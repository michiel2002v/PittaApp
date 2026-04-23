using Microsoft.EntityFrameworkCore;
using PittaApp.Api.Data;
using PittaApp.Api.Domain;
using PittaApp.Api.Services;

namespace PittaApp.Api.Endpoints;

public static class OrderRoundEndpoints
{
    public static IEndpointRouteBuilder MapOrderRoundEndpoints(this IEndpointRouteBuilder app)
    {
        // Authenticated: read rounds (so users can see the currently open round).
        var rounds = app.MapGroup("/order-rounds").RequireAuthorization();

        rounds.MapGet("/current", async (AppDbContext db, CancellationToken ct) =>
        {
            var now = DateTimeOffset.UtcNow;
            // The "current" round is the open round with the nearest future delivery date
            // (or today if still open), tie-breaking by earliest cutoff.
            var round = await db.OrderRounds
                .Where(r => r.Status == OrderRoundStatus.Open)
                .OrderBy(r => r.DeliveryDate).ThenBy(r => r.CutoffAt)
                .FirstOrDefaultAsync(ct);

            if (round is null) return Results.NoContent();
            return Results.Ok(ToDto(round, now));
        });

        rounds.MapGet("/", async (AppDbContext db, CancellationToken ct) =>
        {
            var now = DateTimeOffset.UtcNow;
            var list = await db.OrderRounds
                .OrderByDescending(r => r.DeliveryDate)
                .Take(50)
                .ToListAsync(ct);
            return Results.Ok(list.Select(r => ToDto(r, now)));
        });

        // Admin-only writes.
        var admin = app.MapGroup("/admin/order-rounds").RequireAuthorization("admin");

        admin.MapPost("/", async (OrderRoundWriteRequest req, AppDbContext db, CancellationToken ct) =>
        {
            if (req.CutoffAt <= DateTimeOffset.UtcNow)
                return Results.UnprocessableEntity(new { error = "Cutoff must be in the future." });

            var round = new OrderRound
            {
                DeliveryDate = req.DeliveryDate,
                CutoffAt = req.CutoffAt,
                Notes = string.IsNullOrWhiteSpace(req.Notes) ? null : req.Notes.Trim(),
                DeliveryCostCents = Math.Max(0, req.DeliveryCostCents),
                IsRecurringWeekly = req.IsRecurringWeekly,
            };
            db.OrderRounds.Add(round);
            await db.SaveChangesAsync(ct);
            return Results.Created($"/admin/order-rounds/{round.Id}", ToDto(round, DateTimeOffset.UtcNow));
        });

        admin.MapPut("/{id:guid}", async (Guid id, OrderRoundWriteRequest req, AppDbContext db, CancellationToken ct) =>
        {
            var round = await db.OrderRounds.FindAsync([id], ct);
            if (round is null) return Results.NotFound();
            round.DeliveryDate = req.DeliveryDate;
            round.CutoffAt = req.CutoffAt;
            round.Notes = string.IsNullOrWhiteSpace(req.Notes) ? null : req.Notes.Trim();
            round.DeliveryCostCents = Math.Max(0, req.DeliveryCostCents);
            round.IsRecurringWeekly = req.IsRecurringWeekly;
            await db.SaveChangesAsync(ct);
            return Results.Ok(ToDto(round, DateTimeOffset.UtcNow));
        });

        admin.MapPost("/{id:guid}/lock", async (Guid id, AppDbContext db, CancellationToken ct) =>
        {
            var round = await db.OrderRounds.FindAsync([id], ct);
            if (round is null) return Results.NotFound();
            if (round.Status != OrderRoundStatus.Open)
                return Results.Conflict(new { error = $"Round is already {round.Status}." });
            round.Status = OrderRoundStatus.Locked;

            // Create ledger debits for all orders in this round (if none yet).
            var orders = await db.Orders
                .Include(o => o.Lines)
                .Where(o => o.OrderRoundId == round.Id && o.Status == OrderStatus.Open)
                .ToListAsync(ct);
            foreach (var order in orders)
            {
                order.Status = OrderStatus.Locked;
                var existingDebit = await db.LedgerEntries.AnyAsync(l => l.OrderId == order.Id, ct);
                if (!existingDebit && order.TotalCents > 0)
                {
                    db.LedgerEntries.Add(new LedgerEntry
                    {
                        UserId = order.UserId,
                        OrderId = order.Id,
                        EntryType = LedgerEntryType.OrderDebit,
                        AmountCents = order.TotalCents,
                        Reason = $"Order lock: round {round.DeliveryDate}",
                    });
                }
            }

            // Split delivery cost across all orderers (idempotent on the reason text).
            if (round.DeliveryCostCents > 0 && orders.Count > 0)
            {
                var deliveryReason = $"Leveringskosten ronde {round.DeliveryDate}";
                var alreadyBilled = await db.LedgerEntries.AnyAsync(l => l.Reason == deliveryReason, ct);
                if (!alreadyBilled)
                {
                    var perPerson = round.DeliveryCostCents / orders.Count;
                    var remainder = round.DeliveryCostCents - (perPerson * orders.Count);
                    for (int i = 0; i < orders.Count; i++)
                    {
                        var share = perPerson + (i < remainder ? 1 : 0);
                        if (share <= 0) continue;
                        db.LedgerEntries.Add(new LedgerEntry
                        {
                            UserId = orders[i].UserId,
                            EntryType = LedgerEntryType.ManualAdjustment,
                            AmountCents = share,
                            Reason = deliveryReason,
                        });
                    }
                }
            }

            await db.SaveChangesAsync(ct);
            return Results.Ok(ToDto(round, DateTimeOffset.UtcNow));
        });

        admin.MapPost("/{id:guid}/deliver", async (Guid id, AppDbContext db, TeamsNotificationService teams, CancellationToken ct) =>
        {
            var round = await db.OrderRounds.FindAsync([id], ct);
            if (round is null) return Results.NotFound();
            if (round.Status == OrderRoundStatus.Cancelled)
                return Results.Conflict(new { error = "Cancelled round cannot be delivered." });
            round.Status = OrderRoundStatus.Delivered;
            round.DeliveredAt = DateTimeOffset.UtcNow;

            // Auto-create the next weekly round if marked recurring (idempotent on delivery date).
            if (round.IsRecurringWeekly)
            {
                var nextDate = round.DeliveryDate.AddDays(7);
                var exists = await db.OrderRounds.AnyAsync(r => r.DeliveryDate == nextDate, ct);
                if (!exists)
                {
                    db.OrderRounds.Add(new OrderRound
                    {
                        DeliveryDate = nextDate,
                        CutoffAt = round.CutoffAt.AddDays(7),
                        Notes = round.Notes,
                        DeliveryCostCents = round.DeliveryCostCents,
                        IsRecurringWeekly = true,
                        Status = OrderRoundStatus.Open,
                    });
                }
            }

            await db.SaveChangesAsync(ct);

            // Send Teams notification
            var orderCount = await db.Orders.CountAsync(o => o.OrderRoundId == round.Id, ct);
            _ = teams.SendPittaArrivedAsync(round.DeliveryDate, orderCount, ct);

            return Results.Ok(ToDto(round, DateTimeOffset.UtcNow));
        });

        admin.MapPost("/{id:guid}/cancel", async (Guid id, AppDbContext db, CancellationToken ct) =>
        {
            var round = await db.OrderRounds.FindAsync([id], ct);
            if (round is null) return Results.NotFound();
            if (round.Status == OrderRoundStatus.Delivered)
                return Results.Conflict(new { error = "Delivered round cannot be cancelled." });
            round.Status = OrderRoundStatus.Cancelled;
            await db.SaveChangesAsync(ct);
            return Results.Ok(ToDto(round, DateTimeOffset.UtcNow));
        });

        return app;
    }

    private static OrderRoundResponse ToDto(OrderRound r, DateTimeOffset now) =>
        new(r.Id, r.DeliveryDate, r.CutoffAt, r.Status.ToString(),
            r.EffectiveStatus(now).ToString(), r.IsAcceptingOrders(now), r.Notes, r.DeliveredAt,
            r.DeliveryCostCents, r.IsRecurringWeekly);
}

public record OrderRoundResponse(
    Guid Id,
    DateOnly DeliveryDate,
    DateTimeOffset CutoffAt,
    string Status,
    string EffectiveStatus,
    bool IsAcceptingOrders,
    string? Notes,
    DateTimeOffset? DeliveredAt,
    int DeliveryCostCents,
    bool IsRecurringWeekly);

public record OrderRoundWriteRequest(
    DateOnly DeliveryDate,
    DateTimeOffset CutoffAt,
    string? Notes,
    int DeliveryCostCents = 0,
    bool IsRecurringWeekly = false);

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
            r.EffectiveStatus(now).ToString(), r.IsAcceptingOrders(now), r.Notes, r.DeliveredAt);
}

public record OrderRoundResponse(
    Guid Id,
    DateOnly DeliveryDate,
    DateTimeOffset CutoffAt,
    string Status,
    string EffectiveStatus,
    bool IsAcceptingOrders,
    string? Notes,
    DateTimeOffset? DeliveredAt);

public record OrderRoundWriteRequest(DateOnly DeliveryDate, DateTimeOffset CutoffAt, string? Notes);

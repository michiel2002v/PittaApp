using Microsoft.EntityFrameworkCore;
using PittaApp.Api.Auth;
using PittaApp.Api.Data;
using PittaApp.Api.Domain;

namespace PittaApp.Api.Endpoints;

public static class OrderEndpoints
{
    public static IEndpointRouteBuilder MapOrderEndpoints(this IEndpointRouteBuilder app)
    {
        var orders = app.MapGroup("/orders").RequireAuthorization();

        // Get my order for a specific round (or null).
        orders.MapGet("/round/{roundId:guid}", async (
            Guid roundId, AppDbContext db, CurrentUserService current, CancellationToken ct) =>
        {
            var user = await current.GetOrProvisionAsync(ct);
            if (user is null) return Results.Unauthorized();

            var order = await db.Orders
                .Where(o => o.OrderRoundId == roundId && o.UserId == user.Id)
                .Include(o => o.Lines)
                .SingleOrDefaultAsync(ct);

            if (order is null) return Results.NoContent();
            return Results.Ok(ToDto(order));
        });

        // Create a new order for a round. Fails if one already exists or the round is locked.
        orders.MapPost("/", async (
            PlaceOrderRequest req, AppDbContext db, CurrentUserService current, CancellationToken ct) =>
        {
            var user = await current.GetOrProvisionAsync(ct);
            if (user is null) return Results.Unauthorized();

            var round = await db.OrderRounds.FindAsync([req.OrderRoundId], ct);
            if (round is null) return Results.NotFound(new { error = "Order round not found." });
            if (!round.IsAcceptingOrders(DateTimeOffset.UtcNow))
                return Results.Conflict(new { error = "This order round is no longer accepting orders." });

            var existing = await db.Orders.AnyAsync(o => o.OrderRoundId == round.Id && o.UserId == user.Id, ct);
            if (existing) return Results.Conflict(new { error = "You already have an order for this round. Update it instead." });

            if (req.Lines is null || req.Lines.Count == 0)
                return Results.UnprocessableEntity(new { error = "At least one order line is required." });

            var order = new Order
            {
                UserId = user.Id,
                OrderRoundId = round.Id,
                Notes = string.IsNullOrWhiteSpace(req.Notes) ? null : req.Notes.Trim(),
            };

            var buildResult = await BuildLinesAsync(db, req.Lines, ct);
            if (buildResult.Error is not null) return buildResult.Error;
            order.Lines.AddRange(buildResult.Lines);

            db.Orders.Add(order);
            await db.SaveChangesAsync(ct);

            return Results.Created($"/orders/{order.Id}", ToDto(order));
        });

        // Update (replace lines of) an existing order. Owner-only. Must still be open.
        orders.MapPut("/{id:guid}", async (
            Guid id, PlaceOrderRequest req, AppDbContext db, CurrentUserService current, CancellationToken ct) =>
        {
            var user = await current.GetOrProvisionAsync(ct);
            if (user is null) return Results.Unauthorized();

            var order = await db.Orders
                .Include(o => o.OrderRound)
                .AsNoTracking()
                .SingleOrDefaultAsync(o => o.Id == id, ct);
            if (order is null) return Results.NotFound();
            if (order.UserId != user.Id) return Results.Forbid();
            if (!order.OrderRound.IsAcceptingOrders(DateTimeOffset.UtcNow))
                return Results.Conflict(new { error = "Cutoff has passed; order is locked." });

            if (req.Lines is null || req.Lines.Count == 0)
                return Results.UnprocessableEntity(new { error = "At least one order line is required." });

            var buildResult = await BuildLinesAsync(db, req.Lines, ct);
            if (buildResult.Error is not null) return buildResult.Error;

            // Bypass EF change tracking: delete old lines + update order fields via raw UPDATE/DELETE,
            // then insert the new lines. Avoids optimistic-concurrency mismatches.
            await db.OrderLines.Where(l => l.OrderId == order.Id).ExecuteDeleteAsync(ct);

            var notes = string.IsNullOrWhiteSpace(req.Notes) ? null : req.Notes.Trim();
            var now = DateTimeOffset.UtcNow;
            await db.Orders.Where(o => o.Id == order.Id)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(o => o.Notes, notes)
                    .SetProperty(o => o.UpdatedAt, now), ct);

            foreach (var line in buildResult.Lines)
            {
                line.OrderId = order.Id;
                db.OrderLines.Add(line);
            }
            await db.SaveChangesAsync(ct);

            var reloaded = await db.Orders
                .Include(o => o.Lines)
                .AsNoTracking()
                .SingleAsync(o => o.Id == order.Id, ct);
            return Results.Ok(ToDto(reloaded));
        });

        // Delete own open order.
        orders.MapDelete("/{id:guid}", async (
            Guid id, AppDbContext db, CurrentUserService current, CancellationToken ct) =>
        {
            var user = await current.GetOrProvisionAsync(ct);
            if (user is null) return Results.Unauthorized();

            var order = await db.Orders.Include(o => o.OrderRound).SingleOrDefaultAsync(o => o.Id == id, ct);
            if (order is null) return Results.NotFound();
            if (order.UserId != user.Id) return Results.Forbid();
            if (!order.OrderRound.IsAcceptingOrders(DateTimeOffset.UtcNow))
                return Results.Conflict(new { error = "Cutoff has passed; order is locked." });

            db.Orders.Remove(order);
            await db.SaveChangesAsync(ct);
            return Results.NoContent();
        });

        // Admin: get all orders for a round.
        var admin = app.MapGroup("/admin/orders").RequireAuthorization("admin");
        admin.MapGet("/round/{roundId:guid}", async (
            Guid roundId, AppDbContext db, CancellationToken ct) =>
        {
            var list = await db.Orders
                .Where(o => o.OrderRoundId == roundId)
                .Include(o => o.Lines)
                .Include(o => o.User)
                .OrderBy(o => o.User.DisplayName)
                .ToListAsync(ct);
            return Results.Ok(list.Select(o => new AdminOrderResponse(
                o.Id, o.User.DisplayName, o.User.Email, o.IsPaid,
                o.Notes, ToDto(o).Lines, o.TotalCents)));
        });

        // Admin: toggle payment status.
        admin.MapPost("/{id:guid}/pay", async (Guid id, AppDbContext db, CancellationToken ct) =>
        {
            var order = await db.Orders.FindAsync([id], ct);
            if (order is null) return Results.NotFound();
            order.IsPaid = true;
            order.PaidAt = DateTimeOffset.UtcNow;
            await db.SaveChangesAsync(ct);
            return Results.Ok(new { order.Id, order.IsPaid });
        });

        admin.MapPost("/{id:guid}/unpay", async (Guid id, AppDbContext db, CancellationToken ct) =>
        {
            var order = await db.Orders.FindAsync([id], ct);
            if (order is null) return Results.NotFound();
            order.IsPaid = false;
            order.PaidAt = null;
            await db.SaveChangesAsync(ct);
            return Results.Ok(new { order.Id, order.IsPaid });
        });

        // Admin: wanbetalers ranking.
        admin.MapGet("/wanbetalers", async (AppDbContext db, CancellationToken ct) =>
        {
            var unpaid = await db.Orders
                .Where(o => !o.IsPaid)
                .Include(o => o.Lines)
                .Include(o => o.User)
                .ToListAsync(ct);

            var ranking = unpaid
                .GroupBy(o => new { o.UserId, o.User.DisplayName, o.User.Email })
                .Select(g => new WanbetalerResponse(
                    g.Key.DisplayName, g.Key.Email,
                    g.Sum(o => o.TotalCents),
                    g.Count(),
                    g.Min(o => o.CreatedAt)))
                .OrderByDescending(w => w.TotalOpenCents)
                .ThenByDescending(w => w.UnpaidOrderCount)
                .ToList();
            return Results.Ok(ranking);
        });

        // User: my order history.
        orders.MapGet("/mine", async (
            AppDbContext db, CurrentUserService current, CancellationToken ct) =>
        {
            var user = await current.GetOrProvisionAsync(ct);
            if (user is null) return Results.Unauthorized();

            var myOrders = await db.Orders
                .Where(o => o.UserId == user.Id)
                .Include(o => o.Lines)
                .Include(o => o.OrderRound)
                .OrderByDescending(o => o.CreatedAt)
                .Take(50)
                .ToListAsync(ct);

            return Results.Ok(myOrders.Select(o => new MyOrderHistoryResponse(
                o.Id, o.OrderRound.DeliveryDate, o.IsPaid,
                o.Notes, ToDto(o).Lines, o.TotalCents, o.CreatedAt)));
        });

        return app;
    }

    private record BuildResult(List<OrderLine> Lines, IResult? Error);

    private static async Task<BuildResult> BuildLinesAsync(
        AppDbContext db, List<OrderLineRequest> reqLines, CancellationToken ct)
    {
        var result = new List<OrderLine>();
        foreach (var l in reqLines)
        {
            var size = await db.ItemSizes.Include(s => s.Item)
                .SingleOrDefaultAsync(s => s.Id == l.ItemSizeId, ct);
            var type = await db.ItemTypes.SingleOrDefaultAsync(t => t.Id == l.ItemTypeId, ct);
            if (size is null || type is null || size.Item.DeletedAt is not null
                || size.DeletedAt is not null || type.DeletedAt is not null
                || type.ItemId != size.ItemId)
            {
                return new BuildResult([], Results.UnprocessableEntity(new { error = "Invalid item/size/type combination." }));
            }

            var sauceNames = new List<string>();
            if (l.SauceIds is { Count: > 0 })
            {
                var found = await db.Sauces.Where(s => l.SauceIds.Contains(s.Id) && s.DeletedAt == null).ToListAsync(ct);
                sauceNames = found.Select(s => s.Name).ToList();
            }

            result.Add(new OrderLine
            {
                ItemId = size.ItemId,
                ItemName = size.Item.Name,
                ItemSizeId = size.Id,
                SizeName = size.Name,
                ItemTypeId = type.Id,
                TypeName = type.Name,
                UnitPriceCents = Math.Max(0, size.PriceCents + type.SurchargeCents),
                SaucesText = string.Join(", ", sauceNames),
                Remark = string.IsNullOrWhiteSpace(l.Remark) ? null : l.Remark.Trim(),
            });
        }
        return new BuildResult(result, null);
    }

    private static OrderResponse ToDto(Order o) => new(
        o.Id, o.OrderRoundId, o.Status.ToString(), o.IsPaid, o.Notes,
        o.Lines.Select(l => new OrderLineResponse(
            l.Id, l.ItemId, l.ItemName, l.ItemSizeId, l.SizeName,
            l.ItemTypeId, l.TypeName, l.UnitPriceCents, l.SaucesText, l.Remark)).ToList(),
        o.TotalCents, o.CreatedAt, o.UpdatedAt);
}

public record PlaceOrderRequest(Guid OrderRoundId, List<OrderLineRequest> Lines, string? Notes);
public record OrderLineRequest(Guid ItemSizeId, Guid ItemTypeId, List<Guid>? SauceIds, string? Remark);

public record OrderResponse(
    Guid Id,
    Guid OrderRoundId,
    string Status,
    bool IsPaid,
    string? Notes,
    List<OrderLineResponse> Lines,
    int TotalCents,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public record OrderLineResponse(
    Guid Id,
    Guid ItemId,
    string ItemName,
    Guid ItemSizeId,
    string SizeName,
    Guid ItemTypeId,
    string TypeName,
    int UnitPriceCents,
    string SaucesText,
    string? Remark);

public record AdminOrderResponse(
    Guid Id,
    string UserName,
    string UserEmail,
    bool IsPaid,
    string? Notes,
    List<OrderLineResponse> Lines,
    int TotalCents);

public record WanbetalerResponse(
    string DisplayName,
    string Email,
    int TotalOpenCents,
    int UnpaidOrderCount,
    DateTimeOffset OldestUnpaidOrder);

public record MyOrderHistoryResponse(
    Guid Id,
    DateOnly DeliveryDate,
    bool IsPaid,
    string? Notes,
    List<OrderLineResponse> Lines,
    int TotalCents,
    DateTimeOffset CreatedAt);

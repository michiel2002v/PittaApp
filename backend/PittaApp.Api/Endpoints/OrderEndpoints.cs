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
                .Include(o => o.Lines)
                .Include(o => o.OrderRound)
                .SingleOrDefaultAsync(o => o.Id == id, ct);
            if (order is null) return Results.NotFound();
            if (order.UserId != user.Id) return Results.Forbid();
            if (!order.OrderRound.IsAcceptingOrders(DateTimeOffset.UtcNow))
                return Results.Conflict(new { error = "Cutoff has passed; order is locked." });

            if (req.Lines is null || req.Lines.Count == 0)
                return Results.UnprocessableEntity(new { error = "At least one order line is required." });

            var buildResult = await BuildLinesAsync(db, req.Lines, ct);
            if (buildResult.Error is not null) return buildResult.Error;

            db.OrderLines.RemoveRange(order.Lines);
            order.Lines = buildResult.Lines;
            order.Notes = string.IsNullOrWhiteSpace(req.Notes) ? null : req.Notes.Trim();
            order.UpdatedAt = DateTimeOffset.UtcNow;
            await db.SaveChangesAsync(ct);

            return Results.Ok(ToDto(order));
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

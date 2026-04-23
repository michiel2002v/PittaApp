using Microsoft.EntityFrameworkCore;
using PittaApp.Api.Data;
using PittaApp.Api.Domain;

namespace PittaApp.Api.Endpoints;

public static class CatalogEndpoints
{
    public static IEndpointRouteBuilder MapCatalogEndpoints(this IEndpointRouteBuilder app)
    {
        // Public menu (still requires auth, like all app endpoints): active items with their active sizes/types + active sauces.
        app.MapGet("/menu", async (AppDbContext db, CancellationToken ct) =>
        {
            var items = await db.Items
                .Where(i => i.DeletedAt == null)
                .OrderBy(i => i.SortOrder).ThenBy(i => i.Name)
                .Select(i => new MenuItem(
                    i.Id,
                    i.Name,
                    i.Sizes.Where(s => s.DeletedAt == null)
                        .OrderBy(s => s.SortOrder).ThenBy(s => s.Name)
                        .Select(s => new MenuItemSize(s.Id, s.Name, s.PriceCents)).ToList(),
                    i.Types.Where(t => t.DeletedAt == null)
                        .OrderBy(t => t.SortOrder).ThenBy(t => t.Name)
                        .Select(t => new MenuItemType(t.Id, t.Name, t.SurchargeCents)).ToList()))
                .ToListAsync(ct);

            var sauces = await db.Sauces
                .Where(s => s.DeletedAt == null)
                .OrderBy(s => s.SortOrder).ThenBy(s => s.Name)
                .Select(s => new MenuSauce(s.Id, s.Name))
                .ToListAsync(ct);

            return Results.Ok(new MenuResponse(items, sauces));
        }).RequireAuthorization();

        var admin = app.MapGroup("/admin/catalog").RequireAuthorization("admin");

        // --- Items ---
        admin.MapGet("/items", async (AppDbContext db, bool? includeDeleted, CancellationToken ct) =>
        {
            var q = db.Items.AsQueryable();
            if (includeDeleted != true) q = q.Where(i => i.DeletedAt == null);
            var items = await q.OrderBy(i => i.SortOrder).ThenBy(i => i.Name)
                .Select(i => new AdminItem(i.Id, i.Name, i.SortOrder, i.DeletedAt)).ToListAsync(ct);
            return Results.Ok(items);
        });

        admin.MapPost("/items", async (ItemWriteRequest req, AppDbContext db, CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(req.Name))
                return Results.UnprocessableEntity(new { error = "Name is required." });
            var item = new Item { Name = req.Name.Trim(), SortOrder = req.SortOrder ?? 0 };
            db.Items.Add(item);
            await db.SaveChangesAsync(ct);
            return Results.Created($"/admin/catalog/items/{item.Id}",
                new AdminItem(item.Id, item.Name, item.SortOrder, item.DeletedAt));
        });

        admin.MapPut("/items/{id:guid}", async (Guid id, ItemWriteRequest req, AppDbContext db, CancellationToken ct) =>
        {
            var item = await db.Items.FindAsync([id], ct);
            if (item is null) return Results.NotFound();
            if (string.IsNullOrWhiteSpace(req.Name))
                return Results.UnprocessableEntity(new { error = "Name is required." });
            item.Name = req.Name.Trim();
            if (req.SortOrder.HasValue) item.SortOrder = req.SortOrder.Value;
            await db.SaveChangesAsync(ct);
            return Results.Ok(new AdminItem(item.Id, item.Name, item.SortOrder, item.DeletedAt));
        });

        admin.MapDelete("/items/{id:guid}", async (Guid id, AppDbContext db, CancellationToken ct) =>
        {
            var item = await db.Items.FindAsync([id], ct);
            if (item is null) return Results.NotFound();
            item.DeletedAt = DateTimeOffset.UtcNow;
            await db.SaveChangesAsync(ct);
            return Results.NoContent();
        });

        admin.MapPost("/items/{id:guid}/restore", async (Guid id, AppDbContext db, CancellationToken ct) =>
        {
            var item = await db.Items.FindAsync([id], ct);
            if (item is null) return Results.NotFound();
            item.DeletedAt = null;
            await db.SaveChangesAsync(ct);
            return Results.NoContent();
        });

        // --- Sizes ---
        admin.MapPost("/items/{itemId:guid}/sizes", async (Guid itemId, SizeWriteRequest req, AppDbContext db, CancellationToken ct) =>
        {
            var item = await db.Items.FindAsync([itemId], ct);
            if (item is null) return Results.NotFound();
            if (string.IsNullOrWhiteSpace(req.Name) || req.PriceCents < 0)
                return Results.UnprocessableEntity(new { error = "Name required and price must be non-negative." });
            var size = new ItemSize { ItemId = itemId, Name = req.Name.Trim(), PriceCents = req.PriceCents, SortOrder = req.SortOrder ?? 0 };
            db.ItemSizes.Add(size);
            await db.SaveChangesAsync(ct);
            return Results.Created($"/admin/catalog/sizes/{size.Id}",
                new AdminSize(size.Id, size.ItemId, size.Name, size.PriceCents, size.SortOrder, size.DeletedAt));
        });

        admin.MapPut("/sizes/{id:guid}", async (Guid id, SizeWriteRequest req, AppDbContext db, CancellationToken ct) =>
        {
            var size = await db.ItemSizes.FindAsync([id], ct);
            if (size is null) return Results.NotFound();
            if (string.IsNullOrWhiteSpace(req.Name) || req.PriceCents < 0)
                return Results.UnprocessableEntity(new { error = "Name required and price must be non-negative." });
            size.Name = req.Name.Trim();
            size.PriceCents = req.PriceCents;
            if (req.SortOrder.HasValue) size.SortOrder = req.SortOrder.Value;
            await db.SaveChangesAsync(ct);
            return Results.Ok(new AdminSize(size.Id, size.ItemId, size.Name, size.PriceCents, size.SortOrder, size.DeletedAt));
        });

        admin.MapDelete("/sizes/{id:guid}", async (Guid id, AppDbContext db, CancellationToken ct) =>
        {
            var size = await db.ItemSizes.FindAsync([id], ct);
            if (size is null) return Results.NotFound();
            size.DeletedAt = DateTimeOffset.UtcNow;
            await db.SaveChangesAsync(ct);
            return Results.NoContent();
        });

        // --- Types ---
        admin.MapPost("/items/{itemId:guid}/types", async (Guid itemId, TypeWriteRequest req, AppDbContext db, CancellationToken ct) =>
        {
            var item = await db.Items.FindAsync([itemId], ct);
            if (item is null) return Results.NotFound();
            if (string.IsNullOrWhiteSpace(req.Name))
                return Results.UnprocessableEntity(new { error = "Name is required." });
            var type = new ItemType { ItemId = itemId, Name = req.Name.Trim(), SurchargeCents = req.SurchargeCents, SortOrder = req.SortOrder ?? 0 };
            db.ItemTypes.Add(type);
            await db.SaveChangesAsync(ct);
            return Results.Created($"/admin/catalog/types/{type.Id}",
                new AdminType(type.Id, type.ItemId, type.Name, type.SurchargeCents, type.SortOrder, type.DeletedAt));
        });

        admin.MapPut("/types/{id:guid}", async (Guid id, TypeWriteRequest req, AppDbContext db, CancellationToken ct) =>
        {
            var type = await db.ItemTypes.FindAsync([id], ct);
            if (type is null) return Results.NotFound();
            if (string.IsNullOrWhiteSpace(req.Name))
                return Results.UnprocessableEntity(new { error = "Name is required." });
            type.Name = req.Name.Trim();
            type.SurchargeCents = req.SurchargeCents;
            if (req.SortOrder.HasValue) type.SortOrder = req.SortOrder.Value;
            await db.SaveChangesAsync(ct);
            return Results.Ok(new AdminType(type.Id, type.ItemId, type.Name, type.SurchargeCents, type.SortOrder, type.DeletedAt));
        });

        admin.MapDelete("/types/{id:guid}", async (Guid id, AppDbContext db, CancellationToken ct) =>
        {
            var type = await db.ItemTypes.FindAsync([id], ct);
            if (type is null) return Results.NotFound();
            type.DeletedAt = DateTimeOffset.UtcNow;
            await db.SaveChangesAsync(ct);
            return Results.NoContent();
        });

        // --- Sauces ---
        admin.MapGet("/sauces", async (AppDbContext db, bool? includeDeleted, CancellationToken ct) =>
        {
            var q = db.Sauces.AsQueryable();
            if (includeDeleted != true) q = q.Where(s => s.DeletedAt == null);
            var sauces = await q.OrderBy(s => s.SortOrder).ThenBy(s => s.Name)
                .Select(s => new AdminSauce(s.Id, s.Name, s.SortOrder, s.DeletedAt)).ToListAsync(ct);
            return Results.Ok(sauces);
        });

        admin.MapPost("/sauces", async (SauceWriteRequest req, AppDbContext db, CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(req.Name))
                return Results.UnprocessableEntity(new { error = "Name is required." });
            var sauce = new Sauce { Name = req.Name.Trim(), SortOrder = req.SortOrder ?? 0 };
            db.Sauces.Add(sauce);
            await db.SaveChangesAsync(ct);
            return Results.Created($"/admin/catalog/sauces/{sauce.Id}",
                new AdminSauce(sauce.Id, sauce.Name, sauce.SortOrder, sauce.DeletedAt));
        });

        admin.MapPut("/sauces/{id:guid}", async (Guid id, SauceWriteRequest req, AppDbContext db, CancellationToken ct) =>
        {
            var sauce = await db.Sauces.FindAsync([id], ct);
            if (sauce is null) return Results.NotFound();
            if (string.IsNullOrWhiteSpace(req.Name))
                return Results.UnprocessableEntity(new { error = "Name is required." });
            sauce.Name = req.Name.Trim();
            if (req.SortOrder.HasValue) sauce.SortOrder = req.SortOrder.Value;
            await db.SaveChangesAsync(ct);
            return Results.Ok(new AdminSauce(sauce.Id, sauce.Name, sauce.SortOrder, sauce.DeletedAt));
        });

        admin.MapDelete("/sauces/{id:guid}", async (Guid id, AppDbContext db, CancellationToken ct) =>
        {
            var sauce = await db.Sauces.FindAsync([id], ct);
            if (sauce is null) return Results.NotFound();
            sauce.DeletedAt = DateTimeOffset.UtcNow;
            await db.SaveChangesAsync(ct);
            return Results.NoContent();
        });

        return app;
    }
}

public record MenuResponse(List<MenuItem> Items, List<MenuSauce> Sauces);
public record MenuItem(Guid Id, string Name, List<MenuItemSize> Sizes, List<MenuItemType> Types);
public record MenuItemSize(Guid Id, string Name, int PriceCents);
public record MenuItemType(Guid Id, string Name, int SurchargeCents);
public record MenuSauce(Guid Id, string Name);

public record AdminItem(Guid Id, string Name, int SortOrder, DateTimeOffset? DeletedAt);
public record AdminSize(Guid Id, Guid ItemId, string Name, int PriceCents, int SortOrder, DateTimeOffset? DeletedAt);
public record AdminType(Guid Id, Guid ItemId, string Name, int SurchargeCents, int SortOrder, DateTimeOffset? DeletedAt);
public record AdminSauce(Guid Id, string Name, int SortOrder, DateTimeOffset? DeletedAt);

public record ItemWriteRequest(string Name, int? SortOrder);
public record SizeWriteRequest(string Name, int PriceCents, int? SortOrder);
public record TypeWriteRequest(string Name, int SurchargeCents, int? SortOrder);
public record SauceWriteRequest(string Name, int? SortOrder);

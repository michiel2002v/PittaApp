using Microsoft.EntityFrameworkCore;
using PittaApp.Api.Data;
using PittaApp.Api.Domain;

namespace PittaApp.Api.Tests;

public class OrderTests
{
    private static AppDbContext NewDb()
    {
        var opts = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(opts);
    }

    private static (User user, OrderRound round, Item item) SeedBase(AppDbContext db)
    {
        var user = new User
        {
            DisplayName = "Test User",
            Email = "test@test.com",
            AzureAdObjectId = Guid.NewGuid().ToString(),
        };
        var round = new OrderRound
        {
            DeliveryDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
            CutoffAt = DateTimeOffset.UtcNow.AddHours(12),
            Status = OrderRoundStatus.Open,
        };
        var item = new Item { Name = "Pitta", SortOrder = 1 };
        item.Sizes.Add(new ItemSize { Name = "Klein", PriceCents = 800, SortOrder = 1 });
        item.Sizes.Add(new ItemSize { Name = "Groot", PriceCents = 1000, SortOrder = 2 });
        item.Types.Add(new ItemType { Name = "Vlees", SurchargeCents = 0, SortOrder = 1 });
        item.Types.Add(new ItemType { Name = "Falafel", SurchargeCents = -200, SortOrder = 2 });

        db.Users.Add(user);
        db.OrderRounds.Add(round);
        db.Items.Add(item);
        db.SaveChanges();
        return (user, round, item);
    }

    [Fact]
    public async Task Can_create_order_with_lines()
    {
        using var db = NewDb();
        var (user, round, item) = SeedBase(db);

        var order = new Order
        {
            UserId = user.Id,
            OrderRoundId = round.Id,
            Notes = "Extra saus graag",
        };
        var size = item.Sizes.First(s => s.Name == "Klein");
        var type = item.Types.First(t => t.Name == "Vlees");
        order.Lines.Add(new OrderLine
        {
            ItemId = item.Id,
            ItemName = item.Name,
            ItemSizeId = size.Id,
            SizeName = size.Name,
            ItemTypeId = type.Id,
            TypeName = type.Name,
            UnitPriceCents = size.PriceCents + type.SurchargeCents,
            SaucesText = "Samurai, Andalouse",
        });
        db.Orders.Add(order);
        await db.SaveChangesAsync();

        var loaded = await db.Orders.Include(o => o.Lines).SingleAsync();
        Assert.Equal(user.Id, loaded.UserId);
        Assert.Equal(round.Id, loaded.OrderRoundId);
        Assert.Single(loaded.Lines);
        Assert.Equal(800, loaded.TotalCents);
        Assert.Equal("Samurai, Andalouse", loaded.Lines[0].SaucesText);
    }

    [Fact]
    public async Task Order_total_sums_all_lines()
    {
        using var db = NewDb();
        var (user, round, item) = SeedBase(db);

        var order = new Order { UserId = user.Id, OrderRoundId = round.Id };
        var klein = item.Sizes.First(s => s.Name == "Klein");
        var groot = item.Sizes.First(s => s.Name == "Groot");
        var vlees = item.Types.First(t => t.Name == "Vlees");
        var falafel = item.Types.First(t => t.Name == "Falafel");

        order.Lines.Add(new OrderLine
        {
            ItemId = item.Id, ItemName = item.Name,
            ItemSizeId = klein.Id, SizeName = "Klein",
            ItemTypeId = vlees.Id, TypeName = "Vlees",
            UnitPriceCents = klein.PriceCents + vlees.SurchargeCents, // 800
        });
        order.Lines.Add(new OrderLine
        {
            ItemId = item.Id, ItemName = item.Name,
            ItemSizeId = groot.Id, SizeName = "Groot",
            ItemTypeId = falafel.Id, TypeName = "Falafel",
            UnitPriceCents = groot.PriceCents + falafel.SurchargeCents, // 800
        });
        db.Orders.Add(order);
        await db.SaveChangesAsync();

        var loaded = await db.Orders.Include(o => o.Lines).SingleAsync();
        Assert.Equal(2, loaded.Lines.Count);
        Assert.Equal(1600, loaded.TotalCents);
    }

    [Fact]
    public async Task Deleting_order_cascades_to_lines()
    {
        using var db = NewDb();
        var (user, round, item) = SeedBase(db);

        var order = new Order { UserId = user.Id, OrderRoundId = round.Id };
        var size = item.Sizes.First();
        var type = item.Types.First();
        order.Lines.Add(new OrderLine
        {
            ItemId = item.Id, ItemName = item.Name,
            ItemSizeId = size.Id, SizeName = size.Name,
            ItemTypeId = type.Id, TypeName = type.Name,
            UnitPriceCents = size.PriceCents + type.SurchargeCents,
        });
        db.Orders.Add(order);
        await db.SaveChangesAsync();

        db.Orders.Remove(order);
        await db.SaveChangesAsync();

        Assert.Empty(await db.Orders.ToListAsync());
        Assert.Empty(await db.OrderLines.ToListAsync());
    }

    [Fact]
    public async Task Order_snapshots_prices_independently_of_catalog_changes()
    {
        using var db = NewDb();
        var (user, round, item) = SeedBase(db);
        var size = item.Sizes.First(s => s.Name == "Klein");
        var type = item.Types.First(t => t.Name == "Vlees");

        var order = new Order { UserId = user.Id, OrderRoundId = round.Id };
        order.Lines.Add(new OrderLine
        {
            ItemId = item.Id, ItemName = item.Name,
            ItemSizeId = size.Id, SizeName = "Klein",
            ItemTypeId = type.Id, TypeName = "Vlees",
            UnitPriceCents = 800, // snapshotted
        });
        db.Orders.Add(order);
        await db.SaveChangesAsync();

        // Catalog price changes after order placed
        size.PriceCents = 900;
        await db.SaveChangesAsync();

        var loaded = await db.Orders.Include(o => o.Lines).SingleAsync();
        Assert.Equal(800, loaded.Lines[0].UnitPriceCents); // still snapshotted price
    }

    [Fact]
    public async Task Order_line_stores_sauce_text()
    {
        using var db = NewDb();
        var (user, round, item) = SeedBase(db);
        var size = item.Sizes.First();
        var type = item.Types.First();

        var order = new Order { UserId = user.Id, OrderRoundId = round.Id };
        order.Lines.Add(new OrderLine
        {
            ItemId = item.Id, ItemName = item.Name,
            ItemSizeId = size.Id, SizeName = size.Name,
            ItemTypeId = type.Id, TypeName = type.Name,
            UnitPriceCents = 800,
            SaucesText = "Look, Ketchup",
            Remark = "Zonder sla",
        });
        db.Orders.Add(order);
        await db.SaveChangesAsync();

        var line = await db.OrderLines.SingleAsync();
        Assert.Equal("Look, Ketchup", line.SaucesText);
        Assert.Equal("Zonder sla", line.Remark);
    }

    [Fact]
    public async Task Falafel_surcharge_correctly_subtracted()
    {
        using var db = NewDb();
        var (user, round, item) = SeedBase(db);
        var groot = item.Sizes.First(s => s.Name == "Groot");
        var falafel = item.Types.First(t => t.Name == "Falafel");

        // Falafel surcharge is -200, so Groot(1000) + Falafel(-200) = 800
        var unitPrice = Math.Max(0, groot.PriceCents + falafel.SurchargeCents);
        Assert.Equal(800, unitPrice);

        var order = new Order { UserId = user.Id, OrderRoundId = round.Id };
        order.Lines.Add(new OrderLine
        {
            ItemId = item.Id, ItemName = item.Name,
            ItemSizeId = groot.Id, SizeName = "Groot",
            ItemTypeId = falafel.Id, TypeName = "Falafel",
            UnitPriceCents = unitPrice,
        });
        db.Orders.Add(order);
        await db.SaveChangesAsync();

        var loaded = await db.Orders.Include(o => o.Lines).SingleAsync();
        Assert.Equal(800, loaded.TotalCents);
    }

    [Fact]
    public async Task CatalogSeeder_seeds_items_and_sauces()
    {
        using var db = NewDb();
        await CatalogSeeder.SeedAsync(db);

        var items = await db.Items.Include(i => i.Sizes).Include(i => i.Types).ToListAsync();
        Assert.Equal(7, items.Count);
        Assert.Contains(items, i => i.Name == "Pitta");
        Assert.Contains(items, i => i.Name == "Dürüm");
        Assert.Contains(items, i => i.Name == "Kapsalon");
        Assert.Contains(items, i => i.Name == "Friet");

        var pitta = items.Single(i => i.Name == "Pitta");
        Assert.Equal(2, pitta.Sizes.Count);
        Assert.Contains(pitta.Sizes, s => s.Name == "Klein" && s.PriceCents == 800);
        Assert.Contains(pitta.Sizes, s => s.Name == "Groot" && s.PriceCents == 1000);
        Assert.True(pitta.Types.Count >= 4);
        Assert.Contains(pitta.Types, t => t.Name == "Falafel" && t.SurchargeCents == -200);

        var sauces = await db.Sauces.ToListAsync();
        Assert.Equal(11, sauces.Count);
        Assert.Contains(sauces, s => s.Name == "Samurai");
        Assert.Contains(sauces, s => s.Name == "Geen");
    }

    [Fact]
    public async Task CatalogSeeder_is_idempotent()
    {
        using var db = NewDb();
        await CatalogSeeder.SeedAsync(db);
        await CatalogSeeder.SeedAsync(db); // second call

        Assert.Equal(7, await db.Items.CountAsync());
        Assert.Equal(11, await db.Sauces.CountAsync());
    }
}

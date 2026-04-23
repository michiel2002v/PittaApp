using Microsoft.EntityFrameworkCore;
using PittaApp.Api.Data;
using PittaApp.Api.Domain;

namespace PittaApp.Api.Tests;

public class CatalogTests
{
    private static AppDbContext NewDb()
    {
        var opts = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(opts);
    }

    [Fact]
    public async Task Can_create_item_with_sizes_and_types()
    {
        using var db = NewDb();
        var item = new Item { Name = "Pitta", SortOrder = 1 };
        item.Sizes.Add(new ItemSize { Name = "Klein", PriceCents = 800 });
        item.Sizes.Add(new ItemSize { Name = "Groot", PriceCents = 1000 });
        item.Types.Add(new ItemType { Name = "Mix", SurchargeCents = 0 });
        item.Types.Add(new ItemType { Name = "Kip", SurchargeCents = 50 });
        db.Items.Add(item);
        await db.SaveChangesAsync();

        var loaded = await db.Items
            .Include(i => i.Sizes).Include(i => i.Types)
            .SingleAsync();
        Assert.Equal("Pitta", loaded.Name);
        Assert.Equal(2, loaded.Sizes.Count);
        Assert.Equal(2, loaded.Types.Count);
        Assert.Contains(loaded.Sizes, s => s.Name == "Groot" && s.PriceCents == 1000);
        Assert.Contains(loaded.Types, t => t.Name == "Kip" && t.SurchargeCents == 50);
    }

    [Fact]
    public async Task Soft_delete_marks_item_without_removing()
    {
        using var db = NewDb();
        var item = new Item { Name = "Kapsalon" };
        db.Items.Add(item);
        await db.SaveChangesAsync();

        item.DeletedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync();

        var all = await db.Items.ToListAsync();
        Assert.Single(all);
        Assert.NotNull(all[0].DeletedAt);

        var active = await db.Items.Where(i => i.DeletedAt == null).ToListAsync();
        Assert.Empty(active);
    }

    [Fact]
    public async Task Deleting_item_cascades_to_sizes_and_types()
    {
        using var db = NewDb();
        var item = new Item { Name = "Dürüm" };
        item.Sizes.Add(new ItemSize { Name = "Standaard", PriceCents = 900 });
        item.Types.Add(new ItemType { Name = "Falafel" });
        db.Items.Add(item);
        await db.SaveChangesAsync();

        db.Items.Remove(item);
        await db.SaveChangesAsync();

        Assert.Empty(await db.Items.ToListAsync());
        Assert.Empty(await db.ItemSizes.ToListAsync());
        Assert.Empty(await db.ItemTypes.ToListAsync());
    }

    [Fact]
    public async Task Sauces_are_global_and_soft_deletable()
    {
        using var db = NewDb();
        db.Sauces.Add(new Sauce { Name = "Samurai" });
        db.Sauces.Add(new Sauce { Name = "Andalouse" });
        await db.SaveChangesAsync();

        var sauce = await db.Sauces.FirstAsync(s => s.Name == "Samurai");
        sauce.DeletedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync();

        var active = await db.Sauces.Where(s => s.DeletedAt == null).ToListAsync();
        Assert.Single(active);
        Assert.Equal("Andalouse", active[0].Name);
    }
}

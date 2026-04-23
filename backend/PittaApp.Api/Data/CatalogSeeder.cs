using Microsoft.EntityFrameworkCore;
using PittaApp.Api.Domain;

namespace PittaApp.Api.Data;

/// <summary>
/// Seeds the catalog with items/sizes/types/sauces from the historical Pitta Moestie Excel
/// (April 2025 price list). Runs only when the catalog is empty. Admins can tweak afterwards
/// via the /admin/catalog endpoints — historical orders aren't affected.
/// </summary>
public static class CatalogSeeder
{
    public static async Task SeedAsync(AppDbContext db, CancellationToken ct = default)
    {
        var hasAnyItem = await db.Items.AnyAsync(ct);
        var hasAnySauce = await db.Sauces.AnyAsync(ct);
        if (hasAnyItem || hasAnySauce) return;

        // Prices are stored in cents. Type surcharges are calibrated against the Klein price
        // (the dominant order size); Groot may deviate by ~50 cents for Falafel/Vegetarisch —
        // admins can override in the UI if needed.
        var items = new[]
        {
            new ItemSeed("Pitta", 10, [("Klein", 800), ("Groot", 1000)],
                [("Vlees", 0), ("Kip", 0), ("Mix", 0), ("Falafel", -200), ("Vegetarisch", -500)]),
            new ItemSeed("Dürüm", 20, [("Klein", 800), ("Groot", 1000)],
                [("Vlees", 0), ("Kip", 0), ("Mix", 0), ("Falafel", -200), ("Vegetarisch", -500)]),
            new ItemSeed("Kapsalon", 30, [("Klein", 1000), ("Groot", 1200)],
                [("Vlees", 0), ("Kip", 0), ("Mix", 0), ("Falafel", -300)]),
            new ItemSeed("Friet", 40, [("Klein", 250), ("Groot", 350)],
                [("/", 0)]),
            new ItemSeed("Bakje Vlees", 50, [("Klein", 300), ("Groot", 600)],
                [("Vlees", 0), ("Kip", 0), ("Mix", 0)]),
            new ItemSeed("Kaasballetjes", 60, [("Standaard", 350)], [("/", 0)]),
            new ItemSeed("Schotel 2 hamburgers", 70, [("Standaard", 800)], [("/", 0)]),
        };

        foreach (var seed in items)
        {
            var item = new Item { Name = seed.Name, SortOrder = seed.SortOrder };
            int sizeOrder = 0;
            foreach (var (sn, sp) in seed.Sizes)
            {
                item.Sizes.Add(new ItemSize { Name = sn, PriceCents = sp, SortOrder = sizeOrder++ });
            }
            int typeOrder = 0;
            foreach (var (tn, ts) in seed.Types)
            {
                item.Types.Add(new ItemType { Name = tn, SurchargeCents = ts, SortOrder = typeOrder++ });
            }
            db.Items.Add(item);
        }

        // Sauces observed in the Excel, deduplicated with canonical Dutch spelling.
        string[] sauces =
        [
            "Andalouse", "Cocktail", "Curryketchup", "Hannibal", "Harissa",
            "Joppie", "Ketchup", "Look", "Mayonaise", "Samurai", "Geen",
        ];
        for (int i = 0; i < sauces.Length; i++)
        {
            db.Sauces.Add(new Sauce { Name = sauces[i], SortOrder = i });
        }

        await db.SaveChangesAsync(ct);
    }

    private record ItemSeed(
        string Name,
        int SortOrder,
        (string Name, int PriceCents)[] Sizes,
        (string Name, int SurchargeCents)[] Types);
}

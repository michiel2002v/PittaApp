namespace PittaApp.Api.Domain;

/// <summary>A menu item, e.g. "Pitta", "Dürüm", "Kapsalon".</summary>
public class Item
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Name { get; set; }
    public int SortOrder { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public List<ItemSize> Sizes { get; set; } = [];
    public List<ItemType> Types { get; set; } = [];
}

/// <summary>A size variant of an item with its price in cents. E.g. "Klein" 800, "Groot" 1000.</summary>
public class ItemSize
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ItemId { get; set; }
    public Item Item { get; set; } = null!;
    public required string Name { get; set; }
    public int PriceCents { get; set; }
    public int SortOrder { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
}

/// <summary>A type/filling variant of an item, e.g. "mix", "kip", "falafel", with optional surcharge in cents.</summary>
public class ItemType
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ItemId { get; set; }
    public Item Item { get; set; } = null!;
    public required string Name { get; set; }
    public int SurchargeCents { get; set; }
    public int SortOrder { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
}

/// <summary>A sauce that can be added to any item (no price).</summary>
public class Sauce
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Name { get; set; }
    public int SortOrder { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
}

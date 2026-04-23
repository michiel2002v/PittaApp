namespace PittaApp.Api.Domain;

public enum OrderStatus
{
    Open = 0,
    Locked = 1,
    Delivered = 2,
    Cancelled = 3,
}

/// <summary>
/// A user's order for a specific <see cref="OrderRound"/>. Contains one or more <see cref="OrderLine"/>s.
/// Prices are snapshotted on creation so later catalog changes don't affect closed orders.
/// </summary>
public class Order
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid OrderRoundId { get; set; }
    public OrderRound OrderRound { get; set; } = null!;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public OrderStatus Status { get; set; } = OrderStatus.Open;
    public bool IsPaid { get; set; }
    public DateTimeOffset? PaidAt { get; set; }
    public string? Notes { get; set; }

    public List<OrderLine> Lines { get; set; } = [];

    /// <summary>Total price in cents across all lines.</summary>
    public int TotalCents => Lines.Sum(l => l.UnitPriceCents);
}

/// <summary>A single item on an order. Denormalizes names + snapshotted price for historical accuracy.</summary>
public class OrderLine
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public Guid ItemId { get; set; }
    public string ItemName { get; set; } = string.Empty;

    public Guid ItemSizeId { get; set; }
    public string SizeName { get; set; } = string.Empty;

    public Guid ItemTypeId { get; set; }
    public string TypeName { get; set; } = string.Empty;

    /// <summary>Snapshotted total price (size + type surcharge) at the moment of ordering.</summary>
    public int UnitPriceCents { get; set; }

    /// <summary>Comma-separated sauce names (snapshotted) for simple display.</summary>
    public string SaucesText { get; set; } = string.Empty;

    public string? Remark { get; set; }
}

namespace PittaApp.Api.Domain;

public enum OrderRoundStatus
{
    Open = 0,
    Locked = 1,
    Delivered = 2,
    Cancelled = 3,
}

/// <summary>
/// A single pitta delivery round. Admins create a round with a delivery date and a cutoff
/// after which orders can no longer be placed or modified.
/// </summary>
public class OrderRound
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateOnly DeliveryDate { get; set; }
    public DateTimeOffset CutoffAt { get; set; }
    public OrderRoundStatus Status { get; set; } = OrderRoundStatus.Open;
    public string? Notes { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? DeliveredAt { get; set; }

    /// <summary>Total delivery cost (in cents) to be split across all orderers when the round is locked.</summary>
    public int DeliveryCostCents { get; set; }

    /// <summary>If true, a follow-up round (delivery date +7 days, same cutoff time) is auto-created when this round is delivered.</summary>
    public bool IsRecurringWeekly { get; set; }

    /// <summary>The effective status considering the cutoff time.</summary>
    public OrderRoundStatus EffectiveStatus(DateTimeOffset now)
    {
        if (Status == OrderRoundStatus.Open && now >= CutoffAt) return OrderRoundStatus.Locked;
        return Status;
    }

    /// <summary>Returns true if new orders/changes are still allowed on this round.</summary>
    public bool IsAcceptingOrders(DateTimeOffset now) => EffectiveStatus(now) == OrderRoundStatus.Open;
}

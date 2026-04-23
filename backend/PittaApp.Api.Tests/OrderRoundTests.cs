using PittaApp.Api.Domain;

namespace PittaApp.Api.Tests;

public class OrderRoundTests
{
    private static OrderRound Open(DateTimeOffset cutoff) => new()
    {
        DeliveryDate = DateOnly.FromDateTime(DateTime.UtcNow.Date),
        CutoffAt = cutoff,
        Status = OrderRoundStatus.Open,
    };

    [Fact]
    public void Open_round_before_cutoff_accepts_orders()
    {
        var now = DateTimeOffset.UtcNow;
        var round = Open(now.AddHours(2));

        Assert.True(round.IsAcceptingOrders(now));
        Assert.Equal(OrderRoundStatus.Open, round.EffectiveStatus(now));
    }

    [Fact]
    public void Open_round_after_cutoff_effectively_locked()
    {
        var now = DateTimeOffset.UtcNow;
        var round = Open(now.AddMinutes(-1));

        Assert.False(round.IsAcceptingOrders(now));
        Assert.Equal(OrderRoundStatus.Locked, round.EffectiveStatus(now));
        // Stored status is still Open — only effective status reflects cutoff
        Assert.Equal(OrderRoundStatus.Open, round.Status);
    }

    [Fact]
    public void Manually_locked_round_never_accepts_orders()
    {
        var now = DateTimeOffset.UtcNow;
        var round = Open(now.AddHours(2));
        round.Status = OrderRoundStatus.Locked;

        Assert.False(round.IsAcceptingOrders(now));
        Assert.Equal(OrderRoundStatus.Locked, round.EffectiveStatus(now));
    }

    [Fact]
    public void Delivered_round_not_accepting_orders()
    {
        var now = DateTimeOffset.UtcNow;
        var round = Open(now.AddHours(2));
        round.Status = OrderRoundStatus.Delivered;

        Assert.False(round.IsAcceptingOrders(now));
    }

    [Fact]
    public void Cancelled_round_not_accepting_orders()
    {
        var now = DateTimeOffset.UtcNow;
        var round = Open(now.AddHours(2));
        round.Status = OrderRoundStatus.Cancelled;

        Assert.False(round.IsAcceptingOrders(now));
        Assert.Equal(OrderRoundStatus.Cancelled, round.EffectiveStatus(now));
    }

    [Fact]
    public void Cutoff_at_exact_now_locks_round()
    {
        var now = DateTimeOffset.UtcNow;
        var round = Open(now);

        Assert.False(round.IsAcceptingOrders(now));
    }
}

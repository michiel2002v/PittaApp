using Microsoft.EntityFrameworkCore;
using PittaApp.Api.Domain;

namespace PittaApp.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Item> Items => Set<Item>();
    public DbSet<ItemSize> ItemSizes => Set<ItemSize>();
    public DbSet<ItemType> ItemTypes => Set<ItemType>();
    public DbSet<Sauce> Sauces => Set<Sauce>();
    public DbSet<OrderRound> OrderRounds => Set<OrderRound>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderLine> OrderLines => Set<OrderLine>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(b =>
        {
            b.HasIndex(u => u.AzureAdObjectId).IsUnique();
            b.HasIndex(u => u.Iban).IsUnique();
        });

        modelBuilder.Entity<Item>(b =>
        {
            b.HasMany(i => i.Sizes).WithOne(s => s.Item).HasForeignKey(s => s.ItemId).OnDelete(DeleteBehavior.Cascade);
            b.HasMany(i => i.Types).WithOne(t => t.Item).HasForeignKey(t => t.ItemId).OnDelete(DeleteBehavior.Cascade);
            b.HasIndex(i => i.Name);
        });

        modelBuilder.Entity<ItemSize>(b => b.HasIndex(s => new { s.ItemId, s.Name }));
        modelBuilder.Entity<ItemType>(b => b.HasIndex(t => new { t.ItemId, t.Name }));
        modelBuilder.Entity<Sauce>(b => b.HasIndex(s => s.Name));

        modelBuilder.Entity<OrderRound>(b =>
        {
            b.HasIndex(r => r.DeliveryDate);
            b.HasIndex(r => r.Status);
            b.Property(r => r.Status).HasConversion<int>();
        });

        modelBuilder.Entity<Order>(b =>
        {
            b.HasOne(o => o.User).WithMany().HasForeignKey(o => o.UserId).OnDelete(DeleteBehavior.Restrict);
            b.HasOne(o => o.OrderRound).WithMany().HasForeignKey(o => o.OrderRoundId).OnDelete(DeleteBehavior.Restrict);
            b.HasMany(o => o.Lines).WithOne(l => l.Order).HasForeignKey(l => l.OrderId).OnDelete(DeleteBehavior.Cascade);
            b.Property(o => o.Status).HasConversion<int>();
            b.HasIndex(o => new { o.OrderRoundId, o.UserId }).IsUnique();
            b.HasIndex(o => o.UserId);
            b.HasIndex(o => o.IsPaid);
        });
    }
}

using Microsoft.EntityFrameworkCore;
using PittaApp.Api.Domain;

namespace PittaApp.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(b =>
        {
            b.HasIndex(u => u.AzureAdObjectId).IsUnique();
            b.HasIndex(u => u.Iban).IsUnique();
        });
    }
}

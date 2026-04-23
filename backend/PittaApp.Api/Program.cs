using Microsoft.EntityFrameworkCore;
using PittaApp.Api.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Postgres")
        ?? throw new InvalidOperationException("Missing connection string 'Postgres'.")));

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
            ?? new[] { "http://localhost:5173" };
        policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod().AllowCredentials();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();

app.MapGet("/health", async (AppDbContext db) =>
{
    var dbReachable = await db.Database.CanConnectAsync();
    return Results.Ok(new
    {
        status = "ok",
        database = dbReachable ? "up" : "down",
        timestamp = DateTimeOffset.UtcNow,
    });
});

app.Run();

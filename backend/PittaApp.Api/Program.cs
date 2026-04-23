using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web;
using PittaApp.Api.Auth;
using PittaApp.Api.Data;
using PittaApp.Api.Endpoints;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<CurrentUserService>();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Postgres")
        ?? throw new InvalidOperationException("Missing connection string 'Postgres'.")));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"));

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("admin", policy => policy.RequireAssertion(ctx =>
    {
        var sp = (ctx.Resource as HttpContext)?.RequestServices;
        if (sp is null) return false;
        var current = sp.GetRequiredService<CurrentUserService>();
        // Synchronous wait is acceptable here: GetOrProvisionAsync is fast (single DB hit).
        var user = current.GetOrProvisionAsync().GetAwaiter().GetResult();
        return user?.IsAdmin == true;
    }));
});

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
app.UseAuthentication();
app.UseAuthorization();

// Apply pending EF migrations on startup.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}

app.MapGet("/health", async (AppDbContext db) =>
{
    var dbReachable = await db.Database.CanConnectAsync();
    return Results.Ok(new
    {
        status = "ok",
        database = dbReachable ? "up" : "down",
        timestamp = DateTimeOffset.UtcNow,
    });
}).AllowAnonymous();

app.MapUserEndpoints();

app.Run();

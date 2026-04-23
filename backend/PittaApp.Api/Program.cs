using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web;
using Microsoft.Identity.Web.UI;
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

// Cookie-based OpenID Connect (Entra ID "Web" platform) — server-side OIDC code flow.
builder.Services
    .AddAuthentication(OpenIdConnectDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApp(builder.Configuration.GetSection("AzureAd"));

builder.Services.Configure<CookieAuthenticationOptions>(
    CookieAuthenticationDefaults.AuthenticationScheme,
    opts =>
    {
        opts.Cookie.Name = "pittaapp.auth";
        opts.Cookie.SameSite = SameSiteMode.Lax;
        opts.Cookie.SecurePolicy = CookieSecurePolicy.Always;
        opts.Cookie.HttpOnly = true;
        // API calls get 401 JSON instead of an HTML redirect.
        opts.Events.OnRedirectToLogin = ctx =>
        {
            if (ctx.Request.Path.StartsWithSegments("/me")
                || ctx.Request.Path.StartsWithSegments("/admin")
                || ctx.Request.Path.StartsWithSegments("/api"))
            {
                ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return Task.CompletedTask;
            }
            ctx.Response.Redirect(ctx.RedirectUri);
            return Task.CompletedTask;
        };
        opts.Events.OnRedirectToAccessDenied = ctx =>
        {
            ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
            return Task.CompletedTask;
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("admin", policy => policy.RequireAssertion(ctx =>
    {
        var sp = (ctx.Resource as HttpContext)?.RequestServices;
        if (sp is null) return false;
        var current = sp.GetRequiredService<CurrentUserService>();
        var user = current.GetOrProvisionAsync().GetAwaiter().GetResult();
        return user?.IsAdmin == true;
    }));
});

// Microsoft.Identity.UI registers /MicrosoftIdentity/Account/{SignIn,SignOut} controller actions.
builder.Services.AddControllersWithViews().AddMicrosoftIdentityUI();

// Trust forwarded headers from the Vite dev proxy so redirect_uri uses the public origin.
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor
        | ForwardedHeaders.XForwardedProto
        | ForwardedHeaders.XForwardedHost;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

var app = builder.Build();

app.UseForwardedHeaders();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
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

// Microsoft.Identity.UI sign-in / sign-out controller actions.
app.MapControllers();

app.Run();

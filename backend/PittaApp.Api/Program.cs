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

static bool IsApiPath(PathString path) =>
    path.StartsWithSegments("/me")
    || path.StartsWithSegments("/admin")
    || path.StartsWithSegments("/api");

builder.Services.Configure<CookieAuthenticationOptions>(
    CookieAuthenticationDefaults.AuthenticationScheme,
    opts =>
    {
        opts.Cookie.Name = "pittaapp.auth";
        opts.Cookie.SameSite = SameSiteMode.Lax;
        opts.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest; // HTTP in dev, HTTPS in prod
        opts.Cookie.HttpOnly = true;
    });

// Intercept OIDC challenges on API paths so XHR/fetch gets a clean 401 instead
// of a 302 redirect to login.microsoftonline.com (which fails CORS preflight).
builder.Services.Configure<OpenIdConnectOptions>(
    OpenIdConnectDefaults.AuthenticationScheme,
    opts =>
    {
        // Use authorization code flow (no implicit id_token). Requires a client secret,
        // set via: dotnet user-secrets set "AzureAd:ClientSecret" "..."
        opts.ResponseType = "code";
        opts.ResponseMode = "form_post";
        opts.UsePkce = true;
        opts.SaveTokens = true;

        var originalRedirectToIdp = opts.Events.OnRedirectToIdentityProvider;
        opts.Events.OnRedirectToIdentityProvider = async ctx =>
        {
            if (IsApiPath(ctx.Request.Path))
            {
                ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
                ctx.HandleResponse();
                return;
            }
            if (originalRedirectToIdp is not null) await originalRedirectToIdp(ctx);
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
app.MapCatalogEndpoints();

// Microsoft.Identity.UI sign-in / sign-out controller actions.
app.MapControllers();

app.Run();

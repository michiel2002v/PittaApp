using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using PittaApp.Api.Domain;

namespace PittaApp.Api.Auth;

/// <summary>
/// Resolves the current user from the JWT token, creating or updating the database row on first login.
/// Bootstrap admin: the email configured in <c>Auth:BootstrapAdminEmail</c> is auto-promoted to admin on first sign-in.
/// </summary>
public class CurrentUserService
{
    private readonly Data.AppDbContext _db;
    private readonly IHttpContextAccessor _httpContext;
    private readonly string? _bootstrapAdminEmail;

    public CurrentUserService(Data.AppDbContext db, IHttpContextAccessor httpContext, IConfiguration config)
    {
        _db = db;
        _httpContext = httpContext;
        _bootstrapAdminEmail = config["Auth:BootstrapAdminEmail"]?.Trim().ToLowerInvariant();
    }

    /// <summary>Returns the current user, provisioning them on first call. Returns null if no JWT principal is present.</summary>
    public async Task<User?> GetOrProvisionAsync(CancellationToken ct = default)
    {
        var principal = _httpContext.HttpContext?.User;
        if (principal?.Identity?.IsAuthenticated != true) return null;

        var oid = principal.FindFirst("oid")?.Value
            ?? principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(oid)) return null;

        var email = principal.FindFirst("preferred_username")?.Value
            ?? principal.FindFirst(ClaimTypes.Upn)?.Value
            ?? principal.FindFirst(ClaimTypes.Email)?.Value
            ?? string.Empty;
        var displayName = principal.FindFirst("name")?.Value ?? email;

        var user = await _db.Users.FirstOrDefaultAsync(u => u.AzureAdObjectId == oid, ct);
        if (user is null)
        {
            user = new User
            {
                AzureAdObjectId = oid,
                Email = email,
                DisplayName = displayName,
                IsAdmin = !string.IsNullOrEmpty(_bootstrapAdminEmail)
                    && string.Equals(email, _bootstrapAdminEmail, StringComparison.OrdinalIgnoreCase),
            };
            _db.Users.Add(user);
            await _db.SaveChangesAsync(ct);
        }
        else if (user.Email != email || user.DisplayName != displayName)
        {
            user.Email = email;
            user.DisplayName = displayName;
            await _db.SaveChangesAsync(ct);
        }

        return user;
    }
}

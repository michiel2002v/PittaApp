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
    private readonly HashSet<string> _bootstrapAdminEmails;

    public CurrentUserService(Data.AppDbContext db, IHttpContextAccessor httpContext, IConfiguration config)
    {
        _db = db;
        _httpContext = httpContext;
        var emails = new List<string>();
        var single = config["Auth:BootstrapAdminEmail"];
        if (!string.IsNullOrWhiteSpace(single)) emails.Add(single);
        var list = config.GetSection("Auth:BootstrapAdminEmails").Get<string[]>();
        if (list is not null) emails.AddRange(list);
        _bootstrapAdminEmails = emails
            .Where(e => !string.IsNullOrWhiteSpace(e))
            .Select(e => e.Trim().ToLowerInvariant())
            .ToHashSet();
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
                IsAdmin = _bootstrapAdminEmails.Contains(email.Trim().ToLowerInvariant()),
            };
            _db.Users.Add(user);
            await _db.SaveChangesAsync(ct);
        }
        else
        {
            var changed = false;
            if (user.Email != email) { user.Email = email; changed = true; }
            if (user.DisplayName != displayName) { user.DisplayName = displayName; changed = true; }
            if (!user.IsAdmin && _bootstrapAdminEmails.Contains(email.Trim().ToLowerInvariant()))
            {
                user.IsAdmin = true;
                changed = true;
            }
            if (changed) await _db.SaveChangesAsync(ct);
        }

        return user;
    }
}

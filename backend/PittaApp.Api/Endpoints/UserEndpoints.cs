using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using PittaApp.Api.Auth;
using PittaApp.Api.Data;
using PittaApp.Api.Iban;

namespace PittaApp.Api.Endpoints;

public static class UserEndpoints
{
    public static IEndpointRouteBuilder MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        var me = app.MapGroup("/me").RequireAuthorization();

        me.MapGet("/", async (CurrentUserService current, CancellationToken ct) =>
        {
            var user = await current.GetOrProvisionAsync(ct);
            if (user is null) return Results.Unauthorized();
            return Results.Ok(new MeResponse(user.Id, user.DisplayName, user.Email, user.Iban, user.IsAdmin));
        });

        me.MapPut("/iban", async (
            UpdateIbanRequest request,
            CurrentUserService current,
            AppDbContext db,
            CancellationToken ct) =>
        {
            var user = await current.GetOrProvisionAsync(ct);
            if (user is null) return Results.Unauthorized();

            var normalized = IbanValidator.Normalize(request.Iban);
            if (normalized is null || !IbanValidator.IsValid(normalized))
            {
                return Results.UnprocessableEntity(new { error = "Invalid IBAN (MOD-97 checksum failed)." });
            }

            var conflict = await db.Users
                .Where(u => u.Iban == normalized && u.Id != user.Id)
                .AnyAsync(ct);
            if (conflict)
            {
                return Results.Conflict(new { error = "IBAN is already registered by another user." });
            }

            user.Iban = normalized;
            await db.SaveChangesAsync(ct);
            return Results.Ok(new MeResponse(user.Id, user.DisplayName, user.Email, user.Iban, user.IsAdmin));
        });

        var admin = app.MapGroup("/admin").RequireAuthorization("admin");

        admin.MapGet("/users", async (AppDbContext db, CancellationToken ct) =>
        {
            var users = await db.Users
                .OrderBy(u => u.DisplayName)
                .Select(u => new MeResponse(u.Id, u.DisplayName, u.Email, u.Iban, u.IsAdmin))
                .ToListAsync(ct);
            return Results.Ok(users);
        });

        admin.MapPut("/users/{id:guid}/admin", async (
            Guid id,
            SetAdminRequest body,
            AppDbContext db,
            CancellationToken ct) =>
        {
            var target = await db.Users.FindAsync([id], ct);
            if (target is null) return Results.NotFound();
            target.IsAdmin = body.IsAdmin;
            await db.SaveChangesAsync(ct);
            return Results.NoContent();
        });

        return app;
    }
}

public record MeResponse(Guid Id, string DisplayName, string Email, string? Iban, bool IsAdmin);
public record UpdateIbanRequest(string Iban);
public record SetAdminRequest(bool IsAdmin);

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PittaApp.Api.Domain;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>The Azure AD object id (oid claim) — stable per user per tenant.</summary>
    [MaxLength(64)]
    public required string AzureAdObjectId { get; set; }

    [MaxLength(256)]
    public required string Email { get; set; }

    [MaxLength(256)]
    public required string DisplayName { get; set; }

    /// <summary>Belgian IBAN, normalized (uppercase, no spaces). Null until user completes onboarding.</summary>
    [MaxLength(34)]
    public string? Iban { get; set; }

    public bool IsAdmin { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}

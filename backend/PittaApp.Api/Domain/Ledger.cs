namespace PittaApp.Api.Domain;

public enum LedgerEntryType
{
    /// <summary>Debit created automatically when an order locks at cutoff.</summary>
    OrderDebit = 0,
    /// <summary>Credit from matched bank payment.</summary>
    Payment = 1,
    /// <summary>Manual debit or credit by an admin with a reason.</summary>
    ManualAdjustment = 2,
}

/// <summary>
/// Immutable financial entry on a user's ledger. Positive = debt, negative = credit.
/// Balance = sum of all entries for that user.
/// </summary>
public class LedgerEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public LedgerEntryType EntryType { get; set; }
    /// <summary>Amount in cents. Positive = debit, negative = credit.</summary>
    public int AmountCents { get; set; }
    public string? Reason { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>Optional link to source order (for OrderDebit).</summary>
    public Guid? OrderId { get; set; }
    public Order? Order { get; set; }

    /// <summary>Optional link to source bank transaction (for Payment).</summary>
    public Guid? BankTransactionId { get; set; }
    public BankTransaction? BankTransaction { get; set; }
}

/// <summary>Record of a CSV bank import (one per uploaded file).</summary>
public class CsvImport
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string FileName { get; set; } = string.Empty;
    public DateTimeOffset UploadedAt { get; set; } = DateTimeOffset.UtcNow;
    public Guid UploadedByUserId { get; set; }
    public int MatchedCount { get; set; }
    public int SkippedCount { get; set; }
    public List<BankTransaction> Transactions { get; set; } = [];
}

/// <summary>A single matched bank transaction from a CSV import.</summary>
public class BankTransaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CsvImportId { get; set; }
    public CsvImport CsvImport { get; set; } = null!;
    public Guid? MatchedUserId { get; set; }
    public User? MatchedUser { get; set; }

    public string CounterpartyIban { get; set; } = string.Empty;
    public string CounterpartyName { get; set; } = string.Empty;
    public string? FreeMessage { get; set; }
    public int AmountCents { get; set; }
    public DateOnly TransactionDate { get; set; }
}

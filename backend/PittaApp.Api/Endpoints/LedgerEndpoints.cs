using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using PittaApp.Api.Auth;
using PittaApp.Api.Data;
using PittaApp.Api.Domain;
using PittaApp.Api.Iban;

namespace PittaApp.Api.Endpoints;

public static class LedgerEndpoints
{
    /// <summary>Strips spaces and uppercases an IBAN for canonical matching.</summary>
    public static string NormalizeIban(string? raw) =>
        string.IsNullOrWhiteSpace(raw) ? "" : raw.Replace(" ", "").ToUpperInvariant();

    public static IEndpointRouteBuilder MapLedgerEndpoints(this IEndpointRouteBuilder app)
    {
        // ── User: balance ──────────────────────────────────────────
        app.MapGet("/me/balance", async (AppDbContext db, CurrentUserService current, CancellationToken ct) =>
        {
            var user = await current.GetOrProvisionAsync(ct);
            if (user is null) return Results.Unauthorized();
            var balance = await db.LedgerEntries.Where(l => l.UserId == user.Id).SumAsync(l => (int?)l.AmountCents, ct) ?? 0;
            return Results.Ok(new { balanceCents = balance });
        }).RequireAuthorization();

        // ── Admin: balance adjust + ledger view ────────────────────
        var adminUsers = app.MapGroup("/admin/users").RequireAuthorization("admin");

        adminUsers.MapPost("/{id:guid}/balance/adjust", async (
            Guid id, BalanceAdjustRequest req, AppDbContext db, CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(req.Reason))
                return Results.UnprocessableEntity(new { error = "Reason is required." });
            var target = await db.Users.FindAsync([id], ct);
            if (target is null) return Results.NotFound();
            var entry = new LedgerEntry
            {
                UserId = id,
                EntryType = LedgerEntryType.ManualAdjustment,
                AmountCents = req.AmountCents,
                Reason = req.Reason.Trim(),
            };
            db.LedgerEntries.Add(entry);
            await db.SaveChangesAsync(ct);
            return Results.Ok(new { entry.Id, entry.AmountCents, entry.Reason });
        });

        adminUsers.MapGet("/{id:guid}/ledger", async (Guid id, AppDbContext db, CancellationToken ct) =>
        {
            var entries = await db.LedgerEntries
                .Where(l => l.UserId == id)
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync(ct);
            var balance = entries.Sum(l => l.AmountCents);
            return Results.Ok(new { balanceCents = balance, entries = entries.Select(l => new {
                l.Id, l.AmountCents, entryType = l.EntryType.ToString(), l.Reason, l.CreatedAt, l.OrderId, l.BankTransactionId
            }) });
        });

        adminUsers.MapGet("/", async (AppDbContext db, CancellationToken ct) =>
        {
            var users = await db.Users.OrderBy(u => u.DisplayName).ToListAsync(ct);
            var balances = await db.LedgerEntries
                .GroupBy(l => l.UserId)
                .Select(g => new { UserId = g.Key, Total = g.Sum(l => l.AmountCents) })
                .ToDictionaryAsync(x => x.UserId, x => x.Total, ct);
            return Results.Ok(users.Select(u => new AdminUserResponse(
                u.Id, u.DisplayName, u.Email, u.Iban, u.IsAdmin,
                balances.TryGetValue(u.Id, out var b) ? b : 0)));
        });

        adminUsers.MapPut("/{id:guid}/iban", async (
            Guid id, AdminIbanRequest req, AppDbContext db, CancellationToken ct) =>
        {
            var normalized = NormalizeIban(req.Iban);
            if (!IbanValidator.IsValid(normalized))
                return Results.UnprocessableEntity(new { error = "Invalid IBAN." });
            var user = await db.Users.FindAsync([id], ct);
            if (user is null) return Results.NotFound();
            var dupe = await db.Users.AnyAsync(u => u.Iban == normalized && u.Id != id, ct);
            if (dupe) return Results.Conflict(new { error = "IBAN already in use." });
            user.Iban = normalized;
            await db.SaveChangesAsync(ct);
            return Results.Ok(new { user.Id, user.Iban });
        });

        // ── Admin: ranking (outstanding > 0, sorted DESC) ──────────
        app.MapGet("/admin/ranking", async (AppDbContext db, CancellationToken ct) =>
        {
            var all = await db.LedgerEntries
                .Include(l => l.User)
                .ToListAsync(ct);
            var ranking = all
                .GroupBy(l => new { l.UserId, l.User.DisplayName, l.User.Email })
                .Select(g => new RankingResponse(
                    g.Key.DisplayName, g.Key.Email,
                    g.Sum(l => l.AmountCents),
                    g.Where(l => l.EntryType == LedgerEntryType.OrderDebit && l.AmountCents > 0).Select(l => l.OrderId).Distinct().Count(),
                    g.Where(l => l.AmountCents > 0).Min(l => (DateTimeOffset?)l.CreatedAt)))
                .Where(r => r.BalanceCents > 0)
                .OrderByDescending(r => r.BalanceCents)
                .ToList();
            return Results.Ok(ranking);
        }).RequireAuthorization("admin");

        // ── User: order history (frozen lines) ─────────────────────
        app.MapGet("/orders/history", async (
            AppDbContext db, CurrentUserService current, CancellationToken ct) =>
        {
            var user = await current.GetOrProvisionAsync(ct);
            if (user is null) return Results.Unauthorized();
            var orders = await db.Orders
                .Where(o => o.UserId == user.Id)
                .Include(o => o.Lines)
                .Include(o => o.OrderRound)
                .OrderByDescending(o => o.OrderRound.DeliveryDate)
                .ToListAsync(ct);
            return Results.Ok(orders.Select(o => new {
                o.Id,
                deliveryDate = o.OrderRound.DeliveryDate,
                status = o.Status.ToString(),
                o.IsPaid,
                totalCents = o.TotalCents,
                lines = o.Lines.Select(l => new {
                    l.ItemName, l.TypeName, l.SizeName, l.SaucesText, l.Remark, l.UnitPriceCents,
                }),
            }));
        }).RequireAuthorization();

        // ── Admin: orders by date, with summary ────────────────────
        app.MapGet("/admin/orders-by-date", async (
            string date, AppDbContext db, CancellationToken ct) =>
        {
            if (!DateOnly.TryParse(date, CultureInfo.InvariantCulture, out var d))
                return Results.UnprocessableEntity(new { error = "Invalid date." });
            var orders = await db.Orders
                .Include(o => o.User)
                .Include(o => o.Lines)
                .Include(o => o.OrderRound)
                .Where(o => o.OrderRound.DeliveryDate == d)
                .ToListAsync(ct);
            var summary = orders
                .SelectMany(o => o.Lines)
                .GroupBy(l => new { l.ItemName, l.TypeName, l.SizeName })
                .Select(g => new { g.Key.ItemName, g.Key.TypeName, g.Key.SizeName, count = g.Count() })
                .OrderBy(x => x.ItemName).ThenBy(x => x.TypeName).ThenBy(x => x.SizeName)
                .ToList();
            return Results.Ok(new {
                date = d,
                totalOrders = orders.Count,
                totalCents = orders.Sum(o => o.TotalCents),
                summary,
                orders = orders.Select(o => new {
                    o.Id,
                    user = o.User.DisplayName,
                    totalCents = o.TotalCents,
                    o.IsPaid,
                    o.Notes,
                    lines = o.Lines.Select(l => new {
                        l.ItemName, l.TypeName, l.SizeName, l.SaucesText, l.Remark, l.UnitPriceCents,
                    }),
                }),
            });
        }).RequireAuthorization("admin");

        // ── Admin: KBC CSV import ──────────────────────────────────
        app.MapPost("/admin/imports", async (
            HttpRequest request, AppDbContext db, CurrentUserService current, CancellationToken ct) =>
        {
            if (!request.HasFormContentType) return Results.BadRequest(new { error = "multipart/form-data required." });
            var form = await request.ReadFormAsync(ct);
            var file = form.Files.FirstOrDefault();
            if (file is null || file.Length == 0) return Results.BadRequest(new { error = "No file uploaded." });

            var exists = await db.CsvImports.AnyAsync(c => c.FileName == file.FileName, ct);
            if (exists) return Results.Conflict(new { error = "A file with this name was already imported." });

            var uploader = await current.GetOrProvisionAsync(ct);
            if (uploader is null) return Results.Unauthorized();

            var csvImport = new CsvImport { FileName = file.FileName, UploadedByUserId = uploader.Id };
            db.CsvImports.Add(csvImport);

            var pittaRegex = new Regex(@"PIT{1,2}A", RegexOptions.IgnoreCase | RegexOptions.Compiled);
            var users = await db.Users.ToListAsync(ct);
            var userByIban = users.ToDictionary(u => u.Iban ?? "", u => u);

            var unmatchedPitta = new List<object>();
            int matched = 0, skipped = 0;

            using var stream = file.OpenReadStream();
            using var reader = new StreamReader(stream, Encoding.UTF8);
            var headerLine = await reader.ReadLineAsync(ct);
            if (headerLine is null) return Results.BadRequest(new { error = "Empty CSV." });
            var headers = headerLine.Split(';').Select(h => h.Trim('"').Trim()).ToList();

            int ibanCol = headers.FindIndex(h => h.Contains("tegenpartij", StringComparison.OrdinalIgnoreCase) && h.Contains("rekening", StringComparison.OrdinalIgnoreCase));
            int nameCol = headers.FindIndex(h => h.Contains("naam tegenpartij", StringComparison.OrdinalIgnoreCase));
            int amountCol = headers.FindIndex(h => h.Equals("Bedrag", StringComparison.OrdinalIgnoreCase));
            int messageCol = headers.FindIndex(h => h.Contains("vrije mededeling", StringComparison.OrdinalIgnoreCase));
            int dateCol = headers.FindIndex(h => h.Contains("datum", StringComparison.OrdinalIgnoreCase));

            if (ibanCol < 0 || amountCol < 0 || messageCol < 0)
                return Results.BadRequest(new { error = "CSV missing required columns." });

            string? line;
            while ((line = await reader.ReadLineAsync(ct)) is not null)
            {
                var cells = line.Split(';').Select(c => c.Trim('"').Trim()).ToList();
                if (cells.Count <= Math.Max(ibanCol, Math.Max(amountCol, messageCol))) { skipped++; continue; }

                var iban = NormalizeIban(cells[ibanCol]);
                var message = cells[messageCol];
                var amountStr = cells[amountCol].Replace(",", ".");
                if (!decimal.TryParse(amountStr, NumberStyles.Any, CultureInfo.InvariantCulture, out var amount))
                { skipped++; continue; }
                var amountCents = (int)Math.Round(amount * 100);

                var isPitta = pittaRegex.IsMatch(message ?? "");
                if (!isPitta || amountCents <= 0) { skipped++; continue; }

                DateOnly txDate = DateOnly.FromDateTime(DateTime.UtcNow);
                if (dateCol >= 0 && dateCol < cells.Count)
                {
                    if (DateOnly.TryParse(cells[dateCol], CultureInfo.GetCultureInfo("nl-BE"), out var d)) txDate = d;
                    else if (DateOnly.TryParse(cells[dateCol], CultureInfo.InvariantCulture, out d)) txDate = d;
                }

                if (userByIban.TryGetValue(iban, out var matchedUser))
                {
                    var tx = new BankTransaction
                    {
                        CsvImport = csvImport,
                        MatchedUserId = matchedUser.Id,
                        CounterpartyIban = iban,
                        CounterpartyName = nameCol >= 0 && nameCol < cells.Count ? cells[nameCol] : "",
                        FreeMessage = message,
                        AmountCents = amountCents,
                        TransactionDate = txDate,
                    };
                    csvImport.Transactions.Add(tx);

                    db.LedgerEntries.Add(new LedgerEntry
                    {
                        UserId = matchedUser.Id,
                        EntryType = LedgerEntryType.Payment,
                        AmountCents = -amountCents, // credit
                        Reason = $"KBC payment ({file.FileName})",
                        BankTransaction = tx,
                    });
                    matched++;
                }
                else
                {
                    unmatchedPitta.Add(new { iban, amountCents, date = txDate, freeMededeling = message });
                    skipped++;
                }
            }

            csvImport.MatchedCount = matched;
            csvImport.SkippedCount = skipped;
            await db.SaveChangesAsync(ct);

            return Results.Ok(new { csvImport.Id, matchedCount = matched, skippedCount = skipped, unmatchedPittaRows = unmatchedPitta });
        }).RequireAuthorization("admin").DisableAntiforgery();

        app.MapGet("/admin/imports", async (AppDbContext db, CancellationToken ct) =>
        {
            var list = await db.CsvImports
                .OrderByDescending(c => c.UploadedAt)
                .Select(c => new { c.Id, c.FileName, c.UploadedAt, c.MatchedCount, c.SkippedCount })
                .ToListAsync(ct);
            return Results.Ok(list);
        }).RequireAuthorization("admin");

        return app;
    }
}

public record BalanceAdjustRequest(int AmountCents, string Reason);
public record AdminIbanRequest(string Iban);
public record AdminUserResponse(Guid Id, string DisplayName, string Email, string? Iban, bool IsAdmin, int BalanceCents);
public record RankingResponse(string DisplayName, string Email, int BalanceCents, int UnpaidRoundCount, DateTimeOffset? OldestDebitDate);

using System.Globalization;
using System.Numerics;

namespace PittaApp.Api.Iban;

public static class IbanValidator
{
    /// <summary>
    /// Normalizes a candidate IBAN: strips whitespace and uppercases. Returns null if input is null/empty.
    /// </summary>
    public static string? Normalize(string? input)
    {
        if (string.IsNullOrWhiteSpace(input)) return null;
        Span<char> buffer = stackalloc char[input.Length];
        var len = 0;
        foreach (var c in input)
        {
            if (char.IsWhiteSpace(c)) continue;
            buffer[len++] = char.ToUpperInvariant(c);
        }
        return new string(buffer[..len]);
    }

    /// <summary>
    /// Validates an IBAN using the MOD-97 checksum (ISO 13616).
    /// Input may contain spaces; will be normalized first.
    /// </summary>
    public static bool IsValid(string? input)
    {
        var iban = Normalize(input);
        if (iban is null) return false;
        if (iban.Length is < 15 or > 34) return false;

        // Country code (2 letters) + check digits (2 digits) + BBAN
        if (!char.IsLetter(iban[0]) || !char.IsLetter(iban[1])) return false;
        if (!char.IsDigit(iban[2]) || !char.IsDigit(iban[3])) return false;

        // Move first 4 chars to end, then convert letters to numbers (A=10..Z=35)
        var rearranged = string.Concat(iban.AsSpan(4), iban.AsSpan(0, 4));
        var numeric = new System.Text.StringBuilder(rearranged.Length * 2);
        foreach (var c in rearranged)
        {
            if (char.IsLetter(c))
            {
                numeric.Append((c - 'A' + 10).ToString(CultureInfo.InvariantCulture));
            }
            else if (char.IsDigit(c))
            {
                numeric.Append(c);
            }
            else
            {
                return false;
            }
        }

        if (!BigInteger.TryParse(numeric.ToString(), NumberStyles.None, CultureInfo.InvariantCulture, out var big))
            return false;

        return big % 97 == 1;
    }
}

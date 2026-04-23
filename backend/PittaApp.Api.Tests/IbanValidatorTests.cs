using PittaApp.Api.Iban;
using Xunit;

namespace PittaApp.Api.Tests;

public class IbanValidatorTests
{
    [Theory]
    // Valid Belgian IBANs (ECBS examples + textbook samples).
    [InlineData("BE68 5390 0754 7034")]
    [InlineData("BE68539007547034")]
    [InlineData("be68539007547034")]
    [InlineData("BE62510007547061")]
    // Other-country valid samples.
    [InlineData("GB82 WEST 1234 5698 7654 32")]
    [InlineData("DE89 3704 0044 0532 0130 00")]
    [InlineData("NL91 ABNA 0417 1643 00")]
    public void IsValid_AcceptsValidIbans(string input)
    {
        Assert.True(IbanValidator.IsValid(input));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("BE68 5390 0754 7035")] // wrong checksum
    [InlineData("XX00 0000 0000 0000")]
    [InlineData("BE")]                  // too short
    [InlineData("BE68$5390")]            // non-alphanumeric
    public void IsValid_RejectsInvalidIbans(string? input)
    {
        Assert.False(IbanValidator.IsValid(input));
    }

    [Fact]
    public void Normalize_StripsSpacesAndUppercases()
    {
        Assert.Equal("BE68539007547034", IbanValidator.Normalize(" be68 5390 0754 7034 "));
    }

    [Fact]
    public void Normalize_ReturnsNullForEmpty()
    {
        Assert.Null(IbanValidator.Normalize(""));
        Assert.Null(IbanValidator.Normalize(null));
    }
}

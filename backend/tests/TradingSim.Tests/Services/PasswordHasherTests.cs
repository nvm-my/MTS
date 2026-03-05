using FluentAssertions;
using TradingSim.Infrastructure.Security; // adjust if your namespace differs
using Xunit;

namespace TradingSim.Tests.Services;

public class PasswordHasherTests
{
    private readonly PasswordHasher _hasher = new();

    [Fact]
    public void Hash_Should_Return_NonEmptyHash()
    {
        var hash = _hasher.Hash("P@ssw0rd!");
        hash.Should().NotBeNullOrWhiteSpace();
        hash.Should().NotBe("P@ssw0rd!");
    }

    [Fact]
    public void Verify_Should_Return_True_For_CorrectPassword()
    {
        var password = "P@ssw0rd!";
        var hash = _hasher.Hash(password);

        var ok = _hasher.Verify(password, hash);

        ok.Should().BeTrue();
    }

    [Fact]
    public void Verify_Should_Return_False_For_WrongPassword()
    {
        var hash = _hasher.Hash("CorrectPassword");

        var ok = _hasher.Verify("WrongPassword", hash);

        ok.Should().BeFalse();
    }
}
using FluentAssertions;
using Moq;
using TradingSim.Application.Interfaces.Services;
using TradingSim.Domain.Entities;
using TradingSim.Domain.Matching;
using TradingSim.Infrastructure.Services; // adjust namespace
using Xunit;

namespace TradingSim.Tests.Services;

public class MatchingEngineAdapterTests
{
    [Fact]
    public void LoadOpenLimitOrder_Should_Delegate_To_Engine()
    {
        var engineMock = new Mock<IMatchingEngineCore>(); // see note below
        var adapter = new MatchingEngineAdapter(engineMock.Object);

        var order = new Order { Id = "1", Symbol = "GP" };

        adapter.LoadOpenLimitOrder(order);

        engineMock.Verify(x => x.LoadOpenLimitOrder(order), Times.Once);
    }
}
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using TradingSim.Infrastructure.Mongo;
//..using TradingSim.Infrastructure.Seed;

namespace TradingSim.Infrastructure.Seed;

public sealed class StartupLoader : IHostedService
{
    private readonly IServiceScopeFactory _scopeFactory;

    public StartupLoader(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();

        // Resolve scoped services inside the scope
        var mongo = scope.ServiceProvider.GetRequiredService<MongoContext>();

        // Seed database (make sure SeedData is accessible)
        await SeedData.SeedAsync(mongo.Db);
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
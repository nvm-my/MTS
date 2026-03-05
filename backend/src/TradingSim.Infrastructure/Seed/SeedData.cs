using MongoDB.Driver;
using TradingSim.Domain.Entities;

namespace TradingSim.Infrastructure.Seed;

public static class SeedData
{
    public static async Task SeedAsync(IMongoDatabase database)
    {
        var collection = database.GetCollection<Instrument>("Instruments");

        var count = await collection.CountDocumentsAsync(_ => true);
        if (count > 0) return;

        var instruments = new List<Instrument>
        {
            new Instrument { Symbol = "GP", Name = "Grameenphone Ltd." },
            new Instrument { Symbol = "BATBC", Name = "British American Tobacco Bangladesh" },
            new Instrument { Symbol = "BEXIMCO", Name = "Beximco Ltd." },
            new Instrument { Symbol = "SQURPHARMA", Name = "Square Pharmaceuticals Ltd." },
            new Instrument { Symbol = "RENATA", Name = "Renata Ltd." },
            new Instrument { Symbol = "BRACBANK", Name = "BRAC Bank Ltd." },
            new Instrument { Symbol = "CITYBANK", Name = "The City Bank Ltd." },
            new Instrument { Symbol = "DUTCHBANGL", Name = "Dutch-Bangla Bank Ltd." },
            new Instrument { Symbol = "IFIC", Name = "IFIC Bank Ltd." },
            new Instrument { Symbol = "PUBALIBANK", Name = "Pubali Bank Ltd." },
            new Instrument { Symbol = "OLYMPIC", Name = "Olympic Industries Ltd." },
            new Instrument { Symbol = "ACI", Name = "Advanced Chemical Industries Ltd." },
            new Instrument { Symbol = "ACIFORMULA", Name = "ACI Formulations Ltd." },
            new Instrument { Symbol = "ACMELAB", Name = "ACME Laboratories Ltd." },
            new Instrument { Symbol = "IBNSINA", Name = "Ibn Sina Pharmaceutical Ltd." },
            new Instrument { Symbol = "MARICO", Name = "Marico Bangladesh Ltd." },
            new Instrument { Symbol = "POWERGRID", Name = "Power Grid Company of Bangladesh Ltd." },
            new Instrument { Symbol = "SUMITPOWER", Name = "Summit Power Ltd." },
            new Instrument { Symbol = "BSRMLTD", Name = "BSRM Ltd." },
            new Instrument { Symbol = "WALTONHIL", Name = "Walton Hi-Tech Industries Ltd." }
        };

        await collection.InsertManyAsync(instruments);
    }
}
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using CultureEvents.API.Configurations;
using Microsoft.Extensions.Options;

namespace CultureEvents.API.Controllers;

[ApiController]
[Route("[controller]")]
public class HealthController : ControllerBase
{
    private readonly IMongoClient _mongoClient;
    private readonly MongoDbSettings _settings;

    public HealthController(IOptions<MongoDbSettings> settings)
    {
        _settings = settings.Value;
        _mongoClient = new MongoClient(_settings.ConnectionString);
    }

    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new { status = "healthy" });
    }

    [HttpGet("status")]
    public async Task<IActionResult> GetStatus()
    {
        try
        {
            // Test MongoDB connection
            await _mongoClient.ListDatabaseNamesAsync();

            var status = new
            {
                timestamp = DateTime.UtcNow,
                version = "1.0.0",
                environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"),
                database = new
                {
                    name = _settings.DatabaseName,
                    status = "connected"
                }
            };

            return Ok(status);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                timestamp = DateTime.UtcNow,
                status = "error",
                message = "Database connection failed",
                details = ex.Message
            });
        }
    }
}

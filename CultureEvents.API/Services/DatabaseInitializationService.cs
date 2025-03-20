using CultureEvents.API.Configurations;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CultureEvents.API.Services
{
    public class DatabaseInitializationService : IHostedService
    {
        private readonly MongoDbSettings _mongoDbSettings;
        private readonly ILogger<DatabaseInitializationService> _logger;
        private readonly IServiceProvider _serviceProvider;

        public DatabaseInitializationService(
            IOptions<MongoDbSettings> mongoDbSettings,
            ILogger<DatabaseInitializationService> logger,
            IServiceProvider serviceProvider)
        {
            _mongoDbSettings = mongoDbSettings.Value;
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            try
            {
                _logger.LogInformation("Starting database initialization...");
                
                // Connect to MongoDB
                var client = new MongoClient(_mongoDbSettings.ConnectionString);
                var database = client.GetDatabase(_mongoDbSettings.DatabaseName);

                // Create and run the database initializer
                var loggerFactory = new LoggerFactory();
                var initializerLogger = loggerFactory.CreateLogger<DatabaseInitializer>();
                var dbInitializer = new DatabaseInitializer(database, initializerLogger);
                await dbInitializer.InitializeAsync();
                
                // Seed sample data if needed (only for development environments)
                var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
                if (env == "Development")
                {
                    _logger.LogInformation("Development environment detected. Checking if sample data should be seeded...");
                    await dbInitializer.SeedSampleDataAsync();
                }
                
                _logger.LogInformation("Database initialization completed successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during database initialization: {Message}", ex.Message);
                // Don't throw the exception - allow the application to start even if DB initialization fails
                // The application might still be able to function, and the error is logged
            }
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            // Nothing to do here, MongoDB connection will be closed automatically
            return Task.CompletedTask;
        }
    }
}

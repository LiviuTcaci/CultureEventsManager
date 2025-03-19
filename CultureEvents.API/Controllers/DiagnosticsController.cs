using CultureEvents.API.Data;
using CultureEvents.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CultureEvents.API.Configurations;
using MongoDB.Driver;
using MongoDB.Bson;

namespace CultureEvents.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DiagnosticsController : ControllerBase
    {
        private readonly IRepository<Category> _categoryRepository;
        private readonly MongoDbSettings _settings;

        public DiagnosticsController(IRepository<Category> categoryRepository, IOptions<MongoDbSettings> settings)
        {
            _categoryRepository = categoryRepository;
            _settings = settings.Value;
        }

        [HttpGet]
        public IActionResult HealthCheck()
        {
            return Ok(new { status = "Diagnostics controller is working" });
        }

        [HttpGet("check-mongo")]
        public async Task<ActionResult<object>> CheckMongo()
        {
            try
            {
                // First, try to get a direct connection to MongoDB
                var client = new MongoClient(_settings.ConnectionString);
                var database = client.GetDatabase(_settings.DatabaseName);
                
                // Get collection names
                var collectionNames = new List<string>();
                var filter = new BsonDocument();
                using (var cursor = await database.ListCollectionsAsync())
                {
                    while (await cursor.MoveNextAsync())
                    {
                        foreach (var collection in cursor.Current)
                        {
                            collectionNames.Add(collection["name"].AsString);
                        }
                    }
                }

                // Test querying the categories collection directly (note: MongoDB collection is plural "categories")
                var categoryCollection = database.GetCollection<Category>("categories");
                var categoriesCount = await categoryCollection.CountDocumentsAsync(new BsonDocument());
                var categoriesList = await categoryCollection.Find(new BsonDocument()).Limit(5).ToListAsync();

                return Ok(new
                {
                    ConnectionStatus = "Success",
                    ConnectionString = _settings.ConnectionString.Length > 20 
                        ? _settings.ConnectionString.Substring(0, 20) + "...(truncated)" 
                        : _settings.ConnectionString,
                    DatabaseName = _settings.DatabaseName,
                    Collections = collectionNames,
                    CategoriesCollectionCount = categoriesCount,
                    CategoriesSample = categoriesList
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Error = $"MongoDB connection error: {ex.Message}",
                    InnerException = ex.InnerException?.Message,
                    StackTrace = ex.StackTrace
                });
            }
        }

        [HttpPost("create-test-category")]
        public async Task<ActionResult<Category>> CreateTestCategory()
        {
            try
            {
                // Create a direct connection to MongoDB to bypass repository naming issue
                var client = new MongoClient(_settings.ConnectionString);
                var database = client.GetDatabase(_settings.DatabaseName);
                var categoryCollection = database.GetCollection<Category>("categories");
                
                var category = new Category
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Test Category " + DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                    Description = "Created by diagnostics controller",
                    Icon = "test_icon",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    IsDeleted = false
                };

                await categoryCollection.InsertOneAsync(category);
                return Ok(new
                {
                    Message = "Test category created successfully using direct MongoDB connection",
                    Category = category
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Error = $"Failed to create test category: {ex.Message}",
                    InnerException = ex.InnerException?.Message,
                    StackTrace = ex.StackTrace
                });
            }
        }
    }
}

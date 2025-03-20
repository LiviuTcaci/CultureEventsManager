using CultureEvents.API.Models;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CultureEvents.API.Configurations
{
    public class DatabaseInitializer
    {
        private readonly IMongoDatabase _database;
        private readonly ILogger<DatabaseInitializer> _logger;

        public DatabaseInitializer(IMongoDatabase database, ILogger<DatabaseInitializer> logger)
        {
            _database = database;
            _logger = logger;
        }

        public async Task InitializeAsync()
        {
            try
            {
                _logger.LogInformation("Starting database initialization...");

                // Configure schema validation and indexes
                await MongoSchemaValidation.ConfigureSchemaValidationAsync(_database);
                await MongoCollectionConfiguration.ConfigureIndexesAsync(_database);

                // Force creation of all collections 
                await EnsureCollectionsExistAsync();

                _logger.LogInformation("Database initialization completed successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during database initialization: {Message}", ex.Message);
                throw;
            }
        }

        private async Task EnsureCollectionsExistAsync()
        {
            var collectionNames = new List<string>
            {
                "Users",
                "Events",
                "Categories",
                "Venues",
                "Tickets",
                "Comments",
                "Ratings",
                "Performers"
            };

            var existingCollections = await _database.ListCollectionNamesAsync();
            var existingCollectionsList = await existingCollections.ToListAsync();

            foreach (var collectionName in collectionNames)
            {
                if (!existingCollectionsList.Contains(collectionName))
                {
                    _logger.LogInformation("Creating collection: {CollectionName}", collectionName);
                    await _database.CreateCollectionAsync(collectionName);
                }
                else
                {
                    _logger.LogInformation("Collection already exists: {CollectionName}", collectionName);
                }
            }
        }

        public async Task SeedSampleDataAsync()
        {
            try
            {
                _logger.LogInformation("Checking if sample data needs to be seeded...");

                // Only seed if database is empty
                var users = _database.GetCollection<User>("Users");
                var userCount = await users.CountDocumentsAsync(FilterDefinition<User>.Empty);

                if (userCount > 0)
                {
                    _logger.LogInformation("Database already contains data. Skipping seed operation.");
                    return;
                }

                _logger.LogInformation("Seeding sample data...");

                // Create sample collections with at least one document each
                await SeedSampleUser();
                await SeedSampleCategory();
                await SeedSampleVenue();
                await SeedSamplePerformer();
                await SeedSampleEvent();
                await SeedSampleTicket();
                await SeedSampleComment();
                await SeedSampleRating();

                _logger.LogInformation("Sample data seeded successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error seeding sample data: {Message}", ex.Message);
                throw;
            }
        }

        private async Task SeedSampleUser()
        {
            var collection = _database.GetCollection<User>("Users");
            var user = new User
            {
                Username = "demo_user",
                Email = "user@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                FullName = "Demo User",
                ProfilePicture = "https://randomuser.me/api/portraits/lego/1.jpg",
                Role = "User"
            };
            await collection.InsertOneAsync(user);
        }

        private async Task SeedSampleCategory()
        {
            var collection = _database.GetCollection<Category>("Categories");
            
            // Check if category already exists
            var existingCategory = await collection.Find(c => c.Name == "Music").FirstOrDefaultAsync();
            if (existingCategory != null)
            {
                _logger.LogInformation("Music category already exists. Skipping creation.");
                return;
            }

            var category = new Category
            {
                Name = "Music",
                Description = "Music events including concerts, festivals, and performances",
                Icon = "music_note",
                ParentId = string.Empty // Empty string instead of null for required field
            };
            await collection.InsertOneAsync(category);
        }

        private async Task SeedSampleVenue()
        {
            var collection = _database.GetCollection<Venue>("Venues");
            var venue = new Venue
            {
                Name = "Central Concert Hall",
                Address = "123 Main Street",
                City = "Cluj-Napoca",
                Country = "Romania",
                Capacity = 1000,
                Location = new GeoLocation
                {
                    Latitude = 46.770439,
                    Longitude = 23.591423
                },
                ImageUrl = "https://example.com/venues/central-hall.jpg",
                Description = "A premier concert venue in the heart of Cluj",
                Facilities = new[] { "Parking", "Food Court", "Wheelchair Access" }
            };
            await collection.InsertOneAsync(venue);
        }

        private async Task SeedSamplePerformer()
        {
            var collection = _database.GetCollection<Performer>("Performers");
            var performer = new Performer
            {
                Name = "The Romanian Symphony",
                Type = "Orchestra",
                Description = "Romania's finest classical orchestra",
                ImageUrl = "https://example.com/performers/romanian-symphony.jpg",
                ContactEmail = "contact@romaniansymphony.ro",
                Website = "https://www.romaniansymphony.ro",
                SocialMedia = new Dictionary<string, string>
                {
                    { "facebook", "https://facebook.com/romaniansymphony" },
                    { "instagram", "https://instagram.com/romaniansymphony" }
                }
            };
            await collection.InsertOneAsync(performer);
        }

        private async Task SeedSampleEvent()
        {
            // Get IDs of the previously created entities
            var categories = _database.GetCollection<Category>("Categories");
            var venues = _database.GetCollection<Venue>("Venues");
            var performers = _database.GetCollection<Performer>("Performers");
            var users = _database.GetCollection<User>("Users");

            var category = await categories.Find(FilterDefinition<Category>.Empty).FirstOrDefaultAsync();
            var venue = await venues.Find(FilterDefinition<Venue>.Empty).FirstOrDefaultAsync();
            var performer = await performers.Find(FilterDefinition<Performer>.Empty).FirstOrDefaultAsync();
            var user = await users.Find(FilterDefinition<User>.Empty).FirstOrDefaultAsync();

            if (category == null || venue == null || performer == null || user == null)
            {
                throw new Exception("Required entities for event creation not found");
            }

            var collection = _database.GetCollection<Event>("Events");
            var evnt = new Event
            {
                Title = "Summer Classical Night",
                Description = "An evening of classical masterpieces performed by The Romanian Symphony",
                OrganizerId = user.Id ?? string.Empty,
                CategoryId = category.Id ?? string.Empty,
                VenueId = venue.Id ?? string.Empty,
                StartDate = DateTime.UtcNow.AddDays(30),
                EndDate = DateTime.UtcNow.AddDays(30).AddHours(3),
                ImageUrls = new List<string> { "https://example.com/images/classical-concert.jpg" },
                Status = "Announced",
                Capacity = venue.Capacity,
                PerformerIds = new List<string> { performer.Id ?? string.Empty },
                PerformerDetails = new List<PerformerDetail>
                {
                    new PerformerDetail
                    {
                        PerformerId = performer.Id ?? string.Empty,
                        Order = 1,
                        Role = "Headliner",
                        DurationMinutes = 120
                    }
                }
            };
            await collection.InsertOneAsync(evnt);
        }

        private async Task SeedSampleTicket()
        {
            // Get IDs of the previously created entities
            var events = _database.GetCollection<Event>("Events");
            var users = _database.GetCollection<User>("Users");

            var evnt = await events.Find(FilterDefinition<Event>.Empty).FirstOrDefaultAsync();
            var user = await users.Find(FilterDefinition<User>.Empty).FirstOrDefaultAsync();

            if (evnt == null || user == null)
            {
                throw new Exception("Required entities for ticket creation not found");
            }

            var collection = _database.GetCollection<Ticket>("Tickets");
            var ticket = new Ticket
            {
                EventId = evnt.Id ?? string.Empty,
                UserId = user.Id ?? string.Empty,
                Type = "Standard",
                Price = 50.00m,
                PurchaseDate = DateTime.UtcNow,
                Status = "Active",
                SeatNumber = "A12",
                Barcode = Guid.NewGuid().ToString("N")
            };
            await collection.InsertOneAsync(ticket);
        }

        private async Task SeedSampleComment()
        {
            // Get IDs of the previously created entities
            var events = _database.GetCollection<Event>("Events");
            var users = _database.GetCollection<User>("Users");

            var evnt = await events.Find(FilterDefinition<Event>.Empty).FirstOrDefaultAsync();
            var user = await users.Find(FilterDefinition<User>.Empty).FirstOrDefaultAsync();

            if (evnt == null || user == null)
            {
                throw new Exception("Required entities for comment creation not found");
            }

            var collection = _database.GetCollection<Comment>("Comments");
            var comment = new Comment
            {
                EventId = evnt.Id ?? string.Empty,
                UserId = user.Id ?? string.Empty,
                Content = "Looking forward to this event! It's going to be amazing.",
                ParentId = string.Empty, // Empty string instead of null for required field
                Status = "Active",
                Likes = 5
            };
            await collection.InsertOneAsync(comment);
        }

        private async Task SeedSampleRating()
        {
            // Get IDs of the previously created entities
            var events = _database.GetCollection<Event>("Events");
            var users = _database.GetCollection<User>("Users");

            var evnt = await events.Find(FilterDefinition<Event>.Empty).FirstOrDefaultAsync();
            var user = await users.Find(FilterDefinition<User>.Empty).FirstOrDefaultAsync();

            if (evnt == null || user == null)
            {
                throw new Exception("Required entities for rating creation not found");
            }

            var collection = _database.GetCollection<Rating>("Ratings");
            var rating = new Rating
            {
                EventId = evnt.Id ?? string.Empty,
                UserId = user.Id ?? string.Empty,
                Value = 5,
                Comment = "Excellent event! Would definitely attend again."
            };
            await collection.InsertOneAsync(rating);
        }
    }
}

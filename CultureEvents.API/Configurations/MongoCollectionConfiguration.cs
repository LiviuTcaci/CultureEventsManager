using CultureEvents.API.Models;
using MongoDB.Driver;
using System.Threading.Tasks;

namespace CultureEvents.API.Configurations
{
    public static class MongoCollectionConfiguration
    {
        public static async Task ConfigureIndexesAsync(IMongoDatabase database)
        {
            // Configure User collection indexes
            var userCollection = database.GetCollection<User>("Users");
            await CreateUserIndexes(userCollection);

            // Configure Event collection indexes
            var eventCollection = database.GetCollection<Event>("Events");
            await CreateEventIndexes(eventCollection);

            // Configure Ticket collection indexes
            var ticketCollection = database.GetCollection<Ticket>("Tickets");
            await CreateTicketIndexes(ticketCollection);

            // Configure Category collection indexes
            var categoryCollection = database.GetCollection<Category>("Categories");
            await CreateCategoryIndexes(categoryCollection);

            // Configure Venue collection indexes
            var venueCollection = database.GetCollection<Venue>("Venues");
            await CreateVenueIndexes(venueCollection);

            // Configure Performer collection indexes
            var performerCollection = database.GetCollection<Performer>("Performers");
            await CreatePerformerIndexes(performerCollection);

            // Configure Comment collection indexes
            var commentCollection = database.GetCollection<Comment>("Comments");
            await CreateCommentIndexes(commentCollection);

            // Configure Rating collection indexes
            var ratingCollection = database.GetCollection<Rating>("Ratings");
            await CreateRatingIndexes(ratingCollection);
        }

        private static async Task CreateUserIndexes(IMongoCollection<User> collection)
        {
            // Email index (unique)
            var emailIndexModel = new CreateIndexModel<User>(
                Builders<User>.IndexKeys.Ascending(u => u.Email),
                new CreateIndexOptions { Unique = true, Background = true }
            );
            await collection.Indexes.CreateOneAsync(emailIndexModel);

            // Username index (unique)
            var usernameIndexModel = new CreateIndexModel<User>(
                Builders<User>.IndexKeys.Ascending(u => u.Username),
                new CreateIndexOptions { Unique = true, Background = true }
            );
            await collection.Indexes.CreateOneAsync(usernameIndexModel);

            // Role index for quick filtering by role
            var roleIndexModel = new CreateIndexModel<User>(
                Builders<User>.IndexKeys.Ascending(u => u.Role),
                new CreateIndexOptions { Background = true }
            );
            await collection.Indexes.CreateOneAsync(roleIndexModel);
        }

        private static async Task CreateEventIndexes(IMongoCollection<Event> collection)
        {
            // Category index for quick filtering by category
            var categoryIndexModel = new CreateIndexModel<Event>(
                Builders<Event>.IndexKeys.Ascending(e => e.CategoryId),
                new CreateIndexOptions { Background = true }
            );
            await collection.Indexes.CreateOneAsync(categoryIndexModel);

            // Venue index for quick filtering by venue
            var venueIndexModel = new CreateIndexModel<Event>(
                Builders<Event>.IndexKeys.Ascending(e => e.VenueId),
                new CreateIndexOptions { Background = true }
            );
            await collection.Indexes.CreateOneAsync(venueIndexModel);

            // Start date index for date-based filtering and sorting
            var startDateIndexModel = new CreateIndexModel<Event>(
                Builders<Event>.IndexKeys.Ascending(e => e.StartDate),
                new CreateIndexOptions { Background = true }
            );
            await collection.Indexes.CreateOneAsync(startDateIndexModel);

            // Status index for quick filtering by status
            var statusIndexModel = new CreateIndexModel<Event>(
                Builders<Event>.IndexKeys.Ascending(e => e.Status),
                new CreateIndexOptions { Background = true }
            );
            await collection.Indexes.CreateOneAsync(statusIndexModel);

            // Compound index for category + start date (common query pattern)
            var categoryDateIndexModel = new CreateIndexModel<Event>(
                Builders<Event>.IndexKeys
                    .Ascending(e => e.CategoryId)
                    .Ascending(e => e.StartDate),
                new CreateIndexOptions { Background = true }
            );
            await collection.Indexes.CreateOneAsync(categoryDateIndexModel);

            // Organizer index for quick filtering by organizer
            var organizerIndexModel = new CreateIndexModel<Event>(
                Builders<Event>.IndexKeys.Ascending(e => e.OrganizerId),
                new CreateIndexOptions { Background = true }
            );
            await collection.Indexes.CreateOneAsync(organizerIndexModel);
        }

        private static async Task CreateTicketIndexes(IMongoCollection<Ticket> collection)
        {
            // Event ID index for quick filtering by event
            var eventIndexModel = new CreateIndexModel<Ticket>(
                Builders<Ticket>.IndexKeys.Ascending(t => t.EventId),
                new CreateIndexOptions { Background = true }
            );
            await collection.Indexes.CreateOneAsync(eventIndexModel);

            // User ID index for quick filtering by user
            var userIndexModel = new CreateIndexModel<Ticket>(
                Builders<Ticket>.IndexKeys.Ascending(t => t.UserId),
                new CreateIndexOptions { Background = true }
            );
            await collection.Indexes.CreateOneAsync(userIndexModel);

            // Status index for quick filtering by status
            var statusIndexModel = new CreateIndexModel<Ticket>(
                Builders<Ticket>.IndexKeys.Ascending(t => t.Status),
                new CreateIndexOptions { Background = true }
            );
            await collection.Indexes.CreateOneAsync(statusIndexModel);

            // Compound index for user + event (common query pattern)
            var userEventIndexModel = new CreateIndexModel<Ticket>(
                Builders<Ticket>.IndexKeys
                    .Ascending(t => t.UserId)
                    .Ascending(t => t.EventId),
                new CreateIndexOptions { Background = true }
            );
            await collection.Indexes.CreateOneAsync(userEventIndexModel);

            // Barcode index (unique)
            var barcodeIndexModel = new CreateIndexModel<Ticket>(
                Builders<Ticket>.IndexKeys.Ascending(t => t.Barcode),
                new CreateIndexOptions { Unique = true, Background = true }
            );
            await collection.Indexes.CreateOneAsync(barcodeIndexModel);
        }

        private static async Task CreateCategoryIndexes(IMongoCollection<Category> collection)
        {
            // Name index (unique)
            var nameIndexModel = new CreateIndexModel<Category>(
                Builders<Category>.IndexKeys.Ascending(c => c.Name),
                new CreateIndexOptions { Unique = true, Background = true }
            );
            await collection.Indexes.CreateOneAsync(nameIndexModel);

            // Parent ID index for hierarchical queries
            var parentIndexModel = new CreateIndexModel<Category>(
                Builders<Category>.IndexKeys.Ascending(c => c.ParentId),
                new CreateIndexOptions { Background = true }
            );
            await collection.Indexes.CreateOneAsync(parentIndexModel);
        }

        private static async Task CreateVenueIndexes(IMongoCollection<Venue> collection)
        {
            // Name index for searching venues by name
            var nameIndexModel = new CreateIndexModel<Venue>(
                Builders<Venue>.IndexKeys.Ascending(v => v.Name),
                new CreateIndexOptions { Background = true }
            );
            await collection.Indexes.CreateOneAsync(nameIndexModel);

            // City index for filtering venues by city
            var cityIndexModel = new CreateIndexModel<Venue>(
                Builders<Venue>.IndexKeys.Ascending(v => v.City),
                new CreateIndexOptions { Background = true }
            );
            await collection.Indexes.CreateOneAsync(cityIndexModel);

            // Country index for filtering venues by country
            var countryIndexModel = new CreateIndexModel<Venue>(
                Builders<Venue>.IndexKeys.Ascending(v => v.Country),
                new CreateIndexOptions { Background = true }
            );
            await collection.Indexes.CreateOneAsync(countryIndexModel);

            // Geospatial index for location-based queries
            var geoIndexModel = new CreateIndexModel<Venue>(
                Builders<Venue>.IndexKeys.Geo2DSphere(v => v.Location),
                new CreateIndexOptions { Background = true }
            );
            await collection.Indexes.CreateOneAsync(geoIndexModel);
        }

        private static async Task CreatePerformerIndexes(IMongoCollection<Performer> collection)
        {
            // Name index for searching performers by name
            var nameIndexModel = new CreateIndexModel<Performer>(
                Builders<Performer>.IndexKeys.Ascending(p => p.Name),
                new CreateIndexOptions { Background = true }
            );
            await collection.Indexes.CreateOneAsync(nameIndexModel);

            // Type index for filtering performers by type
            var typeIndexModel = new CreateIndexModel<Performer>(
                Builders<Performer>.IndexKeys.Ascending(p => p.Type),
                new CreateIndexOptions { Background = true }
            );
            await collection.Indexes.CreateOneAsync(typeIndexModel);
        }

        private static async Task CreateCommentIndexes(IMongoCollection<Comment> collection)
        {
            // Event ID index for filtering comments by event
            var eventIndexModel = new CreateIndexModel<Comment>(
                Builders<Comment>.IndexKeys.Ascending(c => c.EventId),
                new CreateIndexOptions { Background = true }
            );
            await collection.Indexes.CreateOneAsync(eventIndexModel);

            // User ID index for filtering comments by user
            var userIndexModel = new CreateIndexModel<Comment>(
                Builders<Comment>.IndexKeys.Ascending(c => c.UserId),
                new CreateIndexOptions { Background = true }
            );
            await collection.Indexes.CreateOneAsync(userIndexModel);

            // Parent ID index for retrieving comment replies
            var parentIndexModel = new CreateIndexModel<Comment>(
                Builders<Comment>.IndexKeys.Ascending(c => c.ParentId),
                new CreateIndexOptions { Background = true }
            );
            await collection.Indexes.CreateOneAsync(parentIndexModel);

            // Status index for filtering by status
            var statusIndexModel = new CreateIndexModel<Comment>(
                Builders<Comment>.IndexKeys.Ascending(c => c.Status),
                new CreateIndexOptions { Background = true }
            );
            await collection.Indexes.CreateOneAsync(statusIndexModel);
        }

        private static async Task CreateRatingIndexes(IMongoCollection<Rating> collection)
        {
            // Event ID index for filtering ratings by event
            var eventIndexModel = new CreateIndexModel<Rating>(
                Builders<Rating>.IndexKeys.Ascending(r => r.EventId),
                new CreateIndexOptions { Background = true }
            );
            await collection.Indexes.CreateOneAsync(eventIndexModel);

            // User ID index for filtering ratings by user
            var userIndexModel = new CreateIndexModel<Rating>(
                Builders<Rating>.IndexKeys.Ascending(r => r.UserId),
                new CreateIndexOptions { Background = true }
            );
            await collection.Indexes.CreateOneAsync(userIndexModel);

            // Compound index for user + event (to ensure one rating per user per event)
            var userEventIndexModel = new CreateIndexModel<Rating>(
                Builders<Rating>.IndexKeys
                    .Ascending(r => r.UserId)
                    .Ascending(r => r.EventId),
                new CreateIndexOptions { Unique = true, Background = true }
            );
            await collection.Indexes.CreateOneAsync(userEventIndexModel);
        }
    }
}

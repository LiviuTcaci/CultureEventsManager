using MongoDB.Bson;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CultureEvents.API.Configurations
{
    public static class MongoSchemaValidation
    {
        public static async Task ConfigureSchemaValidationAsync(IMongoDatabase database)
        {
            // Configure schema validation for each collection
            await ConfigureUserSchemaValidation(database);
            await ConfigureEventSchemaValidation(database);
            await ConfigureTicketSchemaValidation(database);
            await ConfigureCategorySchemaValidation(database);
            await ConfigureVenueSchemaValidation(database);
            await ConfigurePerformerSchemaValidation(database);
            await ConfigureCommentSchemaValidation(database);
            await ConfigureRatingSchemaValidation(database);
        }

        private static async Task ConfigureUserSchemaValidation(IMongoDatabase database)
        {
            var validator = new BsonDocument
            {
                { "$jsonSchema", new BsonDocument
                    {
                        { "bsonType", "object" },
                        { "required", new BsonArray { "username", "email", "password_hash", "role" } },
                        { "properties", new BsonDocument
                            {
                                { "username", new BsonDocument
                                    {
                                        { "bsonType", "string" },
                                        { "minLength", 3 },
                                        { "maxLength", 50 }
                                    }
                                },
                                { "email", new BsonDocument
                                    {
                                        { "bsonType", "string" },
                                        { "pattern", "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$" }
                                    }
                                },
                                { "role", new BsonDocument
                                    {
                                        { "bsonType", "string" },
                                        { "enum", new BsonArray { "User", "Organizer", "Admin" } }
                                    }
                                },
                                { "isDeleted", new BsonDocument
                                    {
                                        { "bsonType", "bool" }
                                    }
                                }
                            }
                        }
                    }
                }
            };

            await CreateOrUpdateValidation(database, "Users", validator);
        }

        private static async Task ConfigureEventSchemaValidation(IMongoDatabase database)
        {
            var validator = new BsonDocument
            {
                { "$jsonSchema", new BsonDocument
                    {
                        { "bsonType", "object" },
                        { "required", new BsonArray { "title", "description", "organizer_id", "category_id", "venue_id", "start_date", "end_date", "status", "capacity" } },
                        { "properties", new BsonDocument
                            {
                                { "title", new BsonDocument
                                    {
                                        { "bsonType", "string" },
                                        { "minLength", 3 },
                                        { "maxLength", 100 }
                                    }
                                },
                                { "status", new BsonDocument
                                    {
                                        { "bsonType", "string" },
                                        { "enum", new BsonArray { "Announced", "Ongoing", "Completed", "Canceled" } }
                                    }
                                },
                                { "capacity", new BsonDocument
                                    {
                                        { "bsonType", "int" },
                                        { "minimum", 1 }
                                    }
                                },
                                { "isDeleted", new BsonDocument
                                    {
                                        { "bsonType", "bool" }
                                    }
                                }
                            }
                        }
                    }
                }
            };

            await CreateOrUpdateValidation(database, "Events", validator);
        }

        private static async Task ConfigureTicketSchemaValidation(IMongoDatabase database)
        {
            var validator = new BsonDocument
            {
                { "$jsonSchema", new BsonDocument
                    {
                        { "bsonType", "object" },
                        { "required", new BsonArray { "event_id", "user_id", "type", "price", "status" } },
                        { "properties", new BsonDocument
                            {
                                { "type", new BsonDocument
                                    {
                                        { "bsonType", "string" },
                                        { "enum", new BsonArray { "Standard", "VIP", "Premium" } }
                                    }
                                },
                                { "price", new BsonDocument
                                    {
                                        { "bsonType", "decimal" },
                                        { "minimum", 0 }
                                    }
                                },
                                { "status", new BsonDocument
                                    {
                                        { "bsonType", "string" },
                                        { "enum", new BsonArray { "Active", "Used", "Canceled", "Refunded" } }
                                    }
                                },
                                { "isDeleted", new BsonDocument
                                    {
                                        { "bsonType", "bool" }
                                    }
                                }
                            }
                        }
                    }
                }
            };

            await CreateOrUpdateValidation(database, "Tickets", validator);
        }

        private static async Task ConfigureCategorySchemaValidation(IMongoDatabase database)
        {
            var validator = new BsonDocument
            {
                { "$jsonSchema", new BsonDocument
                    {
                        { "bsonType", "object" },
                        { "required", new BsonArray { "name" } },
                        { "properties", new BsonDocument
                            {
                                { "name", new BsonDocument
                                    {
                                        { "bsonType", "string" },
                                        { "minLength", 2 },
                                        { "maxLength", 50 }
                                    }
                                },
                                { "isDeleted", new BsonDocument
                                    {
                                        { "bsonType", "bool" }
                                    }
                                }
                            }
                        }
                    }
                }
            };

            await CreateOrUpdateValidation(database, "Categories", validator);
        }

        private static async Task ConfigureVenueSchemaValidation(IMongoDatabase database)
        {
            var validator = new BsonDocument
            {
                { "$jsonSchema", new BsonDocument
                    {
                        { "bsonType", "object" },
                        { "required", new BsonArray { "name", "address", "city", "country", "capacity" } },
                        { "properties", new BsonDocument
                            {
                                { "name", new BsonDocument
                                    {
                                        { "bsonType", "string" },
                                        { "minLength", 2 }
                                    }
                                },
                                { "capacity", new BsonDocument
                                    {
                                        { "bsonType", "int" },
                                        { "minimum", 1 }
                                    }
                                },
                                { "location", new BsonDocument
                                    {
                                        { "bsonType", "object" },
                                        { "required", new BsonArray { "latitude", "longitude" } },
                                        { "properties", new BsonDocument
                                            {
                                                { "latitude", new BsonDocument
                                                    {
                                                        { "bsonType", "double" },
                                                        { "minimum", -90 },
                                                        { "maximum", 90 }
                                                    }
                                                },
                                                { "longitude", new BsonDocument
                                                    {
                                                        { "bsonType", "double" },
                                                        { "minimum", -180 },
                                                        { "maximum", 180 }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                },
                                { "isDeleted", new BsonDocument
                                    {
                                        { "bsonType", "bool" }
                                    }
                                }
                            }
                        }
                    }
                }
            };

            await CreateOrUpdateValidation(database, "Venues", validator);
        }

        private static async Task ConfigurePerformerSchemaValidation(IMongoDatabase database)
        {
            var validator = new BsonDocument
            {
                { "$jsonSchema", new BsonDocument
                    {
                        { "bsonType", "object" },
                        { "required", new BsonArray { "name", "type" } },
                        { "properties", new BsonDocument
                            {
                                { "name", new BsonDocument
                                    {
                                        { "bsonType", "string" },
                                        { "minLength", 2 }
                                    }
                                },
                                { "type", new BsonDocument
                                    {
                                        { "bsonType", "string" },
                                        { "enum", new BsonArray { "Individual", "Band", "Group", "Orchestra" } }
                                    }
                                },
                                { "contact_email", new BsonDocument
                                    {
                                        { "bsonType", "string" },
                                        { "pattern", "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$" }
                                    }
                                },
                                { "isDeleted", new BsonDocument
                                    {
                                        { "bsonType", "bool" }
                                    }
                                }
                            }
                        }
                    }
                }
            };

            await CreateOrUpdateValidation(database, "Performers", validator);
        }

        private static async Task ConfigureCommentSchemaValidation(IMongoDatabase database)
        {
            var validator = new BsonDocument
            {
                { "$jsonSchema", new BsonDocument
                    {
                        { "bsonType", "object" },
                        { "required", new BsonArray { "user_id", "event_id", "content", "status" } },
                        { "properties", new BsonDocument
                            {
                                { "content", new BsonDocument
                                    {
                                        { "bsonType", "string" },
                                        { "minLength", 1 }
                                    }
                                },
                                { "status", new BsonDocument
                                    {
                                        { "bsonType", "string" },
                                        { "enum", new BsonArray { "Active", "Hidden", "Removed" } }
                                    }
                                },
                                { "likes", new BsonDocument
                                    {
                                        { "bsonType", "int" },
                                        { "minimum", 0 }
                                    }
                                },
                                { "isDeleted", new BsonDocument
                                    {
                                        { "bsonType", "bool" }
                                    }
                                }
                            }
                        }
                    }
                }
            };

            await CreateOrUpdateValidation(database, "Comments", validator);
        }

        private static async Task ConfigureRatingSchemaValidation(IMongoDatabase database)
        {
            var validator = new BsonDocument
            {
                { "$jsonSchema", new BsonDocument
                    {
                        { "bsonType", "object" },
                        { "required", new BsonArray { "user_id", "event_id", "value" } },
                        { "properties", new BsonDocument
                            {
                                { "value", new BsonDocument
                                    {
                                        { "bsonType", "int" },
                                        { "minimum", 1 },
                                        { "maximum", 5 }
                                    }
                                },
                                { "isDeleted", new BsonDocument
                                    {
                                        { "bsonType", "bool" }
                                    }
                                }
                            }
                        }
                    }
                }
            };

            await CreateOrUpdateValidation(database, "Ratings", validator);
        }

        private static async Task CreateOrUpdateValidation(IMongoDatabase database, string collectionName, BsonDocument validator)
        {
            try
            {
                // Check if collection exists
                var filter = new BsonDocument("name", collectionName);
                var collections = await database.ListCollectionsAsync(new ListCollectionsOptions { Filter = filter });
                var collectionExists = await collections.AnyAsync();

                if (collectionExists)
                {
                    // Update existing collection validation
                    var command = new BsonDocument
                    {
                        { "collMod", collectionName },
                        { "validator", validator },
                        { "validationLevel", "moderate" },  // "strict" or "moderate"
                        { "validationAction", "warn" }      // "error" or "warn"
                    };

                    await database.RunCommandAsync<BsonDocument>(command);
                }
                else
                {
                // Create new collection with validation
                // Create collection first
                await database.CreateCollectionAsync(collectionName);
                
                // Then apply validation schema
                var command = new BsonDocument
                {
                    { "collMod", collectionName },
                    { "validator", validator },
                    { "validationLevel", "moderate" },  
                    { "validationAction", "warn" }      
                };
                
                await database.RunCommandAsync<BsonDocument>(command);
                }
            }
            catch (MongoException)
            {
                // Handle potential errors - perhaps the collection is not empty
                // and validation might fail on existing documents
                
                // Create without validation first, then try to add validation
                var cursor = await database.ListCollectionNamesAsync();
                var collNames = await cursor.ToListAsync();
                if (!collNames.Contains(collectionName))
                {
                    await database.CreateCollectionAsync(collectionName);
                }
                
                // Optional: log error or retry with different settings
            }
        }
    }
}

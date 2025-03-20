using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace CultureEvents.API.Models
{
    public abstract class BaseEntity
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("createdAt")]
        public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("o");

        [BsonElement("updatedAt")]
        public string UpdatedAt { get; set; } = DateTime.UtcNow.ToString("o");

        [BsonElement("isDeleted")]
        public bool IsDeleted { get; set; } = false;
    }
}

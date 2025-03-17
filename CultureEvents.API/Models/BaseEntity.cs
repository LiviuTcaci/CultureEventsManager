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

        [BsonElement("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("is_deleted")]
        public bool IsDeleted { get; set; } = false;
    }
}

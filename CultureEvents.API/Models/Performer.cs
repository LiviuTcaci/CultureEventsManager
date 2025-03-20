using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;

namespace CultureEvents.API.Models
{
    public class Performer : BaseEntity
    {
        [BsonElement("name")]
        public required string Name { get; set; }

        [BsonElement("type")]
        public required string Type { get; set; } // Individual, Band, Group, Orchestra

        [BsonElement("description")]
        public required string Description { get; set; }

        [BsonElement("image_url")]
        public required string ImageUrl { get; set; }

        [BsonElement("contact_email")]
        public required string ContactEmail { get; set; }

        [BsonElement("website")]
        public required string Website { get; set; }

        [BsonElement("social_media")]
        public Dictionary<string, string> SocialMedia { get; set; } = new Dictionary<string, string>();
    }
}

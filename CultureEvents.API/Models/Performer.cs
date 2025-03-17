using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;

namespace CultureEvents.API.Models
{
    public class Performer : BaseEntity
    {
        [BsonElement("name")]
        public string Name { get; set; }

        [BsonElement("type")]
        public string Type { get; set; } // Individual, Band, Group, Orchestra

        [BsonElement("description")]
        public string Description { get; set; }

        [BsonElement("image_url")]
        public string ImageUrl { get; set; }

        [BsonElement("contact_email")]
        public string ContactEmail { get; set; }

        [BsonElement("website")]
        public string Website { get; set; }

        [BsonElement("social_media")]
        public Dictionary<string, string> SocialMedia { get; set; } = new Dictionary<string, string>();
    }
}

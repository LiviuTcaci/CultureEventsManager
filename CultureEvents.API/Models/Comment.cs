using MongoDB.Bson.Serialization.Attributes;
using System;

namespace CultureEvents.API.Models
{
    public class Comment : BaseEntity
    {
        [BsonElement("user_id")]
        public required string UserId { get; set; }

        [BsonElement("event_id")]
        public required string EventId { get; set; }

        [BsonElement("content")]
        public required string Content { get; set; }

        [BsonElement("parent_id")]
        public required string ParentId { get; set; } // For replies to other comments

        [BsonElement("status")]
        public string Status { get; set; } = "Active"; // Active, Hidden, Removed

        [BsonElement("likes")]
        public int Likes { get; set; } = 0;
    }
}

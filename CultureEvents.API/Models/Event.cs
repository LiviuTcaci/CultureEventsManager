using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;

namespace CultureEvents.API.Models
{
    public class Event : BaseEntity
    {
        [BsonElement("title")]
        public required string Title { get; set; }

        [BsonElement("description")]
        public required string Description { get; set; }

        [BsonElement("organizer_id")]
        public required string OrganizerId { get; set; }

        [BsonElement("category_id")]
        public required string CategoryId { get; set; }

        [BsonElement("venue_id")]
        public required string VenueId { get; set; }

        [BsonElement("start_date")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime StartDate { get; set; }

        [BsonElement("end_date")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime EndDate { get; set; }

        [BsonElement("image_urls")]
        public List<string> ImageUrls { get; set; } = new List<string>();

        [BsonElement("status")]
        public string Status { get; set; } = "Announced"; // Announced, Ongoing, Completed, Canceled

        [BsonElement("capacity")]
        public int Capacity { get; set; }

        [BsonElement("tickets_sold")]
        public int TicketsSold { get; set; } = 0;

        [BsonElement("average_rating")]
        public double AverageRating { get; set; } = 0;

        [BsonElement("rating_count")]
        public int RatingCount { get; set; } = 0;
        
        [BsonElement("performer_ids")]
        public List<string> PerformerIds { get; set; } = new List<string>();
        
        [BsonElement("performer_details")]
        public List<PerformerDetail> PerformerDetails { get; set; } = new List<PerformerDetail>();
    }
    
    public class PerformerDetail
    {
        [BsonElement("performer_id")]
        public required string PerformerId { get; set; }
        
        [BsonElement("order")]
        public int Order { get; set; }
        
        [BsonElement("role")]
        public required string Role { get; set; } // Headliner, Opening, Guest
        
        [BsonElement("duration_minutes")]
        public int DurationMinutes { get; set; }
    }
}

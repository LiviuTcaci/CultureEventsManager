using MongoDB.Bson.Serialization.Attributes;
using System;

namespace CultureEvents.API.Models
{
    public class Ticket : BaseEntity
    {
        [BsonElement("event_id")]
        public required string EventId { get; set; }

        [BsonElement("user_id")]
        public required string UserId { get; set; }

        [BsonElement("type")]
        public required string Type { get; set; } // Standard, VIP, Premium

        [BsonElement("price")]
        public decimal Price { get; set; }

        [BsonElement("purchase_date")]
        public DateTime PurchaseDate { get; set; }

        [BsonElement("status")]
        public string Status { get; set; } = "Active"; // Active, Used, Canceled, Refunded

        [BsonElement("seat_number")]
        public required string SeatNumber { get; set; }

        [BsonElement("barcode")]
        public required string Barcode { get; set; }
    }
}

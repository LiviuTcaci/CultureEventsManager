using MongoDB.Bson.Serialization.Attributes;

namespace CultureEvents.API.Models
{
    public class Rating : BaseEntity
    {
        [BsonElement("user_id")]
        public required string UserId { get; set; }

        [BsonElement("event_id")]
        public required string EventId { get; set; }

        [BsonElement("value")]
        public int Value { get; set; } // 1-5 stars

        [BsonElement("comment")]
        public required string Comment { get; set; }
    }
}

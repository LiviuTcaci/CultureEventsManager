using MongoDB.Bson.Serialization.Attributes;

namespace CultureEvents.API.Models
{
    public class Venue : BaseEntity
    {
        [BsonElement("name")]
        public required string Name { get; set; }

        [BsonElement("address")]
        public required string Address { get; set; }

        [BsonElement("city")]
        public required string City { get; set; }

        [BsonElement("country")]
        public required string Country { get; set; }

        [BsonElement("capacity")]
        public int Capacity { get; set; }

        [BsonElement("location")]
        public required GeoLocation Location { get; set; }

        [BsonElement("image_url")]
        public required string ImageUrl { get; set; }

        [BsonElement("description")]
        public required string Description { get; set; }

        [BsonElement("facilities")]
        public required string[] Facilities { get; set; }
    }

    public class GeoLocation
    {
        [BsonElement("latitude")]
        public double Latitude { get; set; }

        [BsonElement("longitude")]
        public double Longitude { get; set; }
    }
}

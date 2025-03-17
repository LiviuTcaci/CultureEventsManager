using MongoDB.Bson.Serialization.Attributes;

namespace CultureEvents.API.Models
{
    public class Venue : BaseEntity
    {
        [BsonElement("name")]
        public string Name { get; set; }

        [BsonElement("address")]
        public string Address { get; set; }

        [BsonElement("city")]
        public string City { get; set; }

        [BsonElement("country")]
        public string Country { get; set; }

        [BsonElement("capacity")]
        public int Capacity { get; set; }

        [BsonElement("location")]
        public GeoLocation Location { get; set; }

        [BsonElement("image_url")]
        public string ImageUrl { get; set; }

        [BsonElement("description")]
        public string Description { get; set; }

        [BsonElement("facilities")]
        public string[] Facilities { get; set; }
    }

    public class GeoLocation
    {
        [BsonElement("latitude")]
        public double Latitude { get; set; }

        [BsonElement("longitude")]
        public double Longitude { get; set; }
    }
}

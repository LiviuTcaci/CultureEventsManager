using MongoDB.Bson.Serialization.Attributes;

namespace CultureEvents.API.Models
{
    public class Category : BaseEntity
    {
        [BsonElement("name")]
        public required string Name { get; set; }

        [BsonElement("description")]
        public required string Description { get; set; }

        [BsonElement("icon")]
        public required string Icon { get; set; }

        [BsonElement("parent_id")]
        public string? ParentId { get; set; }
    }
}

using MongoDB.Bson.Serialization.Attributes;

namespace CultureEvents.API.Models
{
    public class Category : BaseEntity
    {
        [BsonElement("name")]
        public string Name { get; set; }

        [BsonElement("description")]
        public string Description { get; set; }

        [BsonElement("icon")]
        public string Icon { get; set; }

        [BsonElement("parent_id")]
        public string ParentId { get; set; }
    }
}

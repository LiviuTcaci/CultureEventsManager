using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace CultureEvents.API.Models
{
    public class User : BaseEntity
    {
        [BsonElement("username")]
        public string Username { get; set; }

        [BsonElement("email")]
        public string Email { get; set; }

        [BsonElement("password_hash")]
        public string PasswordHash { get; set; }

        [BsonElement("full_name")]
        public string FullName { get; set; }

        [BsonElement("profile_picture")]
        public string ProfilePicture { get; set; }

        [BsonElement("role")]
        public string Role { get; set; } = "User"; // User, Organizer, Admin

        [BsonElement("saved_events")]
        public List<string> SavedEventIds { get; set; } = new List<string>();

        [BsonElement("attended_events")]
        public List<string> AttendedEventIds { get; set; } = new List<string>();
    }
}

using CultureEvents.API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

namespace CultureEvents.API.Configurations
{
    public static class ValidationHelper
    {
        public static ValidationResult ValidateUser(User user)
        {
            var errors = new List<string>();
            
            // Validate email
            if (string.IsNullOrWhiteSpace(user.Email))
            {
                errors.Add("Email is required");
            }
            else if (!IsValidEmail(user.Email))
            {
                errors.Add("Email is not in a valid format");
            }
            
            // Validate username
            if (string.IsNullOrWhiteSpace(user.Username))
            {
                errors.Add("Username is required");
            }
            else if (user.Username.Length < 3 || user.Username.Length > 50)
            {
                errors.Add("Username must be between 3 and 50 characters");
            }
            
            // Validate role
            if (!IsValidRole(user.Role))
            {
                errors.Add("Role must be one of: User, Organizer, Admin");
            }
            
            return new ValidationResult(errors);
        }
        
        public static ValidationResult ValidateEvent(Event evt)
        {
            var errors = new List<string>();
            
            // Validate title
            if (string.IsNullOrWhiteSpace(evt.Title))
            {
                errors.Add("Title is required");
            }
            else if (evt.Title.Length < 3 || evt.Title.Length > 100)
            {
                errors.Add("Title must be between 3 and 100 characters");
            }
            
            // Validate dates
            if (evt.StartDate == default)
            {
                errors.Add("Start date is required");
            }
            
            if (evt.EndDate == default)
            {
                errors.Add("End date is required");
            }
            
            if (evt.StartDate > evt.EndDate)
            {
                errors.Add("End date must be after start date");
            }
            
            // Validate capacity
            if (evt.Capacity <= 0)
            {
                errors.Add("Capacity must be greater than 0");
            }
            
            // Validate status
            if (!IsValidEventStatus(evt.Status))
            {
                errors.Add("Status must be one of: Announced, Ongoing, Completed, Canceled");
            }
            
            return new ValidationResult(errors);
        }
        
        public static ValidationResult ValidateTicket(Ticket ticket)
        {
            var errors = new List<string>();
            
            // Validate event ID
            if (string.IsNullOrWhiteSpace(ticket.EventId))
            {
                errors.Add("Event ID is required");
            }
            
            // Validate user ID
            if (string.IsNullOrWhiteSpace(ticket.UserId))
            {
                errors.Add("User ID is required");
            }
            
            // Validate price
            if (ticket.Price < 0)
            {
                errors.Add("Price cannot be negative");
            }
            
            // Validate type
            if (!IsValidTicketType(ticket.Type))
            {
                errors.Add("Type must be one of: Standard, VIP, Premium");
            }
            
            // Validate status
            if (!IsValidTicketStatus(ticket.Status))
            {
                errors.Add("Status must be one of: Active, Used, Canceled, Refunded");
            }
            
            return new ValidationResult(errors);
        }
        
        public static ValidationResult ValidateRating(Rating rating)
        {
            var errors = new List<string>();
            
            // Validate event ID
            if (string.IsNullOrWhiteSpace(rating.EventId))
            {
                errors.Add("Event ID is required");
            }
            
            // Validate user ID
            if (string.IsNullOrWhiteSpace(rating.UserId))
            {
                errors.Add("User ID is required");
            }
            
            // Validate rating value
            if (rating.Value < 1 || rating.Value > 5)
            {
                errors.Add("Rating value must be between 1 and 5");
            }
            
            return new ValidationResult(errors);
        }
        
        public static ValidationResult ValidateComment(Comment comment)
        {
            var errors = new List<string>();
            
            // Validate content
            if (string.IsNullOrWhiteSpace(comment.Content))
            {
                errors.Add("Comment content is required");
            }
            
            // Validate user ID
            if (string.IsNullOrWhiteSpace(comment.UserId))
            {
                errors.Add("User ID is required");
            }
            
            // Validate event ID
            if (string.IsNullOrWhiteSpace(comment.EventId))
            {
                errors.Add("Event ID is required");
            }
            
            // Validate status
            if (!IsValidCommentStatus(comment.Status))
            {
                errors.Add("Status must be one of: Active, Hidden, Removed");
            }
            
            return new ValidationResult(errors);
        }
        
        public static ValidationResult ValidateVenue(Venue venue)
        {
            var errors = new List<string>();
            
            // Validate name
            if (string.IsNullOrWhiteSpace(venue.Name))
            {
                errors.Add("Venue name is required");
            }
            
            // Validate address
            if (string.IsNullOrWhiteSpace(venue.Address))
            {
                errors.Add("Address is required");
            }
            
            // Validate city
            if (string.IsNullOrWhiteSpace(venue.City))
            {
                errors.Add("City is required");
            }
            
            // Validate country
            if (string.IsNullOrWhiteSpace(venue.Country))
            {
                errors.Add("Country is required");
            }
            
            // Validate capacity
            if (venue.Capacity <= 0)
            {
                errors.Add("Capacity must be greater than 0");
            }
            
            // Validate location
            if (venue.Location != null)
            {
                if (venue.Location.Latitude < -90 || venue.Location.Latitude > 90)
                {
                    errors.Add("Latitude must be between -90 and 90");
                }
                
                if (venue.Location.Longitude < -180 || venue.Location.Longitude > 180)
                {
                    errors.Add("Longitude must be between -180 and 180");
                }
            }
            
            return new ValidationResult(errors);
        }
        
        public static ValidationResult ValidateCategory(Category category)
        {
            var errors = new List<string>();
            
            // Validate name
            if (string.IsNullOrWhiteSpace(category.Name))
            {
                errors.Add("Category name is required");
            }
            else if (category.Name.Length < 2 || category.Name.Length > 50)
            {
                errors.Add("Category name must be between 2 and 50 characters");
            }
            
            return new ValidationResult(errors);
        }
        
        public static ValidationResult ValidatePerformer(Performer performer)
        {
            var errors = new List<string>();
            
            // Validate name
            if (string.IsNullOrWhiteSpace(performer.Name))
            {
                errors.Add("Performer name is required");
            }
            
            // Validate type
            if (!IsValidPerformerType(performer.Type))
            {
                errors.Add("Type must be one of: Individual, Band, Group, Orchestra");
            }
            
            // Validate contact email if provided
            if (!string.IsNullOrWhiteSpace(performer.ContactEmail) && !IsValidEmail(performer.ContactEmail))
            {
                errors.Add("Contact email is not in a valid format");
            }
            
            return new ValidationResult(errors);
        }
        
        // Helper methods
        private static bool IsValidEmail(string email)
        {
            try
            {
                var regex = new Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$");
                return regex.IsMatch(email);
            }
            catch
            {
                return false;
            }
        }
        
        private static bool IsValidRole(string role)
        {
            return role == "User" || role == "Organizer" || role == "Admin";
        }
        
        private static bool IsValidEventStatus(string status)
        {
            return status == "Announced" || status == "Ongoing" || status == "Completed" || status == "Canceled";
        }
        
        private static bool IsValidTicketType(string type)
        {
            return type == "Standard" || type == "VIP" || type == "Premium";
        }
        
        private static bool IsValidTicketStatus(string status)
        {
            return status == "Active" || status == "Used" || status == "Canceled" || status == "Refunded";
        }
        
        private static bool IsValidCommentStatus(string status)
        {
            return status == "Active" || status == "Hidden" || status == "Removed";
        }
        
        private static bool IsValidPerformerType(string type)
        {
            return type == "Individual" || type == "Band" || type == "Group" || type == "Orchestra";
        }
    }
    
    public class ValidationResult
    {
        public bool IsValid => !Errors.Any();
        public List<string> Errors { get; }
        
        public ValidationResult(List<string> errors)
        {
            Errors = errors ?? new List<string>();
        }
        
        public string ErrorsToString()
        {
            return string.Join("; ", Errors);
        }
    }
}

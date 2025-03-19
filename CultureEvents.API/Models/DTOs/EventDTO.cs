using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CultureEvents.API.Models.DTOs
{
    /// <summary>
    /// Data Transfer Object for creating a new event
    /// </summary>
    public class CreateEventDTO
    {
        [Required]
        [StringLength(100, MinimumLength = 3)]
        public string Title { get; set; }
        
        [Required]
        [StringLength(2000, MinimumLength = 10)]
        public string Description { get; set; }
        
        [Required]
        public string OrganizerId { get; set; }
        
        [Required]
        public string CategoryId { get; set; }
        
        [Required]
        public string VenueId { get; set; }
        
        [Required]
        public DateTime StartDate { get; set; }
        
        [Required]
        public DateTime EndDate { get; set; }
        
        public List<string> ImageUrls { get; set; } = new List<string>();
        
        [Required]
        [RegularExpression("^(Announced|Ongoing|Completed|Canceled)$", 
            ErrorMessage = "Status must be one of: Announced, Ongoing, Completed, Canceled")]
        public string Status { get; set; } = "Announced";
        
        [Range(1, int.MaxValue)]
        public int Capacity { get; set; }
        
        public List<string> PerformerIds { get; set; } = new List<string>();
        
        public List<PerformerDetailDTO> PerformerDetails { get; set; } = new List<PerformerDetailDTO>();
    }

    /// <summary>
    /// Data Transfer Object for updating an existing event
    /// </summary>
    public class UpdateEventDTO
    {
        [StringLength(100, MinimumLength = 3)]
        public string Title { get; set; }
        
        [StringLength(2000, MinimumLength = 10)]
        public string Description { get; set; }
        
        public string CategoryId { get; set; }
        
        public string VenueId { get; set; }
        
        public DateTime? StartDate { get; set; }
        
        public DateTime? EndDate { get; set; }
        
        public List<string> ImageUrls { get; set; }
        
        [RegularExpression("^(Announced|Ongoing|Completed|Canceled)$", 
            ErrorMessage = "Status must be one of: Announced, Ongoing, Completed, Canceled")]
        public string Status { get; set; }
        
        [Range(1, int.MaxValue)]
        public int? Capacity { get; set; }
        
        public List<string> PerformerIds { get; set; }
        
        public List<PerformerDetailDTO> PerformerDetails { get; set; }
    }

    /// <summary>
    /// Data Transfer Object for event performer details
    /// </summary>
    public class PerformerDetailDTO
    {
        [Required]
        public string PerformerId { get; set; }
        
        [Required]
        [Range(1, int.MaxValue)]
        public int Order { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Role { get; set; }
        
        [Range(1, int.MaxValue)]
        public int DurationMinutes { get; set; }
    }

    /// <summary>
    /// Data Transfer Object for filtering events
    /// </summary>
    public class EventFilterDTO
    {
        public string SearchTerm { get; set; }
        public string CategoryId { get; set; }
        public string VenueId { get; set; }
        public DateTime? StartDateFrom { get; set; }
        public DateTime? StartDateTo { get; set; }
        public string Status { get; set; }
        public string OrganizerId { get; set; }
        public int? Page { get; set; } = 1;
        public int? PageSize { get; set; } = 10;
        public string SortBy { get; set; } = "StartDate"; // StartDate, Title, Rating
        public bool SortDescending { get; set; } = false;
    }

    /// <summary>
    /// Data Transfer Object for pagination information
    /// </summary>
    public class PaginatedResult<T>
    {
        public List<T> Items { get; set; } = new List<T>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
        public bool HasPreviousPage => PageNumber > 1;
        public bool HasNextPage => PageNumber < TotalPages;
    }
}

using CultureEvents.API.Data;
using CultureEvents.API.Models;
using CultureEvents.API.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CultureEvents.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventsController : ControllerBase
    {
        private readonly IRepository<Event> _eventRepository;
        private readonly IRepository<Category> _categoryRepository;
        private readonly IRepository<Venue> _venueRepository;

        public EventsController(
            IRepository<Event> eventRepository,
            IRepository<Category> categoryRepository,
            IRepository<Venue> venueRepository)
        {
            _eventRepository = eventRepository;
            _categoryRepository = categoryRepository;
            _venueRepository = venueRepository;
        }

        /// <summary>
        /// Gets all events with optional pagination
        /// </summary>
        /// <param name="page">Page number (default: 1)</param>
        /// <param name="pageSize">Page size (default: 10)</param>
        /// <returns>List of events</returns>
        [HttpGet]
        [ProducesResponseType(typeof(PaginatedResult<Event>), 200)]
        public async Task<ActionResult<PaginatedResult<Event>>> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            // Validate pagination parameters
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 50) pageSize = 10;
            
            // Get total count of non-deleted events
            var totalCount = await _eventRepository.CountAsync(e => !e.IsDeleted);
            
            // Get paginated events
            var events = (await _eventRepository.GetAllAsync())
                .Where(e => !e.IsDeleted)
                .OrderByDescending(e => e.StartDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();
            
            // Create paginated result
            var result = new PaginatedResult<Event>
            {
                Items = events,
                TotalCount = (int)totalCount,
                PageNumber = page,
                PageSize = pageSize
            };
            
            return Ok(result);
        }

        /// <summary>
        /// Gets an event by ID
        /// </summary>
        /// <param name="id">Event ID</param>
        /// <returns>Event</returns>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(Event), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<Event>> GetById(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return BadRequest("Event ID cannot be empty");
            }
            
            var eventItem = await _eventRepository.GetByIdAsync(id);
            
            if (eventItem == null || eventItem.IsDeleted)
            {
                return NotFound("Event not found");
            }
            
            return Ok(eventItem);
        }

        /// <summary>
        /// Creates a new event
        /// </summary>
        /// <param name="eventDto">Event data</param>
        /// <returns>Created event</returns>
        [HttpPost]
        [Authorize(Roles = "Organizer,Admin")]
        [ProducesResponseType(typeof(Event), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<Event>> Create(CreateEventDTO eventDto)
        {
            // Validate input
            if (eventDto == null)
            {
                return BadRequest("Event data is required");
            }
            
            // Validate foreign keys
            if (!await _categoryRepository.ExistsAsync(eventDto.CategoryId))
            {
                return BadRequest($"Category with ID {eventDto.CategoryId} does not exist");
            }
            
            if (!await _venueRepository.ExistsAsync(eventDto.VenueId))
            {
                return BadRequest($"Venue with ID {eventDto.VenueId} does not exist");
            }
            
            // Validate dates
            if (eventDto.EndDate <= eventDto.StartDate)
            {
                return BadRequest("End date must be after start date");
            }
            
            if (eventDto.StartDate < DateTime.UtcNow)
            {
                return BadRequest("Start date cannot be in the past");
            }
            
            // Create a new event entity
            var newEvent = new Event
            {
                Title = eventDto.Title,
                Description = eventDto.Description,
                OrganizerId = eventDto.OrganizerId,
                CategoryId = eventDto.CategoryId,
                VenueId = eventDto.VenueId,
                StartDate = eventDto.StartDate.ToString("o"),
                EndDate = eventDto.EndDate.ToString("o"),
                ImageUrls = eventDto.ImageUrls,
                Status = eventDto.Status,
                Capacity = eventDto.Capacity,
                TicketsSold = 0,
                AverageRating = 0,
                RatingCount = 0,
                PerformerIds = eventDto.PerformerIds,
                PerformerDetails = eventDto.PerformerDetails.Select(pd => new PerformerDetail
                {
                    PerformerId = pd.PerformerId,
                    Order = pd.Order,
                    Role = pd.Role,
                    DurationMinutes = pd.DurationMinutes
                }).ToList()
            };
            
            // Save to database
            await _eventRepository.CreateAsync(newEvent);
            
            return CreatedAtAction(nameof(GetById), new { id = newEvent.Id }, newEvent);
        }

        /// <summary>
        /// Updates an existing event
        /// </summary>
        /// <param name="id">Event ID</param>
        /// <param name="eventDto">Event data to update</param>
        /// <returns>No content</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = "Organizer,Admin")]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Update(string id, UpdateEventDTO eventDto)
        {
            if (string.IsNullOrEmpty(id))
            {
                return BadRequest("Event ID cannot be empty");
            }
            
            if (eventDto == null)
            {
                return BadRequest("Event data is required");
            }
            
            // Check if event exists
            var existingEvent = await _eventRepository.GetByIdAsync(id);
            
            if (existingEvent == null || existingEvent.IsDeleted)
            {
                return NotFound("Event not found");
            }
            
            // Check if user is authorized (only organizer and admin of the event can update it)
            // This would need to be implemented with claims or user service
            // For now, we're just checking if the event exists
            
            // Check if Category exists if provided
            if (!string.IsNullOrEmpty(eventDto.CategoryId) && !await _categoryRepository.ExistsAsync(eventDto.CategoryId))
            {
                return BadRequest($"Category with ID {eventDto.CategoryId} does not exist");
            }
            
            // Check if Venue exists if provided
            if (!string.IsNullOrEmpty(eventDto.VenueId) && !await _venueRepository.ExistsAsync(eventDto.VenueId))
            {
                return BadRequest($"Venue with ID {eventDto.VenueId} does not exist");
            }
            
            // Check dates
            if (eventDto.StartDate.HasValue && eventDto.EndDate.HasValue && 
                eventDto.EndDate.Value <= eventDto.StartDate.Value)
            {
                return BadRequest("End date must be after start date");
            }
            
            // Update event properties (only if provided)
            if (!string.IsNullOrEmpty(eventDto.Title))
                existingEvent.Title = eventDto.Title;
                
            if (!string.IsNullOrEmpty(eventDto.Description))
                existingEvent.Description = eventDto.Description;
                
            if (!string.IsNullOrEmpty(eventDto.CategoryId))
                existingEvent.CategoryId = eventDto.CategoryId;
                
            if (!string.IsNullOrEmpty(eventDto.VenueId))
                existingEvent.VenueId = eventDto.VenueId;
                
            if (eventDto.StartDate.HasValue)
                existingEvent.StartDate = eventDto.StartDate.Value.ToString("o");
                
            if (eventDto.EndDate.HasValue)
                existingEvent.EndDate = eventDto.EndDate.Value.ToString("o");
                
            if (eventDto.ImageUrls != null)
                existingEvent.ImageUrls = eventDto.ImageUrls;
                
            if (!string.IsNullOrEmpty(eventDto.Status))
                existingEvent.Status = eventDto.Status;
                
            if (eventDto.Capacity.HasValue)
                existingEvent.Capacity = eventDto.Capacity.Value;
                
            if (eventDto.PerformerIds != null)
                existingEvent.PerformerIds = eventDto.PerformerIds;
                
            if (eventDto.PerformerDetails != null)
                existingEvent.PerformerDetails = eventDto.PerformerDetails.Select(pd => new PerformerDetail
                {
                    PerformerId = pd.PerformerId,
                    Order = pd.Order,
                    Role = pd.Role,
                    DurationMinutes = pd.DurationMinutes
                }).ToList();
            
            // Update timestamp
            existingEvent.UpdatedAt = DateTime.UtcNow.ToString("o");
            
            // Save to database
            await _eventRepository.UpdateAsync(existingEvent);
            
            return NoContent();
        }

        /// <summary>
        /// Deletes an event (soft delete)
        /// </summary>
        /// <param name="id">Event ID</param>
        /// <returns>No content</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Organizer,Admin")]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Delete(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return BadRequest("Event ID cannot be empty");
            }
            
            var eventExists = await _eventRepository.ExistsAsync(id);
            
            if (!eventExists)
            {
                return NotFound("Event not found");
            }
            
            // Check if user is authorized (only organizer and admin of the event can delete it)
            // This would need to be implemented with claims or user service
            // For now, we're just checking if the event exists
            
            await _eventRepository.SoftDeleteAsync(id);
            return NoContent();
        }

        /// <summary>
        /// Gets upcoming events
        /// </summary>
        /// <returns>List of upcoming events</returns>
        [HttpGet("upcoming")]
        [ProducesResponseType(typeof(List<Event>), 200)]
        public async Task<ActionResult<IEnumerable<Event>>> GetUpcoming([FromQuery] int limit = 10)
        {
            var now = DateTime.UtcNow.ToString("o");
            
            var events = (await _eventRepository.FindAsync(e => 
                    !e.IsDeleted && 
                    (e.Status == "Announced" || e.Status == "Ongoing") &&
                    string.Compare(e.StartDate, now) > 0))
                .OrderBy(e => e.StartDate)
                .Take(limit)
                .ToList();
                
            return Ok(events);
        }

        /// <summary>
        /// Gets events by category
        /// </summary>
        /// <param name="categoryId">Category ID</param>
        /// <returns>List of events in the category</returns>
        [HttpGet("category/{categoryId}")]
        [ProducesResponseType(typeof(List<Event>), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<IEnumerable<Event>>> GetByCategory(string categoryId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (string.IsNullOrEmpty(categoryId))
            {
                return BadRequest("Category ID cannot be empty");
            }
            
            // Check if category exists
            if (!await _categoryRepository.ExistsAsync(categoryId))
            {
                return NotFound($"Category with ID {categoryId} not found");
            }
            
            // Validate pagination parameters
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 50) pageSize = 10;
            
            // Get total count for this category
            var totalCount = await _eventRepository.CountAsync(e => 
                !e.IsDeleted && e.CategoryId == categoryId);
            
            // Get events by category with pagination
            var events = (await _eventRepository.FindAsync(e => 
                    !e.IsDeleted && e.CategoryId == categoryId))
                .OrderByDescending(e => e.StartDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();
            
            // Create paginated result
            var result = new PaginatedResult<Event>
            {
                Items = events,
                TotalCount = (int)totalCount,
                PageNumber = page,
                PageSize = pageSize
            };
            
            return Ok(result);
        }

        /// <summary>
        /// Gets events by venue
        /// </summary>
        /// <param name="venueId">Venue ID</param>
        /// <returns>List of events at the venue</returns>
        [HttpGet("venue/{venueId}")]
        [ProducesResponseType(typeof(List<Event>), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<IEnumerable<Event>>> GetByVenue(string venueId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (string.IsNullOrEmpty(venueId))
            {
                return BadRequest("Venue ID cannot be empty");
            }
            
            // Check if venue exists
            if (!await _venueRepository.ExistsAsync(venueId))
            {
                return NotFound($"Venue with ID {venueId} not found");
            }
            
            // Validate pagination parameters
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 50) pageSize = 10;
            
            // Get total count for this venue
            var totalCount = await _eventRepository.CountAsync(e => 
                !e.IsDeleted && e.VenueId == venueId);
            
            // Get events by venue with pagination
            var events = (await _eventRepository.FindAsync(e => 
                    !e.IsDeleted && e.VenueId == venueId))
                .OrderByDescending(e => e.StartDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();
            
            // Create paginated result
            var result = new PaginatedResult<Event>
            {
                Items = events,
                TotalCount = (int)totalCount,
                PageNumber = page,
                PageSize = pageSize
            };
            
            return Ok(result);
        }

        /// <summary>
        /// Searches for events
        /// </summary>
        /// <param name="term">Search term</param>
        /// <returns>List of matching events</returns>
        [HttpGet("search")]
        [ProducesResponseType(typeof(List<Event>), 200)]
        [ProducesResponseType(400)]
        public async Task<ActionResult<IEnumerable<Event>>> Search([FromQuery] string term, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (string.IsNullOrEmpty(term))
            {
                return BadRequest("Search term cannot be empty");
            }
            
            // Validate pagination parameters
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 50) pageSize = 10;
            
            // Convert search term to lowercase for case-insensitive search
            var lowerTerm = term.ToLower();
            
            // Get all events (not ideal for large datasets, but MongoDB repository doesn't support text search in our implementation)
            var allEvents = await _eventRepository.GetAllAsync();
            
            // Filter by search term
            var filteredEvents = allEvents
                .Where(e => !e.IsDeleted && (
                    e.Title.ToLower().Contains(lowerTerm) ||
                    e.Description.ToLower().Contains(lowerTerm)))
                .OrderByDescending(e => e.StartDate);
            
            // Get total count
            var totalCount = filteredEvents.Count();
            
            // Paginate results
            var paginatedEvents = filteredEvents
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();
            
            // Create paginated result
            var result = new PaginatedResult<Event>
            {
                Items = paginatedEvents,
                TotalCount = totalCount,
                PageNumber = page,
                PageSize = pageSize
            };
            
            return Ok(result);
        }

        /// <summary>
        /// Filters events by various criteria
        /// </summary>
        /// <param name="filter">Filter criteria</param>
        /// <returns>List of filtered events</returns>
        [HttpPost("filter")]
        [ProducesResponseType(typeof(PaginatedResult<Event>), 200)]
        public async Task<ActionResult<PaginatedResult<Event>>> Filter([FromBody] EventFilterDTO filter)
        {
            if (filter == null)
            {
                filter = new EventFilterDTO();
            }
            
            // Validate pagination parameters
            int page = filter.Page ?? 1;
            int pageSize = filter.PageSize ?? 10;
            
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 50) pageSize = 10;
            
            // Get all events (not ideal for large datasets, but necessary for our implementation)
            var allEvents = await _eventRepository.GetAllAsync();
            
            // Apply filters
            var filteredEvents = allEvents.Where(e => !e.IsDeleted);
            
            // Search term
            if (!string.IsNullOrEmpty(filter.SearchTerm))
            {
                var lowerTerm = filter.SearchTerm.ToLower();
                filteredEvents = filteredEvents.Where(e => 
                    e.Title.ToLower().Contains(lowerTerm) ||
                    e.Description.ToLower().Contains(lowerTerm));
            }
            
            // Category
            if (!string.IsNullOrEmpty(filter.CategoryId))
            {
                filteredEvents = filteredEvents.Where(e => e.CategoryId == filter.CategoryId);
            }
            
            // Venue
            if (!string.IsNullOrEmpty(filter.VenueId))
            {
                filteredEvents = filteredEvents.Where(e => e.VenueId == filter.VenueId);
            }
            
            // Date range
            if (filter.StartDateFrom.HasValue)
            {
                var startDateFrom = filter.StartDateFrom.Value.ToString("o");
                filteredEvents = filteredEvents.Where(e => string.Compare(e.StartDate, startDateFrom) >= 0);
            }
            
            if (filter.StartDateTo.HasValue)
            {
                var startDateTo = filter.StartDateTo.Value.ToString("o");
                filteredEvents = filteredEvents.Where(e => string.Compare(e.StartDate, startDateTo) <= 0);
            }
            
            // Status
            if (!string.IsNullOrEmpty(filter.Status))
            {
                filteredEvents = filteredEvents.Where(e => e.Status == filter.Status);
            }
            
            // Organizer
            if (!string.IsNullOrEmpty(filter.OrganizerId))
            {
                filteredEvents = filteredEvents.Where(e => e.OrganizerId == filter.OrganizerId);
            }
            
            // Sorting
            IOrderedEnumerable<Event> sortedEvents;
            
            switch (filter.SortBy?.ToLower())
            {
                case "title":
                    sortedEvents = filter.SortDescending
                        ? filteredEvents.OrderByDescending(e => e.Title)
                        : filteredEvents.OrderBy(e => e.Title);
                    break;
                case "rating":
                    sortedEvents = filter.SortDescending
                        ? filteredEvents.OrderByDescending(e => e.AverageRating)
                        : filteredEvents.OrderBy(e => e.AverageRating);
                    break;
                case "startdate":
                default:
                    sortedEvents = filter.SortDescending
                        ? filteredEvents.OrderByDescending(e => e.StartDate)
                        : filteredEvents.OrderBy(e => e.StartDate);
                    break;
            }
            
            // Get total count
            var totalCount = sortedEvents.Count();
            
            // Paginate results
            var paginatedEvents = sortedEvents
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();
            
            // Create paginated result
            var result = new PaginatedResult<Event>
            {
                Items = paginatedEvents,
                TotalCount = totalCount,
                PageNumber = page,
                PageSize = pageSize
            };
            
            return Ok(result);
        }
    }
}

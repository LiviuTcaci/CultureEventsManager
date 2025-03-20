using CultureEvents.API.Data;
using CultureEvents.API.Models;
using CultureEvents.API.Models.DTOs;
// Explicitly specify which PaginatedResult to use
using DTOPaginatedResult = CultureEvents.API.Models.DTOs.PaginatedResult<CultureEvents.API.Models.Event>;
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
        [HttpGet]
        [ProducesResponseType(typeof(DTOPaginatedResult), 200)]
        public async Task<ActionResult<DTOPaginatedResult>> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 50) pageSize = 10;
            
            var totalCount = await _eventRepository.CountAsync(e => !e.IsDeleted);
            
            var events = (await _eventRepository.GetAllAsync())
                .Where(e => !e.IsDeleted)
                .OrderByDescending(e => e.StartDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();
            
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
        [HttpPost]
        [Authorize(Roles = "Organizer,Admin")]
        [ProducesResponseType(typeof(Event), 201)]
        public async Task<ActionResult<Event>> Create(CreateEventDTO eventDto)
        {
            if (eventDto == null)
            {
                return BadRequest("Event data is required");
            }
            
            if (!await _categoryRepository.ExistsAsync(eventDto.CategoryId))
            {
                return BadRequest($"Category with ID {eventDto.CategoryId} does not exist");
            }
            
            if (!await _venueRepository.ExistsAsync(eventDto.VenueId))
            {
                return BadRequest($"Venue with ID {eventDto.VenueId} does not exist");
            }
            
            if (eventDto.EndDate <= eventDto.StartDate)
            {
                return BadRequest("End date must be after start date");
            }
            
            if (eventDto.StartDate < DateTime.UtcNow)
            {
                return BadRequest("Start date cannot be in the past");
            }
            
            var newEvent = new Event
            {
                Title = eventDto.Title,
                Description = eventDto.Description,
                OrganizerId = eventDto.OrganizerId,
                CategoryId = eventDto.CategoryId,
                VenueId = eventDto.VenueId,
                StartDate = eventDto.StartDate,
                EndDate = eventDto.EndDate,
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
            
            await _eventRepository.CreateAsync(newEvent);
            
            return CreatedAtAction(nameof(GetById), new { id = newEvent.Id }, newEvent);
        }

        /// <summary>
        /// Updates an existing event
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Organizer,Admin")]
        [ProducesResponseType(204)]
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
            
            var existingEvent = await _eventRepository.GetByIdAsync(id);
            
            if (existingEvent == null || existingEvent.IsDeleted)
            {
                return NotFound("Event not found");
            }
            
            if (!string.IsNullOrEmpty(eventDto.CategoryId) && !await _categoryRepository.ExistsAsync(eventDto.CategoryId))
            {
                return BadRequest($"Category with ID {eventDto.CategoryId} does not exist");
            }
            
            if (!string.IsNullOrEmpty(eventDto.VenueId) && !await _venueRepository.ExistsAsync(eventDto.VenueId))
            {
                return BadRequest($"Venue with ID {eventDto.VenueId} does not exist");
            }
            
            if (eventDto.StartDate.HasValue && eventDto.EndDate.HasValue && 
                eventDto.EndDate.Value <= eventDto.StartDate.Value)
            {
                return BadRequest("End date must be after start date");
            }
            
            if (!string.IsNullOrEmpty(eventDto.Title))
                existingEvent.Title = eventDto.Title;
                
            if (!string.IsNullOrEmpty(eventDto.Description))
                existingEvent.Description = eventDto.Description;
                
            if (!string.IsNullOrEmpty(eventDto.CategoryId))
                existingEvent.CategoryId = eventDto.CategoryId;
                
            if (!string.IsNullOrEmpty(eventDto.VenueId))
                existingEvent.VenueId = eventDto.VenueId;
                
            if (eventDto.StartDate.HasValue)
                existingEvent.StartDate = eventDto.StartDate.Value;
                
            if (eventDto.EndDate.HasValue)
                existingEvent.EndDate = eventDto.EndDate.Value;
                
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
            
            existingEvent.UpdatedAt = DateTime.UtcNow;
            
            await _eventRepository.UpdateAsync(existingEvent);
            
            return NoContent();
        }

        /// <summary>
        /// Deletes an event (soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Organizer,Admin")]
        [ProducesResponseType(204)]
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
            
            await _eventRepository.SoftDeleteAsync(id);
            return NoContent();
        }

        /// <summary>
        /// Gets upcoming events
        /// </summary>
        [HttpGet("upcoming")]
        [ProducesResponseType(typeof(List<Event>), 200)]
        public async Task<ActionResult<IEnumerable<Event>>> GetUpcoming([FromQuery] int limit = 10)
        {
            var now = DateTime.UtcNow;
            
            var events = (await _eventRepository.FindAsync(e => 
                    !e.IsDeleted && 
                    (e.Status == "Announced" || e.Status == "Ongoing")))
                .Where(e => e.StartDate > now)
                .OrderBy(e => e.StartDate)
                .Take(limit)
                .ToList();
                
            return Ok(events);
        }

        /// <summary>
        /// Gets events by category
        /// </summary>
        [HttpGet("category/{categoryId}")]
        [ProducesResponseType(typeof(List<Event>), 200)]
        public async Task<ActionResult<IEnumerable<Event>>> GetByCategory(string categoryId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (string.IsNullOrEmpty(categoryId))
            {
                return BadRequest("Category ID cannot be empty");
            }
            
            if (!await _categoryRepository.ExistsAsync(categoryId))
            {
                return NotFound($"Category with ID {categoryId} not found");
            }
            
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 50) pageSize = 10;
            
            var totalCount = await _eventRepository.CountAsync(e => 
                !e.IsDeleted && e.CategoryId == categoryId);
            
            var events = (await _eventRepository.FindAsync(e => 
                    !e.IsDeleted && e.CategoryId == categoryId))
                .OrderByDescending(e => e.StartDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();
            
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
        [HttpGet("venue/{venueId}")]
        [ProducesResponseType(typeof(List<Event>), 200)]
        public async Task<ActionResult<IEnumerable<Event>>> GetByVenue(string venueId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (string.IsNullOrEmpty(venueId))
            {
                return BadRequest("Venue ID cannot be empty");
            }
            
            if (!await _venueRepository.ExistsAsync(venueId))
            {
                return NotFound($"Venue with ID {venueId} not found");
            }
            
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 50) pageSize = 10;
            
            var totalCount = await _eventRepository.CountAsync(e => 
                !e.IsDeleted && e.VenueId == venueId);
            
            var events = (await _eventRepository.FindAsync(e => 
                    !e.IsDeleted && e.VenueId == venueId))
                .OrderByDescending(e => e.StartDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();
            
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
        [HttpGet("search")]
        [ProducesResponseType(typeof(List<Event>), 200)]
        public async Task<ActionResult<IEnumerable<Event>>> Search([FromQuery] string term, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (string.IsNullOrEmpty(term))
            {
                return BadRequest("Search term cannot be empty");
            }
            
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 50) pageSize = 10;
            
            var lowerTerm = term.ToLower();
            
            var allEvents = await _eventRepository.GetAllAsync();
            
            var filteredEvents = allEvents
                .Where(e => !e.IsDeleted && (
                    e.Title.ToLower().Contains(lowerTerm) ||
                    e.Description.ToLower().Contains(lowerTerm)))
                .OrderByDescending(e => e.StartDate);
            
            var totalCount = filteredEvents.Count();
            
            var paginatedEvents = filteredEvents
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();
            
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
        [HttpPost("filter")]
        [ProducesResponseType(typeof(DTOPaginatedResult), 200)]
        public async Task<ActionResult<DTOPaginatedResult>> Filter([FromBody] EventFilterDTO filter)
        {
            if (filter == null)
            {
                filter = new EventFilterDTO();
            }
            
            int page = filter.Page ?? 1;
            int pageSize = filter.PageSize ?? 10;
            
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 50) pageSize = 10;
            
            var allEvents = await _eventRepository.GetAllAsync();
            
            var filteredEvents = allEvents.Where(e => !e.IsDeleted);
            
            if (!string.IsNullOrEmpty(filter.SearchTerm))
            {
                var lowerTerm = filter.SearchTerm.ToLower();
                filteredEvents = filteredEvents.Where(e => 
                    e.Title.ToLower().Contains(lowerTerm) ||
                    e.Description.ToLower().Contains(lowerTerm));
            }
            
            if (!string.IsNullOrEmpty(filter.CategoryId))
            {
                filteredEvents = filteredEvents.Where(e => e.CategoryId == filter.CategoryId);
            }
            
            if (!string.IsNullOrEmpty(filter.VenueId))
            {
                filteredEvents = filteredEvents.Where(e => e.VenueId == filter.VenueId);
            }
            
            if (filter.StartDateFrom.HasValue)
            {
                var startDateFrom = filter.StartDateFrom.Value;
                filteredEvents = filteredEvents.Where(e => e.StartDate >= startDateFrom);
            }
            
            if (filter.StartDateTo.HasValue)
            {
                var startDateTo = filter.StartDateTo.Value;
                filteredEvents = filteredEvents.Where(e => e.StartDate <= startDateTo);
            }
            
            if (!string.IsNullOrEmpty(filter.Status))
            {
                filteredEvents = filteredEvents.Where(e => e.Status == filter.Status);
            }
            
            if (!string.IsNullOrEmpty(filter.OrganizerId))
            {
                filteredEvents = filteredEvents.Where(e => e.OrganizerId == filter.OrganizerId);
            }
            
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
            
            var totalCount = sortedEvents.Count();
            
            var paginatedEvents = sortedEvents
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();
            
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

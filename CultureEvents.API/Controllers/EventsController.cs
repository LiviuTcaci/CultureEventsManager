using CultureEvents.API.Data;
using CultureEvents.API.Models;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CultureEvents.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventsController : ControllerBase
    {
        private readonly IRepository<Event> _eventRepository;

        public EventsController(IRepository<Event> eventRepository)
        {
            _eventRepository = eventRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Event>>> GetAll()
        {
            var events = await _eventRepository.GetAllAsync();
            return Ok(events);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Event>> GetById(string id)
        {
            var eventItem = await _eventRepository.GetByIdAsync(id);
            
            if (eventItem == null)
            {
                return NotFound();
            }
            
            return Ok(eventItem);
        }

        [HttpPost]
        public async Task<ActionResult<Event>> Create(Event eventItem)
        {
            await _eventRepository.CreateAsync(eventItem);
            return CreatedAtAction(nameof(GetById), new { id = eventItem.Id }, eventItem);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Event updatedEvent)
        {
            if (id != updatedEvent.Id)
            {
                return BadRequest();
            }
            
            var eventExists = await _eventRepository.ExistsAsync(id);
            
            if (!eventExists)
            {
                return NotFound();
            }
            
            await _eventRepository.UpdateAsync(updatedEvent);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var eventExists = await _eventRepository.ExistsAsync(id);
            
            if (!eventExists)
            {
                return NotFound();
            }
            
            await _eventRepository.SoftDeleteAsync(id);
            return NoContent();
        }

        [HttpGet("upcoming")]
        public async Task<ActionResult<IEnumerable<Event>>> GetUpcoming()
        {
            var events = await _eventRepository.FindAsync(e => e.Status == "Announced" || e.Status == "Ongoing");
            return Ok(events);
        }

        [HttpGet("by-category/{categoryId}")]
        public async Task<ActionResult<IEnumerable<Event>>> GetByCategory(string categoryId)
        {
            var events = await _eventRepository.FindAsync(e => e.CategoryId == categoryId);
            return Ok(events);
        }

        [HttpGet("by-venue/{venueId}")]
        public async Task<ActionResult<IEnumerable<Event>>> GetByVenue(string venueId)
        {
            var events = await _eventRepository.FindAsync(e => e.VenueId == venueId);
            return Ok(events);
        }
    }
}

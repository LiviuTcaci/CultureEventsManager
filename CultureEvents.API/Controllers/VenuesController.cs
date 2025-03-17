using CultureEvents.API.Data;
using CultureEvents.API.Models;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CultureEvents.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VenuesController : ControllerBase
    {
        private readonly IRepository<Venue> _venueRepository;

        public VenuesController(IRepository<Venue> venueRepository)
        {
            _venueRepository = venueRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Venue>>> GetAll()
        {
            var venues = await _venueRepository.GetAllAsync();
            return Ok(venues);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Venue>> GetById(string id)
        {
            var venue = await _venueRepository.GetByIdAsync(id);
            
            if (venue == null)
            {
                return NotFound();
            }
            
            return Ok(venue);
        }

        [HttpPost]
        public async Task<ActionResult<Venue>> Create(Venue venue)
        {
            await _venueRepository.CreateAsync(venue);
            return CreatedAtAction(nameof(GetById), new { id = venue.Id }, venue);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Venue updatedVenue)
        {
            if (id != updatedVenue.Id)
            {
                return BadRequest();
            }
            
            var venueExists = await _venueRepository.ExistsAsync(id);
            
            if (!venueExists)
            {
                return NotFound();
            }
            
            await _venueRepository.UpdateAsync(updatedVenue);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var venueExists = await _venueRepository.ExistsAsync(id);
            
            if (!venueExists)
            {
                return NotFound();
            }
            
            await _venueRepository.SoftDeleteAsync(id);
            return NoContent();
        }

        [HttpGet("by-city/{city}")]
        public async Task<ActionResult<IEnumerable<Venue>>> GetByCity(string city)
        {
            var venues = await _venueRepository.FindAsync(v => v.City.ToLower() == city.ToLower());
            return Ok(venues);
        }

        [HttpGet("search/{searchTerm}")]
        public async Task<ActionResult<IEnumerable<Venue>>> Search(string searchTerm)
        {
            var lowerSearchTerm = searchTerm.ToLower();
            var venues = await _venueRepository.FindAsync(v => 
                v.Name.ToLower().Contains(lowerSearchTerm) || 
                v.Address.ToLower().Contains(lowerSearchTerm) ||
                v.City.ToLower().Contains(lowerSearchTerm)
            );
            
            return Ok(venues);
        }

        [HttpGet("by-capacity/{minCapacity}")]
        public async Task<ActionResult<IEnumerable<Venue>>> GetByCapacity(int minCapacity)
        {
            var venues = await _venueRepository.FindAsync(v => v.Capacity >= minCapacity);
            return Ok(venues);
        }
    }
}

using CultureEvents.API.Data;
using CultureEvents.API.Models;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CultureEvents.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IRepository<User> _userRepository;

        public UsersController(IRepository<User> userRepository)
        {
            _userRepository = userRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetAll()
        {
            var users = await _userRepository.GetAllAsync();
            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetById(string id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            
            if (user == null)
            {
                return NotFound();
            }
            
            return Ok(user);
        }

        [HttpPost]
        public async Task<ActionResult<User>> Create(User user)
        {
            await _userRepository.CreateAsync(user);
            return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, User updatedUser)
        {
            if (id != updatedUser.Id)
            {
                return BadRequest();
            }
            
            var userExists = await _userRepository.ExistsAsync(id);
            
            if (!userExists)
            {
                return NotFound();
            }
            
            await _userRepository.UpdateAsync(updatedUser);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var userExists = await _userRepository.ExistsAsync(id);
            
            if (!userExists)
            {
                return NotFound();
            }
            
            await _userRepository.SoftDeleteAsync(id);
            return NoContent();
        }
    }
}

using CultureEvents.API.Data;
using CultureEvents.API.Models;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CultureEvents.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly IRepository<Category> _categoryRepository;

        public CategoriesController(IRepository<Category> categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetAll()
        {
            var categories = await _categoryRepository.GetAllAsync();
            return Ok(categories);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Category>> GetById(string id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            
            if (category == null)
            {
                return NotFound();
            }
            
            return Ok(category);
        }

        [HttpPost]
        public async Task<ActionResult<Category>> Create(Category category)
        {
            await _categoryRepository.CreateAsync(category);
            return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Category updatedCategory)
        {
            if (id != updatedCategory.Id)
            {
                return BadRequest();
            }
            
            var categoryExists = await _categoryRepository.ExistsAsync(id);
            
            if (!categoryExists)
            {
                return NotFound();
            }
            
            await _categoryRepository.UpdateAsync(updatedCategory);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var categoryExists = await _categoryRepository.ExistsAsync(id);
            
            if (!categoryExists)
            {
                return NotFound();
            }
            
            await _categoryRepository.SoftDeleteAsync(id);
            return NoContent();
        }

        [HttpGet("root")]
        public async Task<ActionResult<IEnumerable<Category>>> GetRootCategories()
        {
            var rootCategories = await _categoryRepository.FindAsync(c => c.ParentId == null || c.ParentId == string.Empty);
            return Ok(rootCategories);
        }

        [HttpGet("subcategories/{parentId}")]
        public async Task<ActionResult<IEnumerable<Category>>> GetSubcategories(string parentId)
        {
            var subcategories = await _categoryRepository.FindAsync(c => c.ParentId == parentId);
            return Ok(subcategories);
        }
        
        [HttpGet("search/{term}")]
        public async Task<ActionResult<IEnumerable<Category>>> Search(string term)
        {
            var lowerTerm = term.ToLower();
            var categories = await _categoryRepository.FindAsync(c => 
                c.Name.ToLower().Contains(lowerTerm) || 
                (c.Description != null && c.Description.ToLower().Contains(lowerTerm))
            );
            
            return Ok(categories);
        }
    }
}

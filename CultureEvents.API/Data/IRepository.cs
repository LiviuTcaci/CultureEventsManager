using CultureEvents.API.Models;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace CultureEvents.API.Data
{
    public interface IRepository<T> where T : BaseEntity
    {
        // Create
        Task<T> CreateAsync(T entity);
        
        // Read
        Task<T> GetByIdAsync(string id);
        Task<IEnumerable<T>> GetAllAsync();
        Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
        
        // Update
        Task<bool> UpdateAsync(T entity);
        
        // Delete
        Task<bool> DeleteAsync(string id);
        Task<bool> SoftDeleteAsync(string id);
        
        // Other
        Task<bool> ExistsAsync(string id);
        Task<long> CountAsync();
        Task<long> CountAsync(Expression<Func<T, bool>> predicate);
    }
}

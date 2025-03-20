using CultureEvents.API.Models;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace CultureEvents.API.Data
{
    public class RepositoryPaginatedResult<T>
    {
        public required IEnumerable<T> Items { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public long TotalCount { get; set; }
        public bool HasPreviousPage => PageNumber > 1;
        public bool HasNextPage => PageNumber < TotalPages;
    }

    public interface IRepository<T> where T : BaseEntity
    {
        // Create
        Task<T> CreateAsync(T entity);
        
        // Read
        Task<T> GetByIdAsync(string id);
        Task<IEnumerable<T>> GetAllAsync();
        Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
        
        // Read with pagination
        Task<RepositoryPaginatedResult<T>> GetPagedAsync(int pageNumber, int pageSize);
        Task<RepositoryPaginatedResult<T>> FindPagedAsync(Expression<Func<T, bool>> predicate, int pageNumber, int pageSize);
        Task<RepositoryPaginatedResult<T>> GetPagedAndSortedAsync(int pageNumber, int pageSize, string sortField, bool ascending = true);
        Task<RepositoryPaginatedResult<T>> FindPagedAndSortedAsync(Expression<Func<T, bool>> predicate, int pageNumber, int pageSize, string sortField, bool ascending = true);
        
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

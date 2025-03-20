using CultureEvents.API.Configurations;
using CultureEvents.API.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace CultureEvents.API.Data
{
    public class MongoRepository<T> : IRepository<T> where T : BaseEntity
    {
        private readonly IMongoCollection<T> _collection;
        private readonly string _collectionName;

        public MongoRepository(IOptions<MongoDbSettings> settings)
        {
            var client = new MongoClient(settings.Value.ConnectionString);
            var database = client.GetDatabase(settings.Value.DatabaseName);
            
            // Get collection name
            _collectionName = GetCollectionName(typeof(T));
            
            // Try to get the collection
            _collection = database.GetCollection<T>(_collectionName);
        }
        
        private string GetCollectionName(Type documentType)
        {
            // Get proper pluralization of collection name
            string name = documentType.Name;
            
            // Handle special cases for English pluralization
            if (name.EndsWith("y", StringComparison.OrdinalIgnoreCase))
            {
                name = name.Substring(0, name.Length - 1) + "ies";
            }
            else if (name.EndsWith("s", StringComparison.OrdinalIgnoreCase) ||
                     name.EndsWith("x", StringComparison.OrdinalIgnoreCase) ||
                     name.EndsWith("ch", StringComparison.OrdinalIgnoreCase) ||
                     name.EndsWith("sh", StringComparison.OrdinalIgnoreCase))
            {
                name = name + "es";
            }
            else
            {
                name = name + "s";
            }
            
            return name;
        }

        public async Task<T> CreateAsync(T entity)
        {
            await _collection.InsertOneAsync(entity);
            return entity;
        }

        public async Task<T> GetByIdAsync(string id)
        {
            return await _collection.Find(e => e.Id == id && !e.IsDeleted).FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _collection.Find(e => !e.IsDeleted).ToListAsync();
        }

        public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
        {
            // Combine with the IsDeleted filter
            var combinedFilter = Builders<T>.Filter.And(
                Builders<T>.Filter.Where(predicate),
                Builders<T>.Filter.Eq(e => e.IsDeleted, false)
            );
            
            return await _collection.Find(combinedFilter).ToListAsync();
        }
        
        public async Task<RepositoryPaginatedResult<T>> GetPagedAsync(int pageNumber, int pageSize)
        {
            return await GetPagedInternalAsync(
                Builders<T>.Filter.Eq(e => e.IsDeleted, false),
                pageNumber,
                pageSize,
                Builders<T>.Sort.Descending(e => e.CreatedAt)
            );
        }
        
        public async Task<RepositoryPaginatedResult<T>> FindPagedAsync(Expression<Func<T, bool>> predicate, int pageNumber, int pageSize)
        {
            var combinedFilter = Builders<T>.Filter.And(
                Builders<T>.Filter.Where(predicate),
                Builders<T>.Filter.Eq(e => e.IsDeleted, false)
            );
            
            return await GetPagedInternalAsync(
                combinedFilter,
                pageNumber,
                pageSize,
                Builders<T>.Sort.Descending(e => e.CreatedAt)
            );
        }
        
        public async Task<RepositoryPaginatedResult<T>> GetPagedAndSortedAsync(int pageNumber, int pageSize, string sortField, bool ascending = true)
        {
            return await GetPagedInternalAsync(
                Builders<T>.Filter.Eq(e => e.IsDeleted, false),
                pageNumber,
                pageSize,
                GetSortDefinition(sortField, ascending)
            );
        }
        
        public async Task<RepositoryPaginatedResult<T>> FindPagedAndSortedAsync(Expression<Func<T, bool>> predicate, int pageNumber, int pageSize, string sortField, bool ascending = true)
        {
            var combinedFilter = Builders<T>.Filter.And(
                Builders<T>.Filter.Where(predicate),
                Builders<T>.Filter.Eq(e => e.IsDeleted, false)
            );
            
            return await GetPagedInternalAsync(
                combinedFilter,
                pageNumber,
                pageSize,
                GetSortDefinition(sortField, ascending)
            );
        }
        
        private SortDefinition<T> GetSortDefinition(string sortField, bool ascending)
        {
            if (string.IsNullOrWhiteSpace(sortField))
            {
                // Default sort by creation date if no field specified
                return ascending 
                    ? Builders<T>.Sort.Ascending(e => e.CreatedAt) 
                    : Builders<T>.Sort.Descending(e => e.CreatedAt);
            }
            
            // Convert camelCase or PascalCase field names to MongoDB's snake_case format
            string dbFieldName = sortField.Length > 0 
                ? char.ToLowerInvariant(sortField[0]) + sortField.Substring(1)
                : sortField;
            
            // Add support for nested fields using dot notation
            var fieldDefinition = new StringFieldDefinition<T>(dbFieldName);
            
            return ascending 
                ? Builders<T>.Sort.Ascending(fieldDefinition) 
                : Builders<T>.Sort.Descending(fieldDefinition);
        }
        
        private async Task<RepositoryPaginatedResult<T>> GetPagedInternalAsync(
            FilterDefinition<T> filter, 
            int pageNumber, 
            int pageSize, 
            SortDefinition<T> sortDefinition)
        {
            // Ensure valid pagination parameters
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;
            
            // Get total count for pagination metadata
            var totalCount = await _collection.CountDocumentsAsync(filter);
            
            // Calculate total pages
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
            
            // Get paginated data
            var skip = (pageNumber - 1) * pageSize;
            var items = await _collection
                .Find(filter)
                .Sort(sortDefinition)
                .Skip(skip)
                .Limit(pageSize)
                .ToListAsync();
            
            // Return paginated result
            return new RepositoryPaginatedResult<T>
            {
                Items = items,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = totalPages
            };
        }

        public async Task<bool> UpdateAsync(T entity)
        {
            entity.UpdatedAt = DateTime.UtcNow;
            
            var result = await _collection.ReplaceOneAsync(
                e => e.Id == entity.Id && !e.IsDeleted,
                entity
            );
            
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var result = await _collection.DeleteOneAsync(e => e.Id == id);
            return result.DeletedCount > 0;
        }

        public async Task<bool> SoftDeleteAsync(string id)
        {
            var update = Builders<T>.Update
                .Set(e => e.IsDeleted, true)
                .Set(e => e.UpdatedAt, DateTime.UtcNow);
                
            var result = await _collection.UpdateOneAsync(
                e => e.Id == id && !e.IsDeleted,
                update
            );
            
            return result.ModifiedCount > 0;
        }

        public async Task<bool> ExistsAsync(string id)
        {
            return await _collection.Find(e => e.Id == id && !e.IsDeleted).AnyAsync();
        }

        public async Task<long> CountAsync()
        {
            return await _collection.CountDocumentsAsync(e => !e.IsDeleted);
        }

        public async Task<long> CountAsync(Expression<Func<T, bool>> predicate)
        {
            var combinedFilter = Builders<T>.Filter.And(
                Builders<T>.Filter.Where(predicate),
                Builders<T>.Filter.Eq(e => e.IsDeleted, false)
            );
            
            return await _collection.CountDocumentsAsync(combinedFilter);
        }
    }
}

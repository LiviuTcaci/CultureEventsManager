using CultureEvents.API.Configurations;
using CultureEvents.API.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace CultureEvents.API.Data
{
    public class MongoRepository<T> : IRepository<T> where T : BaseEntity
    {
        private readonly IMongoCollection<T> _collection;

        public MongoRepository(IOptions<MongoDbSettings> settings)
        {
            var client = new MongoClient(settings.Value.ConnectionString);
            var database = client.GetDatabase(settings.Value.DatabaseName);
            
            // Use the class name as collection name, in plural form
            string collectionName = typeof(T).Name + "s";
            
            // Try to get the collection
            _collection = database.GetCollection<T>(collectionName);
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

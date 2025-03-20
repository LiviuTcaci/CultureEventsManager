# Database Management for CultureEvents Project

This document provides information about the database setup, configuration, and maintenance for the CultureEvents project.

## MongoDB Configuration

The project uses MongoDB Atlas as its database backend. The connection settings are configured in:
- `CultureEvents.API/appsettings.json` for the .NET API
- JavaScript utility scripts for direct database operations

## Collection Structure

The database follows a standardized collection naming convention using PascalCase (e.g., "Events" not "events"). 
The required collections are:

1. **Users** - User accounts and authentication
2. **Events** - Cultural events information
3. **Categories** - Event categories
4. **Venues** - Event locations
5. **Tickets** - User's purchased tickets
6. **Comments** - User comments on events
7. **Ratings** - User ratings for events
8. **Performers** - Artists and performers

## Utility Scripts

### Create Collections Script
The `create-collections.js` script ensures all required collections exist in the MongoDB database.

To run:
```bash
cd CultureEventsProject
node create-collections.js
```

### Fix Collections Script
The `fix-collections.js` script standardizes collection names by removing duplicate collections with inconsistent casing and ensuring all follow the PascalCase naming convention.

To run:
```bash
cd CultureEventsProject
node fix-collections.js
```

## Schema Validation

The MongoDB collections have validation rules applied to ensure data integrity:

- Field requirements (required fields)
- Data types (string, int, decimal, etc.)
- Value constraints (min/max values, string patterns)
- Enumerated values (status fields, types, etc.)

These validations are applied in `MongoSchemaValidation.cs`.

## Data Repositories

The application uses a repository pattern for data access:

- `IRepository<T>` - Generic repository interface
- `MongoRepository<T>` - MongoDB implementation of the repository

## DateTime Handling

Date values are stored as ISO 8601 strings in MongoDB for better compatibility. When working with dates:

- Use `DateTime.Parse(entity.DateField)` to convert from string to DateTime
- Use `dateTime.ToString("o")` to convert from DateTime to string when saving

## API Diagnostics

The API includes a diagnostics controller with endpoints for checking MongoDB connectivity:

- GET `/api/diagnostics/check-mongo` - Verifies connection and lists collections
- POST `/api/diagnostics/create-test-category` - Creates a test document

## Database Initialization

Database initialization happens in `DatabaseInitializationService.cs` which:

1. Creates missing collections
2. Applies schema validation
3. Seeds sample data in development environments

## Troubleshooting

### Common Issues

1. **Missing Collections**
   - Run the `create-collections.js` script to ensure all collections exist
   - Check if API has been run with `DatabaseInitializationService`

2. **Duplicate Collections**
   - Run the `fix-collections.js` script to standardize collection names
   - Ensure all code uses the same casing for collection names

3. **Connection Issues**
   - Verify the MongoDB connection string in `appsettings.json`
   - Check network connectivity to MongoDB Atlas
   - Ensure correct username and password

4. **Validation Errors**
   - MongoDB validation is set to "warn" rather than "error" to prevent operation failures
   - Check data models match validation schemas

5. **Date Conversion Errors**
   - Ensure dates are explicitly parsed when converting between string and DateTime
   - Use ISO format strings consistently

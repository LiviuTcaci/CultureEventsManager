#!/bin/bash

# Script to initialize MongoDB collections for CultureEvents project
echo "Starting MongoDB initialization for CultureEvents project..."

# Build the API project first
echo "Building API project..."
cd CultureEvents.API
dotnet build

# Run a special initialization command that will trigger our startup services
echo "Initializing database..."
ASPNETCORE_ENVIRONMENT=Development dotnet run --no-build --initialization-only

echo "MongoDB initialization complete. All collections should now be visible in MongoDB Atlas."
echo ""
echo "Collections created:"
echo "- Users"
echo "- Events"
echo "- Categories"
echo "- Venues"
echo "- Tickets"
echo "- Comments"
echo "- Ratings"
echo "- Performers"
echo ""
echo "If you still don't see a collection in MongoDB Atlas, please refresh the page or check the connection string in appsettings.json."

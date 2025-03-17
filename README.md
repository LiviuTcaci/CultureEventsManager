# Culture Events Management Platform

A web-based application for managing cultural events such as concerts, exhibitions, and festivals.

## Tech Stack

- **Backend**: .NET Core 6.0 Web API with C#
- **Frontend**: React with TypeScript
- **Database**: MongoDB

## Features

- Event management (create, read, update, delete)
- Comment and review system
- Rating system (1-5 stars)
- Advanced filtering (by category, date, location)
- User management with different roles

## How to Run

### Prerequisites
- .NET SDK 6.0 or higher
- Node.js and npm
- MongoDB

### Backend
```bash
cd CultureEvents.API
dotnet restore
dotnet run
```

### Frontend
```bash
cd CultureEventsManager
npm install
npm start
```

## Project Structure

- `CultureEvents.API/` - Backend API built with ASP.NET Core
- `CultureEventsManager/` - Frontend application built with React

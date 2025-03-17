# Cultural Events Management Platform

A comprehensive platform for managing and discovering cultural events, built with .NET Core and React.

## Features

- Browse and search cultural events
- View event details and venue information
- User authentication and authorization
- Event management for organizers
- Ticket booking system
- Rating and review system

## Tech Stack

### Backend
- .NET Core 7.0
- MongoDB
- JWT Authentication
- RESTful API
- Swagger/OpenAPI

### Frontend
- React 18
- TypeScript
- Material-UI
- React Router
- Context API for state management

## Prerequisites

- .NET Core SDK 7.0
- Node.js 18+
- MongoDB 8.0+
- npm or yarn

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/LiviuTcaci/CultureEventsManager.git
cd CultureEventsManager
```

2. Start MongoDB
```bash
brew services start mongodb-community
```

3. Set up the backend
```bash
cd CultureEvents.API
dotnet restore
dotnet run
```
The API will be available at http://localhost:5165

4. Set up the frontend
```bash
cd ../CultureEventsManager
npm install
npm run dev
```
The frontend will be available at http://localhost:5173

## Database Setup

To populate the database with initial test data:
```bash
mongosh CultureEvents.API/seed-data.js
```

## API Documentation

API documentation is available via Swagger UI at http://localhost:5165/swagger

## Project Structure

```
CultureEventsProject/
├── CultureEvents.API/         # Backend API
│   ├── Controllers/          # API Controllers
│   ├── Models/              # Data Models
│   ├── Data/               # Data Access Layer
│   └── Configurations/    # App Configuration
│
└── CultureEventsManager/    # Frontend React App
    ├── src/
    │   ├── components/    # React Components
    │   ├── pages/        # Page Components
    │   ├── services/    # API Services
    │   ├── context/    # React Context
    │   └── types/     # TypeScript Types
    └── public/       # Static Assets
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

db = db.getSiblingDB('CultureEventsDb');

// Cleanup existing data
db.categories.deleteMany({});
db.venues.deleteMany({});
db.events.deleteMany({});

// Insert categories
db.categories.insertMany([
    {
        name: "Music",
        description: "Musical performances and concerts",
        icon: "music_note",
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false
    },
    {
        name: "Theatre",
        description: "Theatrical performances and plays",
        icon: "theater_comedy",
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false
    },
    {
        name: "Dance",
        description: "Dance performances and shows",
        icon: "dance",
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false
    }
]);

// Insert venues
db.venues.insertMany([
    {
        name: "City Concert Hall",
        address: "123 Music Street",
        city: "Cluj-Napoca",
        country: "Romania",
        capacity: 1000,
        location: {
            latitude: 46.7712,
            longitude: 23.6236
        },
        description: "Main concert venue in the city",
        facilities: ["Parking", "Wheelchair Access", "Restaurant"],
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false
    },
    {
        name: "National Theatre",
        address: "45 Theatre Square",
        city: "Cluj-Napoca",
        country: "Romania",
        capacity: 500,
        location: {
            latitude: 46.7700,
            longitude: 23.6200
        },
        description: "Historic theatre venue",
        facilities: ["Parking", "Cafe", "Cloakroom"],
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false
    }
]);

// Get references for relationships
let musicCategoryId = db.categories.findOne({name: "Music"})._id;
let theatreCategoryId = db.categories.findOne({name: "Theatre"})._id;
let concertHallId = db.venues.findOne({name: "City Concert Hall"})._id;
let theatreVenueId = db.venues.findOne({name: "National Theatre"})._id;

// Insert events
db.events.insertMany([
    {
        title: "Symphony Orchestra Concert",
        description: "Classical music performance featuring Beethoven's 9th Symphony",
        organizerId: "system",
        categoryId: musicCategoryId.toString(),
        venueId: concertHallId.toString(),
        startDate: new Date("2025-04-15T19:00:00Z"),
        endDate: new Date("2025-04-15T22:00:00Z"),
        imageUrls: ["https://example.com/symphony.jpg"],
        status: "Announced",
        capacity: 1000,
        ticketsSold: 0,
        averageRating: 0,
        ratingCount: 0,
        performerIds: [],
        performerDetails: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false
    },
    {
        title: "Romeo and Juliet",
        description: "Shakespeare's classic love story",
        organizerId: "system",
        categoryId: theatreCategoryId.toString(),
        venueId: theatreVenueId.toString(),
        startDate: new Date("2025-04-20T18:00:00Z"),
        endDate: new Date("2025-04-20T21:00:00Z"),
        imageUrls: ["https://example.com/romeo.jpg"],
        status: "Announced",
        capacity: 500,
        ticketsSold: 0,
        averageRating: 0,
        ratingCount: 0,
        performerIds: [],
        performerDetails: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false
    }
]);

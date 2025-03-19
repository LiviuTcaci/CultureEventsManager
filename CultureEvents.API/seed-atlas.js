const { MongoClient } = require('mongodb');

const atlasUri = 'mongodb+srv://tcacidoliviu:WCHKfPG01HGnyYJL@cluster0.gvq8w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const seedData = async () => {
    const client = new MongoClient(atlasUri);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB Atlas');
        
        const db = client.db('CultureEventsDb');
        
        // Clear existing data
        await db.collection('categories').deleteMany({});
        await db.collection('venues').deleteMany({});
        await db.collection('events').deleteMany({});
        
        // Insert categories
        const categories = await db.collection('categories').insertMany([
            {
                name: 'Music',
                description: 'Musical performances and concerts',
                icon: 'music_note',
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: false
            },
            {
                name: 'Theatre',
                description: 'Theatrical performances and plays',
                icon: 'theater_comedy',
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: false
            },
            {
                name: 'Dance',
                description: 'Dance performances and shows',
                icon: 'dance',
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: false
            }
        ]);
        console.log('Categories seeded');
        
        // Insert venues
        const venues = await db.collection('venues').insertMany([
            {
                name: 'City Concert Hall',
                address: '123 Music Street',
                city: 'Cluj-Napoca',
                country: 'Romania',
                capacity: 1000,
                location: {
                    latitude: 46.7712,
                    longitude: 23.6236
                },
                description: 'Main concert venue in the city',
                facilities: ['Parking', 'Wheelchair Access', 'Restaurant'],
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: false
            },
            {
                name: 'National Theatre',
                address: '45 Theatre Square',
                city: 'Cluj-Napoca',
                country: 'Romania',
                capacity: 500,
                location: {
                    latitude: 46.7700,
                    longitude: 23.6200
                },
                description: 'Historic theatre venue',
                facilities: ['Parking', 'Cafe', 'Cloakroom'],
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: false
            }
        ]);
        console.log('Venues seeded');
        
        // Get references for relationships
        const musicCategory = categories.insertedIds[0];
        const theatreCategory = categories.insertedIds[1];
        const concertHall = venues.insertedIds[0];
        const theatreVenue = venues.insertedIds[1];
        
        // Insert events
        await db.collection('events').insertMany([
            {
                title: 'Symphony Orchestra Concert',
                description: 'Classical music performance featuring Beethoven\'s 9th Symphony',
                organizerId: 'system',
                categoryId: musicCategory.toString(),
                venueId: concertHall.toString(),
                startDate: new Date('2025-04-15T19:00:00Z'),
                endDate: new Date('2025-04-15T22:00:00Z'),
                imageUrls: ['https://example.com/symphony.jpg'],
                status: 'Announced',
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
                title: 'Romeo and Juliet',
                description: 'Shakespeare\'s classic love story',
                organizerId: 'system',
                categoryId: theatreCategory.toString(),
                venueId: theatreVenue.toString(),
                startDate: new Date('2025-04-20T18:00:00Z'),
                endDate: new Date('2025-04-20T21:00:00Z'),
                imageUrls: ['https://example.com/romeo.jpg'],
                status: 'Announced',
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
        console.log('Events seeded');
        
        console.log('All data seeded successfully');
    } catch (err) {
        console.error('Error seeding data:', err);
    } finally {
        await client.close();
    }
};

seedData();

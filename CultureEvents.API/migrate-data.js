// Connect to local MongoDB and export data
const localData = async () => {
    const { MongoClient } = require('mongodb');
    const localUri = "mongodb://localhost:27017";
    const client = new MongoClient(localUri);
    
    try {
        await client.connect();
        const db = client.db("CultureEventsDb");
        
        // Export all collections
        const categories = await db.collection("categories").find({}).toArray();
        const venues = await db.collection("venues").find({}).toArray();
        const events = await db.collection("events").find({}).toArray();
        
        return { categories, venues, events };
    } finally {
        await client.close();
    }
};

// Import data to MongoDB Atlas
const importToAtlas = async (data) => {
    const { MongoClient } = require('mongodb');
    const atlasUri = "mongodb+srv://tcacidoliviu:WCHKfPG01HGnyYJL@cluster0.gvq8w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    const client = new MongoClient(atlasUri);
    
    try {
        await client.connect();
        console.log("Connected to MongoDB Atlas");
        
        const db = client.db("CultureEventsDb");
        
        // Clear existing data
        await db.collection("categories").deleteMany({});
        await db.collection("venues").deleteMany({});
        await db.collection("events").deleteMany({});
        
        // Import data
        if (data.categories.length > 0) {
            await db.collection("categories").insertMany(data.categories);
            console.log(`Imported ${data.categories.length} categories`);
        }
        
        if (data.venues.length > 0) {
            await db.collection("venues").insertMany(data.venues);
            console.log(`Imported ${data.venues.length} venues`);
        }
        
        if (data.events.length > 0) {
            await db.collection("events").insertMany(data.events);
            console.log(`Imported ${data.events.length} events`);
        }
        
        console.log("Migration completed successfully");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await client.close();
    }
};

// Execute migration
const migrate = async () => {
    try {
        const data = await localData();
        await importToAtlas(data);
    } catch (err) {
        console.error("Migration failed:", err);
    }
};

migrate();

// Simple script to directly create required MongoDB collections
// ===========================================================
//
// To run this script:
// 1. Replace the '<Your_Password_Here>' with your actual MongoDB password
// 2. Run: MONGO_PASSWORD=your_password node create-collections.js
//    Or set the password directly in the script and run: node create-collections.js

// Load MongoDB driver
const { MongoClient } = require('mongodb');

// Connection URL and database name from settings (from appsettings.json)
const url = 'mongodb+srv://tcacidoliviu:<db_password>@cluster0.gvq8w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const dbName = 'CultureEventsDb';

// Replace with your actual MongoDB password
const mongoPassword = process.env.MONGO_PASSWORD || 'WCHKfPG01HGnyYJL';
const connectionString = url.replace('<db_password>', mongoPassword);

async function createCollections() {
  console.log('Connecting to MongoDB...');
  
  try {
    // Connect to MongoDB
    const client = await MongoClient.connect(connectionString);
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    
    // List of collections to create
    const collections = [
      'Users',
      'Events',
      'Categories',
      'Venues',
      'Tickets',
      'Comments',
      'Ratings',
      'Performers'
    ];
    
    // Get existing collections
    const existingCollections = await db.listCollections().toArray();
    const existingCollectionNames = existingCollections.map(c => c.name);
    
    // Create collections if they don't exist
    for (const collectionName of collections) {
      if (!existingCollectionNames.includes(collectionName)) {
        console.log(`Creating collection: ${collectionName}`);
        await db.createCollection(collectionName);
      } else {
        console.log(`Collection already exists: ${collectionName}`);
      }
    }
    
    // List all collections
    console.log('\nCollections in database:');
    const finalCollections = await db.listCollections().toArray();
    finalCollections.forEach(c => console.log(`- ${c.name}`));
    
    // Close connection
    await client.close();
    console.log('\nMongoDB collections created successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

// Run the script
createCollections();

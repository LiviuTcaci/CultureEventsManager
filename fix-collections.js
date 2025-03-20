// Script to standardize MongoDB collection names
// Removes lowercase duplicates and ensures consistent PascalCase naming

const { MongoClient } = require('mongodb');

// Connection URL and database name from settings (from appsettings.json)
const url = 'mongodb+srv://tcacidoliviu:<db_password>@cluster0.gvq8w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const dbName = 'CultureEventsDb';

// Use the correct MongoDB password
const mongoPassword = process.env.MONGO_PASSWORD || 'WCHKfPG01HGnyYJL';
const connectionString = url.replace('<db_password>', mongoPassword);

// The standard collection names we want to keep (PascalCase)
const standardCollections = [
  'Users',
  'Events',
  'Categories',
  'Venues',
  'Tickets',
  'Comments',
  'Ratings',
  'Performers'
];

async function fixCollections() {
  console.log('Connecting to MongoDB...');
  
  try {
    // Connect to MongoDB
    const client = await MongoClient.connect(connectionString);
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    
    // Get existing collections
    const existingCollections = await db.listCollections().toArray();
    const existingCollectionNames = existingCollections.map(c => c.name);
    
    console.log('Existing collections:', existingCollectionNames);
    
    // Check for duplicates (lowercase versions of our standard collections)
    for (const stdCollection of standardCollections) {
      const lowercaseVersion = stdCollection.toLowerCase();
      
      // If both versions exist (e.g., "Events" and "events")
      if (existingCollectionNames.includes(stdCollection) && 
          existingCollectionNames.includes(lowercaseVersion) &&
          stdCollection !== lowercaseVersion) {
        
        console.log(`Found duplicate collections: ${stdCollection} and ${lowercaseVersion}`);
        
        // Check if there are documents in the lowercase collection
        const lowercaseCol = db.collection(lowercaseVersion);
        const docCount = await lowercaseCol.countDocuments();
        
        if (docCount > 0) {
          console.log(`  ${lowercaseVersion} contains ${docCount} documents. Merging into ${stdCollection}...`);
          
          // Get all documents from lowercase collection
          const docs = await lowercaseCol.find().toArray();
          
          // Insert them into the PascalCase collection
          if (docs.length > 0) {
            await db.collection(stdCollection).insertMany(docs);
            console.log(`  Documents merged into ${stdCollection}`);
          }
        }
        
        // Delete the lowercase collection
        await db.dropCollection(lowercaseVersion);
        console.log(`  Dropped collection: ${lowercaseVersion}`);
      }
    }
    
    // Drop any collection named "category" (singular)
    if (existingCollectionNames.includes('category')) {
      console.log('Dropping singular "category" collection');
      await db.dropCollection('category');
    }
    
    // Check for any missing standard collections
    for (const stdCollection of standardCollections) {
      if (!existingCollectionNames.includes(stdCollection)) {
        console.log(`Creating missing standard collection: ${stdCollection}`);
        await db.createCollection(stdCollection);
      }
    }
    
    // List final collections
    console.log('\nFinal collections in database:');
    const finalCollections = await db.listCollections().toArray();
    finalCollections.forEach(c => console.log(`- ${c.name}`));
    
    // Close connection
    await client.close();
    console.log('\nMongoDB collections standardized successfully');
  } catch (error) {
    console.error('Error fixing collections:', error);
  }
}

// Run the script
fixCollections();

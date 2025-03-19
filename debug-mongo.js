const { MongoClient } = require("mongodb");

// Connection URI - use the same one from docker-compose.yml
const uri = "mongodb+srv://tcacidoliviu:WCHKfPG01HGnyYJL@cluster0.gvq8w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "CultureEventsDb";

async function debugMongo() {
  const client = new MongoClient(uri);
  
  try {
    console.log("Attempting to connect to MongoDB Atlas...");
    await client.connect();
    console.log("Successfully connected to MongoDB Atlas!");
    
    const db = client.db(dbName);
    
    // List all collections
    console.log("\nListing collections in database:");
    const collections = await db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log("No collections found in the database!");
    } else {
      console.log(`Found ${collections.length} collections:`);
      collections.forEach(c => console.log(` - ${c.name}`));
    }
    
    // Check each expected collection
    const expectedCollections = ["category", "venue", "event"];
    
    for (const collName of expectedCollections) {
      console.log(`\nChecking collection: ${collName}`);
      
      // Check if collection exists
      const collExists = collections.some(c => c.name === collName);
      if (!collExists) {
        console.log(`Collection "${collName}" does not exist!`);
        continue;
      }
      
      // Count documents
      const count = await db.collection(collName).countDocuments();
      console.log(`Document count: ${count}`);
      
      // Print first few documents if any exist
      if (count > 0) {
        const docs = await db.collection(collName).find().limit(2).toArray();
        console.log("Sample documents:");
        docs.forEach(doc => console.log(JSON.stringify(doc, null, 2)));
      }
    }
    
    // Test inserting a category
    console.log("\nTesting category insertion...");
    const testCategory = {
      name: "Test Category " + new Date().toISOString(),
      description: "Test category created by debug script",
      icon: "test_icon",
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false
    };
    
    const result = await db.collection("category").insertOne(testCategory);
    if (result.acknowledged) {
      console.log(`Successfully inserted test category with id: ${result.insertedId}`);
    } else {
      console.log("Failed to insert test category");
    }
    
  } catch (error) {
    console.error("Error during MongoDB debugging:", error);
  } finally {
    await client.close();
    console.log("\nConnection closed");
  }
}

debugMongo().catch(console.error);

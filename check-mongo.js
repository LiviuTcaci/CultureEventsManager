const { MongoClient } = require("mongodb");

// Connection URI
const uri = "mongodb+srv://tcacidoliviu:WCHKfPG01HGnyYJL@cluster0.gvq8w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "CultureEventsDb";

async function checkData() {
  let client;

  try {
    client = new MongoClient(uri);
    await client.connect();
    console.log("Connected to MongoDB Atlas");
    
    const db = client.db(dbName);
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log("Collections in database:", collections.map(c => c.name));

    // Check category collection
    if (collections.find(c => c.name === "category")) {
      const categories = await db.collection("category").find({}).toArray();
      console.log("Categories count:", categories.length);
      console.log("Categories:", JSON.stringify(categories, null, 2));
    } else {
      console.log("Category collection does not exist");
    }
    
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

checkData();

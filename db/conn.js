import { MongoClient } from "mongodb"
const connectionString = process.env.ATLAS_URI || ""
const client = new MongoClient(connectionString)
let conn

try {
  conn = await client.connect()
} catch(e) {
  console.log('Failed to connect to MongoDB: ' + e)
}

let db = conn.db("car-rent")
export default db
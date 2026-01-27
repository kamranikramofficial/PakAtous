
const mongoose = require('mongoose');
const path = require('path');
// Load .env.local
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });

console.log("Starting test (checking .env.local)..."); 
console.log("CWD:", process.cwd());

async function testConnection() {
  const uri = process.env.DATABASE_URL;

  console.log("URI found:", !!uri); // Don't log the secret

  if (!uri) {
    console.error("DATABASE_URL is not defined in env");
    return;
  }
  
  try {
    await mongoose.connect(uri);
    console.log("Connection successful!");
    await mongoose.disconnect();
  } catch (err) {
    console.error("Connection failed:", err);
  }
}

testConnection();

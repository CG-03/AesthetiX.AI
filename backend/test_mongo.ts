import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in .env');
    process.exit(1);
  }

  console.log('Testing connection to MongoDB...');
  console.log('URI used (partially masked):', MONGODB_URI.replace(/:([^@]+)@/, ':****@'));

  try {
    // Adding options to help with some DNS environments including force IPv4
    await mongoose.connect(MONGODB_URI, {
      family: 4, 
      connectTimeoutMS: 10000,
    });
    console.log('Successfully connected to MongoDB!');
    
    // Check readyState
    console.log('Mongoose connection readyState:', mongoose.connection.readyState);
    
    // Test a basic query
    const db = mongoose.connection.db;
    if (db) {
        const collections = await db.listCollections().toArray();
        console.log('Collections in database:', collections.map(c => c.name));
    } else {
        console.log('Connected but db object is null');
    }
    
    await mongoose.disconnect();
    console.log('Disconnected.');
  } catch (err: any) {
    console.error('Connection failed!');
    console.error('Error Name:', err.name);
    console.error('Error Code:', err.code);
    console.error('Error Message:', err.message);
    if (err.stack) console.error('Stack Trace:', err.stack);
    process.exit(1);
  }
}

testConnection();

import mongoose from 'mongoose';

// Define the MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI;

// Throw an error if MONGODB_URI is not defined in environment variables
if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Interface for cached mongoose connection
 * Stores both the connection promise and the resolved mongoose instance
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

/**
 * Extend the global namespace to include mongoose cache
 * This prevents TypeScript errors when accessing global.mongoose
 */
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

// Initialize the cache
// Use global variable to persist connection across hot reloads in development
let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

// Store the cache in global scope if not already present
if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Connect to MongoDB using Mongoose
 * Implements connection caching to reuse existing connections
 * 
 * @returns Promise resolving to the Mongoose instance
 */
async function connectDB(): Promise<typeof mongoose> {
  // Return existing connection if already established
  if (cached.conn) {
    return cached.conn;
  }

  // Return existing connection promise if connection is in progress
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable mongoose buffering to throw errors immediately
    };

    // Create new connection promise
    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongooseInstance) => {
      console.log('✅ MongoDB connected successfully');
      return mongooseInstance;
    });
  }

  try {
    // Await the connection promise and cache the result
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset the promise on error so next call will retry
    cached.promise = null;
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }

  return cached.conn;
}

export default connectDB;

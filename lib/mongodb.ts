import "server-only";
import mongoose from "mongoose";

type ConnectionCache = { connection: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const globalForMongo = globalThis as typeof globalThis & { utiuMongo?: ConnectionCache };
const cache = globalForMongo.utiuMongo ??= { connection: null, promise: null };

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required");
  if (cache.connection?.connection.readyState === 1) return cache.connection;
  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB_NAME || "utiu",
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
      bufferCommands: false,
    });
  }
  try {
    cache.connection = await cache.promise;
    return cache.connection;
  } catch (error) {
    cache.connection = null;
    throw error;
  } finally {
    cache.promise = null;
  }
}

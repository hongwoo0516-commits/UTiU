import { existsSync } from "node:fs";
import mongoose from "mongoose";

const envFile = new URL("../.env.local", import.meta.url);
if (existsSync(envFile)) process.loadEnvFile(envFile);

try {
  if (!process.env.MONGODB_URI) throw new Error("MissingMongoUri");
  const dbName = process.env.MONGODB_DB_NAME || "utiu";
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName,
    serverSelectionTimeoutMS: 10000,
    autoIndex: false,
    autoCreate: false,
  });
  await mongoose.connection.db.admin().ping();
  console.log(`MongoDB connection OK (database: ${dbName}). No records changed.`);
} catch (error) {
  // Connection errors can contain credentials; print only their type.
  console.error(`MongoDB connection failed (${error.name}). Check URI, database permissions, and Atlas Network Access.`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}

// @ts-nocheck
import mongoose from "mongoose";
import { env } from "./env";

let cached = global.__mongoose;
if (!cached) {
  cached = global.__mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_CONNECTION_STRING is not configured.");
  }

  if (!cached.promise) {
    mongoose.set("strictQuery", true);
    cached.promise = mongoose
      .connect(env.MONGODB_URI, {
        dbName: "rk_realestate",
        serverSelectionTimeoutMS: 10000,
      })
      .then((m) => {
        console.log("[db] Connected to MongoDB (rk_realestate)");
        return m;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

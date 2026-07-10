import type { IncomingMessage, ServerResponse } from "node:http";
import app from "./app";
import { connectDB } from "./mongo/config/db";

const dbPromise = connectDB().catch((err) =>
  console.error("[vercel] DB connection error:", err),
);

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await dbPromise;
  return new Promise<void>((resolve) => {
    res.on("finish", resolve);
    app(req as any, res as any);
  });
}

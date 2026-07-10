import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../src/app";
import { connectDB } from "../src/mongo/config/db";

const dbPromise = connectDB().catch((err) =>
  console.error("[vercel] DB connection error:", err),
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await dbPromise;
  return new Promise<void>((resolve) => {
    res.on("finish", resolve);
    app(req as any, res as any);
  });
}

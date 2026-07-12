import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import mongoRouter from "./mongo/routes";
import { logger } from "./lib/logger";
import { securityHeaders, requireJsonContentType } from "./mongo/middleware/securityHeaders";

const app: Express = express();

app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// Security headers on every response
app.use(securityHeaders);

// ── CORS ───────────────────────────────────────────────────────────────────
// In production restrict to the known frontend origin; in development
// reflect all origins so local dev tools work without extra config.
// Override by setting ALLOWED_ORIGIN (comma-separated) in the environment.
const rawAllowed = process.env.ALLOWED_ORIGIN ?? "";
const allowedOrigins: string[] = rawAllowed.length
  ? rawAllowed.split(",").map((o) => o.trim()).filter(Boolean)
  : ["https://rk-assosiates.vercel.app"];

const isDev = process.env.NODE_ENV !== "production";

app.use(
  cors({
    origin: isDev
      ? true // reflect all origins in local development
      : (origin, callback) => {
          // Allow server-to-server / curl requests (no origin header)
          if (!origin) return callback(null, true);
          if (allowedOrigins.includes(origin)) return callback(null, true);
          callback(new Error(`Origin ${origin} not allowed by CORS policy`));
        },
    credentials: true,
  }),
);
// ───────────────────────────────────────────────────────────────────────────

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Reject POST/PUT/PATCH without a recognised Content-Type
app.use(requireJsonContentType);

app.use("/api", router);
app.use("/api", mongoRouter);

export default app;

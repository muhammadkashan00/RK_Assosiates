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

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Reject POST/PUT/PATCH with wrong Content-Type (after body parsers so multipart passthrough works)
app.use(requireJsonContentType);

app.use("/api", router);
app.use("/api", mongoRouter);

export default app;

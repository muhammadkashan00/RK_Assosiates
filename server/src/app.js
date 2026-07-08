import "./config/env.js"
import express from "express"
import helmet from "helmet"
import cors from "cors"
import cookieParser from "cookie-parser"
import morgan from "morgan"

import { env, isProd } from "./config/env.js"
import { connectDB } from "./config/db.js"
import { apiLimiter } from "./middleware/rateLimit.js"
import { notFound, errorHandler } from "./middleware/error.js"

import authRoutes from "./routes/auth.js"
import propertyRoutes from "./routes/properties.js"
import leadRoutes from "./routes/leads.js"
import analyticsRoutes from "./routes/analytics.js"

const app = express()

// Behind a proxy (Vercel/Render) - needed for correct client IPs.
app.set("trust proxy", 1)

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }))
app.use(
  cors({
    origin: isProd ? (env.CLIENT_ORIGIN ? env.CLIENT_ORIGIN.split(",") : true) : true,
    credentials: true,
  }),
)
app.use(express.json({ limit: "1mb" }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
if (!isProd) app.use(morgan("dev"))

// Health check works without a database connection.
app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "rk-associates-api", time: new Date().toISOString() })
})

// Ensure the database is connected before handling any data route. The
// connection is cached across warm serverless invocations (see config/db.js).
app.use("/api", async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (err) {
    console.error("[api] Database connection failed:", err.message)
    res.status(503).json({ message: "Service temporarily unavailable. Please try again shortly." })
  }
})

app.use("/api", apiLimiter)
app.use("/api/auth", authRoutes)
app.use("/api/properties", propertyRoutes)
app.use("/api/leads", leadRoutes)
app.use("/api/analytics", analyticsRoutes)

app.use(notFound)
app.use(errorHandler)

export default app

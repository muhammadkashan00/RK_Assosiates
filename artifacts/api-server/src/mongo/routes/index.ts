// @ts-nocheck
import { Router } from "express";
import { apiLimiter, adminLimiter } from "../middleware/rateLimit";
import authRoutes from "./auth";
import propertyRoutes from "./properties";
import leadRoutes from "./leads";
import analyticsRoutes from "./analytics";
import { notFound, errorHandler } from "../middleware/error";

const router = Router();

// General rate limit on all mongo-backed routes
router.use(apiLimiter);

router.use("/auth", authRoutes);
router.use("/properties", propertyRoutes);

// Lead & analytics write paths are admin-facing — apply tight limit
router.use("/leads", adminLimiter, leadRoutes);
router.use("/analytics", analyticsRoutes);

router.use(notFound);
router.use(errorHandler);

export default router;

// @ts-nocheck
import { Router } from "express";
import { apiLimiter } from "../middleware/rateLimit";
import authRoutes from "./auth";
import propertyRoutes from "./properties";
import leadRoutes from "./leads";
import analyticsRoutes from "./analytics";
import { notFound, errorHandler } from "../middleware/error";

const router = Router();

router.use(apiLimiter);
router.use("/auth", authRoutes);
router.use("/properties", propertyRoutes);
router.use("/leads", leadRoutes);
router.use("/analytics", analyticsRoutes);

router.use(notFound);
router.use(errorHandler);

export default router;

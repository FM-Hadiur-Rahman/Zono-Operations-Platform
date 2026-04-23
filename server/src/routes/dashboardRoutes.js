import express from "express";
import {
  getOwnerDashboardStats,
  getManagerDashboardStats,
  getOwnerLocationsStats,
  getOwnerSuppliersStats,
} from "../controllers/dashboardController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/owner", protect, authorize("owner"), getOwnerDashboardStats);
router.get(
  "/owner/locations",
  protect,
  authorize("owner"),
  getOwnerLocationsStats,
);
router.get(
  "/owner/suppliers",
  protect,
  authorize("owner"),
  getOwnerSuppliersStats,
);
router.get(
  "/manager",
  protect,
  authorize("manager", "owner"),
  getManagerDashboardStats,
);

export default router;

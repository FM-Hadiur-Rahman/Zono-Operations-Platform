import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
} from "../controllers/orderController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(protect, authorize("manager", "owner"), createOrder)
  .get(protect, authorize("manager", "owner"), getOrders);

router.get("/:id", protect, authorize("manager", "owner"), getOrderById);

export default router;

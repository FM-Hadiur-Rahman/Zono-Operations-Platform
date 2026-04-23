import express from "express";
import { getProducts } from "../controllers/productController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getProducts);

export default router;

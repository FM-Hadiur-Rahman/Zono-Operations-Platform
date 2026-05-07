import express from "express";
import {
  getProducts,
  createProduct,
} from "../controllers/productController.js";
import { protect } from "../middlewares/authMiddleware.js";
import uploadProductImage from "../middlewares/uploadProductImage.js";

const router = express.Router();

router.get("/", protect, getProducts);

router.post("/", protect, uploadProductImage.single("image"), createProduct);

export default router;

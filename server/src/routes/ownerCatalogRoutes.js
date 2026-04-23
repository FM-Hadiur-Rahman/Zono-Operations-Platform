import express from "express";
import {
  getOwnerSuppliers,
  createOwnerSupplier,
  updateOwnerSupplier,
  getOwnerProducts,
  createOwnerProduct,
  updateOwnerProduct,
} from "../controllers/ownerCatalogController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("owner"));

router.get("/suppliers", getOwnerSuppliers);
router.post("/suppliers", createOwnerSupplier);
router.put("/suppliers/:id", updateOwnerSupplier);

router.get("/products", getOwnerProducts);
router.post("/products", createOwnerProduct);
router.put("/products/:id", updateOwnerProduct);

export default router;

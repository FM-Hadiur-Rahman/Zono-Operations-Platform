import express from "express";
import {
  getOwnerLocations,
  createOwnerLocation,
  updateOwnerLocation,
  getOwnerUsers,
  createOwnerManager,
} from "../controllers/ownerManagementController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("owner"));

router.get("/locations", getOwnerLocations);
router.post("/locations", createOwnerLocation);
router.put("/locations/:id", updateOwnerLocation);

router.get("/users", getOwnerUsers);
router.post("/users", createOwnerManager);

export default router;

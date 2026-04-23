import express from "express";
import {
  seedInitialData,
  resetSeedData,
} from "../controllers/setupController.js";

const router = express.Router();

router.post("/seed", seedInitialData);
router.delete("/reset", resetSeedData);

export default router;

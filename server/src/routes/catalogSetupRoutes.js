import express from "express";
import {
  seedCatalogData,
  resetCatalogData,
} from "../controllers/catalogSetupController.js";

const router = express.Router();

router.post("/seed", seedCatalogData);
router.delete("/reset", resetCatalogData);

export default router;

import express from "express";
import { createPlatformAdmin } from "../controllers/platformSetupController.js";

const router = express.Router();

router.post("/platform-admin", createPlatformAdmin);

export default router;

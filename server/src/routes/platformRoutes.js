import express from "express";
import {
  createCompany,
  getCompanies,
  getCompanyById,
  toggleCompanyStatus,
} from "../controllers/platformController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("platform_admin"));

router.get("/companies", getCompanies);
router.get("/companies/:id", getCompanyById);
router.post("/companies", createCompany);
router.patch("/companies/:id/toggle-status", toggleCompanyStatus);

export default router;

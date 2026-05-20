import { Router } from "express";
import { ReportController } from "../../controllers/ReportController";
import { authMiddleware } from "../../middlewares/AuthMiddleware";
const router = Router();
const reportController = new ReportController();

// User Side
router.post("/", authMiddleware, reportController.createReport);

//! Admin side
router.get("/staff", authMiddleware, reportController.showAllReportByDivision)
router.post("/validate/:id", authMiddleware, reportController.validateReport)

export default router;
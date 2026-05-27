import { Router } from "express";
import { ReportController } from "../../controllers/ReportController";
import { authMiddleware } from "../../middlewares/AuthMiddleware";

const router = Router();
const reportController = new ReportController();

// Canonical staff dashboard routes
router.get("/reports", authMiddleware, reportController.showAllReportByDivision);
router.get("/reports/:id", authMiddleware, reportController.showDetailReportStaff);

export default router;

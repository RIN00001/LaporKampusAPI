import { Router } from "express";
import { ReportController } from "../../controllers/ReportController";
import { authMiddleware } from "../../middlewares/AuthMiddleware";

const router = Router();
const reportController = new ReportController();

// User side
router.post("/", authMiddleware, reportController.createReport);
router.get("/me", authMiddleware, reportController.showAllReportUser);
router.get("/:id", authMiddleware, reportController.showDetailReportUser);
router.patch("/:id/cancel", authMiddleware, reportController.cancelReportUser);

//! Legacy staff routes kept for backward compatibility.
//! Prefer /api/staff/reports for Jefferson's staff dashboard.
router.get("/staff", authMiddleware, reportController.showAllReportByDivision);
router.get("/staff/:id", authMiddleware, reportController.showDetailReportStaff);
router.patch("/validate/:id", authMiddleware, reportController.validateReport);

export default router;

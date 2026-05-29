import { Router } from "express";
import { ReportController } from "../../controllers/ReportController";
import { authMiddleware } from "../../middlewares/AuthMiddleware";

const router = Router();
const reportController = new ReportController();

// User side
router.post("/", authMiddleware, reportController.createReport);
router.get("/me", authMiddleware, reportController.showAllReportUser);

//! Legacy staff routes kept for backward compatibility.
//! Prefer /api/staff/reports for Jefferson's staff dashboard.
router.get("/staff", authMiddleware, reportController.showAllReportByDivisionLegacy);
router.get("/staff/:id", authMiddleware, reportController.showDetailReportStaffLegacy);
router.patch("/validate/:id", authMiddleware, reportController.validateReport);

// Dynamic routes must be registered last to prevent shadowing
router.get("/:id", authMiddleware, reportController.showDetailReportUser);
router.patch("/:id/cancel", authMiddleware, reportController.cancelReportUser);

export default router;

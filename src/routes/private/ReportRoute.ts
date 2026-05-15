import { Router } from "express";
import { ReportController } from "../../controllers/ReportController";
import { authMiddleware } from "../../middlewares/AuthMiddleware";
const router = Router();
const reportController = new ReportController();

router.post("/", authMiddleware, reportController.createReport);

export default router;
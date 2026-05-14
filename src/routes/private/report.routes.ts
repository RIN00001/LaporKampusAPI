import { Router } from "express";
import { ReportController } from "../../controllers/report.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();
const reportController = new ReportController();

router.post("/", authMiddleware, reportController.createReport);

export default router;
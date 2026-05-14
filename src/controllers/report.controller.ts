import { Response } from "express";
import { ReportService } from "../services/report.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export class ReportController {
  private reportService = new ReportService();

  createReport = async (req: AuthRequest, res: Response) => {
    try {
      const userId = Number(req.user?.id);

      const result = await this.reportService.createReport(userId, req.body);

      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Create report failed",
      });
    }
  };
}
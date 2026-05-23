import { Response } from "express";
import { ReportService } from "../services/ReportService";
import { AuthRequest } from "../middlewares/AuthMiddleware";

export class ReportController {
  private reportService = new ReportService();

  // User Side
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

  // Staff side
  // Take all report based on division
  showAllReportByDivision = async (req: AuthRequest, res: Response) => {
    try {
      const userId = Number(req.user?.id)

      const result = await this.reportService.getReportsByDivision(userId)
      res.status(201).json(result)
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Unknown error is detected"
      })
    }
  }

  // Take report in admin side
  showDetailReportStaff = async (req: AuthRequest, res: Response) => {
    try {
      const userId = Number(req.user?.id)

      const reportId = Number(req.params.id)

      const result = await this.reportService.getReportDetailStaff(reportId, userId)
      res.status(201).json(result)
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Unknown error is detected"
      })
    }
  }

  // Validate a report
  validateReport = async(req: AuthRequest, res: Response) => {
    try {
      // Fetch both userId of a user
      const userId = Number(req.user?.id);

      // Fetch reportId that will be validate
      const reportId = Number(req.params.id);

      // Calling service to do validation
      const result = await this.reportService.validateReport(reportId, userId, req.body);
      // If success, show the result & status 201
      res.status(201).json(result);
    } catch (error) {
      // If fail, show error & status 400
      res.status(400).json({
        message: error instanceof Error ? error.message : "Validate report failed",
      });
    }
  }
}
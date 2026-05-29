import { ReportStatus } from "@prisma/client";
import { Response } from "express";
import { AuthRequest } from "../middlewares/AuthMiddleware";
import { ReportService } from "../services/ReportService";
import { errorResponse } from "../utils/ApiResponse";

export class ReportController {
  private reportService = new ReportService();

  // To create a new report from a user
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

  // To get all reports for the logged in user
  showAllReportUser = async (req: AuthRequest, res: Response) => {
    try {
      const userId = Number(req.user?.id);

      const result = await this.reportService.getAllReportsUser(userId);

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Fetch reports failed",
      });
    }
  };

  // To get one report detail for the logged in user
  showDetailReportUser = async (req: AuthRequest, res: Response) => {
    try {
      const userId = Number(req.user?.id);
      const reportId = Number(req.params.id);

      if (!Number.isInteger(reportId) || reportId < 1) {
        return res.status(400).json({ message: "Invalid report id" });
      }

      const result = await this.reportService.getReportDetailUser(
        reportId,
        userId,
      );

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        message:
          error instanceof Error ? error.message : "Fetch report detail failed",
      });
    }
  };

  // To cancel one report owned by the logged in user
  cancelReportUser = async (req: AuthRequest, res: Response) => {
    try {
      const userId = Number(req.user?.id);
      const reportId = Number(req.params.id);

      if (!Number.isInteger(reportId) || reportId < 1) {
        return res.status(400).json({ message: "Invalid report id" });
      }

      const result = await this.reportService.cancelReport(reportId, userId);

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Cancel report failed",
      });
    }
  };

  // Staff side: take all reports based on division
  showAllReportByDivision = async (req: AuthRequest, res: Response) => {
    try {
      const userId = Number(req.user?.id);

      const result = await this.reportService.getReportsByDivision(userId, {
        page: Number(req.query.page),
        limit: Number(req.query.limit),
        status: req.query.status as ReportStatus | undefined,
        search: req.query.search as string | undefined,
      });

      res.status(200).json(result);
    } catch (error) {
      res
        .status(400)
        .json(
          errorResponse(
            error instanceof Error ? error.message : "Unknown error is detected",
          ),
        );
    }
  };

  // Staff side: take report detail in admin side
  showDetailReportStaff = async (req: AuthRequest, res: Response) => {
    try {
      const userId = Number(req.user?.id);
      const reportId = Number(req.params.id);

      if (!Number.isInteger(reportId) || reportId < 1) {
        return res.status(400).json(errorResponse("Invalid report id"));
      }

      const result = await this.reportService.getReportDetailStaff(
        reportId,
        userId,
      );

      res.status(200).json(result);
    } catch (error) {
      res
        .status(400)
        .json(
          errorResponse(
            error instanceof Error ? error.message : "Unknown error is detected",
          ),
        );
    }
  };

  // Staff side: take all reports based on division (Legacy for Android app)
  showAllReportByDivisionLegacy = async (req: AuthRequest, res: Response) => {
    try {
      const userId = Number(req.user?.id);

      const result = await this.reportService.getReportsByDivisionLegacy(userId);

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Fetch reports failed",
      });
    }
  };

  // Staff side: take report detail (Legacy for Android app)
  showDetailReportStaffLegacy = async (req: AuthRequest, res: Response) => {
    try {
      const userId = Number(req.user?.id);
      const reportId = Number(req.params.id);

      if (!Number.isInteger(reportId) || reportId < 1) {
        return res.status(400).json({ message: "Invalid report id" });
      }

      const result = await this.reportService.getReportDetailStaffLegacy(
        reportId,
        userId,
      );

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Fetch report detail failed",
      });
    }
  };

  // To validate a report by staff
  validateReport = async (req: AuthRequest, res: Response) => {
    try {
      const userId = Number(req.user?.id);
      const reportId = Number(req.params.id);

      const result = await this.reportService.validateReport(
        reportId,
        userId,
        req.body,
      );

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        message:
          error instanceof Error ? error.message : "Validate report failed",
      });
    }
  };
}

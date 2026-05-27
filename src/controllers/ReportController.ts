import { Response } from "express";
import { ReportService } from "../services/ReportService";
import { AuthRequest } from "../middlewares/AuthMiddleware";

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

	// To get a detailed report for user
	showDetailReportUser = async (req: AuthRequest, res: Response) => {
		try {
			const userId = Number(req.user?.id);
			
			const reportId = Number(req.params.id);

			const result = await this.reportService.getReportDetailUser(reportId, userId);
			
			res.status(200).json(result);
		} catch (error) {
			res.status(400).json({
				message: error instanceof Error ? error.message : "Fetch detail report failed",
			});
		}
	};

	// To cancel a report by user
	cancelReportUser = async (req: AuthRequest, res: Response) => {
		try {
			const userId = Number(req.user?.id);
			
			const reportId = Number(req.params.id);

			const result = await this.reportService.cancelReport(reportId, userId);
			
			res.status(200).json(result);
		} catch (error) {
			res.status(400).json({
				message: error instanceof Error ? error.message : "Cancel report failed",
			});
		}
	};

	// To take all reports based on staff division
	showAllReportByDivision = async (req: AuthRequest, res: Response) => {
		try {
			const userId = Number(req.user?.id);

			const result = await this.reportService.getReportsByDivision(userId);

			res.status(200).json(result);
		} catch (error) {
			res.status(400).json({
				message: error instanceof Error ? error.message : "Unknown error is detected",
			});
		}
	};

	// To take a detailed report in staff side
	showDetailReportStaff = async (req: AuthRequest, res: Response) => {
		try {
			const userId = Number(req.user?.id);

			const reportId = Number(req.params.id);

			const result = await this.reportService.getReportDetailStaff(reportId, userId);

			res.status(200).json(result);
		} catch (error) {
			res.status(400).json({
				message: error instanceof Error ? error.message : "Unknown error is detected",
			});
		}
	};

	// To validate a report by staff
	validateReport = async (req: AuthRequest, res: Response) => {
		try {
			const userId = Number(req.user?.id);

			const reportId = Number(req.params.id);

			const result = await this.reportService.validateReport(reportId, userId, req.body);
			
			res.status(200).json(result);
		} catch (error) {
			res.status(400).json({
				message: error instanceof Error ? error.message : "Validate report failed",
			});
		}
	};
}
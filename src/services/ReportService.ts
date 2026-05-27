import { report } from "process";
import { CreateReportRequestDTO, ReportValidateDTO } from "../dtos/ReportDTO";
import { ReportRepository } from "../repositories/ReportRepository";
import { validateCreateReportInput } from "../validations/ReportValidation";
import { AuthService } from "./AuthService";

export class ReportService {
	private reportRepository = new ReportRepository();
	private authService = new AuthService();

	// To create a report from a user
	async createReport(userId: number, dto: CreateReportRequestDTO) {
		validateCreateReportInput(dto);

		const report = await this.reportRepository.createReport(userId, dto);

		if (dto.imageUrlReport) {
			await this.reportRepository.addReportImage(report.id, dto.imageUrlReport);
		}

		const finalReport = await this.reportRepository.getReportById(report.id);

		return {
			message: "Report created successfully",
			report: finalReport,
		};
	}

	// To get all reports for a specific user
	async getAllReportsUser(userId: number) {
		const userReports = await this.reportRepository.findReportsByUserId(userId);

		return userReports.map((report) => {
			const latestHistory = report.statusHistory?.[0];

			return {
				reportIdReport: report.id,
				titleReport: report.title,
				descriptionReport: report.description,
				statusReport: report.status,
				locationReport: report.location,
				floorReport: report.floor,
				roomReport: report.room,
				upvoteCountReport: report._count?.upvotes ?? 0,
				noteReport: latestHistory?.note ?? "",
			};
		});
	}

	// To get a detailed report for a specific user
	async getReportDetailUser(reportId: number, userId: number) {
		const fetchReport = await this.reportRepository.getReportById(reportId);

		if (!fetchReport) {
			throw new Error("Report not found!");
		}

		if (fetchReport.userId !== userId) {
			throw new Error("You do not have access to view this report.");
		}

		const latestHistory = fetchReport.statusHistory?.[0];

		return {
			reportIdReport: fetchReport.id,
			titleReport: fetchReport.title,
			descriptionReport: fetchReport.description,
			statusReport: fetchReport.status,
			locationReport: fetchReport.location,
			floorReport: fetchReport.floor,
			roomReport: fetchReport.room,
			upvoteCountReport: fetchReport._count?.upvotes ?? 0,
			noteReport: latestHistory?.note ?? "",
		};
	}

	// To cancel a report from a user
	async cancelReport(reportId: number, userId: number) {
		const fetchReport = await this.reportRepository.getReportById(reportId);

		if (!fetchReport) {
			throw new Error("Report not found!");
		}

		if (fetchReport.userId !== userId) {
			throw new Error("You do not have permission to cancel this report.");
		}

		if (fetchReport.status === "DONE" || fetchReport.status === "REJECTED") {
			throw new Error("Cannot cancel a report that is already processed or rejected.");
		}

		const dto: ReportValidateDTO = { 
			newStatusReport: "CANCELLED", 
			noteReport: "Cancelled by user" 
		};

		const cancelledReport = await this.reportRepository.updateReportStatus(
			reportId,
			userId,
			fetchReport.status,
			dto
		);

		return {
			message: "Report cancelled successfully",
			report: cancelledReport,
		};
	}

	// To get all reports based on staff division
	async getReportsByDivision(userId: number) {
		const user = await this.authService.checkIfUserStaff(userId);

		const division = this.authService.validateStaffDivision(user.division);

		const reportDivision = await this.reportRepository.findReportsByDivision(division);

		return reportDivision.map((report) => {
			const latestHistory = report.statusHistory?.[0];
			
			return {
				reportIdReport: report.id,
				titleReport: report.title,
				descriptionReport: report.description,
				statusReport: report.status,
				locationReport: report.location,
				floorReport: report.floor,
				roomReport: report.room,
				upvoteCountReport: report._count?.upvotes ?? 0,
				noteReport: latestHistory?.note ?? "",
			};
		});
	}

	// To get a detailed report for staff members
	async getReportDetailStaff(reportId: number, userId: number) {
		const user = await this.authService.checkIfUserStaff(userId);

		const division = this.authService.validateStaffDivision(user.division);

		const fetchReport = await this.reportRepository.getReportById(reportId);

		if (!fetchReport) {
			throw new Error("Report not found!");
		}

		this.authService.checkIfReportIsPartOfStaffDivision(
			division,
			fetchReport.division
		);

		const latestHistory = fetchReport.statusHistory?.[0];

		return {
			reportIdReport: fetchReport.id,
			titleReport: fetchReport.title,
			descriptionReport: fetchReport.description,
			statusReport: fetchReport.status,
			locationReport: fetchReport.location,
			floorReport: fetchReport.floor,
			roomReport: fetchReport.room,
			upvoteCountReport: fetchReport._count?.upvotes ?? 0,
			noteReport: latestHistory?.note ?? "",
		};
	}

	// To validate and change a report status from staff
	async validateReport(reportId: number, userId: number, dto: ReportValidateDTO) {
		const user = await this.authService.checkIfUserStaff(userId);

		const fetchReport = await this.reportRepository.getReportById(reportId);

		if (!fetchReport) {
			throw new Error("Report not found!");
		}

		if (fetchReport.status === dto.newStatusReport) {
			throw new Error(`Report is already in the status ${dto.newStatusReport}`);
		}

		this.authService.checkIfReportIsPartOfStaffDivision(
			user.division,
			fetchReport.division
		);

		const updatedValidationReport = await this.reportRepository.updateReportStatus(
			reportId,
			userId,
			fetchReport.status,
			dto
		);

		return {
			message: "Report status updated successfully",
			report: updatedValidationReport,
		};
	}
}
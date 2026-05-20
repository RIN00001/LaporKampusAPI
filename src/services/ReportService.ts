import { CreateReportRequestDTO, ReportValidateDTO } from "../dtos/ReportDTO";
import { ReportRepository } from "../repositories/ReportRepository";
import { validateCreateReportInput } from "../validations/ReportValidation";
import { AuthService } from "./AuthService";

export class ReportService {
  private reportRepository = new ReportRepository();
  private authService = new AuthService();

  // User Side
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

  // Staff Side
  // Take report based on staff division
  async getReportsByDivision(userId: number) {
    const user = await this.authService.checkIfUserStaff(userId)

    const division = await this.authService.validateStaffDivision(user.division);

    const reports = await this.reportRepository.findReportsByDivision(division);

    return reports
  }

  // Changing a report validation
  async validateReport(reportId: number, userId: number, dto: ReportValidateDTO) {
    // Check if user is an admin
    const user = await this.authService.checkIfUserStaff(userId)

    // Fetch a report
    const fetchReport = await this.reportRepository.getReportById(reportId)

    // If no report found, throw errors
    if(!fetchReport) {
      throw new Error("Report not found!")
    }

    if(fetchReport.status === dto.newStatusReport) {
      throw new Error(`Report is already in the stauts ${dto.newStatusReport}`)
    }
    
    // Check if report & user have the same division
    this.authService.checkIfReportIsPartOfStaffDivision(user.division, fetchReport.division)

    // Change of validation on a report is changed
    const updatedValidationReport = await this.reportRepository.updateReportStatus(reportId, userId, fetchReport.status, dto);

    // Return a message and the full data that it got updated
    return {
      message: "Report status updated successfully",
      report: updatedValidationReport,
    }
  }
}

import { DivisionType } from "@prisma/client";
import { CreateReportRequestDTO, ReportValidateDTO } from "../dtos/ReportDTO";
import { AuthRepository } from "../repositories/AuthRepository";
import { ReportRepository } from "../repositories/ReportRepository";
import { validateCreateReportInput } from "../validations/ReportValidation";

export class ReportService {
  private reportRepository = new ReportRepository();
  private authRepository = new AuthRepository();

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

  // Changing a report validation
  async validateReport(reportId: number, userId: number, dto: ReportValidateDTO) {
    // Check if user is an admin
    const user = await this.checkIfUserAdmin(userId)

    // Fetch a report
    const fetchReport = await this.reportRepository.getReportById(reportId)

    // If no report found, throw errors
    if(!fetchReport) {
      throw new Error("Report not found!")
    }
    
    // Check if report & user have the same division
    this.checkIfReportIsPartOfStaffDivision(user.division, fetchReport.division)

    // Change of validation on a report is changed
    const updatedValidationReport = await this.reportRepository.updateReportStatus(reportId, userId, fetchReport.status, dto);

    // Return a message and the full data that it got updated
    return {
      message: "Report status updated successfully",
      report: updatedValidationReport,
    }
  }


  // Validate if an user is a staff
  async checkIfUserAdmin(userId: number) {
    const user = await this.authRepository.checkUser(userId)
    if (!user) {
      throw new Error("User not found");
    }
    if (user.role !== "STAFF") {
      throw new Error("Unauthorized: Only staff members can validate reports");
    }

    return user;
  }

  // Validate if user is a staff of a certain division that's the same as the report
  async checkIfReportIsPartOfStaffDivision(staffDivision: DivisionType | null, reportTakenDivision: DivisionType) {
    if(!staffDivision) {
      throw new Error("Unauthorized: You are not assigned to any division")
    } 
    if(staffDivision !== reportTakenDivision) {
      throw new Error(`Unauthorized: You can only validate reports for ${staffDivision}`)
    }
  }
}

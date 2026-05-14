import { CreateReportRequestDTO } from "../dtos/report.dto";
import { ReportRepository } from "../repositories/report.repository";
import { validateCreateReportInput } from "../validations/report.validations";

export class ReportService {
  private reportRepository = new ReportRepository();

async createReport(userId: number, dto: CreateReportRequestDTO) {
  validateCreateReportInput(dto);

  const report = await this.reportRepository.createReport(userId, dto);

    if (dto.imageUrl) {
    await this.reportRepository.addReportImage(report.id, dto.imageUrl);
    }

    const finalReport = await this.reportRepository.getReportById(report.id);

    return {
    message: "Report created successfully",
    report: finalReport,
    };
}
}
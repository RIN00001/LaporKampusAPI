import { ReportStatus } from "@prisma/client";
import {
  CreateReportRequestDTO,
  ReportValidateDTO,
  StaffReportDetailDTO,
  StaffReportListItemDTO,
  StaffReportListResponseDTO,
  StaffReportQueryDTO,
} from "../dtos/ReportDTO";
import { ReportRepository } from "../repositories/ReportRepository";
import { validateCreateReportInput } from "../validations/ReportValidation";
import { successResponse } from "../utils/ApiResponse";
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
      throw new Error(
        "Cannot cancel a report that is already processed or rejected.",
      );
    }

    const dto: ReportValidateDTO = {
      newStatusReport: "CANCELLED",
      noteReport: "Cancelled by user",
    };

    const cancelledReport = await this.reportRepository.updateReportStatus(
      reportId,
      userId,
      fetchReport.status,
      dto,
    );

    return {
      message: "Report cancelled successfully",
      report: cancelledReport,
    };
  }

  // To get all reports based on staff division
  async getReportsByDivision(userId: number, query: StaffReportQueryDTO = {}) {
    const user = await this.authService.checkIfUserStaff(userId);

    const division = this.authService.validateStaffDivision(user.division);

    const staffQuery = this.buildStaffReportQuery(query);

    const [reportDivision, totalItems] =
      await this.reportRepository.findStaffReportsByDivision(
        division,
        staffQuery,
      );

    const reports = reportDivision.map((report) =>
      this.mapStaffReportListItem(report),
    );

    const totalPages = Math.ceil(totalItems / staffQuery.limit);

    const response: StaffReportListResponseDTO = {
      reports,
      pagination: {
        page: staffQuery.page,
        limit: staffQuery.limit,
        totalItems,
        totalPages,
        hasNextPage: staffQuery.page < totalPages,
        hasPreviousPage: staffQuery.page > 1,
      },
    };

    return successResponse("Staff reports fetched successfully", response);
  }

  // To get a detailed report for staff members
  async getReportDetailStaff(reportId: number, userId: number) {
    const user = await this.authService.checkIfUserStaff(userId);

    const division = this.authService.validateStaffDivision(user.division);

    const fetchReport =
      await this.reportRepository.getStaffReportDetailById(reportId);

    if (!fetchReport) {
      throw new Error("Report not found!");
    }

    this.authService.checkIfReportIsPartOfStaffDivision(
      division,
      fetchReport.division,
    );

    const report = this.mapStaffReportDetail(fetchReport);

    return successResponse("Staff report detail fetched successfully", report);
  }

  // To validate and change a report status from staff
  async validateReport(
    reportId: number,
    userId: number,
    dto: ReportValidateDTO,
  ) {
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
      fetchReport.division,
    );

    const updatedValidationReport =
      await this.reportRepository.updateReportStatus(
        reportId,
        userId,
        fetchReport.status,
        dto,
      );

    return {
      message: "Report status updated successfully",
      report: updatedValidationReport,
    };
  }

  private mapStaffReportListItem(report: any): StaffReportListItemDTO {
    const latestHistory = report.statusHistory?.[0];

    return {
      id: report.id,
      category: report.division,
      title: report.title,
      shortDescription: this.createShortDescription(report.description),
      division: report.division,
      status: report.status,
      location: report.location,
      floor: report.floor,
      room: report.room,
      thumbnailImageUrl: report.images?.[0]?.imageUrl ?? null,
      upvoteCount: report._count?.upvotes ?? 0,
      latestNote: latestHistory?.note ?? null,
      reporterName: report.user?.name ?? "",
      createdAt: report.createdAt,
    };
  }

  private mapStaffReportDetail(report: any): StaffReportDetailDTO {
    return {
      id: report.id,
      category: report.division,
      title: report.title,
      description: report.description,
      division: report.division,
      status: report.status,
      location: report.location,
      floor: report.floor,
      room: report.room,
      upvoteCount: report._count?.upvotes ?? 0,
      latestNote: report.statusHistory?.[0]?.note ?? null,
      createdAt: report.createdAt,
      images: report.images.map((image: any) => ({
        id: image.id,
        imageUrl: image.imageUrl,
      })),
      reporter: {
        id: report.user.id,
        name: report.user.name,
        email: report.user.email,
      },
      history: report.statusHistory.map((history: any) => ({
        id: history.id,
        oldStatus: history.oldStatus,
        newStatus: history.newStatus,
        note: history.note,
        changedAt: history.changedAt,
        changedBy: {
          id: history.changedBy.id,
          name: history.changedBy.name,
          email: history.changedBy.email,
        },
      })),
    };
  }

  // To get all reports based on staff division (for legacy/Android endpoint)
  async getReportsByDivisionLegacy(userId: number) {
    const user = await this.authService.checkIfUserStaff(userId);
    const division = this.authService.validateStaffDivision(user.division);

    const reports = await this.reportRepository.findReportsByDivision(division);

    return reports.map((report) => {
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

  // To get detailed report for staff members (for legacy/Android endpoint)
  async getReportDetailStaffLegacy(reportId: number, userId: number) {
    const user = await this.authService.checkIfUserStaff(userId);
    const division = this.authService.validateStaffDivision(user.division);

    const fetchReport = await this.reportRepository.getReportById(reportId);

    if (!fetchReport) {
      throw new Error("Report not found!");
    }

    this.authService.checkIfReportIsPartOfStaffDivision(
      division,
      fetchReport.division,
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

  private buildStaffReportQuery(query: StaffReportQueryDTO) {
    const page = this.parsePositiveNumber(query.page, 1);
    const limit = Math.min(this.parsePositiveNumber(query.limit, 10), 50);

    if (query.status && !Object.values(ReportStatus).includes(query.status)) {
      throw new Error("Invalid report status");
    }

    return {
      page,
      limit,
      status: query.status,
      search: query.search?.trim() || undefined,
    };
  }

  private parsePositiveNumber(value: number | undefined, defaultValue: number) {
    const numberValue = Number(value);

    if (!Number.isInteger(numberValue) || numberValue < 1) {
      return defaultValue;
    }

    return numberValue;
  }

  private createShortDescription(description: string) {
    if (description.length <= 120) {
      return description;
    }

    return `${description.slice(0, 117)}...`;
  }
}

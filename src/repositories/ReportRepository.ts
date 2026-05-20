import { DivisionType, ReportStatus } from "@prisma/client";
import { prisma } from "../config/Prisma";
import { CreateReportRequestDTO, ReportValidateDTO } from "../dtos/ReportDTO";

export class ReportRepository {
  createReport(userId: number, dto: CreateReportRequestDTO) {
    return prisma.report.create({
      data: {
        title: dto.titleReport,
        description: dto.descriptionReport,
        location: dto.locationReport,
        floor: dto.floorReport,
        room: dto.roomReport,
        division: dto.divisionReport,
        userId,
      },
      include: {
        images: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  addReportImage(reportId: number, imageUrl: string) {
    return prisma.reportImage.create({
      data: {
        reportId,
        imageUrl,
      },
    });
  }

  getReportById(reportId: number) {
    return prisma.report.findUnique({
      where: {
        id: reportId,
      },
      include: {
        images: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  updateReportStatus(reportId: number, staffId: number, oldStatus: ReportStatus, dto: ReportValidateDTO) {
    return prisma.report.update({
      where: {
        id: reportId,
      },
      data: {
        status: dto.newStatusReport,
        statusHistory: {
          create: {
            oldStatus: oldStatus,
            newStatus: dto.newStatusReport,
            note: dto.noteReport,
            changedById: staffId
          },
        },
      },
      include: {
        statusHistory: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })
  }

  findReportsByDivision(division: DivisionType) {
    return prisma.report.findMany({
      //Find all report based on staff logged in
      where: {
        division: division,
      },

      // Take how many upvotes a report has
      include: {
        _count: {
          select: {
            upvotes: true,
          },
        },
      },
      
      // Order it from highest
      orderBy: {
        upvotes: {
          _count: "desc"
        }
      }
    })
  }
}

import { prisma } from "../config/Prisma";
import { CreateReportRequestDTO } from "../dtos/ReportDTO";

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
}
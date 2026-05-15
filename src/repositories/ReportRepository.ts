import { prisma } from "../config/prisma";
import { CreateReportRequestDTO } from "../dtos/ReportDTO";

export class ReportRepository {
        createReport(userId: number, dto: CreateReportRequestDTO) {
          return prisma.report.create({
            data: {
              title: dto.title,
              description: dto.description,
              location: dto.location,
              floor: dto.floor,
              room: dto.room,
              division: dto.division,
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
import { CreateReportRequestDTO } from "../dtos/ReportDTO";
import { DivisionType } from "@prisma/client";

export function validateCreateReportInput(dto: CreateReportRequestDTO) {
  const { title, description, location, floor, room, division } = dto;

  if (!title || !description || !location || !floor || !room || !division) {
    throw new Error("All report fields are required");
  }

  if (!Object.values(DivisionType).includes(division)) {
    throw new Error("Division must be ICT or PM");
  }
}
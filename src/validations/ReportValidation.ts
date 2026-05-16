import { CreateReportRequestDTO } from "../dtos/ReportDTO";
import { DivisionType } from "@prisma/client";

export function validateCreateReportInput(dto: CreateReportRequestDTO) {
  const { titleReport, descriptionReport, locationReport, floorReport, roomReport, divisionReport } = dto;

  if (!titleReport || !descriptionReport || !locationReport || !floorReport || !roomReport || !divisionReport) {
    throw new Error("All report fields are required");
  }

  if (!Object.values(DivisionType).includes(divisionReport)) {
    throw new Error("Division must be ICT or PM");
  }
}
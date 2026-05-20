import { ReportStatus, DivisionType } from "@prisma/client";

export interface CreateReportRequestDTO {
  titleReport: string;
  descriptionReport: string;
  locationReport: string;
  floorReport: string;
  roomReport: string;
  divisionReport: DivisionType;
  imageUrlReport?: string;
}

export interface ReportResponseDTO {
  reportIdReport: number;
  titleReport: string;
  descriptionReport: string;
  statusReport: string;
  locationReport: string;
  floorReport: string;
  roomReport: string;
  upvoteCountReport: number;
}

export interface ReportValidateDTO {
  newStatusReport: ReportStatus;
  noteReport?: string;
}
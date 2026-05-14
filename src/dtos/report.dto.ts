import { DivisionType } from "@prisma/client";

export interface CreateReportRequestDTO {
  title: string;
  description: string;
  location: string;
  floor: string;
  room: string;
  division: DivisionType;
  imageUrl?: string;
}
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
  noteReport: string;
  locationReport: string;
  floorReport: string;
  roomReport: string;
  upvoteCountReport: number;
}

export interface ReportValidateDTO {
  newStatusReport: ReportStatus;
  noteReport?: string;
}

export interface StaffReportQueryDTO {
  page?: number;
  limit?: number;
  status?: ReportStatus;
  search?: string;
}

export interface StaffReportListItemDTO {
  id: number;
  category: DivisionType;
  title: string;
  shortDescription: string;
  division: DivisionType;
  status: ReportStatus;
  location: string;
  floor: string;
  room: string;
  thumbnailImageUrl: string | null;
  upvoteCount: number;
  latestNote: string | null;
  reporterName: string;
  createdAt: Date;
}

export interface StaffReportListResponseDTO {
  reports: StaffReportListItemDTO[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface StaffReportDetailDTO {
  id: number;
  category: DivisionType;
  title: string;
  description: string;
  division: DivisionType;
  status: ReportStatus;
  location: string;
  floor: string;
  room: string;
  upvoteCount: number;
  latestNote: string | null;
  createdAt: Date;
  images: {
    id: number;
    imageUrl: string;
  }[];
  reporter: {
    id: number;
    name: string;
    email: string;
  };
  history: StaffReportHistoryDTO[];
}

export interface StaffReportHistoryDTO {
  id: number;
  oldStatus: ReportStatus | null;
  newStatus: ReportStatus;
  note: string | null;
  changedAt: Date;
  changedBy: {
    id: number;
    name: string;
    email: string;
  };
}

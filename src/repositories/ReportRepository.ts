import { DivisionType, Prisma, ReportStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import {
	CreateReportRequestDTO,
	ReportValidateDTO,
	StaffReportQueryDTO,
} from "../dtos/ReportDTO";

export class ReportRepository {
	// To create a new report in the database
	createReport(userId: number, dto: CreateReportRequestDTO) {
		return prisma.report.create({
			data: {
				title: dto.titleReport,
				description: dto.descriptionReport,
				location: dto.locationReport,
				floor: dto.floorReport,
				room: dto.roomReport,
				division: dto.divisionReport,
				userId: userId,
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

	// To add an image to a specific report
	addReportImage(reportId: number, imageUrl: string) {
		return prisma.reportImage.create({
			data: {
				reportId: reportId,
				imageUrl: imageUrl,
			},
		});
	}

	// To fetch a single report by its ID
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
				statusHistory: {
					orderBy: {
						changedAt: "desc",
					},
					include: {
						changedBy: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
					},
				},
				_count: {
					select: {
						upvotes: true,
					},
				},
			},
		});
	}

	// To update the status of a report and record history
	updateReportStatus(
		reportId: number,
		staffId: number,
		oldStatus: ReportStatus,
		dto: ReportValidateDTO,
	) {
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
						changedById: staffId,
					},
				},
			},
			include: {
				statusHistory: true,
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

	// To find all reports based on a specific division
	findReportsByDivision(division: DivisionType) {
		return prisma.report.findMany({
			where: {
				division: division,
			},
			include: {
				_count: {
					select: {
						upvotes: true,
					},
				},
				statusHistory: {
					orderBy: {
						changedAt: "desc",
					},
					take: 1,
				},
				images: true, // DITAMBAHKAN AGAR GAMBAR KETARIK
			},
			orderBy: {
				upvotes: {
					_count: "desc",
				},
			},
		});
	}

	// To find all reports created by a specific user
	findReportsByUserId(userId: number) {
		return prisma.report.findMany({
			where: {
				userId: userId,
			},
			include: {
				_count: {
					select: {
						upvotes: true,
					},
				},
				statusHistory: {
					orderBy: {
						changedAt: "desc",
					},
					take: 1,
				},
				images: true, // DITAMBAHKAN AGAR GAMBAR KETARIK
			},
			orderBy: {
				createdAt: "desc",
			},
		});
	}

	findStaffReportsByDivision(
		division: DivisionType,
		query: Required<Pick<StaffReportQueryDTO, "page" | "limit">> &
			Pick<StaffReportQueryDTO, "status" | "search">,
	) {
		const where = this.buildStaffReportWhere(
			division,
			query.status,
			query.search,
		);
		const skip = (query.page - 1) * query.limit;

		return prisma.$transaction([
			prisma.report.findMany({
				where,
				skip,
				take: query.limit,
				select: {
					id: true,
					title: true,
					description: true,
					division: true,
					status: true,
					location: true,
					floor: true,
					room: true,
					createdAt: true,
					user: {
						select: {
							name: true,
						},
					},
					images: {
						take: 1,
						select: {
							imageUrl: true,
						},
					},
					statusHistory: {
						orderBy: {
							changedAt: "desc",
						},
						take: 1,
						select: {
							note: true,
						},
					},
					_count: {
						select: {
							upvotes: true,
						},
					},
				},
				orderBy: [
					{
						upvotes: {
							_count: "desc",
						},
					},
					{
						createdAt: "desc",
					},
				],
			}),
			prisma.report.count({ where }),
		]);
	}

	getStaffReportDetailById(reportId: number) {
		return prisma.report.findUnique({
			where: {
				id: reportId,
			},
			select: {
				id: true,
				title: true,
				description: true,
				division: true,
				status: true,
				location: true,
				floor: true,
				room: true,
				createdAt: true,
				images: {
					select: {
						id: true,
						imageUrl: true,
					},
				},
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				statusHistory: {
					orderBy: {
						changedAt: "desc",
					},
					select: {
						id: true,
						oldStatus: true,
						newStatus: true,
						note: true,
						changedAt: true,
						changedBy: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
					},
				},
				_count: {
					select: {
						upvotes: true,
					},
				},
			},
		});
	}

	private buildStaffReportWhere(
		division: DivisionType,
		status?: ReportStatus,
		search?: string,
	): Prisma.ReportWhereInput {
		const trimmedSearch = search?.trim();

		return {
			division,
			...(status ? { status } : {}),
			...(trimmedSearch
				? {
					OR: [
						{
							title: {
								contains: trimmedSearch,
								mode: "insensitive",
							},
						},
						{
							description: {
								contains: trimmedSearch,
								mode: "insensitive",
							},
						},
						{
							location: {
								contains: trimmedSearch,
								mode: "insensitive",
							},
						},
						{
							floor: {
								contains: trimmedSearch,
								mode: "insensitive",
							},
						},
						{
							room: {
								contains: trimmedSearch,
								mode: "insensitive",
							},
						},
						{
							user: {
								name: {
									contains: trimmedSearch,
									mode: "insensitive",
								},
							},
						},
					],
				}
				: {}),
		};
	}
}
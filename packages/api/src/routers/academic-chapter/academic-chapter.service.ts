import type { PrismaClient } from "@workspace/db/main"
import { notFound } from "../../utils/errors"
import type {
  CreateAcademicChapterInput,
  DeleteAcademicChapterInput,
  GetAcademicChapterInput,
  ListAcademicChaptersInput,
  UpdateAcademicChapterInput,
} from "./academic-chapter.schema"

export async function listAcademicChapters(
  db: PrismaClient,
  input: ListAcademicChaptersInput,
) {
  const where: any = {}
  if (input.subjectId) where.subjectId = input.subjectId
  if (input.academicYearId) where.academicYearId = input.academicYearId
  if (typeof input.isActive === "boolean") where.isActive = input.isActive

  if (input.query) {
    where.OR = [
      { nameEn: { contains: input.query, mode: "insensitive" } },
      { nameBn: { contains: input.query, mode: "insensitive" } },
    ]
  }

  let orderBy: any = { position: "asc" }
  if (input.sort === "name_asc") {
    orderBy = { nameEn: "asc" }
  } else if (input.sort === "name_desc") {
    orderBy = { nameEn: "desc" }
  } else if (input.sort === "position_asc") {
    orderBy = { position: "asc" }
  } else if (input.sort === "position_desc") {
    orderBy = { position: "desc" }
  }

  const page = input.page ?? 1
  const limit = input.limit ?? 20
  const skip = input.cursor ? 1 : (page - 1) * limit

  const [academicChapters, totalItems] = await Promise.all([
    db.academicChapter.findMany({
      where,
      take: limit,
      skip,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      orderBy,
      include: {
        subject: {
          select: {
            id: true,
            nameEn: true,
            nameBn: true,
          },
        },
        academicYear: {
          select: {
            id: true,
            nameEn: true,
            nameBn: true,
          },
        },
      },
    }),
    db.academicChapter.count({ where }),
  ])

  const nextCursor =
    academicChapters.length === limit
      ? academicChapters[academicChapters.length - 1]?.id
      : undefined

  return {
    academicChapters,
    totalItems,
    totalPages: Math.ceil(totalItems / limit) || 1,
    page,
    limit,
    nextCursor,
  }
}

export async function getAcademicChapterById(
  db: PrismaClient,
  input: GetAcademicChapterInput,
) {
  const academicChapter = await db.academicChapter.findUnique({
    where: { id: input.id },
  })
  if (!academicChapter) throw notFound("AcademicChapter")
  return academicChapter
}

export async function createAcademicChapter(
  db: PrismaClient,
  input: CreateAcademicChapterInput,
) {
  return db.academicChapter.create({ data: input })
}

export async function updateAcademicChapter(
  db: PrismaClient,
  input: UpdateAcademicChapterInput,
) {
  const { id, ...data } = input
  const existing = await db.academicChapter.findUnique({
    where: { id },
    select: { id: true },
  })
  if (!existing) throw notFound("AcademicChapter")

  return db.academicChapter.update({ where: { id }, data })
}

export async function deleteAcademicChapter(
  db: PrismaClient,
  input: DeleteAcademicChapterInput,
) {
  const existing = await db.academicChapter.findUnique({
    where: { id: input.id },
    select: { id: true },
  })
  if (!existing) throw notFound("AcademicChapter")

  await db.academicChapter.delete({ where: { id: input.id } })
  return { success: true }
}

export async function toggleAcademicChapterStatus(
  db: PrismaClient,
  input: GetAcademicChapterInput,
) {
  const existing = await db.academicChapter.findUnique({
    where: { id: input.id },
    select: { id: true, isActive: true },
  })
  if (!existing) throw notFound("AcademicChapter")

  return db.academicChapter.update({
    where: { id: input.id },
    data: { isActive: !existing.isActive },
  })
}

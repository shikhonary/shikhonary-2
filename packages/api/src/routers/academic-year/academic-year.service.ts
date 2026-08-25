import type { PrismaClient } from "@workspace/db/main"
import { notFound } from "../../utils/errors"
import type {
  CreateAcademicYearInput,
  DeleteAcademicYearInput,
  GetAcademicYearInput,
  ListAcademicYearsInput,
  UpdateAcademicYearInput,
} from "./academic-year.schema"

export async function listAcademicYears(
  db: PrismaClient,
  input: ListAcademicYearsInput,
) {
  const where: any = {}
  if (typeof input.isActive === "boolean") where.isActive = input.isActive
  
  if (input.query) {
    where.OR = [
      { nameEn: { contains: input.query, mode: "insensitive" } },
      { nameBn: { contains: input.query, mode: "insensitive" } },
    ]
  }

  let orderBy: any = { startDate: "desc" }
  if (input.sort === "name_asc") {
    orderBy = { nameEn: "asc" }
  } else if (input.sort === "name_desc") {
    orderBy = { nameEn: "desc" }
  } else if (input.sort === "newest") {
    orderBy = { startDate: "desc" }
  } else if (input.sort === "oldest") {
    orderBy = { startDate: "asc" }
  }

  const page = input.page ?? 1
  const limit = input.limit ?? 20
  const skip = input.cursor ? 1 : (page - 1) * limit

  const [academicYears, totalItems] = await Promise.all([
    db.academicYear.findMany({
      where,
      take: limit,
      skip,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      orderBy,
    }),
    db.academicYear.count({ where }),
  ])

  const nextCursor =
    academicYears.length === limit
      ? academicYears[academicYears.length - 1]?.id
      : undefined

  return {
    academicYears,
    totalItems,
    totalPages: Math.ceil(totalItems / limit) || 1,
    page,
    limit,
    nextCursor,
  }
}

export async function getAcademicYearById(
  db: PrismaClient,
  input: GetAcademicYearInput,
) {
  const academicYear = await db.academicYear.findUnique({
    where: { id: input.id },
  })
  if (!academicYear) throw notFound("AcademicYear")
  return academicYear
}

export async function createAcademicYear(
  db: PrismaClient,
  input: CreateAcademicYearInput,
) {
  if (input.isCurrent) {
    await db.academicYear.updateMany({
      where: {},
      data: { isCurrent: false },
    })
  }

  return db.academicYear.create({ data: input })
}

export async function updateAcademicYear(
  db: PrismaClient,
  input: UpdateAcademicYearInput,
) {
  const { id, ...data } = input
  const existing = await db.academicYear.findUnique({
    where: { id },
    select: { id: true },
  })
  if (!existing) throw notFound("AcademicYear")

  if (data.isCurrent) {
    await db.academicYear.updateMany({
      where: {},
      data: { isCurrent: false },
    })
  }

  return db.academicYear.update({ where: { id }, data })
}

export async function deleteAcademicYear(
  db: PrismaClient,
  input: DeleteAcademicYearInput,
) {
  const existing = await db.academicYear.findUnique({
    where: { id: input.id },
    select: { id: true },
  })
  if (!existing) throw notFound("AcademicYear")

  await db.academicYear.delete({ where: { id: input.id } })
  return { success: true }
}

export async function toggleAcademicYearStatus(
  db: PrismaClient,
  input: GetAcademicYearInput,
) {
  const existing = await db.academicYear.findUnique({
    where: { id: input.id },
    select: { id: true, isActive: true },
  })
  if (!existing) throw notFound("AcademicYear")

  return db.academicYear.update({
    where: { id: input.id },
    data: { isActive: !existing.isActive },
  })
}

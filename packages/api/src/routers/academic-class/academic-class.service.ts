import type { PrismaClient } from "@workspace/db/main"
import { notFound } from "../../utils/errors"
import type {
  CreateAcademicClassInput,
  DeleteAcademicClassInput,
  GetAcademicClassInput,
  ListAcademicClassesInput,
  UpdateAcademicClassInput,
} from "./academic-class.schema"

export async function listAcademicClasses(
  db: PrismaClient,
  input: ListAcademicClassesInput,
) {
  const where: any = {}
  if (typeof input.isActive === "boolean") where.isActive = input.isActive

  if (input.academicYearId) {
    where.classSubjects = {
      some: {
        academicSubject: {
          academicYearId: input.academicYearId,
        },
      },
    }
  }

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

  const [academicClasses, totalItems] = await Promise.all([
    db.academicClass.findMany({
      where,
      take: limit,
      skip,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      orderBy,
    }),
    db.academicClass.count({ where }),
  ])

  const nextCursor =
    academicClasses.length === limit
      ? academicClasses[academicClasses.length - 1]?.id
      : undefined

  return {
    academicClasses,
    totalItems,
    totalPages: Math.ceil(totalItems / limit) || 1,
    page,
    limit,
    nextCursor,
  }
}

export async function getAcademicClassById(
  db: PrismaClient,
  input: GetAcademicClassInput,
) {
  const academicClass = await db.academicClass.findUnique({
    where: { id: input.id },
  })
  if (!academicClass) throw notFound("AcademicClass")
  return academicClass
}

export async function createAcademicClass(
  db: PrismaClient,
  input: CreateAcademicClassInput,
) {
  return db.academicClass.create({ data: input })
}

export async function updateAcademicClass(
  db: PrismaClient,
  input: UpdateAcademicClassInput,
) {
  const { id, ...data } = input
  const existing = await db.academicClass.findUnique({
    where: { id },
    select: { id: true },
  })
  if (!existing) throw notFound("AcademicClass")

  return db.academicClass.update({ where: { id }, data })
}

export async function deleteAcademicClass(
  db: PrismaClient,
  input: DeleteAcademicClassInput,
) {
  const existing = await db.academicClass.findUnique({
    where: { id: input.id },
    select: { id: true },
  })
  if (!existing) throw notFound("AcademicClass")

  await db.academicClass.delete({ where: { id: input.id } })
  return { success: true }
}

export async function toggleAcademicClassStatus(
  db: PrismaClient,
  input: GetAcademicClassInput,
) {
  const existing = await db.academicClass.findUnique({
    where: { id: input.id },
    select: { id: true, isActive: true },
  })
  if (!existing) throw notFound("AcademicClass")

  return db.academicClass.update({
    where: { id: input.id },
    data: { isActive: !existing.isActive },
  })
}

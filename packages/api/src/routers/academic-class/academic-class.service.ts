/**
 * Academic Class domain — business logic service.
 *
 * All database queries live here, decoupled from tRPC plumbing.
 */
import type { PrismaClient } from "@workspace/db/main"
import { notFound } from "../../utils/errors"
import type {
  AcademicClassForSelectionInput,
  CreateAcademicClassInput,
  DeleteAcademicClassInput,
  GetAcademicClassInput,
  ListAcademicClassesInput,
  UpdateAcademicClassInput,
} from "./academic-class.schema"
import { safeAcademicClassSelect } from "./academic-class.schema"

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function listAcademicClasses(
  db: PrismaClient,
  input: ListAcademicClassesInput,
) {
  const where = {
    ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    ...(input.query
      ? {
          name: { contains: input.query, mode: "insensitive" as const },
        }
      : {}),
  }

  let orderBy: any = [{ createdAt: "desc" }]
  switch (input.sort) {
    case "name_asc":
      orderBy = [{ name: "asc" }]
      break
    case "name_desc":
      orderBy = [{ name: "desc" }]
      break
    case "newest":
      orderBy = [{ createdAt: "desc" }]
      break
    case "oldest":
      orderBy = [{ createdAt: "asc" }]
      break
    case "All":
    default:
      orderBy = [{ createdAt: "desc" }]
      break
  }

  const page = input.page ?? 1
  const limit = input.limit ?? 10
  const skip = input.cursor ? 1 : (page - 1) * limit

  const [items, totalItems] = await Promise.all([
    db.academicClass.findMany({
      take: limit,
      skip,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      where,
      select: safeAcademicClassSelect,
      orderBy,
    }),
    db.academicClass.count({ where }),
  ])

  const nextCursor =
    items.length === limit ? items[items.length - 1]?.id : undefined

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / limit) || 1,
    page,
    limit,
    nextCursor,
  }
}

export async function getAcademicClassStats(db: PrismaClient) {
  const [totalClassesCount, activeClassesCount, inactiveClassesCount] = await Promise.all([
    db.academicClass.count(),
    db.academicClass.count({
      where: { isActive: true },
    }),
    db.academicClass.count({
      where: { isActive: false },
    }),
  ])

  return {
    totalClassesCount,
    activeClassesCount,
    inactiveClassesCount,
  }
}

export async function getAcademicClassById(
  db: PrismaClient,
  input: GetAcademicClassInput,
) {
  const item = await db.academicClass.findUnique({
    where: { id: input.id },
    select: safeAcademicClassSelect,
  })

  if (!item) throw notFound("AcademicClass")
  return item
}

export async function getAcademicClassesForSelection(
  db: PrismaClient,
  input: AcademicClassForSelectionInput,
) {
  return db.academicClass.findMany({
    where: input.isActive !== undefined ? { isActive: input.isActive } : undefined,
    select: {
      id: true,
      name: true,
      isActive: true,
    },
    orderBy: { name: "asc" },
  })
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

import { TRPCError } from "@trpc/server"

export async function createAcademicClass(
  db: PrismaClient,
  input: CreateAcademicClassInput,
) {
  try {
    return await db.academicClass.create({
      data: input,
      select: safeAcademicClassSelect,
    })
  } catch (err: any) {
    console.error("[createAcademicClass] Error:", err)
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: err?.message || "Failed to create academic class",
    })
  }
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

  return db.academicClass.update({
    where: { id },
    data,
    select: safeAcademicClassSelect,
  })
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

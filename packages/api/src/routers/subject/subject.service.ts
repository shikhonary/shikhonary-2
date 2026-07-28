/**
 * Subject domain — business logic service.
 *
 * All database queries live here, decoupled from tRPC plumbing.
 */
import type { PrismaClient } from "@workspace/db/main"
import { Prisma } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import { notFound } from "../../utils/errors"
import type {
  AssignAcademicClassesInput,
  CreateSubjectInput,
  DeleteSubjectInput,
  GetSubjectInput,
  ListSubjectsInput,
  SubjectForSelectionInput,
  UpdateSubjectInput,
} from "./subject.schema"
import { safeSubjectSelect } from "./subject.schema"

export type MappedSubject = Omit<
  Prisma.SubjectGetPayload<{ select: typeof safeSubjectSelect }>,
  "academicClasses"
> & {
  nameEn: string
  nameBn: string
  level: string
  group: string
  academicClasses: Array<{
    id: string
    academicClassId: string
    academicClass: {
      id: string
      name: string
      isActive: boolean
      nameEn: string
      nameBn: string
    } | null
  }>
}

// Helper to map database Subject record to the legacy shape expected by client applications.
export function mapSubjectResponse(
  subject: Prisma.SubjectGetPayload<{ select: typeof safeSubjectSelect }>
): MappedSubject {
  return {
    id: subject.id,
    name: subject.name,
    position: subject.position,
    createdAt: subject.createdAt,
    updatedAt: subject.updatedAt,
    _count: subject._count,
    nameEn: subject.name,
    nameBn: subject.name,
    level: "",
    group: "",
    academicClasses: subject.academicClasses?.map((ac) => ({
      id: ac.id,
      academicClassId: ac.academicClassId,
      academicClass: ac.academicClass ? {
        id: ac.academicClass.id,
        name: ac.academicClass.name,
        isActive: ac.academicClass.isActive,
        nameEn: ac.academicClass.name,
        nameBn: ac.academicClass.name,
      } : null,
    })) || [],
  }
}

export function mapSubjectResponseNullable(
  subject: Prisma.SubjectGetPayload<{ select: typeof safeSubjectSelect }> | null
): MappedSubject | null {
  if (!subject) return null
  return mapSubjectResponse(subject)
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function listSubjects(
  db: PrismaClient,
  input: ListSubjectsInput,
) {
  const where = {
    ...(input.academicClassId
      ? {
          academicClasses: {
            some: {
              academicClassId: input.academicClassId,
            },
          },
        }
      : {}),
    ...(input.query
      ? {
          OR: [
            { name: { contains: input.query, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }

  let orderBy: any = [{ position: "asc" }, { createdAt: "desc" }]
  switch (input.sort) {
    case "position_desc":
      orderBy = [{ position: "desc" }, { createdAt: "desc" }]
      break
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
    case "position_asc":
    case "All":
    default:
      orderBy = [{ position: "asc" }, { createdAt: "desc" }]
      break
  }

  const page = input.page ?? 1
  const limit = input.limit ?? 10
  const skip = input.cursor ? 1 : (page - 1) * limit

  const [items, totalItems] = await Promise.all([
    db.subject.findMany({
      take: limit,
      skip,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      where,
      select: safeSubjectSelect,
      orderBy,
    }),
    db.subject.count({ where }),
  ])

  const nextCursor =
    items.length === limit ? items[items.length - 1]?.id : undefined

  return {
    items: items.map(mapSubjectResponse),
    totalItems,
    totalPages: Math.ceil(totalItems / limit) || 1,
    page,
    limit,
    nextCursor,
  }
}

export async function getSubjectStats(db: PrismaClient) {
  const totalSubjectsCount = await db.subject.count()

  return {
    totalSubjectsCount,
    activeLevelsCount: 0,
    activeGroupsCount: 0,
  }
}

export async function getSubjectById(
  db: PrismaClient,
  input: GetSubjectInput,
): Promise<MappedSubject> {
  const item = await db.subject.findUnique({
    where: { id: input.id },
    select: safeSubjectSelect,
  })

  if (!item) throw notFound("Subject")
  return mapSubjectResponse(item)
}

export type MappedSubjectSelection = {
  id: string
  name: string
  position: number
  nameEn: string
  nameBn: string
}

export async function getSubjectsForSelection(
  db: PrismaClient,
  input: SubjectForSelectionInput,
): Promise<MappedSubjectSelection[]> {
  const items = await db.subject.findMany({
    where: {
      ...(input.academicClassId
        ? {
            academicClasses: {
              some: {
                academicClassId: input.academicClassId,
              },
            },
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      position: true,
    },
    orderBy: { position: "asc" },
  })

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    position: item.position,
    nameEn: item.name,
    nameBn: item.name,
  }))
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createSubject(
  db: PrismaClient,
  input: CreateSubjectInput,
) {
  try {
    const { academicClassIds, ...data } = input
    return await db.subject.create({
      data: {
        ...data,
        ...(academicClassIds && academicClassIds.length > 0
          ? {
              academicClasses: {
                create: academicClassIds.map((academicClassId) => ({
                  academicClassId,
                })),
              },
            }
          : {}),
      },
      select: safeSubjectSelect,
    })
  } catch (err: any) {
    console.error("[createSubject] Error:", err)
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: err?.message || "Failed to create subject",
    })
  }
}

export async function updateSubject(
  db: PrismaClient,
  input: UpdateSubjectInput,
) {
  const { id, academicClassIds, ...data } = input

  const existing = await db.subject.findUnique({
    where: { id },
    select: { id: true },
  })
  if (!existing) throw notFound("Subject")

  if (academicClassIds !== undefined) {
    await db.$transaction([
      db.academicClassSubject.deleteMany({
        where: { subjectId: id },
      }),
      ...(academicClassIds.length > 0
        ? [
            db.academicClassSubject.createMany({
              data: academicClassIds.map((academicClassId) => ({
                subjectId: id,
                academicClassId,
              })),
            }),
          ]
        : []),
      db.subject.update({
        where: { id },
        data,
      }),
    ])

    return getSubjectById(db, { id })
  }

  return db.subject.update({
    where: { id },
    data,
    select: safeSubjectSelect,
  })
}

export async function deleteSubject(
  db: PrismaClient,
  input: DeleteSubjectInput,
) {
  const existing = await db.subject.findUnique({
    where: { id: input.id },
    select: { id: true },
  })
  if (!existing) throw notFound("Subject")

  await db.$transaction([
    db.academicClassSubject.deleteMany({
      where: { subjectId: input.id },
    }),
    db.subject.delete({
      where: { id: input.id },
    }),
  ])

  return { success: true }
}

export async function assignAcademicClassesToSubject(
  db: PrismaClient,
  input: AssignAcademicClassesInput,
) {
  const existing = await db.subject.findUnique({
    where: { id: input.subjectId },
    select: { id: true },
  })
  if (!existing) throw notFound("Subject")

  await db.$transaction([
    db.academicClassSubject.deleteMany({
      where: { subjectId: input.subjectId },
    }),
    ...(input.academicClassIds.length > 0
      ? [
          db.academicClassSubject.createMany({
            data: input.academicClassIds.map((academicClassId) => ({
              subjectId: input.subjectId,
              academicClassId,
            })),
          }),
        ]
      : []),
  ])

  return getSubjectById(db, { id: input.subjectId })
}

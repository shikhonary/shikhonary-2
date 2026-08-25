import type { PrismaClient } from "@workspace/db/main"
import { conflict, notFound } from "../../utils/errors"
import type {
  CreateQuestionTypeInput,
  DeleteQuestionTypeInput,
  GetQuestionTypeInput,
  ListQuestionTypesInput,
  UpdateQuestionTypeInput,
} from "./question-type.schema"

export async function listQuestionTypes(
  db: PrismaClient,
  input: ListQuestionTypesInput,
) {
  const where: any = {}
  if (typeof input.isActive === "boolean") where.isActive = input.isActive

  if (input.subjectId) {
    where.subjects = {
      some: {
        subjectId: input.subjectId,
      },
    }
  }

  if (input.query) {
    where.OR = [
      { nameEn: { contains: input.query, mode: "insensitive" } },
      { nameBn: { contains: input.query, mode: "insensitive" } },
      { label: { contains: input.query, mode: "insensitive" } },
    ]
  }

  let orderBy: any = { position: "asc" }
  if (input.sort === "name_asc") {
    orderBy = { nameEn: "asc" }
  } else if (input.sort === "name_desc") {
    orderBy = { nameEn: "desc" }
  } else if (input.sort === "position_desc") {
    orderBy = { position: "desc" }
  } else if (input.sort === "mark_asc") {
    orderBy = { mark: "asc" }
  } else if (input.sort === "mark_desc") {
    orderBy = { mark: "desc" }
  }

  const page = input.page ?? 1
  const limit = input.limit ?? 20
  const skip = input.cursor ? 1 : (page - 1) * limit

  const [questionTypes, totalItems] = await Promise.all([
    db.questionType.findMany({
      where,
      take: limit,
      skip,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      orderBy,
    }),
    db.questionType.count({ where }),
  ])

  const nextCursor =
    questionTypes.length === limit
      ? questionTypes[questionTypes.length - 1]?.id
      : undefined

  return {
    questionTypes,
    totalItems,
    totalPages: Math.ceil(totalItems / limit) || 1,
    page,
    limit,
    nextCursor,
  }
}

export async function getQuestionTypeById(
  db: PrismaClient,
  input: GetQuestionTypeInput,
) {
  const questionType = await db.questionType.findUnique({
    where: { id: input.id },
  })
  if (!questionType) throw notFound("QuestionType")
  return questionType
}

export async function createQuestionType(
  db: PrismaClient,
  input: CreateQuestionTypeInput,
) {
  const existing = await db.questionType.findUnique({
    where: { label: input.label },
  })
  if (existing) {
    throw conflict(`Question type with label "${input.label}" already exists.`)
  }

  return db.questionType.create({
    data: input,
  })
}

export async function updateQuestionType(
  db: PrismaClient,
  input: UpdateQuestionTypeInput,
) {
  const { id, ...data } = input
  const existing = await db.questionType.findUnique({
    where: { id },
  })
  if (!existing) throw notFound("QuestionType")

  if (data.label && data.label !== existing.label) {
    const conflictLabel = await db.questionType.findUnique({
      where: { label: data.label },
    })
    if (conflictLabel) {
      throw conflict(`Question type with label "${data.label}" already exists.`)
    }
  }

  return db.questionType.update({
    where: { id },
    data,
  })
}

export async function deleteQuestionType(
  db: PrismaClient,
  input: DeleteQuestionTypeInput,
) {
  const existing = await db.questionType.findUnique({
    where: { id: input.id },
  })
  if (!existing) throw notFound("QuestionType")

  await db.questionType.delete({
    where: { id: input.id },
  })
  return { success: true }
}

export async function toggleQuestionTypeStatus(
  db: PrismaClient,
  input: GetQuestionTypeInput,
) {
  const existing = await db.questionType.findUnique({
    where: { id: input.id },
    select: { id: true, isActive: true },
  })
  if (!existing) throw notFound("QuestionType")

  return db.questionType.update({
    where: { id: input.id },
    data: { isActive: !existing.isActive },
  })
}

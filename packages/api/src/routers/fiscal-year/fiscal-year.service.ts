import type { PrismaClient } from "@workspace/db/main"
import { notFound } from "../../utils/errors"
import type {
  CreateFiscalYearInput,
  DeleteFiscalYearInput,
  GetFiscalYearInput,
  ListFiscalYearsInput,
  UpdateFiscalYearInput,
} from "./fiscal-year.schema"

export async function listFiscalYears(
  db: PrismaClient,
  input: ListFiscalYearsInput,
) {
  const where: any = {}
  if (input.tenantId) where.tenantId = input.tenantId

  const fiscalYears = await db.fiscalYear.findMany({
    where,
    take: input.limit,
    skip: input.cursor ? 1 : 0,
    cursor: input.cursor ? { id: input.cursor } : undefined,
    orderBy: { startDate: "desc" },
  })

  const nextCursor =
    fiscalYears.length === input.limit
      ? fiscalYears[fiscalYears.length - 1]?.id
      : undefined

  return { fiscalYears, nextCursor }
}

export async function getFiscalYearById(
  db: PrismaClient,
  input: GetFiscalYearInput,
) {
  const fiscalYear = await db.fiscalYear.findUnique({
    where: { id: input.id },
  })
  if (!fiscalYear) throw notFound("FiscalYear")
  return fiscalYear
}

export async function getCurrentFiscalYear(
  db: PrismaClient,
  tenantId?: string,
) {
  const where: any = { isCurrent: true }
  if (tenantId) where.tenantId = tenantId

  const fiscalYear = await db.fiscalYear.findFirst({
    where,
    orderBy: { startDate: "desc" },
  })
  return fiscalYear ?? null
}

export async function createFiscalYear(
  db: PrismaClient,
  input: CreateFiscalYearInput,
) {
  if (input.isCurrent) {
    await db.fiscalYear.updateMany({
      where: { tenantId: input.tenantId ?? null },
      data: { isCurrent: false },
    })
  }

  return db.fiscalYear.create({ data: input })
}

export async function updateFiscalYear(
  db: PrismaClient,
  input: UpdateFiscalYearInput,
) {
  const { id, ...data } = input
  const existing = await db.fiscalYear.findUnique({
    where: { id },
    select: { id: true, tenantId: true },
  })
  if (!existing) throw notFound("FiscalYear")

  if (data.isCurrent) {
    await db.fiscalYear.updateMany({
      where: { tenantId: existing.tenantId },
      data: { isCurrent: false },
    })
  }

  return db.fiscalYear.update({ where: { id }, data })
}

export async function deleteFiscalYear(
  db: PrismaClient,
  input: DeleteFiscalYearInput,
) {
  const existing = await db.fiscalYear.findUnique({
    where: { id: input.id },
    select: { id: true },
  })
  if (!existing) throw notFound("FiscalYear")

  await db.fiscalYear.delete({ where: { id: input.id } })
  return { success: true }
}

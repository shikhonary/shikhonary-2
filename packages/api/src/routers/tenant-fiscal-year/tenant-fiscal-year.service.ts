import type { TenantPrismaClient } from "@workspace/db/tenant"
import { notFound } from "../../utils/errors"
import type {
  CreateTenantFiscalYearInput,
  DeleteTenantFiscalYearInput,
  GetTenantFiscalYearInput,
  ListTenantFiscalYearsInput,
  UpdateTenantFiscalYearInput,
} from "./tenant-fiscal-year.schema"

export async function listTenantFiscalYears(
  tenantDb: TenantPrismaClient,
  input: ListTenantFiscalYearsInput,
) {
  const where: any = {}

  if (input.search && input.search.trim() !== "") {
    where.year = { contains: input.search.trim(), mode: "insensitive" }
  }

  let orderBy: any = { startDate: "desc" }
  if (input.sort) {
    switch (input.sort) {
      case "name_asc":
        orderBy = { year: "asc" }
        break
      case "name_desc":
        orderBy = { year: "desc" }
        break
      case "newest":
        orderBy = { startDate: "desc" }
        break
      case "oldest":
        orderBy = { startDate: "asc" }
        break
      default:
        orderBy = { startDate: "desc" }
    }
  }

  const fiscalYears = await tenantDb.fiscalYear.findMany({
    where,
    take: input.limit,
    skip: input.cursor ? 1 : 0,
    cursor: input.cursor ? { id: input.cursor } : undefined,
    orderBy,
  })

  const nextCursor =
    fiscalYears.length === input.limit
      ? fiscalYears[fiscalYears.length - 1]?.id
      : undefined

  return { fiscalYears, nextCursor }
}

export async function getTenantFiscalYearById(
  tenantDb: TenantPrismaClient,
  input: GetTenantFiscalYearInput,
) {
  const fiscalYear = await tenantDb.fiscalYear.findUnique({
    where: { id: input.id },
  })
  if (!fiscalYear) throw notFound("FiscalYear")
  return fiscalYear
}

export async function getCurrentTenantFiscalYear(
  tenantDb: TenantPrismaClient,
) {
  const fiscalYear = await tenantDb.fiscalYear.findFirst({
    where: { isCurrent: true },
    orderBy: { startDate: "desc" },
  })
  return fiscalYear ?? null
}

export async function createTenantFiscalYear(
  tenantDb: TenantPrismaClient,
  input: CreateTenantFiscalYearInput,
) {
  if (input.isCurrent) {
    await tenantDb.fiscalYear.updateMany({
      where: { isCurrent: true },
      data: { isCurrent: false },
    })
  }

  return tenantDb.fiscalYear.create({ data: input })
}

export async function updateTenantFiscalYear(
  tenantDb: TenantPrismaClient,
  input: UpdateTenantFiscalYearInput,
) {
  const { id, ...data } = input
  const existing = await tenantDb.fiscalYear.findUnique({
    where: { id },
    select: { id: true },
  })
  if (!existing) throw notFound("FiscalYear")

  if (data.isCurrent) {
    await tenantDb.fiscalYear.updateMany({
      where: { isCurrent: true },
      data: { isCurrent: false },
    })
  }

  return tenantDb.fiscalYear.update({ where: { id }, data })
}

export async function deleteTenantFiscalYear(
  tenantDb: TenantPrismaClient,
  input: DeleteTenantFiscalYearInput,
) {
  const existing = await tenantDb.fiscalYear.findUnique({
    where: { id: input.id },
    select: { id: true },
  })
  if (!existing) throw notFound("FiscalYear")

  await tenantDb.fiscalYear.delete({ where: { id: input.id } })
  return { success: true }
}

import type { TenantPrismaClient } from "@workspace/db/tenant"
import { notFound } from "../../utils/errors"
import type {
  CreateTenantWardInput,
  DeleteTenantWardInput,
  GetTenantWardInput,
  ListTenantWardsInput,
  UpdateTenantWardInput,
} from "./tenant-ward.schema"

export async function listTenantWards(
  tenantDb: TenantPrismaClient,
  input: ListTenantWardsInput,
) {
  const where: any = {}

  if (input.search && input.search.trim() !== "") {
    const query = input.search.trim()
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { nameBn: { contains: query, mode: "insensitive" } },
    ]
  }

  let orderBy: any = { createdAt: "desc" }
  if (input.sort) {
    switch (input.sort) {
      case "name_asc":
        orderBy = { nameBn: "asc" }
        break
      case "name_desc":
        orderBy = { nameBn: "desc" }
        break
      case "newest":
        orderBy = { createdAt: "desc" }
        break
      case "oldest":
        orderBy = { createdAt: "asc" }
        break
      default:
        orderBy = { createdAt: "desc" }
    }
  }

  const wards = await tenantDb.ward.findMany({
    where,
    take: input.limit,
    skip: input.cursor ? 1 : 0,
    cursor: input.cursor ? { id: input.cursor } : undefined,
    orderBy,
  })

  const nextCursor =
    wards.length === input.limit
      ? wards[wards.length - 1]?.id
      : undefined

  return { wards, nextCursor }
}

export async function getTenantWardById(
  tenantDb: TenantPrismaClient,
  input: GetTenantWardInput,
) {
  const ward = await tenantDb.ward.findUnique({
    where: { id: input.id },
  })
  if (!ward) throw notFound("Ward")
  return ward
}

export async function createTenantWard(
  tenantDb: TenantPrismaClient,
  input: CreateTenantWardInput,
) {
  return tenantDb.ward.create({ data: input })
}

export async function updateTenantWard(
  tenantDb: TenantPrismaClient,
  input: UpdateTenantWardInput,
) {
  const { id, ...data } = input
  const existing = await tenantDb.ward.findUnique({
    where: { id },
    select: { id: true },
  })
  if (!existing) throw notFound("Ward")

  return tenantDb.ward.update({ where: { id }, data })
}

export async function deleteTenantWard(
  tenantDb: TenantPrismaClient,
  input: DeleteTenantWardInput,
) {
  const existing = await tenantDb.ward.findUnique({
    where: { id: input.id },
    select: { id: true },
  })
  if (!existing) throw notFound("Ward")

  await tenantDb.ward.delete({ where: { id: input.id } })
  return { success: true }
}

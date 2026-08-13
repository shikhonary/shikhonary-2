import type { TenantPrismaClient } from "@workspace/db/tenant"
import type {
  GetCounterByKeyInput,
  AdjustCounterInput,
  SetCounterInput,
  DeleteCounterInput,
} from "./tenant-counter.schema"

export async function listTenantCounters(tenantDb: TenantPrismaClient) {
  return tenantDb.counter.findMany({
    orderBy: { key: "asc" },
  })
}

export async function getTenantCounterByKey(
  tenantDb: TenantPrismaClient,
  input: GetCounterByKeyInput,
) {
  const counter = await tenantDb.counter.findUnique({
    where: { key: input.key },
  })
  return counter ?? { key: input.key, value: 0 }
}

export async function incrementTenantCounter(
  tenantDb: TenantPrismaClient,
  input: AdjustCounterInput,
) {
  return tenantDb.counter.upsert({
    where: { key: input.key },
    create: { key: input.key, value: input.by },
    update: { value: { increment: input.by } },
  })
}

export async function decrementTenantCounter(
  tenantDb: TenantPrismaClient,
  input: AdjustCounterInput,
) {
  return tenantDb.counter.upsert({
    where: { key: input.key },
    create: { key: input.key, value: -input.by },
    update: { value: { decrement: input.by } },
  })
}

export async function setTenantCounter(
  tenantDb: TenantPrismaClient,
  input: SetCounterInput,
) {
  return tenantDb.counter.upsert({
    where: { key: input.key },
    create: { key: input.key, value: input.value },
    update: { value: input.value },
  })
}

export async function deleteTenantCounter(
  tenantDb: TenantPrismaClient,
  input: DeleteCounterInput,
) {
  return tenantDb.counter.delete({
    where: { id: input.id },
  })
}

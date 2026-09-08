import type { TenantPrismaClient } from "@workspace/db/tenant"

export async function logHistory(
  tenantDb: TenantPrismaClient,
  params: {
    questionPaperId: string
    action: string
    actorId?: string | null
    actorType?: "USER" | "AI" | "SYSTEM"
    changes?: any
    snapshot?: any
  }
) {
  return tenantDb.questionPaperHistory.create({
    data: {
      questionPaperId: params.questionPaperId,
      action: params.action,
      actorId: params.actorId ?? null,
      actorType: params.actorType ?? "USER",
      changes: params.changes ?? {},
      snapshot: params.snapshot ?? null,
    },
  })
}

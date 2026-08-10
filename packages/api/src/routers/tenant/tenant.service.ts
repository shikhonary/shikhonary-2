import type { PrismaClient } from "@workspace/db/main"
import { provisionTenantDb, deleteTenantDb } from "@workspace/db"
import { sendInvitationEmail } from "@workspace/email"
import { conflict, notFound } from "../../utils/errors"
import type {
  BulkTenantActionInput,
  CreateTenantInput,
  DeleteTenantInput,
  GetTenantBySlugInput,
  GetTenantInput,
  ListTenantsInput,
  ToggleTenantStatusInput,
  UpdateTenantInput,
  SendInvitationInput,
  ResendInvitationInput,
  RevokeInvitationInput,
  ListInvitationsInput,
  UpdateTenantProfileInput,
} from "./tenant.schema"

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function listTenants(
  db: PrismaClient,
  input: ListTenantsInput,
) {
  const where: any = {}
  if (input.type) where.type = input.type
  if (input.isActive !== undefined) where.isActive = input.isActive
  if (input.planId) {
    where.subscription = { planId: input.planId }
  }

  const tenants = await db.tenant.findMany({
    where,
    take: input.limit,
    skip: input.cursor ? 1 : 0,
    cursor: input.cursor ? { id: input.cursor } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      subscription: {
        include: { plan: true },
      },
      _count: {
        select: { members: true },
      },
    },
  })

  const nextCursor =
    tenants.length === input.limit
      ? tenants[tenants.length - 1]?.id
      : undefined

  return { tenants, nextCursor }
}

export async function getTenantById(
  db: PrismaClient,
  input: GetTenantInput,
) {
  const tenant = await db.tenant.findUnique({
    where: { id: input.id },
    include: {
      subscription: {
        include: { plan: true },
      },
      owner: true,
      currentFiscalYear: true,
      invitations: {
        orderBy: { createdAt: "desc" },
      },
    },
  })
  if (!tenant) throw notFound("Tenant")
  return tenant
}

export async function getTenantBySlug(
  db: PrismaClient,
  input: GetTenantBySlugInput,
) {
  const tenant = await db.tenant.findUnique({
    where: { slug: input.slug },
    include: {
      subscription: {
        include: { plan: true },
      },
      currentFiscalYear: true,
    },
  })
  if (!tenant) throw notFound("Tenant")
  return tenant
}

export async function getTenantStats(db: PrismaClient) {
  const [total, active, suspended] = await Promise.all([
    db.tenant.count(),
    db.tenant.count({ where: { isActive: true, isSuspended: false } }),
    db.tenant.count({ where: { isSuspended: true } }),
  ])
  return { total, active, suspended }
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createTenant(
  db: PrismaClient,
  input: CreateTenantInput,
) {
  const existing = await db.tenant.findUnique({
    where: { slug: input.slug },
    select: { id: true },
  })
  if (existing) {
    throw conflict(`Tenant with slug "${input.slug}" already exists.`)
  }

  const { planId, ...tenantData } = input

  // 1. Save tenant metadata (+ optional subscription) in main DB via transaction
  const tenant = await db.$transaction(async (tx) => {
    const createdTenant = await tx.tenant.create({
      data: {
        ...tenantData,
        databaseStatus: "PENDING",
      },
    })

    if (planId) {
      const plan = await tx.subscriptionPlan.findUnique({
        where: { id: planId },
      })

      if (plan) {
        const now = new Date()
        const oneYearLater = new Date(now)
        oneYearLater.setFullYear(now.getFullYear() + 1)

        await tx.subscription.create({
          data: {
            tenantId: createdTenant.id,
            planId: plan.id,
            status: "ACTIVE",
            currentPeriodStart: now,
            currentPeriodEnd: oneYearLater,
            billingCycle: "YEARLY",
            pricePerMonth: plan.monthlyPriceBDT,
            pricePerYear: plan.yearlyPriceBDT,
          },
        })
      }
    }

    return createdTenant
  })

  // 2. Provision dedicated database instance for the tenant
  try {
    const res = await provisionTenantDb(tenant.slug)
    await db.tenant.update({
      where: { id: tenant.id },
      data: {
        databaseName: res.databaseName,
        connectionString: res.connectionString,
        databaseStatus: "READY",
      },
    })
  } catch (err: any) {
    console.error(`Provisioning error for ${tenant.slug}:`, err)
    await db.tenant.update({
      where: { id: tenant.id },
      data: { databaseStatus: "FAILED" },
    })
  }

  return tenant
}

export async function updateTenant(
  db: PrismaClient,
  input: UpdateTenantInput,
) {
  const { id, planId, ...data } = input
  const existing = await db.tenant.findUnique({
    where: { id },
    select: { id: true },
  })
  if (!existing) throw notFound("Tenant")

  return db.$transaction(async (tx) => {
    const updated = await tx.tenant.update({ where: { id }, data })

    if (planId) {
      const plan = await tx.subscriptionPlan.findUnique({
        where: { id: planId },
      })

      if (plan) {
        const existingSub = await tx.subscription.findUnique({
          where: { tenantId: id },
        })

        if (existingSub) {
          await tx.subscription.update({
            where: { id: existingSub.id },
            data: {
              planId: plan.id,
              pricePerMonth: plan.monthlyPriceBDT,
              pricePerYear: plan.yearlyPriceBDT,
            },
          })
        } else {
          const now = new Date()
          const oneYearLater = new Date(now)
          oneYearLater.setFullYear(now.getFullYear() + 1)

          await tx.subscription.create({
            data: {
              tenantId: id,
              planId: plan.id,
              status: "ACTIVE",
              currentPeriodStart: now,
              currentPeriodEnd: oneYearLater,
              billingCycle: "YEARLY",
              pricePerMonth: plan.monthlyPriceBDT,
              pricePerYear: plan.yearlyPriceBDT,
            },
          })
        }
      }
    }

    return updated
  })
}

export async function toggleTenantStatus(
  db: PrismaClient,
  input: ToggleTenantStatusInput,
) {
  const existing = await db.tenant.findUnique({
    where: { id: input.id },
    select: { id: true, isActive: true },
  })
  if (!existing) throw notFound("Tenant")

  return db.tenant.update({
    where: { id: input.id },
    data: { isActive: !existing.isActive },
  })
}

export async function bulkActivateTenants(
  db: PrismaClient,
  input: BulkTenantActionInput,
) {
  await db.tenant.updateMany({
    where: { id: { in: input.ids } },
    data: { isActive: true },
  })
  return { success: true }
}

export async function bulkDeactivateTenants(
  db: PrismaClient,
  input: BulkTenantActionInput,
) {
  await db.tenant.updateMany({
    where: { id: { in: input.ids } },
    data: { isActive: false },
  })
  return { success: true }
}

export async function bulkDeleteTenants(
  db: PrismaClient,
  input: BulkTenantActionInput,
) {
  const tenants = await db.tenant.findMany({
    where: { id: { in: input.ids } },
    select: { id: true, databaseName: true },
  })

  await Promise.allSettled(
    tenants.map(async (t) => {
      if (t.databaseName) {
        try {
          await deleteTenantDb(t.databaseName)
        } catch (err) {
          console.error(`Failed to drop DB for tenant ${t.id}:`, err)
        }
      }
    }),
  )

  await db.tenant.deleteMany({
    where: { id: { in: input.ids } },
  })
  return { success: true }
}

export async function deleteTenant(
  db: PrismaClient,
  input: DeleteTenantInput,
) {
  const existing = await db.tenant.findUnique({
    where: { id: input.id },
    select: { id: true, databaseName: true },
  })
  if (!existing) throw notFound("Tenant")

  if (existing.databaseName) {
    try {
      await deleteTenantDb(existing.databaseName)
    } catch (dbError) {
      console.error(
        `Failed to drop database "${existing.databaseName}" for tenant ${input.id}:`,
        dbError,
      )
      throw dbError
    }
  }

  await db.tenant.delete({ where: { id: input.id } })
  return { success: true }
}

// ---------------------------------------------------------------------------
// Invitation Services
// ---------------------------------------------------------------------------

export async function sendTenantInvitation(
  db: PrismaClient,
  input: SendInvitationInput,
) {
  const tenant = await db.tenant.findUnique({
    where: { id: input.tenantId },
    select: { id: true, name: true },
  })
  if (!tenant) throw notFound("Tenant")

  const crypto = await import("crypto")
  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  const email = input.email.toLowerCase().trim()

  const invitation = await db.tenantInvitation.upsert({
    where: {
      email_tenantId: {
        email,
        tenantId: input.tenantId,
      },
    },
    create: {
      tenantId: input.tenantId,
      email,
      name: input.name,
      role: input.role || "STAFF",
      message: input.message,
      token,
      expiresAt,
      invitedBy: "Super Admin",
      status: "PENDING",
    },
    update: {
      name: input.name,
      role: input.role || "STAFF",
      message: input.message,
      token,
      expiresAt,
      status: "PENDING",
    },
  })

  // Dispatch Invitation Email via Resend
  const baseUrl = process.env.NEXT_PUBLIC_TENANT_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"
  const invitationLink = `${baseUrl}/auth/accept-invitation?token=${token}`

  try {
    await sendInvitationEmail({
      to: email,
      tenantName: tenant.name,
      inviterName: "Super Admin",
      invitationLink,
      recipientName: input.name || undefined,
      message: input.message || undefined,
    })
  } catch (emailError) {
    console.error(`[Email Dispatch Error] Failed to send invitation email to ${email}:`, emailError)
  }

  return invitation
}

export async function listTenantInvitations(
  db: PrismaClient,
  input: ListInvitationsInput,
) {
  return db.tenantInvitation.findMany({
    where: { tenantId: input.tenantId },
    orderBy: { createdAt: "desc" },
  })
}

export async function resendTenantInvitation(
  db: PrismaClient,
  input: ResendInvitationInput,
) {
  const existing = await db.tenantInvitation.findUnique({
    where: { id: input.id },
    include: {
      tenant: { select: { name: true } },
    },
  })
  if (!existing) throw notFound("Invitation")

  const crypto = await import("crypto")
  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  const updated = await db.tenantInvitation.update({
    where: { id: input.id },
    data: {
      token,
      expiresAt,
      status: "PENDING",
    },
  })

  const baseUrl = process.env.NEXT_PUBLIC_TENANT_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"
  const invitationLink = `${baseUrl}/accept-invitation?token=${token}`

  try {
    await sendInvitationEmail({
      to: existing.email,
      tenantName: existing.tenant?.name || "Union Porishod",
      inviterName: "Super Admin",
      invitationLink,
      recipientName: existing.name || undefined,
      message: existing.message || undefined,
    })
  } catch (emailError) {
    console.error(`[Email Dispatch Error] Failed to resend invitation email to ${existing.email}:`, emailError)
  }

  return updated
}

export async function revokeTenantInvitation(
  db: PrismaClient,
  input: RevokeInvitationInput,
) {
  const existing = await db.tenantInvitation.findUnique({
    where: { id: input.id },
  })
  if (!existing) throw notFound("Invitation")

  return db.tenantInvitation.update({
    where: { id: input.id },
    data: {
      status: "REJECTED",
    },
  })
}

export async function getTenantProfile(db: PrismaClient, tenantId: string) {
  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
    include: {
      currentFiscalYear: true,
    },
  })
  if (!tenant) throw notFound("Tenant")
  return tenant
}

export async function updateTenantProfile(
  db: PrismaClient,
  tenantId: string,
  input: UpdateTenantProfileInput,
) {
  return db.tenant.update({
    where: { id: tenantId },
    data: input,
  })
}


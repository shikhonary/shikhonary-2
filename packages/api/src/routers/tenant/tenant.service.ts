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

// Helper to flatten geographic relations into flat string attributes on Tenant
function flattenTenantGeographics<T extends { division?: any; district?: any; upazila?: any; union?: any }>(tenant: T) {
  if (!tenant) return tenant
  const { division, district, upazila, union, ...rest } = tenant
  return {
    ...rest,
    divisionId: division?.id ?? null,
    divisionName: division?.name ?? null,
    divisionNameBn: division?.nameBn ?? null,
    districtId: district?.id ?? null,
    districtName: district?.name ?? null,
    districtNameBn: district?.nameBn ?? null,
    upazilaId: upazila?.id ?? null,
    upazilaName: upazila?.name ?? null,
    upazilaNameBn: upazila?.nameBn ?? null,
    unionId: union?.id ?? null,
    unionName: union?.name ?? null,
    unionNameBn: union?.nameBn ?? null,
  }
}

// Helper to resolve name strings into DB model IDs (divisionId, districtId, upazilaId, unionId)
async function resolveGeographicIds(
  db: PrismaClient,
  geography: {
    divisionName?: string | null
    districtName?: string | null
    upazilaName?: string | null
    unionName?: string | null
  },
) {
  const { divisionName, districtName, upazilaName, unionName } = geography

  const getCandidates = (name: string | null | undefined): string[] => {
    if (!name) return []
    const clean = name.trim()
    const candidates = [clean]
    if (/sadar$/i.test(clean)) {
      candidates.push(clean.replace(/\s+sadar$/i, "").trim())
    } else {
      candidates.push(`${clean} Sadar`)
    }
    return candidates
  }

  const unionCandidates = getCandidates(unionName)
  const upazilaCandidates = getCandidates(upazilaName)
  const districtCandidates = getCandidates(districtName)
  const divisionCandidates = getCandidates(divisionName)

  // 1. Resolve union (and its parent structures)
  if (unionCandidates.length > 0) {
    const matchedUnion = await db.union.findFirst({
      where: {
        name: { in: unionCandidates, mode: "insensitive" },
        upazila: upazilaCandidates.length > 0 ? {
          name: { in: upazilaCandidates, mode: "insensitive" },
          district: districtCandidates.length > 0 ? {
            name: { in: districtCandidates, mode: "insensitive" },
            division: divisionCandidates.length > 0 ? {
              name: { in: divisionCandidates, mode: "insensitive" },
            } : undefined,
          } : undefined,
        } : undefined,
      },
      select: {
        id: true,
        upazilaId: true,
        upazila: {
          select: {
            districtId: true,
            district: {
              select: {
                divisionId: true,
              },
            },
          },
        },
      },
    })

    if (matchedUnion) {
      return {
        unionId: matchedUnion.id,
        upazilaId: matchedUnion.upazilaId,
        districtId: matchedUnion.upazila.districtId,
        divisionId: matchedUnion.upazila.district.divisionId,
      }
    }

    // Try Bangla matching
    const matchedUnionBn = await db.union.findFirst({
      where: {
        nameBn: { equals: unionName ? unionName.trim() : "" },
        upazila: upazilaName ? {
          nameBn: { equals: upazilaName.trim() },
          district: districtName ? {
            nameBn: { equals: districtName.trim() },
            division: divisionName ? {
              nameBn: { equals: divisionName.trim() },
            } : undefined,
          } : undefined,
        } : undefined,
      },
      select: {
        id: true,
        upazilaId: true,
        upazila: {
          select: {
            districtId: true,
            district: {
              select: {
                divisionId: true,
              },
            },
          },
        },
      },
    })

    if (matchedUnionBn) {
      return {
        unionId: matchedUnionBn.id,
        upazilaId: matchedUnionBn.upazilaId,
        districtId: matchedUnionBn.upazila.districtId,
        divisionId: matchedUnionBn.upazila.district.divisionId,
      }
    }
  }

  // 2. Resolve upazila only if union isn't found/given
  if (upazilaCandidates.length > 0) {
    const matchedUpazila = await db.upazila.findFirst({
      where: {
        name: { in: upazilaCandidates, mode: "insensitive" },
        district: districtCandidates.length > 0 ? {
          name: { in: districtCandidates, mode: "insensitive" },
          division: divisionCandidates.length > 0 ? {
            name: { in: divisionCandidates, mode: "insensitive" },
          } : undefined,
        } : undefined,
      },
      select: {
        id: true,
        districtId: true,
        district: {
          select: {
            divisionId: true,
          },
        },
      },
    })

    if (matchedUpazila) {
      return {
        unionId: null,
        upazilaId: matchedUpazila.id,
        districtId: matchedUpazila.districtId,
        divisionId: matchedUpazila.district.divisionId,
      }
    }
  }

  // 3. Resolve district only if upazila/union isn't found/given
  if (districtCandidates.length > 0) {
    const matchedDistrict = await db.district.findFirst({
      where: {
        name: { in: districtCandidates, mode: "insensitive" },
        division: divisionCandidates.length > 0 ? {
          name: { in: divisionCandidates, mode: "insensitive" },
        } : undefined,
      },
      select: {
        id: true,
        divisionId: true,
      },
    })

    if (matchedDistrict) {
      return {
        unionId: null,
        upazilaId: null,
        districtId: matchedDistrict.id,
        divisionId: matchedDistrict.divisionId,
      }
    }
  }

  // 4. Resolve division only if district/upazila/union isn't found/given
  if (divisionCandidates.length > 0) {
    const matchedDivision = await db.division.findFirst({
      where: { name: { in: divisionCandidates, mode: "insensitive" } },
      select: { id: true },
    })

    if (matchedDivision) {
      return {
        unionId: null,
        upazilaId: null,
        districtId: null,
        divisionId: matchedDivision.id,
      }
    }
  }

  return {
    unionId: null,
    upazilaId: null,
    districtId: null,
    divisionId: null,
  }
}

export async function listTenants(
  db: PrismaClient,
  input: ListTenantsInput,
) {
  const where: any = {}
  if (input.type && input.type !== "all") where.type = input.type
  if (input.isActive !== undefined) where.isActive = input.isActive
  if (input.planId) {
    where.subscription = { planId: input.planId }
  }

  if (input.status && input.status !== "all") {
    if (input.status === "active") {
      where.isActive = true
      where.isSuspended = false
    } else if (input.status === "inactive") {
      where.isActive = false
    } else if (input.status === "suspended") {
      where.isSuspended = true
    }
  }

  if (input.query) {
    where.OR = [
      { id: { contains: input.query, mode: "insensitive" } },
      { name: { contains: input.query, mode: "insensitive" } },
      { nameBn: { contains: input.query, mode: "insensitive" } },
      { slug: { contains: input.query, mode: "insensitive" } },
    ]
  }

  let orderBy: any = { createdAt: "desc" }
  if (input.sort && input.sort !== "All") {
    switch (input.sort) {
      case "asc":
      case "oldest":
        orderBy = { createdAt: "asc" }
        break
      case "name_asc":
        orderBy = { name: "asc" }
        break
      case "name_desc":
        orderBy = { name: "desc" }
        break
      case "desc":
      case "newest":
      default:
        orderBy = { createdAt: "desc" }
        break
    }
  }

  const page = input.page ?? 1
  const limit = input.limit ?? 20
  const skip = input.cursor ? 1 : (page - 1) * limit

  const [tenants, totalItems] = await Promise.all([
    db.tenant.findMany({
      where,
      take: limit,
      skip,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      orderBy,
      include: {
        subscription: {
          include: { plan: true },
        },
        _count: {
          select: { members: true },
        },
        division: true,
        district: true,
        upazila: true,
        union: true,
      },
    }),
    db.tenant.count({ where }),
  ])

  const nextCursor =
    tenants.length === limit
      ? tenants[tenants.length - 1]?.id
      : undefined

  return {
    tenants: tenants.map(flattenTenantGeographics),
    nextCursor,
    totalItems,
  }
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
      division: true,
      district: true,
      upazila: true,
      union: true,
    },
  })
  if (!tenant) throw notFound("Tenant")
  return flattenTenantGeographics(tenant)
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
      division: true,
      district: true,
      upazila: true,
      union: true,
    },
  })
  if (!tenant) throw notFound("Tenant")
  return flattenTenantGeographics(tenant)
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

  const {
    planId,
    divisionName,
    districtName,
    upazilaName,
    unionName,
    divisionId,
    districtId,
    upazilaId,
    unionId,
    ...tenantData
  } = input

  const geoIds = (divisionId || districtId || upazilaId || unionId)
    ? { divisionId, districtId, upazilaId, unionId }
    : await resolveGeographicIds(db, {
        divisionName,
        districtName,
        upazilaName,
        unionName,
      })

  // 1. Save tenant metadata (+ optional subscription) in main DB via transaction
  const tenant = await db.$transaction(async (tx) => {
    const createdTenant = await tx.tenant.create({
      data: {
        ...tenantData,
        ...geoIds,
        databaseStatus: "PENDING",
      },
      include: {
        division: true,
        district: true,
        upazila: true,
        union: true,
      }
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
    const finalTenant = await db.tenant.update({
      where: { id: tenant.id },
      data: {
        databaseName: res.databaseName,
        connectionString: res.connectionString,
        databaseStatus: "READY",
      },
      include: {
        division: true,
        district: true,
        upazila: true,
        union: true,
      }
    })
    return flattenTenantGeographics(finalTenant)
  } catch (err: any) {
    console.error(`Provisioning error for ${tenant.slug}:`, err)
    const finalTenant = await db.tenant.update({
      where: { id: tenant.id },
      data: { databaseStatus: "FAILED" },
      include: {
        division: true,
        district: true,
        upazila: true,
        union: true,
      }
    })
    return flattenTenantGeographics(finalTenant)
  }
}

export async function updateTenant(
  db: PrismaClient,
  input: UpdateTenantInput,
) {
  const {
    id,
    planId,
    divisionName,
    districtName,
    upazilaName,
    unionName,
    divisionId,
    districtId,
    upazilaId,
    unionId,
    ...data
  } = input
  const existing = await db.tenant.findUnique({
    where: { id },
    select: { id: true },
  })
  if (!existing) throw notFound("Tenant")

  // Resolve geographic IDs
  let geoIds = {}
  if (divisionId !== undefined || districtId !== undefined || upazilaId !== undefined || unionId !== undefined) {
    geoIds = { divisionId, districtId, upazilaId, unionId }
  } else if (divisionName !== undefined || districtName !== undefined || upazilaName !== undefined || unionName !== undefined) {
    geoIds = await resolveGeographicIds(db, {
      divisionName,
      districtName,
      upazilaName,
      unionName,
    })
  }

  return db.$transaction(async (tx) => {
    const updated = await tx.tenant.update({
      where: { id },
      data: {
        ...data,
        ...geoIds,
      },
      include: {
        division: true,
        district: true,
        upazila: true,
        union: true,
      }
    })

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

    return flattenTenantGeographics(updated)
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
  const invitationLink = `${baseUrl}/accept-invitation?token=${token}`

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
      tenantName: existing.tenant?.name || "Institution",
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
      division: true,
      district: true,
      upazila: true,
      union: true,
    },
  })
  if (!tenant) throw notFound("Tenant")
  return flattenTenantGeographics(tenant)
}

export async function updateTenantProfile(
  db: PrismaClient,
  tenantId: string,
  input: UpdateTenantProfileInput,
) {
  const {
    divisionName,
    districtName,
    upazilaName,
    unionName,
    divisionId,
    districtId,
    upazilaId,
    unionId,
    ...data
  } = input

  let geoIds = {}
  if (divisionId !== undefined || districtId !== undefined || upazilaId !== undefined || unionId !== undefined) {
    geoIds = { divisionId, districtId, upazilaId, unionId }
  } else if (divisionName !== undefined || districtName !== undefined || upazilaName !== undefined || unionName !== undefined) {
    geoIds = await resolveGeographicIds(db, {
      divisionName,
      districtName,
      upazilaName,
      unionName,
    })
  }

  const updated = await db.tenant.update({
    where: { id: tenantId },
    data: {
      ...data,
      ...geoIds,
    },
    include: {
      currentFiscalYear: true,
      division: true,
      district: true,
      upazila: true,
      union: true,
    },
  })

  return flattenTenantGeographics(updated)
}


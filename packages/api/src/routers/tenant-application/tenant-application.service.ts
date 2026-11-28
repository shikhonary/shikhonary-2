import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  SubmitTenantApplicationInput,
  ListTenantApplicationsInput,
  RejectTenantApplicationInput,
} from "./tenant-application.schema"

export async function submitTenantApplication(
  db: PrismaClient,
  userId: string,
  input: SubmitTenantApplicationInput
) {
  // Check if user already has an active ADMIN membership in a tenant
  const existingMembership = await db.tenantMember.findFirst({
    where: {
      userId,
      role: "ADMIN",
      isActive: true,
    },
    include: {
      tenant: { select: { id: true, name: true, slug: true } },
    },
  })

  if (existingMembership) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `আপনার অ্যাকাউন্টে ইতিমধ্যে "${existingMembership.tenant.name}" প্রতিষ্ঠানের অ্যাডমিন সদস্যপদ রয়েছে।`,
    })
  }

  // Check if user already has a pending application
  const existingPending = await db.onboardingApplication.findFirst({
    where: {
      userId,
      status: "PENDING",
    },
  })

  // Validate referral code if provided
  let validReferralCode: string | null = null
  if (input.referralCode && input.referralCode.trim()) {
    const code = await db.referralCode.findFirst({
      where: {
        code: { equals: input.referralCode.trim(), mode: "insensitive" },
        isActive: true,
      },
    })
    if (code) {
      validReferralCode = code.code
    }
  }

  if (existingPending) {
    // Update existing pending application instead of throwing
    return db.onboardingApplication.update({
      where: { id: existingPending.id },
      data: {
        type: input.type || "SCHOOL",
        name: input.name.trim(),
        phone: input.phone.trim(),
        divisionId: input.divisionId || null,
        districtId: input.districtId || null,
        referralCode: validReferralCode || input.referralCode?.trim().toUpperCase() || null,
      },
      include: {
        division: true,
        district: true,
      },
    })
  }

  return db.onboardingApplication.create({
    data: {
      userId,
      type: input.type || "SCHOOL",
      name: input.name.trim(),
      phone: input.phone.trim(),
      divisionId: input.divisionId || null,
      districtId: input.districtId || null,
      referralCode: validReferralCode,
      status: "PENDING",
    },
    include: {
      division: true,
      district: true,
    },
  })
}

export async function getMyTenantApplication(db: PrismaClient, userId: string) {
  return db.onboardingApplication.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      division: { select: { id: true, name: true, nameBn: true } },
      district: { select: { id: true, name: true, nameBn: true } },
    },
  })
}

export async function listTenantApplications(
  db: PrismaClient,
  input: ListTenantApplicationsInput
) {
  const where: any = {}

  if (input.status && input.status !== "ALL") {
    where.status = input.status
  }

  if (input.type) {
    where.type = input.type
  }

  if (input.search && input.search.trim()) {
    const q = input.search.trim()
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { user: { name: { contains: q, mode: "insensitive" } } },
      { user: { email: { contains: q, mode: "insensitive" } } },
      { referralCode: { contains: q, mode: "insensitive" } },
    ]
  }

  const [items, totalItems] = await Promise.all([
    db.onboardingApplication.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (input.page - 1) * input.limit,
      take: input.limit,
      include: {
        user: { select: { id: true, name: true, email: true } },
        division: { select: { id: true, name: true, nameBn: true } },
        district: { select: { id: true, name: true, nameBn: true } },
      },
    }),
    db.onboardingApplication.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / input.limit) || 1,
    page: input.page,
    limit: input.limit,
  }
}

export async function getTenantApplicationStats(db: PrismaClient) {
  const [totalCount, pendingCount, approvedCount, rejectedCount] = await Promise.all([
    db.onboardingApplication.count(),
    db.onboardingApplication.count({ where: { status: "PENDING" } }),
    db.onboardingApplication.count({ where: { status: "APPROVED" } }),
    db.onboardingApplication.count({ where: { status: "REJECTED" } }),
  ])

  return {
    totalCount,
    pendingCount,
    approvedCount,
    rejectedCount,
  }
}

export async function getTenantApplicationById(db: PrismaClient, id: string) {
  const application = await db.onboardingApplication.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      division: { select: { id: true, name: true, nameBn: true } },
      district: { select: { id: true, name: true, nameBn: true } },
    },
  })

  if (!application) {
    throw new TRPCError({ code: "NOT_FOUND", message: "আবেদন খুঁজে পাওয়া যায়নি।" })
  }

  return application
}

export async function rejectTenantApplication(
  db: PrismaClient,
  adminUserId: string,
  input: RejectTenantApplicationInput
) {
  const application = await db.onboardingApplication.findUnique({
    where: { id: input.id },
  })

  if (!application) {
    throw new TRPCError({ code: "NOT_FOUND", message: "আবেদন খুঁজে পাওয়া যায়নি।" })
  }

  return db.onboardingApplication.update({
    where: { id: input.id },
    data: {
      status: "REJECTED",
      rejectionReason: input.rejectionReason.trim(),
      reviewedByUserId: adminUserId,
      reviewedAt: new Date(),
    },
  })
}

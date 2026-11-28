import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type { InvitePeerInput, ListReferralsInput, ValidateReferralCodeInput } from "./referral.schema"

export async function getOrCreateTenantReferralCode(db: PrismaClient, tenantId: string) {
  let referralCode = await db.referralCode.findFirst({
    where: { referrerTenantId: tenantId, isActive: true },
    include: {
      referrerTenant: {
        select: { id: true, name: true, nameBn: true, slug: true },
      },
    },
  })

  if (!referralCode) {
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, name: true, nameBn: true, slug: true },
    })

    if (!tenant) {
      throw new TRPCError({ code: "NOT_FOUND", message: "প্রতিষ্ঠান খুঁজে পাওয়া যায়নি।" })
    }

    const cleanSlug = (tenant.slug || "school")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 8)
    const randomSuffix = Math.floor(100 + Math.random() * 900)
    const code = `SHIK-${cleanSlug}-${randomSuffix}`

    referralCode = await db.referralCode.create({
      data: {
        code,
        referrerTenantId: tenantId,
      },
      include: {
        referrerTenant: {
          select: { id: true, name: true, nameBn: true, slug: true },
        },
      },
    })
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_TENANT_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3001"
  const referralLink = `${baseUrl.replace(/\/$/, "")}/join?ref=${referralCode.code}`

  return {
    id: referralCode.id,
    code: referralCode.code,
    referralLink,
    clickCount: referralCode.clickCount,
    totalConverted: referralCode.totalConverted,
    totalEarnedCredits: referralCode.totalEarnedCredits,
    createdAt: referralCode.createdAt,
    tenant: referralCode.referrerTenant,
  }
}

export async function getReferralStats(db: PrismaClient, tenantId: string) {
  const [referrals, referralCode] = await Promise.all([
    db.referral.findMany({
      where: { referrerTenantId: tenantId },
      select: {
        status: true,
        referrerBonusCredits: true,
      },
    }),
    db.referralCode.findFirst({
      where: { referrerTenantId: tenantId, isActive: true },
      select: { clickCount: true, totalConverted: true },
    }),
  ])

  const totalReferrals = referrals.length
  const activeInstitutions = referrals.filter(
    (r) => r.status === "ACTIVATED" || r.status === "REWARDED"
  ).length
  const pendingReferrals = referrals.filter((r) => r.status === "PENDING").length
  const totalEarnedCredits = referrals.reduce(
    (acc, curr) => acc + (curr.referrerBonusCredits || 0),
    0
  )

  return {
    totalReferrals,
    activeInstitutions,
    pendingReferrals,
    totalEarnedCredits,
    clickCount: referralCode?.clickCount ?? 0,
    potentialBonusCredits: pendingReferrals * 300,
  }
}

export async function listTenantReferrals(
  db: PrismaClient,
  tenantId: string,
  input: ListReferralsInput
) {
  const where: any = { referrerTenantId: tenantId }
  if (input.status !== "ALL") {
    where.status = input.status
  }

  const limit = input.limit
  const skip = (input.page - 1) * limit

  const [items, totalItems] = await Promise.all([
    db.referral.findMany({
      where,
      take: limit,
      skip,
      orderBy: { createdAt: "desc" },
      include: {
        referredTenant: {
          select: {
            id: true,
            name: true,
            nameBn: true,
            logo: true,
            createdAt: true,
          },
        },
      },
    }),
    db.referral.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / limit) || 1,
    page: input.page,
    limit: input.limit,
  }
}

export async function invitePeerInstitution(
  db: PrismaClient,
  tenantId: string,
  input: InvitePeerInput
) {
  const codeInfo = await getOrCreateTenantReferralCode(db, tenantId)

  // Check if an existing pending referral already exists for this email from this tenant
  const existing = await db.referral.findFirst({
    where: {
      referrerTenantId: tenantId,
      referredEmail: input.email.toLowerCase().trim(),
      status: "PENDING",
    },
  })

  if (existing) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "এই ইমেইল ঠিকানায় ইতিপূর্বে একটি আমন্ত্রণ পাঠানো হয়েছে এবং তা গ্রহণ অপেক্ষায় রয়েছে।",
    })
  }

  const referral = await db.referral.create({
    data: {
      referralCodeId: codeInfo.id,
      referrerTenantId: tenantId,
      referredInstitutionName: input.institutionName.trim(),
      referredEmail: input.email.toLowerCase().trim(),
      referredPhone: input.phone?.trim() || null,
      status: "PENDING",
    },
  })

  // Try sending pre-invitation email if mail client is active
  try {
    const { sendInvitationEmail } = await import("@workspace/email")
    await sendInvitationEmail({
      to: input.email.toLowerCase().trim(),
      tenantName: input.institutionName,
      inviterName: codeInfo.tenant?.nameBn || codeInfo.tenant?.name || "শিখনারী পার্টনার স্কুল",
      invitationLink: codeInfo.referralLink,
      message:
        input.message ||
        `আপনাকে শিখনারী প্ল্যাটফর্মে যুক্ত হতে আমন্ত্রণ জানানো হয়েছে। যুক্ত হলেই ৫০টি ফ্রি এআই কোয়েশ্চেন ক্রেডিট বোনাস পাবেন।`,
    })
  } catch (err) {
    console.warn("[Referral] Failed to dispatch email notification:", err)
  }

  return { success: true, referral }
}

export async function validateReferralCode(db: PrismaClient, input: ValidateReferralCodeInput) {
  const referralCode = await db.referralCode.findFirst({
    where: {
      code: { equals: input.code.trim(), mode: "insensitive" },
      isActive: true,
    },
    include: {
      referrerTenant: {
        select: {
          id: true,
          name: true,
          nameBn: true,
          logo: true,
        },
      },
    },
  })

  if (!referralCode) {
    return {
      valid: false,
      message: "রেফারেল কোডটি সঠিক নয় বা মেয়াদ উত্তীর্ণ হয়েছে।",
    }
  }

  return {
    valid: true,
    code: referralCode.code,
    referralCodeId: referralCode.id,
    referrerTenantId: referralCode.referrerTenantId,
    referrerTenantName:
      referralCode.referrerTenant.nameBn || referralCode.referrerTenant.name,
    tenant: referralCode.referrerTenant,
  }
}

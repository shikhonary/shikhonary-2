import { TRPCError } from "@trpc/server"
import { db } from "@workspace/db/main"
import type { ValidateInvitationInput, AcceptInvitationInput } from "./invitation.schema"

// ---------------------------------------------------------------------------
// Validate invitation token
// ---------------------------------------------------------------------------

export async function validateInvitation(input: ValidateInvitationInput) {
  // Use findFirst instead of findUnique when querying by non-id @unique field
  const invitation = await db.tenantInvitation.findFirst({
    where: { token: input.token },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      expiresAt: true,
      message: true,
      tenant: {
        select: {
          id: true,
          name: true,
          nameBn: true,
          slug: true,
          logo: true,
        },
      },
    },
  })

  if (!invitation) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "আমন্ত্রণটি পাওয়া যায়নি বা মেয়াদ শেষ হয়ে গেছে।",
    })
  }

  if (invitation.status === "ACCEPTED") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "এই আমন্ত্রণটি ইতিমধ্যে গ্রহণ করা হয়েছে।",
    })
  }

  if (invitation.status === "REVOKED") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "এই আমন্ত্রণটি বাতিল করা হয়েছে।",
    })
  }

  if (invitation.expiresAt < new Date()) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "এই আমন্ত্রণপত্রের মেয়াদ শেষ হয়ে গেছে।",
    })
  }

  return invitation
}

// ---------------------------------------------------------------------------
// Accept invitation — creates TenantMember record
// ---------------------------------------------------------------------------

export async function acceptInvitation(
  userId: string,
  input: AcceptInvitationInput,
) {
  // 1. Validate the token
  const invitation = await db.tenantInvitation.findFirst({
    where: { token: input.token },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      expiresAt: true,
      tenantId: true,
    },
  })

  if (!invitation) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "আমন্ত্রণটি পাওয়া যায়নি।",
    })
  }

  if (invitation.status !== "PENDING") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        invitation.status === "ACCEPTED"
          ? "এই আমন্ত্রণটি ইতিমধ্যে গ্রহণ করা হয়েছে।"
          : "এই আমন্ত্রণটি আর কার্যকর নেই।",
    })
  }

  if (invitation.expiresAt < new Date()) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "এই আমন্ত্রণপত্রের মেয়াদ শেষ হয়ে গেছে।",
    })
  }

  // 2. Check if user is already a member
  const existingMembership = await db.tenantMember.findFirst({
    where: {
      userId,
      tenantId: invitation.tenantId,
    },
  })

  if (existingMembership) {
    // Already a member — mark invitation as accepted and ensure user is verified
    await db.$transaction([
      db.tenantInvitation.update({
        where: { id: invitation.id },
        data: {
          status: "ACCEPTED",
          acceptedAt: new Date(),
          acceptedBy: userId,
        },
      }),
      db.user.update({
        where: { id: userId },
        data: { emailVerified: true },
      }),
    ])
    return { success: true, alreadyMember: true }
  }

  // 3. Create TenantMember + mark invitation accepted + auto-verify user in a transaction
  await db.$transaction([
    db.tenantMember.create({
      data: {
        userId,
        tenantId: invitation.tenantId,
        role: invitation.role,
        isActive: true,
      },
    }),
    db.tenantInvitation.update({
      where: { id: invitation.id },
      data: {
        status: "ACCEPTED",
        acceptedAt: new Date(),
        acceptedBy: userId,
      },
    }),
    db.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    }),
  ])

  // 4. Referral Reward Disbursement: Check if this tenant was created via a referral
  try {
    const pendingReferral = await db.referral.findFirst({
      where: {
        referredTenantId: invitation.tenantId,
        status: "PENDING",
      },
      include: {
        referralCode: true,
        referrerTenant: { select: { id: true, name: true, nameBn: true, creditBalance: true } },
        referredTenant: { select: { id: true, name: true, nameBn: true, creditBalance: true } },
      },
    })

    if (pendingReferral && pendingReferral.referrerTenant && pendingReferral.referredTenant) {
      const REFERRER_BONUS = 300
      const REFEREE_BONUS = 100
      const now = new Date()

      await db.$transaction(async (tx) => {
        // A. Award Referrer (+50 credits)
        const referrerNewBalance = pendingReferral.referrerTenant.creditBalance + REFERRER_BONUS
        await tx.tenant.update({
          where: { id: pendingReferral.referrerTenantId },
          data: { creditBalance: referrerNewBalance },
        })
        await tx.creditTransaction.create({
          data: {
            tenantId: pendingReferral.referrerTenantId,
            type: "REFERRAL_BONUS",
            amount: REFERRER_BONUS,
            balance: referrerNewBalance,
            description: `রেফারেল বোনাস: "${pendingReferral.referredTenant?.nameBn || pendingReferral.referredTenant?.name}" যোগদানে অর্জিত`,
            metadata: {
              referralId: pendingReferral.id,
              referredTenantId: invitation.tenantId,
              referredUserId: userId,
            },
          },
        })

        // B. Award Referee (+30 welcome bonus credits)
        const currentRefereeBalance = pendingReferral.referredTenant?.creditBalance ?? 0
        const refereeNewBalance = currentRefereeBalance + REFEREE_BONUS
        await tx.tenant.update({
          where: { id: invitation.tenantId },
          data: { creditBalance: refereeNewBalance },
        })
        await tx.creditTransaction.create({
          data: {
            tenantId: invitation.tenantId,
            type: "REFERRAL_BONUS",
            amount: REFEREE_BONUS,
            balance: refereeNewBalance,
            description: `রেফারেল স্বাগতম বোনাস: "${pendingReferral.referrerTenant?.nameBn || pendingReferral.referrerTenant?.name}"-এর আমন্ত্রণে অর্জিত`,
            metadata: {
              referralId: pendingReferral.id,
              referrerTenantId: pendingReferral.referrerTenantId,
            },
          },
        })

        // C. Update Referral record & ReferralCode stats
        await tx.referral.update({
          where: { id: pendingReferral.id },
          data: {
            status: "REWARDED",
            referrerBonusCredits: REFERRER_BONUS,
            refereeBonusCredits: REFEREE_BONUS,
            rewardedAt: now,
          },
        })

        await tx.referralCode.update({
          where: { id: pendingReferral.referralCodeId },
          data: {
            totalConverted: { increment: 1 },
            totalEarnedCredits: { increment: REFERRER_BONUS },
          },
        })
      })
    }
  } catch (refErr) {
    console.error("[Referral Reward Error] Failed to disburse referral bonus:", refErr)
  }

  return { success: true, alreadyMember: false }
}

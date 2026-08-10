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

  return { success: true, alreadyMember: false }
}

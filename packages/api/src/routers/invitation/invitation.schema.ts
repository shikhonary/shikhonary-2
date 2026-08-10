import { z } from "zod"

// ---------------------------------------------------------------------------
// Validate invitation by token (public — no auth)
// ---------------------------------------------------------------------------

export const validateInvitationSchema = z.object({
  token: z.string().min(1, "Token is required"),
})

export type ValidateInvitationInput = z.infer<typeof validateInvitationSchema>

// ---------------------------------------------------------------------------
// Accept invitation (protected — requires auth session)
// ---------------------------------------------------------------------------

export const acceptInvitationSchema = z.object({
  token: z.string().min(1, "Token is required"),
})

export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>

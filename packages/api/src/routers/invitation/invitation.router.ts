import { createTRPCRouter, publicProcedure, protectedProcedure } from "../../trpc"
import { validateInvitationSchema, acceptInvitationSchema } from "./invitation.schema"
import { validateInvitation, acceptInvitation } from "./invitation.service"

export const invitationRouter = createTRPCRouter({
  /**
   * Validate an invitation token.
   * Public — no auth required. Used to show the invitation details page.
   */
  validate: publicProcedure
    .input(validateInvitationSchema)
    .query(({ input }) => validateInvitation(input)),

  /**
   * Accept an invitation.
   * Protected — user must be signed in. Creates a TenantMember record.
   */
  accept: protectedProcedure
    .input(acceptInvitationSchema)
    .mutation(({ ctx, input }) => acceptInvitation(ctx.session.user.id, input)),
})

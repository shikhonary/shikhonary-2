import { db } from "@workspace/db/main"
import { createTRPCRouter, publicProcedure, tenantMemberProcedure } from "../../trpc"
import {
  getReferralStatsSchema,
  invitePeerSchema,
  listReferralsSchema,
  validateReferralCodeSchema,
} from "./referral.schema"
import {
  getOrCreateTenantReferralCode,
  getReferralStats,
  invitePeerInstitution,
  listTenantReferrals,
  validateReferralCode,
} from "./referral.service"

export const referralRouter = createTRPCRouter({
  /** Get or generate current tenant's unique referral code & share link */
  getMyCode: tenantMemberProcedure.query(({ ctx }) =>
    getOrCreateTenantReferralCode(ctx.db, ctx.tenant.id)
  ),

  /** Get referral program metrics for current tenant */
  getStats: tenantMemberProcedure
    .input(getReferralStatsSchema)
    .query(({ ctx }) => getReferralStats(ctx.db, ctx.tenant.id)),

  /** List institutions referred by current tenant */
  getHistory: tenantMemberProcedure
    .input(listReferralsSchema)
    .query(({ ctx, input }) => listTenantReferrals(ctx.db, ctx.tenant.id, input)),

  /** Directly invite a peer institution / create referral lead */
  invitePeer: tenantMemberProcedure
    .input(invitePeerSchema)
    .mutation(({ ctx, input }) =>
      invitePeerInstitution(ctx.db, ctx.tenant.id, input)
    ),

  /** Validate a referral code (used by Admin creation form or public lead form) */
  validateCode: publicProcedure
    .input(validateReferralCodeSchema)
    .query(({ input }) => validateReferralCode(db, input)),
})

import { z } from "zod"
import { createTRPCRouter, protectedProcedure, superAdminProcedure } from "../../trpc"
import { db } from "@workspace/db/main"
import {
  submitTenantApplicationSchema,
  listTenantApplicationsSchema,
  rejectTenantApplicationSchema,
} from "./tenant-application.schema"
import {
  submitTenantApplication,
  getMyTenantApplication,
  listTenantApplications,
  getTenantApplicationById,
  getTenantApplicationStats,
  rejectTenantApplication,
} from "./tenant-application.service"

export const tenantApplicationRouter = createTRPCRouter({
  /** Submit or update a minimal tenant onboarding application (any authenticated user) */
  submit: protectedProcedure
    .input(submitTenantApplicationSchema)
    .mutation(({ ctx, input }) => submitTenantApplication(db, ctx.session.user.id, input)),

  /** Get current authenticated user's latest onboarding application status */
  myStatus: protectedProcedure.query(({ ctx }) =>
    getMyTenantApplication(db, ctx.session.user.id)
  ),

  /** Super Admin: List all tenant onboarding applications */
  list: superAdminProcedure
    .input(listTenantApplicationsSchema)
    .query(({ ctx, input }) => listTenantApplications(ctx.db, input)),

  /** Super Admin: Get stats (total, pending, approved, rejected) */
  stats: superAdminProcedure.query(({ ctx }) => getTenantApplicationStats(ctx.db)),

  /** Super Admin: Get single application details */
  byId: superAdminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(({ ctx, input }) => getTenantApplicationById(ctx.db, input.id)),

  /** Super Admin: Reject application with reason */
  reject: superAdminProcedure
    .input(rejectTenantApplicationSchema)
    .mutation(({ ctx, input }) =>
      rejectTenantApplication(ctx.db, ctx.session.user.id, input)
    ),
})

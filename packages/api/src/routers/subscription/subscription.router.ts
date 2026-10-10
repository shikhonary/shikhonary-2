import { createTRPCRouter, superAdminProcedure, tenantMemberProcedure } from "../../trpc"
import {
  cancelSubscriptionSchema,
  changeSubscriptionPlanSchema,
  createSubscriptionSchema,
  deleteSubscriptionSchema,
  getSubscriptionByTenantSchema,
  getSubscriptionSchema,
  listSubscriptionsSchema,
  requestPlanChangeSchema,
  updateSubscriptionSchema,
} from "./subscription.schema"
import {
  cancelSubscription,
  changeSubscriptionPlan,
  createSubscription,
  deleteSubscription,
  getSubscriptionById,
  getSubscriptionByTenantId,
  getSubscriptionStats,
  getTenantInvoices,
  getTenantSubscriptionDetails,
  listSubscriptions,
  tenantChangeSubscriptionPlan,
  updateSubscription,
} from "./subscription.service"
import { listSubscriptionPlans } from "../subscription-plan/subscription-plan.service"

export const subscriptionRouter = createTRPCRouter({
  // ── Tenant Member Procedures ──
  getMySubscription: tenantMemberProcedure.query(({ ctx }) =>
    getTenantSubscriptionDetails(ctx.db, ctx.tenant.id, ctx.tenantDb)
  ),

  listAvailablePlans: tenantMemberProcedure.query(({ ctx }) =>
    listSubscriptionPlans(ctx.db, { isActive: true, limit: 20 })
  ),

  getMyInvoices: tenantMemberProcedure.query(({ ctx }) =>
    getTenantInvoices(ctx.db, ctx.tenant.id)
  ),

  requestPlanChange: tenantMemberProcedure
    .input(requestPlanChangeSchema)
    .mutation(({ ctx, input }) =>
      tenantChangeSubscriptionPlan(ctx.db, ctx.tenant.id, ctx.session.user.id, input)
    ),

  // ── Super Admin Procedures ──
  list: superAdminProcedure
    .input(listSubscriptionsSchema)
    .query(({ ctx, input }) => listSubscriptions(ctx.db, input)),

  byId: superAdminProcedure
    .input(getSubscriptionSchema)
    .query(({ ctx, input }) => getSubscriptionById(ctx.db, input)),

  byTenantId: superAdminProcedure
    .input(getSubscriptionByTenantSchema)
    .query(({ ctx, input }) => getSubscriptionByTenantId(ctx.db, input)),

  stats: superAdminProcedure
    .query(({ ctx }) => getSubscriptionStats(ctx.db)),

  create: superAdminProcedure
    .input(createSubscriptionSchema)
    .mutation(({ ctx, input }) => createSubscription(ctx.db, input)),

  update: superAdminProcedure
    .input(updateSubscriptionSchema)
    .mutation(({ ctx, input }) => updateSubscription(ctx.db, input)),

  changePlan: superAdminProcedure
    .input(changeSubscriptionPlanSchema)
    .mutation(({ ctx, input }) => changeSubscriptionPlan(ctx.db, input)),

  cancel: superAdminProcedure
    .input(cancelSubscriptionSchema)
    .mutation(({ ctx, input }) => cancelSubscription(ctx.db, input)),

  delete: superAdminProcedure
    .input(deleteSubscriptionSchema)
    .mutation(({ ctx, input }) => deleteSubscription(ctx.db, input)),
})


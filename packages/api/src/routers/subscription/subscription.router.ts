import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  cancelSubscriptionSchema,
  changeSubscriptionPlanSchema,
  createSubscriptionSchema,
  deleteSubscriptionSchema,
  getSubscriptionByTenantSchema,
  getSubscriptionSchema,
  listSubscriptionsSchema,
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
  listSubscriptions,
  updateSubscription,
} from "./subscription.service"

export const subscriptionRouter = createTRPCRouter({
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

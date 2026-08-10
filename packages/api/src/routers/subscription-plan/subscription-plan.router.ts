import { db } from "@workspace/db/main"
import { createTRPCRouter, publicProcedure, superAdminProcedure } from "../../trpc"
import {
  createSubscriptionPlanSchema,
  deleteSubscriptionPlanSchema,
  getSubscriptionPlanSchema,
  listSubscriptionPlansSchema,
  updateSubscriptionPlanSchema,
} from "./subscription-plan.schema"
import {
  createSubscriptionPlan,
  deleteSubscriptionPlan,
  getSubscriptionPlanById,
  listSelectionSubscriptionPlans,
  listSubscriptionPlans,
  updateSubscriptionPlan,
} from "./subscription-plan.service"

export const subscriptionPlanRouter = createTRPCRouter({
  /** Public endpoint for pricing / signup UI */
  listPublic: publicProcedure
    .input(listSubscriptionPlansSchema)
    .query(({ input }) => listSubscriptionPlans(db, { ...input, isActive: true })),

  /** Selection endpoint for forms */
  forSelection: publicProcedure
    .query(() => listSelectionSubscriptionPlans(db)),

  /** SuperAdmin list endpoint */
  list: superAdminProcedure
    .input(listSubscriptionPlansSchema)
    .query(({ ctx, input }) => listSubscriptionPlans(ctx.db, input)),

  /** Fetch plan by ID */
  byId: publicProcedure
    .input(getSubscriptionPlanSchema)
    .query(({ input }) => getSubscriptionPlanById(db, input)),

  /** Create subscription plan */
  create: superAdminProcedure
    .input(createSubscriptionPlanSchema)
    .mutation(({ ctx, input }) => createSubscriptionPlan(ctx.db, input)),

  /** Update subscription plan */
  update: superAdminProcedure
    .input(updateSubscriptionPlanSchema)
    .mutation(({ ctx, input }) => updateSubscriptionPlan(ctx.db, input)),

  /** Delete subscription plan */
  delete: superAdminProcedure
    .input(deleteSubscriptionPlanSchema)
    .mutation(({ ctx, input }) => deleteSubscriptionPlan(ctx.db, input)),
})

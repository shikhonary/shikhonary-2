import { db } from "@workspace/db/main"
import { createTRPCRouter, protectedProcedure } from "../../trpc"
import {
  getAdminStats,
  getSubscriptionStatusDistribution,
  getRecentSubscriptions,
} from "./dashboard.service"

export const dashboardRouter = createTRPCRouter({
  getStats: protectedProcedure.query(() => getAdminStats(db)),
  getSubscriptionStatusDistribution: protectedProcedure.query(() =>
    getSubscriptionStatusDistribution(db),
  ),
  getRecentSubscriptions: protectedProcedure.query(() =>
    getRecentSubscriptions(db),
  ),
})

import { createTRPCRouter, tenantMemberProcedure } from "../../trpc"
import { getTenantDashboardStats } from "./tenant-dashboard.service"

export const tenantDashboardRouter = createTRPCRouter({
  stats: tenantMemberProcedure.query(({ ctx }) =>
    getTenantDashboardStats(ctx.tenantDb),
  ),
})

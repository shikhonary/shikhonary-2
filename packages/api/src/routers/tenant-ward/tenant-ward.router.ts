import { createTRPCRouter, tenantMemberProcedure } from "../../trpc"
import {
  createTenantWardSchema,
  deleteTenantWardSchema,
  getTenantWardSchema,
  listTenantWardsSchema,
  updateTenantWardSchema,
} from "./tenant-ward.schema"
import {
  createTenantWard,
  deleteTenantWard,
  getTenantWardById,
  listTenantWards,
  updateTenantWard,
} from "./tenant-ward.service"

export const tenantWardRouter = createTRPCRouter({
  list: tenantMemberProcedure
    .input(listTenantWardsSchema)
    .query(({ ctx, input }) => listTenantWards(ctx.tenantDb, input)),

  byId: tenantMemberProcedure
    .input(getTenantWardSchema)
    .query(({ ctx, input }) => getTenantWardById(ctx.tenantDb, input)),

  create: tenantMemberProcedure
    .input(createTenantWardSchema)
    .mutation(({ ctx, input }) => createTenantWard(ctx.tenantDb, input)),

  update: tenantMemberProcedure
    .input(updateTenantWardSchema)
    .mutation(({ ctx, input }) => updateTenantWard(ctx.tenantDb, input)),

  delete: tenantMemberProcedure
    .input(deleteTenantWardSchema)
    .mutation(({ ctx, input }) => deleteTenantWard(ctx.tenantDb, input)),
})

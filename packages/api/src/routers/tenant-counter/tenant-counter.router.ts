import { createTRPCRouter, tenantMemberProcedure } from "../../trpc"
import {
  getCounterByKeySchema,
  adjustCounterSchema,
  setCounterSchema,
  deleteCounterSchema,
} from "./tenant-counter.schema"
import {
  listTenantCounters,
  getTenantCounterByKey,
  incrementTenantCounter,
  decrementTenantCounter,
  setTenantCounter,
  deleteTenantCounter,
} from "./tenant-counter.service"

export const tenantCounterRouter = createTRPCRouter({
  list: tenantMemberProcedure
    .query(({ ctx }) => listTenantCounters(ctx.tenantDb)),

  byKey: tenantMemberProcedure
    .input(getCounterByKeySchema)
    .query(({ ctx, input }) => getTenantCounterByKey(ctx.tenantDb, input)),

  increment: tenantMemberProcedure
    .input(adjustCounterSchema)
    .mutation(({ ctx, input }) => incrementTenantCounter(ctx.tenantDb, input)),

  decrement: tenantMemberProcedure
    .input(adjustCounterSchema)
    .mutation(({ ctx, input }) => decrementTenantCounter(ctx.tenantDb, input)),

  set: tenantMemberProcedure
    .input(setCounterSchema)
    .mutation(({ ctx, input }) => setTenantCounter(ctx.tenantDb, input)),

  delete: tenantMemberProcedure
    .input(deleteCounterSchema)
    .mutation(({ ctx, input }) => deleteTenantCounter(ctx.tenantDb, input)),
})

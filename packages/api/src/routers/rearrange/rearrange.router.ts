import { z } from "zod"
import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createRearrangeSchema,
  deleteRearrangeSchema,
  getRearrangeSchema,
  listRearrangeSchema,
  updateRearrangeSchema,
  bulkDeleteRearrangeSchema,
  importRearrangeSchema,
  rearrangeStatsSchema,
  rearrangeBoardYearsSchema,
} from "./rearrange.schema"
import {
  createRearrange,
  deleteRearrange,
  getRearrangeById,
  listRearrange,
  updateRearrange,
  bulkDeleteRearrange,
  importRearrange,
  getRearrangeStats,
  getRearrangeBoardYears,
} from "./rearrange.service"

export const rearrangeRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listRearrangeSchema)
    .query(({ ctx, input }) => listRearrange(ctx.db, input)),

  stats: superAdminProcedure
    .input(rearrangeStatsSchema.optional())
    .query(({ ctx, input }) => getRearrangeStats(ctx.db, input ?? {})),

  boardYears: superAdminProcedure
    .input(rearrangeBoardYearsSchema.optional())
    .query(({ ctx, input }) => getRearrangeBoardYears(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getRearrangeSchema)
    .query(({ ctx, input }) => getRearrangeById(ctx.db, input)),

  create: superAdminProcedure
    .input(createRearrangeSchema)
    .mutation(({ ctx, input }) => createRearrange(ctx.db, input, ctx.session?.user?.id)),

  update: superAdminProcedure
    .input(updateRearrangeSchema)
    .mutation(({ ctx, input }) => updateRearrange(ctx.db, input, ctx.session?.user?.id)),

  delete: superAdminProcedure
    .input(deleteRearrangeSchema)
    .mutation(({ ctx, input }) => deleteRearrange(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteRearrangeSchema)
    .mutation(({ ctx, input }) => bulkDeleteRearrange(ctx.db, input)),

  import: superAdminProcedure
    .input(importRearrangeSchema)
    .mutation(({ ctx, input }) => importRearrange(ctx.db, input, ctx.session?.user?.id)),

  toggleActive: superAdminProcedure
    .input(z.object({ id: z.string(), isActive: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.rearrange.update({
        where: { id: input.id },
        data: { isActive: input.isActive },
      })
    }),
})

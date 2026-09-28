import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createVerbTenseSchema,
  deleteVerbTenseSchema,
  getVerbTenseSchema,
  listVerbTenseSchema,
  updateVerbTenseSchema,
  bulkDeleteVerbTenseSchema,
  importVerbTenseSchema,
  verbTenseStatsSchema,
} from "./verb-tense.schema"
import {
  createVerbTense,
  deleteVerbTense,
  getVerbTenseById,
  listVerbTense,
  updateVerbTense,
  bulkDeleteVerbTense,
  importVerbTense,
  getVerbTenseStats,
} from "./verb-tense.service"

export const verbTenseRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listVerbTenseSchema)
    .query(({ ctx, input }) => listVerbTense(ctx.db, input)),

  stats: superAdminProcedure
    .input(verbTenseStatsSchema.optional())
    .query(({ ctx, input }) => getVerbTenseStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getVerbTenseSchema)
    .query(({ ctx, input }) => getVerbTenseById(ctx.db, input)),

  create: superAdminProcedure
    .input(createVerbTenseSchema)
    .mutation(({ ctx, input }) => createVerbTense(ctx.db, input, ctx.session?.user?.id)),

  update: superAdminProcedure
    .input(updateVerbTenseSchema)
    .mutation(({ ctx, input }) => updateVerbTense(ctx.db, input, ctx.session?.user?.id)),

  delete: superAdminProcedure
    .input(deleteVerbTenseSchema)
    .mutation(({ ctx, input }) => deleteVerbTense(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteVerbTenseSchema)
    .mutation(({ ctx, input }) => bulkDeleteVerbTense(ctx.db, input)),

  import: superAdminProcedure
    .input(importVerbTenseSchema)
    .mutation(({ ctx, input }) => importVerbTense(ctx.db, input, ctx.session?.user?.id)),
})

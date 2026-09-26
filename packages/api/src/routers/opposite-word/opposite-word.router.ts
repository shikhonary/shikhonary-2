import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createOppositeWordSchema,
  deleteOppositeWordSchema,
  getOppositeWordSchema,
  listOppositeWordSchema,
  updateOppositeWordSchema,
  bulkDeleteOppositeWordSchema,
  importOppositeWordSchema,
  oppositeWordStatsSchema,
} from "./opposite-word.schema"
import {
  createOppositeWord,
  deleteOppositeWord,
  getOppositeWordById,
  listOppositeWord,
  updateOppositeWord,
  bulkDeleteOppositeWord,
  importOppositeWord,
  getOppositeWordStats,
} from "./opposite-word.service"

export const oppositeWordRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listOppositeWordSchema)
    .query(({ ctx, input }) => listOppositeWord(ctx.db, input)),

  stats: superAdminProcedure
    .input(oppositeWordStatsSchema.optional())
    .query(({ ctx, input }) => getOppositeWordStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getOppositeWordSchema)
    .query(({ ctx, input }) => getOppositeWordById(ctx.db, input)),

  create: superAdminProcedure
    .input(createOppositeWordSchema)
    .mutation(({ ctx, input }) => createOppositeWord(ctx.db, input, ctx.session?.user?.id)),

  update: superAdminProcedure
    .input(updateOppositeWordSchema)
    .mutation(({ ctx, input }) => updateOppositeWord(ctx.db, input, ctx.session?.user?.id)),

  delete: superAdminProcedure
    .input(deleteOppositeWordSchema)
    .mutation(({ ctx, input }) => deleteOppositeWord(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteOppositeWordSchema)
    .mutation(({ ctx, input }) => bulkDeleteOppositeWord(ctx.db, input)),

  import: superAdminProcedure
    .input(importOppositeWordSchema)
    .mutation(({ ctx, input }) => importOppositeWord(ctx.db, input, ctx.session?.user?.id)),
})

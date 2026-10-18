import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import { z } from "zod"
import {
  createSeenComprehensionSchema,
  deleteSeenComprehensionSchema,
  getSeenComprehensionSchema,
  listSeenComprehensionsSchema,
  updateSeenComprehensionSchema,
  bulkDeleteSeenComprehensionsSchema,
  toggleSeenComprehensionActiveSchema,
  importSeenComprehensionsSchema,
  seenComprehensionStatsSchema,
} from "./seen-comprehension.schema"
import {
  createSeenComprehension,
  deleteSeenComprehension,
  getSeenComprehensionById,
  listSeenComprehensions,
  updateSeenComprehension,
  bulkDeleteSeenComprehensions,
  toggleSeenComprehensionActive,
  importSeenComprehensions,
  getSeenComprehensionStats,
  getBoardYears,
} from "./seen-comprehension.service"

export const seenComprehensionRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listSeenComprehensionsSchema)
    .query(({ ctx, input }) => listSeenComprehensions(ctx.db, input, ctx)),

  stats: superAdminProcedure
    .input(seenComprehensionStatsSchema.optional())
    .query(({ ctx, input }) => getSeenComprehensionStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getSeenComprehensionSchema)
    .query(({ ctx, input }) => getSeenComprehensionById(ctx.db, input)),

  boardYears: superAdminProcedure
    .input(
      z.object({
        subjectId: z.string(),
        chapterId: z.string().optional(),
        academicChapterId: z.string().optional(),
        comprehensionType: z.string().optional(),
      })
    )
    .query(({ ctx, input }) => getBoardYears(ctx.db, input)),

  create: superAdminProcedure
    .input(createSeenComprehensionSchema)
    .mutation(({ ctx, input }) => createSeenComprehension(ctx.db, input, ctx)),

  update: superAdminProcedure
    .input(updateSeenComprehensionSchema)
    .mutation(({ ctx, input }) => updateSeenComprehension(ctx.db, input, ctx)),

  delete: superAdminProcedure
    .input(deleteSeenComprehensionSchema)
    .mutation(({ ctx, input }) => deleteSeenComprehension(ctx.db, input, ctx)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteSeenComprehensionsSchema)
    .mutation(({ ctx, input }) => bulkDeleteSeenComprehensions(ctx.db, input, ctx)),

  toggleActive: superAdminProcedure
    .input(toggleSeenComprehensionActiveSchema)
    .mutation(({ ctx, input }) => toggleSeenComprehensionActive(ctx.db, input, ctx)),

  import: superAdminProcedure
    .input(importSeenComprehensionsSchema)
    .mutation(({ ctx, input }) => importSeenComprehensions(ctx.db, input, ctx)),
})

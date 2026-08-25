import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import { z } from "zod"
import {
  createMcqSchema,
  deleteMcqSchema,
  getMcqSchema,
  listMcqsSchema,
  updateMcqSchema,
  bulkDeleteMcqsSchema,
  toggleMcqActiveSchema,
  importMcqsSchema,
  mcqStatsSchema,
} from "./mcq.schema"
import {
  createMcq,
  deleteMcq,
  getMcqById,
  listMcqs,
  updateMcq,
  bulkDeleteMcqs,
  toggleMcqActive,
  importMcqs,
  getMcqStats,
  getBoardYears,
} from "./mcq.service"

export const mcqRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listMcqsSchema)
    .query(({ ctx, input }) => listMcqs(ctx.db, input)),

  stats: superAdminProcedure
    .input(mcqStatsSchema.optional())
    .query(({ ctx, input }) => getMcqStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getMcqSchema)
    .query(({ ctx, input }) => getMcqById(ctx.db, input)),

  boardYears: superAdminProcedure
    .input(
      z.object({
        subjectId: z.string(),
        chapterId: z.string().optional(),
      })
    )
    .query(({ ctx, input }) => getBoardYears(ctx.db, input)),

  create: superAdminProcedure
    .input(createMcqSchema)
    .mutation(({ ctx, input }) => createMcq(ctx.db, input)),

  update: superAdminProcedure
    .input(updateMcqSchema)
    .mutation(({ ctx, input }) => updateMcq(ctx.db, input)),

  delete: superAdminProcedure
    .input(deleteMcqSchema)
    .mutation(({ ctx, input }) => deleteMcq(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteMcqsSchema)
    .mutation(({ ctx, input }) => bulkDeleteMcqs(ctx.db, input)),

  toggleActive: superAdminProcedure
    .input(toggleMcqActiveSchema)
    .mutation(({ ctx, input }) => toggleMcqActive(ctx.db, input)),

  import: superAdminProcedure
    .input(importMcqsSchema)
    .mutation(({ ctx, input }) => importMcqs(ctx.db, input)),
})

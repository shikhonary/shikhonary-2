import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import { z } from "zod"
import {
  createPbqSchema,
  deletePbqSchema,
  getPbqSchema,
  listPbqsSchema,
  updatePbqSchema,
  bulkDeletePbqsSchema,
  togglePbqActiveSchema,
  importPbqsSchema,
  pbqStatsSchema,
} from "./pbq.schema"
import {
  createPbq,
  deletePbq,
  getPbqById,
  listPbqs,
  updatePbq,
  bulkDeletePbqs,
  togglePbqActive,
  importPbqs,
  getPbqStats,
  getBoardYears,
} from "./pbq.service"

export const pbqRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listPbqsSchema)
    .query(({ ctx, input }) => listPbqs(ctx.db, input, ctx)),

  stats: superAdminProcedure
    .input(pbqStatsSchema.optional())
    .query(({ ctx, input }) => getPbqStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getPbqSchema)
    .query(({ ctx, input }) => getPbqById(ctx.db, input)),

  boardYears: superAdminProcedure
    .input(
      z.object({
        subjectId: z.string(),
        chapterId: z.string().optional(),
        academicChapterId: z.string().optional(),
      })
    )
    .query(({ ctx, input }) => getBoardYears(ctx.db, input)),

  create: superAdminProcedure
    .input(createPbqSchema)
    .mutation(({ ctx, input }) => createPbq(ctx.db, input, ctx)),

  update: superAdminProcedure
    .input(updatePbqSchema)
    .mutation(({ ctx, input }) => updatePbq(ctx.db, input, ctx)),

  delete: superAdminProcedure
    .input(deletePbqSchema)
    .mutation(({ ctx, input }) => deletePbq(ctx.db, input, ctx)),

  bulkDelete: superAdminProcedure
    .input(bulkDeletePbqsSchema)
    .mutation(({ ctx, input }) => bulkDeletePbqs(ctx.db, input, ctx)),

  toggleActive: superAdminProcedure
    .input(togglePbqActiveSchema)
    .mutation(({ ctx, input }) => togglePbqActive(ctx.db, input, ctx)),

  import: superAdminProcedure
    .input(importPbqsSchema)
    .mutation(({ ctx, input }) => importPbqs(ctx.db, input, ctx)),
})

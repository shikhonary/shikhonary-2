import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import { z } from "zod"
import {
  createCqSchema,
  deleteCqSchema,
  getCqSchema,
  listCqsSchema,
  updateCqSchema,
  bulkDeleteCqsSchema,
  toggleCqActiveSchema,
  importCqsSchema,
  cqStatsSchema,
} from "./cq.schema"
import {
  createCq,
  deleteCq,
  getCqById,
  listCqs,
  updateCq,
  bulkDeleteCqs,
  toggleCqActive,
  importCqs,
  getCqStats,
  getBoardYears,
} from "./cq.service"

export const cqRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listCqsSchema)
    .query(({ ctx, input }) => listCqs(ctx.db, input)),

  stats: superAdminProcedure
    .input(cqStatsSchema.optional())
    .query(({ ctx, input }) => getCqStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getCqSchema)
    .query(({ ctx, input }) => getCqById(ctx.db, input)),

  boardYears: superAdminProcedure
    .input(
      z.object({
        subjectId: z.string(),
        chapterId: z.string().optional(),
      })
    )
    .query(({ ctx, input }) => getBoardYears(ctx.db, input)),

  create: superAdminProcedure
    .input(createCqSchema)
    .mutation(({ ctx, input }) => createCq(ctx.db, input)),

  update: superAdminProcedure
    .input(updateCqSchema)
    .mutation(({ ctx, input }) => updateCq(ctx.db, input)),

  delete: superAdminProcedure
    .input(deleteCqSchema)
    .mutation(({ ctx, input }) => deleteCq(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteCqsSchema)
    .mutation(({ ctx, input }) => bulkDeleteCqs(ctx.db, input)),

  toggleActive: superAdminProcedure
    .input(toggleCqActiveSchema)
    .mutation(({ ctx, input }) => toggleCqActive(ctx.db, input)),

  import: superAdminProcedure
    .input(importCqsSchema)
    .mutation(({ ctx, input }) => importCqs(ctx.db, input)),
})

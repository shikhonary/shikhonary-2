import { z } from "zod"
import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createJuktobornoSchema,
  deleteJuktobornoSchema,
  getJuktobornoSchema,
  listJuktobornoSchema,
  updateJuktobornoSchema,
  bulkDeleteJuktobornoSchema,
  toggleJuktobornoActiveSchema,
  importJuktobornoSchema,
  juktobornoStatsSchema,
} from "./juktoborno.schema"
import {
  createJuktoborno,
  deleteJuktoborno,
  getJuktobornoById,
  listJuktoborno,
  updateJuktoborno,
  bulkDeleteJuktoborno,
  toggleJuktobornoActive,
  getBoardYears,
  importJuktoborno,
  getJuktobornoStats,
} from "./juktoborno.service"

export const juktobornoRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listJuktobornoSchema)
    .query(({ ctx, input }) => listJuktoborno(ctx.db, input)),

  stats: superAdminProcedure
    .input(juktobornoStatsSchema.optional())
    .query(({ ctx, input }) => getJuktobornoStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getJuktobornoSchema)
    .query(({ ctx, input }) => getJuktobornoById(ctx.db, input)),

  create: superAdminProcedure
    .input(createJuktobornoSchema)
    .mutation(({ ctx, input }) => createJuktoborno(ctx.db, input, ctx.session?.user?.id)),

  update: superAdminProcedure
    .input(updateJuktobornoSchema)
    .mutation(({ ctx, input }) => updateJuktoborno(ctx.db, input, ctx.session?.user?.id)),

  delete: superAdminProcedure
    .input(deleteJuktobornoSchema)
    .mutation(({ ctx, input }) => deleteJuktoborno(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteJuktobornoSchema)
    .mutation(({ ctx, input }) => bulkDeleteJuktoborno(ctx.db, input)),

  toggleActive: superAdminProcedure
    .input(toggleJuktobornoActiveSchema)
    .mutation(({ ctx, input }) => toggleJuktobornoActive(ctx.db, input, ctx.session?.user?.id)),

  boardYears: superAdminProcedure
    .input(
      z.object({
        subjectId: z.string(),
        chapterId: z.string().optional(),
        academicChapterId: z.string().optional(),
      })
    )
    .query(({ ctx, input }) => getBoardYears(ctx.db, input)),

  import: superAdminProcedure
    .input(importJuktobornoSchema)
    .mutation(({ ctx, input }) => importJuktoborno(ctx.db, input, ctx.session?.user?.id)),
})

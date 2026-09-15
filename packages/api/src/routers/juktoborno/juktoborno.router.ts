import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createJuktobornoSchema,
  deleteJuktobornoSchema,
  getJuktobornoSchema,
  listJuktobornoSchema,
  updateJuktobornoSchema,
  bulkDeleteJuktobornoSchema,
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
    .mutation(({ ctx, input }) => createJuktoborno(ctx.db, input)),

  update: superAdminProcedure
    .input(updateJuktobornoSchema)
    .mutation(({ ctx, input }) => updateJuktoborno(ctx.db, input)),

  delete: superAdminProcedure
    .input(deleteJuktobornoSchema)
    .mutation(({ ctx, input }) => deleteJuktoborno(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteJuktobornoSchema)
    .mutation(({ ctx, input }) => bulkDeleteJuktoborno(ctx.db, input)),

  import: superAdminProcedure
    .input(importJuktobornoSchema)
    .mutation(({ ctx, input }) => importJuktoborno(ctx.db, input)),
})

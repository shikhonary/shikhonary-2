import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createSynonymSchema,
  deleteSynonymSchema,
  getSynonymSchema,
  listSynonymSchema,
  updateSynonymSchema,
  bulkDeleteSynonymSchema,
  importSynonymSchema,
  synonymStatsSchema,
} from "./synonym.schema"
import {
  createSynonym,
  deleteSynonym,
  getSynonymById,
  listSynonym,
  updateSynonym,
  bulkDeleteSynonym,
  importSynonym,
  getSynonymStats,
} from "./synonym.service"

export const synonymRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listSynonymSchema)
    .query(({ ctx, input }) => listSynonym(ctx.db, input)),

  stats: superAdminProcedure
    .input(synonymStatsSchema.optional())
    .query(({ ctx, input }) => getSynonymStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getSynonymSchema)
    .query(({ ctx, input }) => getSynonymById(ctx.db, input)),

  create: superAdminProcedure
    .input(createSynonymSchema)
    .mutation(({ ctx, input }) => createSynonym(ctx.db, input)),

  update: superAdminProcedure
    .input(updateSynonymSchema)
    .mutation(({ ctx, input }) => updateSynonym(ctx.db, input)),

  delete: superAdminProcedure
    .input(deleteSynonymSchema)
    .mutation(({ ctx, input }) => deleteSynonym(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteSynonymSchema)
    .mutation(({ ctx, input }) => bulkDeleteSynonym(ctx.db, input)),

  import: superAdminProcedure
    .input(importSynonymSchema)
    .mutation(({ ctx, input }) => importSynonym(ctx.db, input)),
})

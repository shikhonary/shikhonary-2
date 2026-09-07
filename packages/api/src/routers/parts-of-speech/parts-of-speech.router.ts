import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createPartsOfSpeechSchema,
  deletePartsOfSpeechSchema,
  getPartsOfSpeechSchema,
  listPartsOfSpeechSchema,
  updatePartsOfSpeechSchema,
  bulkDeletePartsOfSpeechSchema,
  importPartsOfSpeechSchema,
  partsOfSpeechStatsSchema,
} from "./parts-of-speech.schema"
import {
  createPartsOfSpeech,
  deletePartsOfSpeech,
  getPartsOfSpeechById,
  listPartsOfSpeech,
  updatePartsOfSpeech,
  bulkDeletePartsOfSpeech,
  importPartsOfSpeech,
  getPartsOfSpeechStats,
} from "./parts-of-speech.service"

export const partsOfSpeechRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listPartsOfSpeechSchema)
    .query(({ ctx, input }) => listPartsOfSpeech(ctx.db, input)),

  stats: superAdminProcedure
    .input(partsOfSpeechStatsSchema.optional())
    .query(({ ctx, input }) => getPartsOfSpeechStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getPartsOfSpeechSchema)
    .query(({ ctx, input }) => getPartsOfSpeechById(ctx.db, input)),

  create: superAdminProcedure
    .input(createPartsOfSpeechSchema)
    .mutation(({ ctx, input }) => createPartsOfSpeech(ctx.db, input)),

  update: superAdminProcedure
    .input(updatePartsOfSpeechSchema)
    .mutation(({ ctx, input }) => updatePartsOfSpeech(ctx.db, input)),

  delete: superAdminProcedure
    .input(deletePartsOfSpeechSchema)
    .mutation(({ ctx, input }) => deletePartsOfSpeech(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeletePartsOfSpeechSchema)
    .mutation(({ ctx, input }) => bulkDeletePartsOfSpeech(ctx.db, input)),

  import: superAdminProcedure
    .input(importPartsOfSpeechSchema)
    .mutation(({ ctx, input }) => importPartsOfSpeech(ctx.db, input)),
})

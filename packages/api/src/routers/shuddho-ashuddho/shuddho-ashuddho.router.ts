import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createShuddhoAshuddhoSchema,
  deleteShuddhoAshuddhoSchema,
  getShuddhoAshuddhoSchema,
  listShuddhoAshuddhoSchema,
  updateShuddhoAshuddhoSchema,
  bulkDeleteShuddhoAshuddhoSchema,
  importShuddhoAshuddhoSchema,
  shuddhoAshuddhoStatsSchema,
} from "./shuddho-ashuddho.schema"
import {
  createShuddhoAshuddho,
  deleteShuddhoAshuddho,
  getShuddhoAshuddhoById,
  listShuddhoAshuddho,
  updateShuddhoAshuddho,
  bulkDeleteShuddhoAshuddho,
  importShuddhoAshuddho,
  getShuddhoAshuddhoStats,
} from "./shuddho-ashuddho.service"

export const shuddhoAshuddhoRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listShuddhoAshuddhoSchema)
    .query(({ ctx, input }) => listShuddhoAshuddho(ctx.db, input)),

  stats: superAdminProcedure
    .input(shuddhoAshuddhoStatsSchema.optional())
    .query(({ ctx, input }) => getShuddhoAshuddhoStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getShuddhoAshuddhoSchema)
    .query(({ ctx, input }) => getShuddhoAshuddhoById(ctx.db, input)),

  create: superAdminProcedure
    .input(createShuddhoAshuddhoSchema)
    .mutation(({ ctx, input }) => createShuddhoAshuddho(ctx.db, input, ctx.session?.user?.id)),

  update: superAdminProcedure
    .input(updateShuddhoAshuddhoSchema)
    .mutation(({ ctx, input }) => updateShuddhoAshuddho(ctx.db, input, ctx.session?.user?.id)),

  delete: superAdminProcedure
    .input(deleteShuddhoAshuddhoSchema)
    .mutation(({ ctx, input }) => deleteShuddhoAshuddho(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteShuddhoAshuddhoSchema)
    .mutation(({ ctx, input }) => bulkDeleteShuddhoAshuddho(ctx.db, input)),

  import: superAdminProcedure
    .input(importShuddhoAshuddhoSchema)
    .mutation(({ ctx, input }) => importShuddhoAshuddho(ctx.db, input, ctx.session?.user?.id)),
})

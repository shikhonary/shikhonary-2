import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createSadhuToCholitoSchema,
  deleteSadhuToCholitoSchema,
  getSadhuToCholitoSchema,
  listSadhuToCholitoSchema,
  updateSadhuToCholitoSchema,
  bulkDeleteSadhuToCholitoSchema,
  importSadhuToCholitoSchema,
  sadhuToCholitoStatsSchema,
} from "./sadhu-to-cholito.schema"
import {
  createSadhuToCholito,
  deleteSadhuToCholito,
  getSadhuToCholitoById,
  listSadhuToCholito,
  updateSadhuToCholito,
  bulkDeleteSadhuToCholito,
  importSadhuToCholito,
  getSadhuToCholitoStats,
} from "./sadhu-to-cholito.service"

export const sadhuToCholitoRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listSadhuToCholitoSchema)
    .query(({ ctx, input }) => listSadhuToCholito(ctx.db, input)),

  stats: superAdminProcedure
    .input(sadhuToCholitoStatsSchema.optional())
    .query(({ ctx, input }) => getSadhuToCholitoStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getSadhuToCholitoSchema)
    .query(({ ctx, input }) => getSadhuToCholitoById(ctx.db, input)),

  create: superAdminProcedure
    .input(createSadhuToCholitoSchema)
    .mutation(({ ctx, input }) => createSadhuToCholito(ctx.db, input, ctx.session?.user?.id)),

  update: superAdminProcedure
    .input(updateSadhuToCholitoSchema)
    .mutation(({ ctx, input }) => updateSadhuToCholito(ctx.db, input, ctx.session?.user?.id)),

  delete: superAdminProcedure
    .input(deleteSadhuToCholitoSchema)
    .mutation(({ ctx, input }) => deleteSadhuToCholito(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteSadhuToCholitoSchema)
    .mutation(({ ctx, input }) => bulkDeleteSadhuToCholito(ctx.db, input)),

  import: superAdminProcedure
    .input(importSadhuToCholitoSchema)
    .mutation(({ ctx, input }) => importSadhuToCholito(ctx.db, input, ctx.session?.user?.id)),
})

import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createPodNirnoySchema,
  deletePodNirnoySchema,
  getPodNirnoySchema,
  listPodNirnoySchema,
  updatePodNirnoySchema,
  bulkDeletePodNirnoySchema,
  importPodNirnoySchema,
  podNirnoyStatsSchema,
} from "./pod-nirnoy.schema"
import {
  createPodNirnoy,
  deletePodNirnoy,
  getPodNirnoyById,
  listPodNirnoy,
  updatePodNirnoy,
  bulkDeletePodNirnoy,
  importPodNirnoy,
  getPodNirnoyStats,
} from "./pod-nirnoy.service"

export const podNirnoyRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listPodNirnoySchema)
    .query(({ ctx, input }) => listPodNirnoy(ctx.db, input)),

  stats: superAdminProcedure
    .input(podNirnoyStatsSchema.optional())
    .query(({ ctx, input }) => getPodNirnoyStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getPodNirnoySchema)
    .query(({ ctx, input }) => getPodNirnoyById(ctx.db, input)),

  create: superAdminProcedure
    .input(createPodNirnoySchema)
    .mutation(({ ctx, input }) => createPodNirnoy(ctx.db, input, ctx.session?.user?.id)),

  update: superAdminProcedure
    .input(updatePodNirnoySchema)
    .mutation(({ ctx, input }) => updatePodNirnoy(ctx.db, input, ctx.session?.user?.id)),

  delete: superAdminProcedure
    .input(deletePodNirnoySchema)
    .mutation(({ ctx, input }) => deletePodNirnoy(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeletePodNirnoySchema)
    .mutation(({ ctx, input }) => bulkDeletePodNirnoy(ctx.db, input)),

  import: superAdminProcedure
    .input(importPodNirnoySchema)
    .mutation(({ ctx, input }) => importPodNirnoy(ctx.db, input, ctx.session?.user?.id)),
})

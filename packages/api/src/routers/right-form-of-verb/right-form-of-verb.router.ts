import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createRightFormOfVerbSchema,
  deleteRightFormOfVerbSchema,
  getRightFormOfVerbSchema,
  listRightFormOfVerbsSchema,
  updateRightFormOfVerbSchema,
  bulkDeleteRightFormOfVerbsSchema,
  importRightFormOfVerbsSchema,
  rightFormOfVerbsStatsSchema,
} from "./right-form-of-verb.schema"
import {
  createRightFormOfVerb,
  deleteRightFormOfVerb,
  getRightFormOfVerbById,
  listRightFormOfVerbs,
  updateRightFormOfVerb,
  bulkDeleteRightFormOfVerbs,
  importRightFormOfVerbs,
  getRightFormOfVerbsStats,
} from "./right-form-of-verb.service"

export const rightFormOfVerbRouter = createTRPCRouter({
  list: superAdminProcedure
  .input(listRightFormOfVerbsSchema)
  .query(({ ctx, input }) => listRightFormOfVerbs(ctx.db, input)),

  stats: superAdminProcedure
    .input(rightFormOfVerbsStatsSchema.optional())
    .query(({ ctx, input }) => getRightFormOfVerbsStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getRightFormOfVerbSchema)
    .query(({ ctx, input }) => getRightFormOfVerbById(ctx.db, input)),

  create: superAdminProcedure
    .input(createRightFormOfVerbSchema)
    .mutation(({ ctx, input }) => createRightFormOfVerb(ctx.db, input)),

  update: superAdminProcedure
    .input(updateRightFormOfVerbSchema)
    .mutation(({ ctx, input }) => updateRightFormOfVerb(ctx.db, input)),

  delete: superAdminProcedure
    .input(deleteRightFormOfVerbSchema)
    .mutation(({ ctx, input }) => deleteRightFormOfVerb(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteRightFormOfVerbsSchema)
    .mutation(({ ctx, input }) => bulkDeleteRightFormOfVerbs(ctx.db, input)),

  import: superAdminProcedure
    .input(importRightFormOfVerbsSchema)
    .mutation(({ ctx, input }) => importRightFormOfVerbs(ctx.db, input)),
})

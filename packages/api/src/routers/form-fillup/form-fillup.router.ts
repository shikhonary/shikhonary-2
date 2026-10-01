import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createFormFillupSchema,
  deleteFormFillupSchema,
  getFormFillupSchema,
  listFormFillupSchema,
  updateFormFillupSchema,
  bulkDeleteFormFillupSchema,
  importFormFillupSchema,
  formFillupStatsSchema,
} from "./form-fillup.schema"
import {
  createFormFillup,
  deleteFormFillup,
  getFormFillupById,
  listFormFillup,
  updateFormFillup,
  bulkDeleteFormFillup,
  importFormFillup,
  getFormFillupStats,
} from "./form-fillup.service"

export const formFillupRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listFormFillupSchema)
    .query(({ ctx, input }) => listFormFillup(ctx.db, input)),

  stats: superAdminProcedure
    .input(formFillupStatsSchema.optional())
    .query(({ ctx, input }) => getFormFillupStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getFormFillupSchema)
    .query(({ ctx, input }) => getFormFillupById(ctx.db, input)),

  create: superAdminProcedure
    .input(createFormFillupSchema)
    .mutation(({ ctx, input }) => createFormFillup(ctx.db, input, ctx.session?.user?.id)),

  update: superAdminProcedure
    .input(updateFormFillupSchema)
    .mutation(({ ctx, input }) => updateFormFillup(ctx.db, input, ctx.session?.user?.id)),

  delete: superAdminProcedure
    .input(deleteFormFillupSchema)
    .mutation(({ ctx, input }) => deleteFormFillup(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteFormFillupSchema)
    .mutation(({ ctx, input }) => bulkDeleteFormFillup(ctx.db, input)),

  import: superAdminProcedure
    .input(importFormFillupSchema)
    .mutation(({ ctx, input }) => importFormFillup(ctx.db, input, ctx.session?.user?.id)),
})

export const formFillingRouter = formFillupRouter

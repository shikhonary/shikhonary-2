import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createGenderChangeSchema,
  deleteGenderChangeSchema,
  getGenderChangeSchema,
  listGenderChangeSchema,
  updateGenderChangeSchema,
  bulkDeleteGenderChangeSchema,
  importGenderChangeSchema,
  genderChangeStatsSchema,
} from "./gender-change.schema"
import {
  createGenderChange,
  deleteGenderChange,
  getGenderChangeById,
  listGenderChange,
  updateGenderChange,
  bulkDeleteGenderChange,
  importGenderChange,
  getGenderChangeStats,
} from "./gender-change.service"

export const genderChangeRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listGenderChangeSchema)
    .query(({ ctx, input }) => listGenderChange(ctx.db, input)),

  stats: superAdminProcedure
    .input(genderChangeStatsSchema.optional())
    .query(({ ctx, input }) => getGenderChangeStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getGenderChangeSchema)
    .query(({ ctx, input }) => getGenderChangeById(ctx.db, input)),

  create: superAdminProcedure
    .input(createGenderChangeSchema)
    .mutation(({ ctx, input }) => createGenderChange(ctx.db, input)),

  update: superAdminProcedure
    .input(updateGenderChangeSchema)
    .mutation(({ ctx, input }) => updateGenderChange(ctx.db, input)),

  delete: superAdminProcedure
    .input(deleteGenderChangeSchema)
    .mutation(({ ctx, input }) => deleteGenderChange(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteGenderChangeSchema)
    .mutation(({ ctx, input }) => bulkDeleteGenderChange(ctx.db, input)),

  import: superAdminProcedure
    .input(importGenderChangeSchema)
    .mutation(({ ctx, input }) => importGenderChange(ctx.db, input)),
})

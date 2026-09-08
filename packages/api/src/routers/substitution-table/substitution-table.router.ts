import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createSubstitutionTableSchema,
  deleteSubstitutionTableSchema,
  getSubstitutionTableSchema,
  listSubstitutionTablesSchema,
  updateSubstitutionTableSchema,
  bulkDeleteSubstitutionTablesSchema,
  importSubstitutionTablesSchema,
  substitutionTableStatsSchema,
} from "./substitution-table.schema"
import {
  createSubstitutionTable,
  deleteSubstitutionTable,
  getSubstitutionTableById,
  listSubstitutionTables,
  updateSubstitutionTable,
  bulkDeleteSubstitutionTables,
  importSubstitutionTables,
  getSubstitutionTableStats,
} from "./substitution-table.service"

export const substitutionTableRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listSubstitutionTablesSchema)
    .query(({ ctx, input }) => listSubstitutionTables(ctx.db, input)),

  stats: superAdminProcedure
    .input(substitutionTableStatsSchema.optional())
    .query(({ ctx, input }) => getSubstitutionTableStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getSubstitutionTableSchema)
    .query(({ ctx, input }) => getSubstitutionTableById(ctx.db, input)),

  create: superAdminProcedure
    .input(createSubstitutionTableSchema)
    .mutation(({ ctx, input }) => createSubstitutionTable(ctx.db, input)),

  update: superAdminProcedure
    .input(updateSubstitutionTableSchema)
    .mutation(({ ctx, input }) => updateSubstitutionTable(ctx.db, input)),

  delete: superAdminProcedure
    .input(deleteSubstitutionTableSchema)
    .mutation(({ ctx, input }) => deleteSubstitutionTable(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteSubstitutionTablesSchema)
    .mutation(({ ctx, input }) => bulkDeleteSubstitutionTables(ctx.db, input)),

  import: superAdminProcedure
    .input(importSubstitutionTablesSchema)
    .mutation(({ ctx, input }) => importSubstitutionTables(ctx.db, input)),
})

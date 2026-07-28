/**
 * Role sub-router.
 *
 * Thin tRPC layer — delegates business logic to `role.service.ts`.
 * No raw DB calls here.
 */
import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createRoleSchema,
  deleteRoleSchema,
  getRoleSchema,
  listRolesSchema,
  roleForSelectionSchema,
  updateRoleSchema,
} from "./role.schema"
import {
  createRole,
  deleteRole,
  getRoleById,
  getRolesForSelection,
  listRoles,
  updateRole,
} from "./role.service"

export const roleRouter = createTRPCRouter({
  /**
   * Fetch all roles for selection inputs, with optional name filter.
   */
  forSelection: superAdminProcedure
    .input(roleForSelectionSchema)
    .query(({ ctx, input }) => getRolesForSelection(ctx.db, input)),

  /**
   * List all roles with cursor-based pagination and optional search filter.
   */
  list: superAdminProcedure
    .input(listRolesSchema)
    .query(({ ctx, input }) => listRoles(ctx.db, input)),

  /**
   * Fetch a single role by ID.
   */
  byId: superAdminProcedure
    .input(getRoleSchema)
    .query(({ ctx, input }) => getRoleById(ctx.db, input)),

  /**
   * Create a new role.
   */
  create: superAdminProcedure
    .input(createRoleSchema)
    .mutation(({ ctx, input }) => createRole(ctx.db, input)),

  /**
   * Update an existing role.
   */
  update: superAdminProcedure
    .input(updateRoleSchema)
    .mutation(({ ctx, input }) => updateRole(ctx.db, input)),

  /**
   * Delete a role.
   */
  delete: superAdminProcedure
    .input(deleteRoleSchema)
    .mutation(({ ctx, input }) => deleteRole(ctx.db, input)),
})

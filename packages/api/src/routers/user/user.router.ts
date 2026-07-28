/**
 * User sub-router.
 *
 * Thin tRPC layer — validates input with Zod schemas, then delegates
 * business logic to `user.service.ts`. No raw DB calls here.
 *
 * All procedures require super-admin access (platform-level user management).
 */
import {
  createTRPCRouter,
  protectedProcedure,
  superAdminProcedure,
} from "../../trpc"
import { db } from "@workspace/db/main"
import {
  createUserSchema,
  deleteUserSchema,
  getUserSchema,
  listUsersSchema,
  updateUserSchema,
  updateUserRolesSchema,
  updateContactSchema,
  usersForSelectionSchema,
} from "./user.schema"
import {
  createUser,
  deleteUser,
  getUserById,
  getUsersForSelection,
  getUserStats,
  listUsers,
  updateUser,
  updateUserRoles,
  updateUserContact,
} from "./user.service"

export const userRouter = createTRPCRouter({
  /**
   * Fetch current user's profile and bound roles.
   */
  me: protectedProcedure.query(({ ctx }) => {
    return {
      user: ctx.session.user,
      roles: ctx.roles,
    }
  }),

  /**
   * Allow current user to update their phone number or email (e.g. to fix typos before verification).
   */
  updateContact: protectedProcedure
    .input(updateContactSchema)
    .mutation(({ ctx, input }) => updateUserContact(db, ctx.session.user.id, input)),

  /**
   * Fetch summary statistics for users (total count, delta, verified, pending).
   */
  stats: superAdminProcedure.query(({ ctx }) => getUserStats(ctx.db)),

  /**
   * Fetch users formatted for selection dropdowns.
   */
  forSelection: superAdminProcedure
    .input(usersForSelectionSchema)
    .query(({ ctx, input }) => getUsersForSelection(ctx.db, input)),

  /**
   * Create a new user record.
   */
  create: superAdminProcedure
    .input(createUserSchema)
    .mutation(({ ctx, input }) => createUser(ctx.db, input)),

  /**
   * List all users with cursor-based or page-offset pagination.
   * Returns only safe fields (no passwords, tokens, etc.) with roles.
   */
  list: superAdminProcedure
    .input(listUsersSchema)
    .query(({ ctx, input }) => listUsers(ctx.db, input)),

  /**
   * Fetch a single user by id.
   */
  byId: superAdminProcedure
    .input(getUserSchema)
    .query(({ ctx, input }) => getUserById(ctx.db, input)),

  /**
   * Update a user's profile fields.
   */
  update: superAdminProcedure
    .input(updateUserSchema)
    .mutation(({ ctx, input }) => updateUser(ctx.db, input)),

  /**
   * Update a user's assigned roles by role IDs (Super Admin only).
   */
  updateRoles: superAdminProcedure
    .input(updateUserRolesSchema)
    .mutation(({ ctx, input }) => updateUserRoles(ctx.db, input)),

  /**
   * Permanently delete a user and cascade their sessions/accounts.
   */
  delete: superAdminProcedure
    .input(deleteUserSchema)
    .mutation(({ ctx, input }) => deleteUser(ctx.db, input)),
})

import { createTRPCRouter, superAdminProcedure, tenantMemberProcedure } from "../../trpc"
import {
  bulkTenantActionSchema,
  createTenantSchema,
  deleteTenantSchema,
  getTenantBySlugSchema,
  getTenantSchema,
  listTenantsSchema,
  toggleTenantStatusSchema,
  updateTenantSchema,
  sendInvitationSchema,
  resendInvitationSchema,
  revokeInvitationSchema,
  listInvitationsSchema,
  updateTenantProfileSchema,
} from "./tenant.schema"
import {
  bulkActivateTenants,
  bulkDeactivateTenants,
  bulkDeleteTenants,
  createTenant,
  deleteTenant,
  getTenantById,
  getTenantBySlug,
  getTenantStats,
  listTenants,
  toggleTenantStatus,
  updateTenant,
  sendTenantInvitation,
  listTenantInvitations,
  resendTenantInvitation,
  revokeTenantInvitation,
  getTenantProfile,
  updateTenantProfile,
} from "./tenant.service"

export const tenantRouter = createTRPCRouter({
  /** List all tenants with pagination and filters */
  list: superAdminProcedure
    .input(listTenantsSchema)
    .query(({ ctx, input }) => listTenants(ctx.db, input)),

  /** Fetch tenant stats (total, active, suspended) */
  stats: superAdminProcedure
    .query(({ ctx }) => getTenantStats(ctx.db)),

  /** Fetch tenant by ID */
  byId: superAdminProcedure
    .input(getTenantSchema)
    .query(({ ctx, input }) => getTenantById(ctx.db, input)),

  /** Fetch tenant by URL slug */
  bySlug: superAdminProcedure
    .input(getTenantBySlugSchema)
    .query(({ ctx, input }) => getTenantBySlug(ctx.db, input)),

  /** Create a new tenant (and optional initial subscription) */
  create: superAdminProcedure
    .input(createTenantSchema)
    .mutation(({ ctx, input }) => createTenant(ctx.db, input)),

  /** Update tenant details */
  update: superAdminProcedure
    .input(updateTenantSchema)
    .mutation(({ ctx, input }) => updateTenant(ctx.db, input)),

  /** Toggle tenant active status */
  toggleStatus: superAdminProcedure
    .input(toggleTenantStatusSchema)
    .mutation(({ ctx, input }) => toggleTenantStatus(ctx.db, input)),

  /** Bulk activate tenants */
  bulkActive: superAdminProcedure
    .input(bulkTenantActionSchema)
    .mutation(({ ctx, input }) => bulkActivateTenants(ctx.db, input)),

  /** Bulk deactivate tenants */
  bulkDeactive: superAdminProcedure
    .input(bulkTenantActionSchema)
    .mutation(({ ctx, input }) => bulkDeactivateTenants(ctx.db, input)),

  /** Bulk delete tenants */
  bulkDelete: superAdminProcedure
    .input(bulkTenantActionSchema)
    .mutation(({ ctx, input }) => bulkDeleteTenants(ctx.db, input)),

  /** Delete a single tenant */
  delete: superAdminProcedure
    .input(deleteTenantSchema)
    .mutation(({ ctx, input }) => deleteTenant(ctx.db, input)),

  /** Send team invitation */
  sendInvitation: superAdminProcedure
    .input(sendInvitationSchema)
    .mutation(({ ctx, input }) => sendTenantInvitation(ctx.db, input)),

  /** List team invitations */
  listInvitations: superAdminProcedure
    .input(listInvitationsSchema)
    .query(({ ctx, input }) => listTenantInvitations(ctx.db, input)),

  /** Resend invitation link */
  resendInvitation: superAdminProcedure
    .input(resendInvitationSchema)
    .mutation(({ ctx, input }) => resendTenantInvitation(ctx.db, input)),

  /** Revoke invitation link */
  revokeInvitation: superAdminProcedure
    .input(revokeInvitationSchema)
    .mutation(({ ctx, input }) => revokeTenantInvitation(ctx.db, input)),

  /** Get current tenant profile */
  current: tenantMemberProcedure
    .query(({ ctx }) => getTenantProfile(ctx.db, ctx.tenant.id)),

  /** Update current tenant profile */
  updateCurrent: tenantMemberProcedure
    .input(updateTenantProfileSchema)
    .mutation(({ ctx, input }) => updateTenantProfile(ctx.db, ctx.tenant.id, input)),
})

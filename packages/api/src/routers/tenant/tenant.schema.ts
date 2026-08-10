import { z } from "zod"
import { idSchema, paginationSchema, slugSchema } from "../../schemas/common"

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export const listTenantsSchema = paginationSchema.extend({
  type: z.string().optional(),
  planId: z.string().optional(),
  isActive: z.boolean().optional(),
})

export type ListTenantsInput = z.infer<typeof listTenantsSchema>

export const getTenantSchema = idSchema

export type GetTenantInput = z.infer<typeof getTenantSchema>

export const getTenantBySlugSchema = slugSchema

export type GetTenantBySlugInput = z.infer<typeof getTenantBySlugSchema>

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export const createTenantSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only."),
  name: z.string().min(1).max(200),
  nameBn: z.string().optional(),
  description: z.string().optional(),
  logo: z.string().optional(),
  type: z.string().default("UNION_PORISHOD"),
  email: z.string().email().or(z.literal("")).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  divisionName: z.string().optional(),
  districtName: z.string().optional(),
  upazilaName: z.string().optional(),
  unionName: z.string().optional(),
  postalCode: z.string().optional(),
  secretaryName: z.string().optional(),
  chairmanName: z.string().optional(),
  subdomain: z.string().optional(),
  customDomain: z.string().optional(),
  isActive: z.boolean().default(true),
  planId: z.string().optional(), // Optional initial subscription plan ID
})

export type CreateTenantInput = z.infer<typeof createTenantSchema>

export const updateTenantSchema = z.object({
  id: z.string().min(1),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only.")
    .optional(),
  name: z.string().min(1).max(200).optional(),
  nameBn: z.string().optional(),
  description: z.string().optional(),
  logo: z.string().optional(),
  type: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  divisionName: z.string().optional(),
  districtName: z.string().optional(),
  upazilaName: z.string().optional(),
  unionName: z.string().optional(),
  postalCode: z.string().optional(),
  secretaryName: z.string().optional(),
  chairmanName: z.string().optional(),
  subdomain: z.string().optional(),
  customDomain: z.string().optional(),
  customDomainVerified: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isSuspended: z.boolean().optional(),
  suspendReason: z.string().optional(),
  currentFiscalYearId: z.string().optional(),
  planId: z.string().optional(),
})

export type UpdateTenantInput = z.infer<typeof updateTenantSchema>

export const toggleTenantStatusSchema = idSchema

export type ToggleTenantStatusInput = z.infer<typeof toggleTenantStatusSchema>

export const bulkTenantActionSchema = z.object({
  ids: z.array(z.string().min(1)),
})

export type BulkTenantActionInput = z.infer<typeof bulkTenantActionSchema>

export const deleteTenantSchema = idSchema

export type DeleteTenantInput = z.infer<typeof deleteTenantSchema>

// ---------------------------------------------------------------------------
// Invitations
// ---------------------------------------------------------------------------

export const sendInvitationSchema = z.object({
  tenantId: z.string().min(1),
  email: z.string().email("Please enter a valid email address."),
  name: z.string().optional(),
  role: z.string().default("STAFF"),
  message: z.string().optional(),
})

export type SendInvitationInput = z.infer<typeof sendInvitationSchema>

export const resendInvitationSchema = idSchema
export type ResendInvitationInput = z.infer<typeof resendInvitationSchema>

export const revokeInvitationSchema = idSchema
export type RevokeInvitationInput = z.infer<typeof revokeInvitationSchema>

export const listInvitationsSchema = z.object({
  tenantId: z.string().min(1),
})
export type ListInvitationsInput = z.infer<typeof listInvitationsSchema>

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export const updateTenantProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  nameBn: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")).nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  divisionName: z.string().optional().nullable(),
  districtName: z.string().optional().nullable(),
  upazilaName: z.string().optional().nullable(),
  unionName: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  secretaryName: z.string().optional().nullable(),
  chairmanName: z.string().optional().nullable(),
})

export type UpdateTenantProfileInput = z.infer<typeof updateTenantProfileSchema>


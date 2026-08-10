import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"

export const listTenantWardsSchema = paginationSchema.extend({
  search: z.string().optional(),
  sort: z.enum(["all", "name_asc", "name_desc", "newest", "oldest"]).optional(),
})

export type ListTenantWardsInput = z.infer<typeof listTenantWardsSchema>

export const getTenantWardSchema = idSchema

export type GetTenantWardInput = z.infer<typeof getTenantWardSchema>

export const createTenantWardSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nameBn: z.string().min(1, "Bangla name is required"),
})

export type CreateTenantWardInput = z.infer<typeof createTenantWardSchema>

export const updateTenantWardSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  nameBn: z.string().min(1).optional(),
})

export type UpdateTenantWardInput = z.infer<typeof updateTenantWardSchema>

export const deleteTenantWardSchema = idSchema

export type DeleteTenantWardInput = z.infer<typeof deleteTenantWardSchema>

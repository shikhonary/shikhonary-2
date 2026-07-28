/**
 * Role domain — Zod input/output schemas.
 */
import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"

export const roleForSelectionSchema = z
  .object({
    name: z.string().optional(),
  })
  .optional()

export type RoleForSelectionInput = z.infer<typeof roleForSelectionSchema>

export const listRolesSchema = paginationSchema.extend({
  query: z.string().optional(),
})

export type ListRolesInput = z.infer<typeof listRolesSchema>

export const getRoleSchema = idSchema

export type GetRoleInput = z.infer<typeof getRoleSchema>

export const createRoleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
})

export type CreateRoleInput = z.infer<typeof createRoleSchema>

export const updateRoleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
})

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>

export const deleteRoleSchema = idSchema

export type DeleteRoleInput = z.infer<typeof deleteRoleSchema>

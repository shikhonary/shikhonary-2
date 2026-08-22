import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"

export const listSubscriptionsSchema = paginationSchema.extend({
  tenantId: z.string().optional(),
  planId: z.string().optional(),
  status: z.string().optional(),
})

export type ListSubscriptionsInput = z.infer<typeof listSubscriptionsSchema>

export const getSubscriptionSchema = idSchema

export type GetSubscriptionInput = z.infer<typeof getSubscriptionSchema>

export const getSubscriptionByTenantSchema = z.object({
  tenantId: z.string().min(1),
})

export type GetSubscriptionByTenantInput = z.infer<typeof getSubscriptionByTenantSchema>

export const createSubscriptionSchema = z.object({
  tenantId: z.string().min(1),
  planId: z.string().min(1),
  status: z.enum(["ACTIVE", "TRIALING", "PAST_DUE", "CANCELED", "EXPIRED"]).default("ACTIVE"),
  billingCycle: z.enum(["MONTHLY", "YEARLY"]).default("YEARLY"),
  currency: z.string().default("BDT"),
  pricePerMonth: z.number().int().min(0).default(0),
  pricePerYear: z.number().int().min(0).optional(),
  currentPeriodStart: z.coerce.date(),
  currentPeriodEnd: z.coerce.date(),
  trialEndsAt: z.coerce.date().optional(),
  customStudentLimit: z.number().int().min(0).optional(),
  customTeacherLimit: z.number().int().min(0).optional(),
  customExamLimit: z.number().int().min(0).optional(),
  customStorageLimit: z.number().int().min(0).optional(),
})

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>

export const updateSubscriptionSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["ACTIVE", "TRIALING", "PAST_DUE", "CANCELED", "EXPIRED"]).optional(),
  billingCycle: z.enum(["MONTHLY", "YEARLY"]).optional(),
  pricePerMonth: z.number().int().min(0).optional(),
  pricePerYear: z.number().int().min(0).optional(),
  currentPeriodStart: z.coerce.date().optional(),
  currentPeriodEnd: z.coerce.date().optional(),
  customStudentLimit: z.number().int().min(0).optional(),
  customTeacherLimit: z.number().int().min(0).optional(),
  customExamLimit: z.number().int().min(0).optional(),
  customStorageLimit: z.number().int().min(0).optional(),
})

export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>

export const changeSubscriptionPlanSchema = z.object({
  id: z.string().min(1),
  planId: z.string().min(1),
  billingCycle: z.enum(["MONTHLY", "YEARLY"]).default("YEARLY"),
  reason: z.string().optional(),
})

export type ChangeSubscriptionPlanInput = z.infer<typeof changeSubscriptionPlanSchema>

export const cancelSubscriptionSchema = z.object({
  id: z.string().min(1),
  cancelReason: z.string().optional(),
  cancelAtPeriodEnd: z.boolean().default(true),
})

export type CancelSubscriptionInput = z.infer<typeof cancelSubscriptionSchema>

export const deleteSubscriptionSchema = idSchema

export type DeleteSubscriptionInput = z.infer<typeof deleteSubscriptionSchema>

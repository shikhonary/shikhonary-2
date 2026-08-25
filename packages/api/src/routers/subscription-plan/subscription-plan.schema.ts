import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"

export const listSubscriptionPlansSchema = paginationSchema.extend({
  isActive: z.boolean().optional(),
  query: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
})

export type ListSubscriptionPlansInput = z.infer<typeof listSubscriptionPlansSchema>

export const getSubscriptionPlanSchema = idSchema

export type GetSubscriptionPlanInput = z.infer<typeof getSubscriptionPlanSchema>

export const createSubscriptionPlanSchema = z.object({
  name: z.string().min(1).max(50),
  displayName: z.string().min(1).max(100),
  description: z.string().optional(),

  monthlyPriceBDT: z.number().int().min(0).default(0),
  yearlyPriceBDT: z.number().int().min(0).default(0),

  features: z.record(z.unknown()).default({}),
  isActive: z.boolean().default(true),
  isPopular: z.boolean().default(false),

  defaultStudentLimit: z.number().int().min(0).default(1000),
  defaultTeacherLimit: z.number().int().min(0).default(10),
  defaultExamLimit: z.number().int().min(0).default(500),
  defaultStorageLimit: z.number().int().min(0).default(500),
  defaultCreditLimit: z.number().int().min(0).default(30),

  canCreateExams: z.boolean().default(true),
  canCollectFees: z.boolean().default(false),
  canUseLms: z.boolean().default(false),
  canManageAttendance: z.boolean().default(false),
  canManageLibrary: z.boolean().default(false),
  canManageTransport: z.boolean().default(false),
  canSendSms: z.boolean().default(false),
  canUseCustomDomain: z.boolean().default(false),
  canUseAiFeatures: z.boolean().default(false),
  canExportReports: z.boolean().default(true),
})

export type CreateSubscriptionPlanInput = z.infer<typeof createSubscriptionPlanSchema>

export const updateSubscriptionPlanSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(50).optional(),
  displayName: z.string().min(1).max(100).optional(),
  description: z.string().optional(),

  monthlyPriceBDT: z.number().int().min(0).optional(),
  yearlyPriceBDT: z.number().int().min(0).optional(),

  features: z.record(z.unknown()).optional(),
  isActive: z.boolean().optional(),
  isPopular: z.boolean().optional(),

  defaultStudentLimit: z.number().int().min(0).optional(),
  defaultTeacherLimit: z.number().int().min(0).optional(),
  defaultExamLimit: z.number().int().min(0).optional(),
  defaultStorageLimit: z.number().int().min(0).optional(),
  defaultCreditLimit: z.number().int().min(0).optional(),

  canCreateExams: z.boolean().optional(),
  canCollectFees: z.boolean().optional(),
  canUseLms: z.boolean().optional(),
  canManageAttendance: z.boolean().optional(),
  canManageLibrary: z.boolean().optional(),
  canManageTransport: z.boolean().optional(),
  canSendSms: z.boolean().optional(),
  canUseCustomDomain: z.boolean().optional(),
  canUseAiFeatures: z.boolean().optional(),
  canExportReports: z.boolean().optional(),
})

export type UpdateSubscriptionPlanInput = z.infer<typeof updateSubscriptionPlanSchema>

export const deleteSubscriptionPlanSchema = idSchema

export type DeleteSubscriptionPlanInput = z.infer<typeof deleteSubscriptionPlanSchema>

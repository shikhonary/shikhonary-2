import { z } from "zod"

export const getReferralStatsSchema = z.object({}).optional()
export type GetReferralStatsInput = z.infer<typeof getReferralStatsSchema>

export const invitePeerSchema = z.object({
  institutionName: z.string().min(2, "প্রতিষ্ঠানের নাম আবশ্যক").max(200),
  email: z.string().email("সঠিক ইমেইল ঠিকানা প্রদান করুন"),
  phone: z.string().optional().nullable(),
  message: z.string().optional().nullable(),
})
export type InvitePeerInput = z.infer<typeof invitePeerSchema>

export const listReferralsSchema = z.object({
  status: z.enum(["ALL", "PENDING", "ACTIVATED", "REWARDED", "EXPIRED"]).optional().default("ALL"),
  limit: z.number().int().min(1).max(100).default(20),
  page: z.number().int().min(1).default(1),
})
export type ListReferralsInput = z.infer<typeof listReferralsSchema>

export const validateReferralCodeSchema = z.object({
  code: z.string().min(3, "রেফারেল কোড আবশ্যক").max(50),
})
export type ValidateReferralCodeInput = z.infer<typeof validateReferralCodeSchema>

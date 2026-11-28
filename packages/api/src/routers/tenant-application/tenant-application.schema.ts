import { z } from "zod"
import { normalizeBdPhoneNumber, isValidBdPhoneNumber } from "@workspace/utils"

export const INSTITUTION_TYPES = ["SCHOOL", "COACHING", "TUTOR", "COLLEGE", "MADRASAH", "OTHER"] as const
export type InstitutionType = (typeof INSTITUTION_TYPES)[number]

export const submitTenantApplicationSchema = z.object({
  type: z.enum(INSTITUTION_TYPES).default("SCHOOL"),
  name: z.string().min(2, "প্রতিষ্ঠানের নাম আবশ্যক"),
  phone: z
    .string()
    .transform(normalizeBdPhoneNumber)
    .refine(
      (val) => isValidBdPhoneNumber(val),
      "সঠিক ১১ ডিজিটের বাংলাদেশী মোবাইল নম্বর প্রদান করুন (যেমন: ০১৭১২-৩৪৫৬৭৮)"
    ),
  divisionId: z.string().optional().nullable(),
  districtId: z.string().optional().nullable(),
  referralCode: z.string().optional().nullable(),
})

export type SubmitTenantApplicationInput = z.infer<typeof submitTenantApplicationSchema>

export const listTenantApplicationsSchema = z.object({
  status: z.enum(["ALL", "PENDING", "APPROVED", "REJECTED"]).optional().default("ALL"),
  type: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
})

export type ListTenantApplicationsInput = z.infer<typeof listTenantApplicationsSchema>

export const rejectTenantApplicationSchema = z.object({
  id: z.string().min(1),
  rejectionReason: z.string().min(2, "বাতিলের কারণ উল্লেখ করুন"),
})

export type RejectTenantApplicationInput = z.infer<typeof rejectTenantApplicationSchema>

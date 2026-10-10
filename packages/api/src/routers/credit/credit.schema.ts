import { z } from "zod"
import { paginationSchema } from "../../schemas/common"

export const getCreditBalanceSchema = z.object({}).optional()

export const listCreditTransactionsSchema = paginationSchema.extend({
  type: z.enum(["SUBSCRIPTION_REFRESH", "PURCHASE", "USAGE", "REFUND", "ADMIN_ADJUSTMENT"]).optional(),
  page: z.number().int().min(1).optional(),
})

export type ListCreditTransactionsInput = z.infer<typeof listCreditTransactionsSchema>

export const estimatePaperCostSchema = z.object({
  questionTypeCounts: z.array(
    z.object({
      questionTypeId: z.string().min(1),
      count: z.number().int().min(1),
    })
  ),
})

export type EstimatePaperCostInput = z.infer<typeof estimatePaperCostSchema>

export const purchaseCreditPackSchema = z.object({
  packId: z.string().min(1),
  paymentMethod: z
    .enum(["BKASH", "NAGAD", "ROCKET", "CARD", "MANUAL"])
    .default("BKASH"),
  paymentReference: z.string().optional(),
})

export type PurchaseCreditPackInput = z.infer<typeof purchaseCreditPackSchema>

export interface CreditPackItem {
  id: string
  name: string
  displayName: string
  description: string
  credits: number
  bonusCredits: number
  totalCredits: number
  priceBDT: number
  isPopular: boolean
  badge?: string
}

export const DEFAULT_CREDIT_PACKS: CreditPackItem[] = [
  {
    id: "pack_mini",
    name: "mini",
    displayName: "মিনি টপ-আপ",
    description: "জরুরি প্রশ্ন তৈরি ও স্বল্প ব্যবহারের জন্য",
    credits: 200,
    bonusCredits: 0,
    totalCredits: 200,
    priceBDT: 200,
    isPopular: false,
  },
  {
    id: "pack_standard",
    name: "standard",
    displayName: "স্ট্যান্ডার্ড টপ-আপ",
    description: "কোচিং ও নিয়মিত প্রশ্ন তৈরির সেরা পছন্দ",
    credits: 500,
    bonusCredits: 50,
    totalCredits: 550,
    priceBDT: 500,
    isPopular: true,
    badge: "১০% বোনাস",
  },
  {
    id: "pack_super_saver",
    name: "super-saver",
    displayName: "সুপার সেভার প্যাক",
    description: "মাসিক পরীক্ষা ও বড় প্রশ্নভাণ্ডার ব্যবহারের জন্য",
    credits: 1000,
    bonusCredits: 200,
    totalCredits: 1200,
    priceBDT: 1000,
    isPopular: false,
    badge: "২০% বোনাস",
  },
  {
    id: "pack_mega",
    name: "mega",
    displayName: "মেগা প্রাতিষ্ঠানিক প্যাক",
    description: "স্কুল, কলেজ ও বৃহৎ প্রতিষ্ঠানের ভারী ব্যবহারের জন্য",
    credits: 2500,
    bonusCredits: 600,
    totalCredits: 3100,
    priceBDT: 2500,
    isPopular: false,
    badge: "২৪% বোনাস",
  },
]

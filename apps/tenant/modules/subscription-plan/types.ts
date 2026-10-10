export type BillingCycle = "MONTHLY" | "YEARLY"

export interface SubscriptionPlanItem {
  id: string
  name: string
  displayName: string
  description?: string | null
  monthlyPriceBDT: number
  yearlyPriceBDT: number
  features?: any
  isActive: boolean
  isPopular: boolean

  // Resource limits
  defaultStudentLimit: number
  defaultTeacherLimit: number
  defaultExamLimit: number
  defaultStorageLimit: number
  defaultCreditLimit: number

  // Feature flags
  canCreateExams: boolean
  canCollectFees: boolean
  canUseLms: boolean
  canManageAttendance: boolean
  canManageLibrary: boolean
  canManageTransport: boolean
  canSendSms: boolean
  canUseCustomDomain: boolean
  canUseAiFeatures: boolean
  canExportReports: boolean

  createdAt?: string | Date
  updatedAt?: string | Date
}

export interface QuotaItem {
  used: number
  limit: number
  remaining: number
  percentage: number
  unit: string
}

export interface TenantQuotas {
  papers: QuotaItem
  aiChatbotPapers: QuotaItem
  omrSheets: QuotaItem
  onlineExams: QuotaItem
  credits: {
    balance: number
    usedTotal: number
    monthlyRefresh: number
  }
}

export interface TenantSubscriptionDetails {
  subscription: {
    id: string
    tenantId: string
    planId: string
    status: "ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELED" | "EXPIRED" | string
    billingCycle: BillingCycle | string
    currency: string
    pricePerMonth: number
    pricePerYear?: number | null
    currentPeriodStart: string | Date
    currentPeriodEnd: string | Date
    trialEndsAt?: string | Date | null
    cancelAtPeriodEnd: boolean
    canceledAt?: string | Date | null
    cancelReason?: string | null
    customStudentLimit?: number | null
    customTeacherLimit?: number | null
    customExamLimit?: number | null
    customStorageLimit?: number | null
    plan: SubscriptionPlanItem
    history?: {
      id: string
      event: string
      fromPlanId?: string | null
      toPlanId?: string | null
      reason?: string | null
      createdAt: string | Date
    }[]
  } | null
  remainingDays: number
  quotas?: TenantQuotas
  usage: {
    teachers: number
    students: number
    exams: number
    storageMB: number
    credits: number
  }
}

export interface InvoiceItem {
  id: string
  tenantId: string
  invoiceNumber: string
  amount: number
  currency: string
  status: "PAID" | "PENDING" | "VOID" | string
  periodStart: string | Date
  periodEnd: string | Date
  dueDate?: string | Date | null
  paidAt?: string | Date | null
  paymentMethod?: string | null
  paymentProvider?: string | null
  paymentReference?: string | null
  pdfUrl?: string | null
  lineItems?: any
  description?: string | null
  notes?: string | null
  createdAt: string | Date
}

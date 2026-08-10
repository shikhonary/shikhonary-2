/**
 * Global application constants.
 */
export const APP_NAME = "UP Hub"

export const DEFAULT_PAGE_SIZE = 20

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "Admin",
  CHAIRMAN: "Chairman",
  MEMBER: "Member",
  USER: "User",
} as const

export const VERIFICATION_STATUS = {
  VERIFIED: "Verified",
  PENDING: "Pending",
  BLOCKED: "Blocked",
} as const

export const SORT_OPTIONS = [
  {
    label: "Oldest",
    label_bn: "সবচেয়ে পুরানো",
    value: "asc",
  },
  {
    label: "Newest",
    label_bn: "সর্বশেষ",
    value: "desc",
  },
  {
    label: "Name (A - Z)",
    label_bn: "নাম (A - Z)",
    value: "name_asc",
  },
  {
    label: "Name (Z - A)",
    label_bn: "নাম (Z - A)",
    value: "name_desc",
  },
]

// ---------------------------------------------------------------------------
// Subscription & Fiscal Year Systems
// ---------------------------------------------------------------------------

export const SUBSCRIPTION_STATUS = {
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  SUSPENDED: "SUSPENDED",
  CANCELLED: "CANCELLED",
} as const

export type SubscriptionStatus =
  (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS]

export const BILLING_CYCLE = {
  MONTHLY: "MONTHLY",
  YEARLY: "YEARLY",
} as const

export type BillingCycle = (typeof BILLING_CYCLE)[keyof typeof BILLING_CYCLE]

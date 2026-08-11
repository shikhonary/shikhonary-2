import { useQueryStates, parseAsString, parseAsStringEnum } from "nuqs"

export const taxPaymentStatusEnum = ["all", "paid", "unpaid"] as const
export type TaxPaymentStatusOption = (typeof taxPaymentStatusEnum)[number]

export const taxPaymentSearchParamsParsers = {
  search: parseAsString.withDefault(""),
  fiscalYearId: parseAsString.withDefault("all"),
  wardId: parseAsString.withDefault("all"),
  status: parseAsStringEnum<TaxPaymentStatusOption>(Array.from(taxPaymentStatusEnum)).withDefault("all"),
}

export function useTaxPaymentSearchParams() {
  return useQueryStates(taxPaymentSearchParamsParsers, {
    shallow: true,
  })
}

import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const subscriptionPlanSortOptions = [
  "All",
  "name_asc",
  "name_desc",
  "price_asc",
  "price_desc",
] as const
export type SubscriptionPlanSortOption = (typeof subscriptionPlanSortOptions)[number]

export const subscriptionPlanSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  sort: parseAsStringEnum<SubscriptionPlanSortOption>(Array.from(subscriptionPlanSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useSubscriptionPlanSearchParams() {
  return useQueryStates(subscriptionPlanSearchParamsParsers, {
    shallow: true,
  })
}

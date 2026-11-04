import { useQueryStates, parseAsString, parseAsInteger } from "nuqs"

export const tenantSortOptions = [
  "All",
  "newest",
  "oldest",
  "name_asc",
  "name_desc",
] as const

export const tenantSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  status: parseAsString.withDefault("all"),
  type: parseAsString.withDefault("all"),
  sort: parseAsString.withDefault("newest"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useTenantSearchParams() {
  return useQueryStates(tenantSearchParamsParsers, {
    shallow: true,
  })
}

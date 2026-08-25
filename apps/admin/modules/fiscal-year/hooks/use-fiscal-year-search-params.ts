import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const fiscalYearSortOptions = [
  "All",
  "name_asc",
  "name_desc",
  "newest",
  "oldest",
] as const
export type FiscalYearSortOption = (typeof fiscalYearSortOptions)[number]

export const fiscalYearSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  sort: parseAsStringEnum<FiscalYearSortOption>(Array.from(fiscalYearSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useFiscalYearSearchParams() {
  return useQueryStates(fiscalYearSearchParamsParsers, {
    shallow: true,
  })
}

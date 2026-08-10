import { useQueryStates, parseAsString } from "nuqs"

export const fiscalYearSearchParamsParsers = {
  search: parseAsString.withDefault(""),
  sort: parseAsString.withDefault("all"),
}

export function useFiscalYearSearchParams() {
  return useQueryStates(fiscalYearSearchParamsParsers, {
    shallow: true,
  })
}

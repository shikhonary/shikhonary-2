import { useQueryStates, parseAsString } from "nuqs"

export const taxPayerSearchParamsParsers = {
  search: parseAsString.withDefault(""),
  wardId: parseAsString.withDefault("all"),
  sort: parseAsString.withDefault("all"),
}

export function useTaxPayerSearchParams() {
  return useQueryStates(taxPayerSearchParamsParsers, {
    shallow: true,
  })
}

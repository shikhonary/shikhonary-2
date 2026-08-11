import { useQueryStates, parseAsString } from "nuqs"

export const taxGenerationSearchParamsParsers = {
  search: parseAsString.withDefault(""),
  wardId: parseAsString.withDefault("all"),
  fiscalYearId: parseAsString.withDefault(""),
}

export function useTaxGenerationSearchParams() {
  return useQueryStates(taxGenerationSearchParamsParsers, {
    shallow: true,
  })
}

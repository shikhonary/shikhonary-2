import { useQueryStates, parseAsString } from "nuqs"

export const counterSearchParamsParsers = {
  search: parseAsString.withDefault(""),
  sort: parseAsString.withDefault("all"),
}

export function useCounterSearchParams() {
  return useQueryStates(counterSearchParamsParsers, {
    shallow: true,
  })
}

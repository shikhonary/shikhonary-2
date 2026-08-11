import { useQueryStates, parseAsString } from "nuqs"

export const wardSearchParamsParsers = {
  search: parseAsString.withDefault(""),
  sort: parseAsString.withDefault("all"),
}

export function useWardSearchParams() {
  return useQueryStates(wardSearchParamsParsers, {
    shallow: true,
  })
}

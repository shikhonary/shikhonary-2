import { useQueryStates, parseAsString } from "nuqs"

export const citizenApplicationSearchParamsParsers = {
  search: parseAsString.withDefault(""),
  wardId: parseAsString.withDefault("all"),
  status: parseAsString.withDefault("PENDING"),
  sort: parseAsString.withDefault("newest"),
}

export function useCitizenApplicationSearchParams() {
  return useQueryStates(citizenApplicationSearchParamsParsers, {
    shallow: true,
  })
}

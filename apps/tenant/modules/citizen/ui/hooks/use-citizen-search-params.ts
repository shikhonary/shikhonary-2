import { useQueryStates, parseAsString } from "nuqs"

export const citizenSearchParamsParsers = {
  search: parseAsString.withDefault(""),
  wardId: parseAsString.withDefault("all"),
  residentType: parseAsString.withDefault("all"),
  sort: parseAsString.withDefault("newest"),
}

export function useCitizenSearchParams() {
  return useQueryStates(citizenSearchParamsParsers, {
    shallow: true,
  })
}

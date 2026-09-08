import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const substitutionTablesSortOptions = [
  "All",
  "newest",
  "oldest",
  "popularity",
] as const
export type SubstitutionTablesSortOption = (typeof substitutionTablesSortOptions)[number]

export const substitutionTablesSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  subjectId: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<SubstitutionTablesSortOption>(Array.from(substitutionTablesSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useSubstitutionTablesSearchParams() {
  return useQueryStates(substitutionTablesSearchParamsParsers, {
    shallow: true,
  })
}

import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const thoughtExpansionSortOptions = [
  "All",
  "newest",
  "oldest",
  "title_asc",
  "title_desc",
  "popularity",
] as const
export type ThoughtExpansionSortOption = (typeof thoughtExpansionSortOptions)[number]

export const thoughtExpansionSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  subjectId: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<ThoughtExpansionSortOption>(Array.from(thoughtExpansionSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useThoughtExpansionSearchParams() {
  return useQueryStates(thoughtExpansionSearchParamsParsers, {
    shallow: true,
  })
}

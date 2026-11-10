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
  academicClassId: parseAsString.withDefault("All"),
  subjectId: parseAsString.withDefault("All"),
  board: parseAsString.withDefault("All"),
  isActive: parseAsString.withDefault("All"),
  hasReport: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<ThoughtExpansionSortOption>(Array.from(thoughtExpansionSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useThoughtExpansionSearchParams() {
  return useQueryStates(thoughtExpansionSearchParamsParsers, {
    shallow: true,
  })
}

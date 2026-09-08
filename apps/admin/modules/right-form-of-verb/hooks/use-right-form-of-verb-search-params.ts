import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const rightFormOfVerbSortOptions = [
  "All",
  "newest",
  "oldest",
  "content_asc",
  "content_desc",
  "popularity",
] as const
export type RightFormOfVerbSortOption = (typeof rightFormOfVerbSortOptions)[number]

export const rightFormOfVerbSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  subjectId: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<RightFormOfVerbSortOption>(Array.from(rightFormOfVerbSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useRightFormOfVerbSearchParams() {
  return useQueryStates(rightFormOfVerbSearchParamsParsers, {
    shallow: true,
  })
}

import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const csSortOptions = [
  "All",
  "newest",
  "oldest",
  "question_asc",
  "question_desc",
] as const
export type CsSortOption = (typeof csSortOptions)[number]

export const csSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  subjectId: parseAsString.withDefault("All"),
  chapterId: parseAsString.withDefault("All"),
  board: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<CsSortOption>(Array.from(csSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useCsSearchParams() {
  return useQueryStates(csSearchParamsParsers, {
    shallow: true,
  })
}

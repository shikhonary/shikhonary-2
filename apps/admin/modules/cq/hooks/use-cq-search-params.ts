import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const cqSortOptions = [
  "All",
  "newest",
  "oldest",
  "question_asc",
  "question_desc",
] as const
export type CqSortOption = (typeof cqSortOptions)[number]

export const cqSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  subjectId: parseAsString.withDefault("All"),
  chapterId: parseAsString.withDefault("All"),
  board: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<CqSortOption>(Array.from(cqSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useCqSearchParams() {
  return useQueryStates(cqSearchParamsParsers, {
    shallow: true,
  })
}

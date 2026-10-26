import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const makeQuestionSortOptions = [
  "All",
  "newest",
  "oldest",
  "statement_asc",
  "statement_desc",
] as const

export type MakeQuestionSortOption = (typeof makeQuestionSortOptions)[number]

export const makeQuestionSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  classId: parseAsString.withDefault("All"),
  subjectId: parseAsString.withDefault("All"),
  chapterId: parseAsString.withDefault("All"),
  board: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<MakeQuestionSortOption>(Array.from(makeQuestionSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useMakeQuestionSearchParams() {
  return useQueryStates(makeQuestionSearchParamsParsers, {
    shallow: true,
  })
}

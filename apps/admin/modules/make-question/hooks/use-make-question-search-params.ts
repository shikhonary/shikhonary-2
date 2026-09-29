import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const makeQuestionSortOptions = [
  "All",
  "newest",
  "oldest",
  "statement_asc",
  "statement_desc",
  "popularity",
] as const
export type MakeQuestionSortOption = (typeof makeQuestionSortOptions)[number]

export const makeQuestionSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  subjectId: parseAsString.withDefault("All"),
  chapterId: parseAsString.withDefault("All"),
  essenceId: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<MakeQuestionSortOption>(Array.from(makeQuestionSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(20),
}

export function useMakeQuestionSearchParams() {
  return useQueryStates(makeQuestionSearchParamsParsers, {
    shallow: true,
  })
}

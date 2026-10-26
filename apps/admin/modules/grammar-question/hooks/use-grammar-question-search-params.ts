import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const grammarQuestionSortOptions = [
  "All",
  "newest",
  "oldest",
  "question_asc",
  "question_desc",
] as const

export type GrammarQuestionSortOption = (typeof grammarQuestionSortOptions)[number]

export const grammarQuestionSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  classId: parseAsString.withDefault("All"),
  subjectId: parseAsString.withDefault("All"),
  chapterId: parseAsString.withDefault("All"),
  board: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<GrammarQuestionSortOption>(Array.from(grammarQuestionSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useGrammarQuestionSearchParams() {
  return useQueryStates(grammarQuestionSearchParamsParsers, {
    shallow: true,
  })
}

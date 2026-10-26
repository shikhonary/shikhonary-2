import { useQueryStates, parseAsString, parseAsInteger } from "nuqs"

export const shortAnswerSortOptions = [
  "All",
  "newest",
  "oldest",
  "question_asc",
  "question_desc",
] as const

export const shortAnswerSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  subjectId: parseAsString.withDefault("All"),
  chapterId: parseAsString.withDefault("All"),
  board: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsString.withDefault("newest"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useShortAnswerSearchParams() {
  return useQueryStates(shortAnswerSearchParamsParsers, {
    shallow: true,
  })
}

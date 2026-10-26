import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const mathQuestionSortOptions = [
  "All",
  "newest",
  "oldest",
  "question_asc",
  "question_desc",
] as const

export type MathQuestionSortOption = (typeof mathQuestionSortOptions)[number]

export const mathQuestionSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  classId: parseAsString.withDefault("All"),
  subjectId: parseAsString.withDefault("All"),
  chapterId: parseAsString.withDefault("All"),
  board: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<MathQuestionSortOption>(Array.from(mathQuestionSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useMathQuestionSearchParams() {
  return useQueryStates(mathQuestionSearchParamsParsers, {
    shallow: true,
  })
}

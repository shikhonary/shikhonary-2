import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const shortQuestionSortOptions = [
  "All",
  "newest",
  "oldest",
  "question_asc",
  "question_desc",
  "popularity",
] as const
export type ShortQuestionSortOption = (typeof shortQuestionSortOptions)[number]

export const shortQuestionSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  subjectId: parseAsString.withDefault("All"),
  chapterId: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<ShortQuestionSortOption>(Array.from(shortQuestionSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useShortQuestionSearchParams() {
  return useQueryStates(shortQuestionSearchParamsParsers, {
    shallow: true,
  })
}

import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const descriptiveQuestionSortOptions = [
  "All",
  "newest",
  "oldest",
  "question_asc",
  "question_desc",
  "popularity",
] as const
export type DescriptiveQuestionSortOption = (typeof descriptiveQuestionSortOptions)[number]

export const descriptiveQuestionSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  subjectId: parseAsString.withDefault("All"),
  chapterId: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<DescriptiveQuestionSortOption>(Array.from(descriptiveQuestionSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useDescriptiveQuestionSearchParams() {
  return useQueryStates(descriptiveQuestionSearchParamsParsers, {
    shallow: true,
  })
}

import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const questionTypeSortOptions = [
  "All",
  "name_asc",
  "name_desc",
  "position_desc",
  "mark_asc",
  "mark_desc",
] as const
export type QuestionTypeSortOption = (typeof questionTypeSortOptions)[number]

export const questionTypeSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  sort: parseAsStringEnum<QuestionTypeSortOption>(Array.from(questionTypeSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(5),
}

export function useQuestionTypeSearchParams() {
  return useQueryStates(questionTypeSearchParamsParsers, {
    shallow: true,
  })
}

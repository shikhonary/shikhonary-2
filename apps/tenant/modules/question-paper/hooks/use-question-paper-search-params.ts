import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const questionPaperSortEnum = [
  "All",
  "newest",
  "oldest",
  "title_asc",
  "title_desc",
] as const
export type QuestionPaperSortOption = (typeof questionPaperSortEnum)[number]

export const questionPaperSearchParamsParsers = {
  search: parseAsString.withDefault(""),
  classId: parseAsString.withDefault("All"),
  status: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<QuestionPaperSortOption>(Array.from(questionPaperSortEnum)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useQuestionPaperSearchParams() {
  return useQueryStates(questionPaperSearchParamsParsers, {
    shallow: true,
  })
}

import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const questionBankSortEnum = ["newest", "oldest"] as const
export type QuestionBankSortOption = (typeof questionBankSortEnum)[number]

export const questionBankViewModeEnum = ["grid", "table"] as const
export type QuestionBankViewMode = (typeof questionBankViewModeEnum)[number]

export const questionBankSearchParamsParsers = {
  search: parseAsString.withDefault(""),
  classId: parseAsString.withDefault("All"),
  subjectId: parseAsString.withDefault("All"),
  chapterId: parseAsString.withDefault("All"),
  category: parseAsString.withDefault("MCQ"),
  difficulty: parseAsString.withDefault("All"),
  board: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<QuestionBankSortOption>(Array.from(questionBankSortEnum)).withDefault("newest"),
  viewMode: parseAsStringEnum<QuestionBankViewMode>(Array.from(questionBankViewModeEnum)).withDefault("grid"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(12),
}

export function useQuestionBankSearchParams() {
  return useQueryStates(questionBankSearchParamsParsers, {
    shallow: true,
  })
}

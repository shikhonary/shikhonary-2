import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const shortAnswerSortOptions = [
  "All",
  "newest",
  "oldest",
  "question_asc",
  "question_desc",
] as const
export type ShortAnswerSortOption = (typeof shortAnswerSortOptions)[number]

export const shortAnswerSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  academicClassId: parseAsString.withDefault("All"),
  subjectId: parseAsString.withDefault("All"),
  chapterId: parseAsString.withDefault("All"),
  board: parseAsString.withDefault("All"),
  isActive: parseAsString.withDefault("All"),
  hasReport: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<ShortAnswerSortOption>(Array.from(shortAnswerSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useShortAnswerSearchParams() {
  return useQueryStates(shortAnswerSearchParamsParsers, {
    shallow: true,
  })
}

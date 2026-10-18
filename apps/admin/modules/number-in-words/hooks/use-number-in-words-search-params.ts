import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const numberInWordsSortOptions = [
  "All",
  "newest",
  "oldest",
  "number_asc",
  "number_desc",
  "popularity",
] as const
export type NumberInWordsSortOption = (typeof numberInWordsSortOptions)[number]

export const numberInWordsSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  classId: parseAsString.withDefault("All"),
  subjectId: parseAsString.withDefault("All"),
  chapterId: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<NumberInWordsSortOption>(Array.from(numberInWordsSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useNumberInWordsSearchParams() {
  return useQueryStates(numberInWordsSearchParamsParsers, {
    shallow: true,
  })
}

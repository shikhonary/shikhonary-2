import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const wordMeaningSortOptions = [
  "All",
  "newest",
  "oldest",
  "word_asc",
  "word_desc",
  "popularity",
] as const
export type WordMeaningSortOption = (typeof wordMeaningSortOptions)[number]

export const wordMeaningSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  classId: parseAsString.withDefault("All"),
  subjectId: parseAsString.withDefault("All"),
  chapterId: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<WordMeaningSortOption>(Array.from(wordMeaningSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useWordMeaningSearchParams() {
  return useQueryStates(wordMeaningSearchParamsParsers, {
    shallow: true,
  })
}

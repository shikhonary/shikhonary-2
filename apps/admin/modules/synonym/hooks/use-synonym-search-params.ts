import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const synonymSortOptions = [
  "All",
  "newest",
  "oldest",
  "word_asc",
  "word_desc",
  "popularity",
] as const
export type SynonymSortOption = (typeof synonymSortOptions)[number]

export const synonymSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  classId: parseAsString.withDefault("All"),
  subjectId: parseAsString.withDefault("All"),
  chapterId: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<SynonymSortOption>(Array.from(synonymSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useSynonymSearchParams() {
  return useQueryStates(synonymSearchParamsParsers, {
    shallow: true,
  })
}

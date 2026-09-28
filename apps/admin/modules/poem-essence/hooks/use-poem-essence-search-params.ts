import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const poemEssenceSortOptions = [
  "All",
  "newest",
  "oldest",
  "title_asc",
  "title_desc",
  "popularity",
] as const
export type PoemEssenceSortOption = (typeof poemEssenceSortOptions)[number]

export const poemEssenceSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  classId: parseAsString.withDefault("All"),
  subjectId: parseAsString.withDefault("All"),
  chapterId: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<PoemEssenceSortOption>(Array.from(poemEssenceSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function usePoemEssenceSearchParams() {
  return useQueryStates(poemEssenceSearchParamsParsers, {
    shallow: true,
  })
}

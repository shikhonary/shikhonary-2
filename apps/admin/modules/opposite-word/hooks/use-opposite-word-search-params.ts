import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const oppositeWordSortOptions = [
  "All",
  "newest",
  "oldest",
  "word_asc",
  "word_desc",
  "popularity",
] as const
export type OppositeWordSortOption = (typeof oppositeWordSortOptions)[number]

export const oppositeWordSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  classId: parseAsString.withDefault("All"),
  subjectId: parseAsString.withDefault("All"),
  chapterId: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<OppositeWordSortOption>(Array.from(oppositeWordSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useOppositeWordSearchParams() {
  return useQueryStates(oppositeWordSearchParamsParsers, {
    shallow: true,
  })
}

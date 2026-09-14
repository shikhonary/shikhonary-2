import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const poemSortOptions = [
  "All",
  "newest",
  "oldest",
  "title_asc",
  "title_desc",
  "popularity",
] as const
export type PoemSortOption = (typeof poemSortOptions)[number]

export const poemSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  subjectId: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<PoemSortOption>(Array.from(poemSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function usePoemSearchParams() {
  return useQueryStates(poemSearchParamsParsers, {
    shallow: true,
  })
}

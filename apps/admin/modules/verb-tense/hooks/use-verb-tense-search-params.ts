import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const verbTenseSortOptions = [
  "All",
  "newest",
  "oldest",
  "verb_asc",
  "verb_desc",
  "popularity",
] as const
export type VerbTenseSortOption = (typeof verbTenseSortOptions)[number]

export const verbTenseSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  subjectId: parseAsString.withDefault("All"),
  chapterId: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<VerbTenseSortOption>(Array.from(verbTenseSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useVerbTenseSearchParams() {
  return useQueryStates(verbTenseSearchParamsParsers, {
    shallow: true,
  })
}

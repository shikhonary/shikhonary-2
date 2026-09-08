import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const punctuationSortOptions = [
  "All",
  "newest",
  "oldest",
  "content_asc",
  "content_desc",
  "popularity",
] as const
export type PunctuationSortOption = (typeof punctuationSortOptions)[number]

export const punctuationSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  academicClassId: parseAsString.withDefault("All"),
  subjectId: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<PunctuationSortOption>(Array.from(punctuationSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function usePunctuationSearchParams() {
  return useQueryStates(punctuationSearchParamsParsers, {
    shallow: true,
  })
}

import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const changingSentenceSortOptions = [
  "All",
  "newest",
  "oldest",
  "content_asc",
  "content_desc",
  "popularity",
] as const
export type ChangingSentenceSortOption = (typeof changingSentenceSortOptions)[number]

export const changingSentenceSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  classId: parseAsString.withDefault("All"),
  subjectId: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<ChangingSentenceSortOption>(Array.from(changingSentenceSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useChangingSentenceSearchParams() {
  return useQueryStates(changingSentenceSearchParamsParsers, {
    shallow: true,
  })
}

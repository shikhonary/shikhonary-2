import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const shuddhoAshuddhoSortOptions = [
  "All",
  "newest",
  "oldest",
  "sentence_asc",
  "sentence_desc",
  "popularity",
] as const
export type ShuddhoAshuddhoSortOption = (typeof shuddhoAshuddhoSortOptions)[number]

export const shuddhoAshuddhoSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  classId: parseAsString.withDefault("All"),
  subjectId: parseAsString.withDefault("All"),
  chapterId: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<ShuddhoAshuddhoSortOption>(Array.from(shuddhoAshuddhoSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useShuddhoAshuddhoSearchParams() {
  return useQueryStates(shuddhoAshuddhoSearchParamsParsers, {
    shallow: true,
  })
}

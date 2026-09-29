import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const ekKothayProkashSortOptions = [
  "All",
  "newest",
  "oldest",
  "phrase_asc",
  "phrase_desc",
  "popularity",
] as const
export type EkKothayProkashSortOption = (typeof ekKothayProkashSortOptions)[number]

export const ekKothayProkashSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  classId: parseAsString.withDefault("All"),
  subjectId: parseAsString.withDefault("All"),
  chapterId: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<EkKothayProkashSortOption>(Array.from(ekKothayProkashSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useEkKothayProkashSearchParams() {
  return useQueryStates(ekKothayProkashSearchParamsParsers, {
    shallow: true,
  })
}

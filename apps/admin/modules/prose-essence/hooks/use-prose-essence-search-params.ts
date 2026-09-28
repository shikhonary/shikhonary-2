import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const proseEssenceSortOptions = [
  "All",
  "newest",
  "oldest",
  "title_asc",
  "title_desc",
  "popularity",
] as const
export type ProseEssenceSortOption = (typeof proseEssenceSortOptions)[number]

export const proseEssenceSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  classId: parseAsString.withDefault("All"),
  subjectId: parseAsString.withDefault("All"),
  chapterId: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<ProseEssenceSortOption>(Array.from(proseEssenceSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useProseEssenceSearchParams() {
  return useQueryStates(proseEssenceSearchParamsParsers, {
    shallow: true,
  })
}

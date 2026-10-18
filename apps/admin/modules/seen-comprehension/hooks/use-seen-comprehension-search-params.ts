import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const seenComprehensionSortOptions = [
  "All",
  "newest",
  "oldest",
  "title_asc",
  "title_desc",
] as const
export type SeenComprehensionSortOption = (typeof seenComprehensionSortOptions)[number]

export const seenComprehensionSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  subjectId: parseAsString.withDefault("All"),
  chapterId: parseAsString.withDefault("All"),
  comprehensionType: parseAsString.withDefault("All"),
  board: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<SeenComprehensionSortOption>(Array.from(seenComprehensionSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useSeenComprehensionSearchParams() {
  return useQueryStates(seenComprehensionSearchParamsParsers, {
    shallow: true,
  })
}

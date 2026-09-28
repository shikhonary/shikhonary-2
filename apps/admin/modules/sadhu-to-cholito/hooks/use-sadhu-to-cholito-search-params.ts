import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const sadhuToCholitoSortOptions = [
  "All",
  "newest",
  "oldest",
  "sadhuText_asc",
  "sadhuText_desc",
  "popularity",
] as const
export type SadhuToCholitoSortOption = (typeof sadhuToCholitoSortOptions)[number]

export const sadhuToCholitoSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  classId: parseAsString.withDefault("All"),
  subjectId: parseAsString.withDefault("All"),
  chapterId: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<SadhuToCholitoSortOption>(Array.from(sadhuToCholitoSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useSadhuToCholitoSearchParams() {
  return useQueryStates(sadhuToCholitoSearchParamsParsers, {
    shallow: true,
  })
}

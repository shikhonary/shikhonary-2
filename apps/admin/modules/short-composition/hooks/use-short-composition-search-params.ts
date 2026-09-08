import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const shortCompositionSortOptions = [
  "All",
  "newest",
  "oldest",
  "title_asc",
  "title_desc",
  "popularity",
] as const
export type ShortCompositionSortOption = (typeof shortCompositionSortOptions)[number]

export const shortCompositionSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  academicClassId: parseAsString.withDefault("All"),
  subjectId: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<ShortCompositionSortOption>(Array.from(shortCompositionSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useShortCompositionSearchParams() {
  return useQueryStates(shortCompositionSearchParamsParsers, {
    shallow: true,
  })
}

import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const letterSortOptions = [
  "All",
  "newest",
  "oldest",
  "title_asc",
  "title_desc",
  "popularity",
] as const
export type LetterSortOption = (typeof letterSortOptions)[number]

export const letterSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  academicClassId: parseAsString.withDefault("All"),
  subjectId: parseAsString.withDefault("All"),
  board: parseAsString.withDefault("All"),
  isActive: parseAsString.withDefault("All"),
  hasReport: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<LetterSortOption>(Array.from(letterSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useLetterSearchParams() {
  return useQueryStates(letterSearchParamsParsers, {
    shallow: true,
  })
}

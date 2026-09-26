import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const fillInTheBlanksWithoutCluesSortOptions = [
  "All",
  "newest",
  "oldest",
  "content_asc",
  "content_desc",
  "popularity",
] as const
export type FillInTheBlanksWithoutCluesSortOption = (typeof fillInTheBlanksWithoutCluesSortOptions)[number]

export const fillInTheBlanksWithoutCluesSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  subjectId: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<FillInTheBlanksWithoutCluesSortOption>(Array.from(fillInTheBlanksWithoutCluesSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useFillInTheBlanksWithoutCluesSearchParams() {
  return useQueryStates(fillInTheBlanksWithoutCluesSearchParamsParsers, {
    shallow: true,
  })
}

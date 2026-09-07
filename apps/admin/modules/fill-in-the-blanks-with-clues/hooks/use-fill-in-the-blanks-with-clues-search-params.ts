import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const fillInTheBlanksWithCluesSortOptions = [
  "All",
  "newest",
  "oldest",
  "content_asc",
  "content_desc",
  "popularity",
] as const
export type FillInTheBlanksWithCluesSortOption = (typeof fillInTheBlanksWithCluesSortOptions)[number]

export const fillInTheBlanksWithCluesSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  subjectId: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<FillInTheBlanksWithCluesSortOption>(Array.from(fillInTheBlanksWithCluesSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useFillInTheBlanksWithCluesSearchParams() {
  return useQueryStates(fillInTheBlanksWithCluesSearchParamsParsers, {
    shallow: true,
  })
}

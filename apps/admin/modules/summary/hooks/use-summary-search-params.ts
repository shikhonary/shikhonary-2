import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const summarySortOptions = [
  "All",
  "newest",
  "oldest",
  "title_asc",
  "title_desc",
  "popularity",
] as const
export type SummarySortOption = (typeof summarySortOptions)[number]

export const summarySearchParamsParsers = {
  query: parseAsString.withDefault(""),
  subjectId: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<SummarySortOption>(Array.from(summarySortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useSummarySearchParams() {
  return useQueryStates(summarySearchParamsParsers, {
    shallow: true,
  })
}

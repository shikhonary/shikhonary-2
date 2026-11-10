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
  academicClassId: parseAsString.withDefault("All"),
  subjectId: parseAsString.withDefault("All"),
  board: parseAsString.withDefault("All"),
  isActive: parseAsString.withDefault("All"),
  hasReport: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<SummarySortOption>(Array.from(summarySortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useSummarySearchParams() {
  return useQueryStates(summarySearchParamsParsers, {
    shallow: true,
  })
}

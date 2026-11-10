import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const newsReportSortOptions = [
  "All",
  "newest",
  "oldest",
  "title_asc",
  "title_desc",
  "popularity",
] as const
export type NewsReportSortOption = (typeof newsReportSortOptions)[number]

export const newsReportSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  academicClassId: parseAsString.withDefault("All"),
  subjectId: parseAsString.withDefault("All"),
  board: parseAsString.withDefault("All"),
  isActive: parseAsString.withDefault("All"),
  hasReport: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<NewsReportSortOption>(Array.from(newsReportSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useNewsReportSearchParams() {
  return useQueryStates(newsReportSearchParamsParsers, {
    shallow: true,
  })
}

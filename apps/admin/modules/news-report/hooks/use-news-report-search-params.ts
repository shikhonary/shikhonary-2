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
  subjectId: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<NewsReportSortOption>(Array.from(newsReportSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useNewsReportSearchParams() {
  return useQueryStates(newsReportSearchParamsParsers, {
    shallow: true,
  })
}

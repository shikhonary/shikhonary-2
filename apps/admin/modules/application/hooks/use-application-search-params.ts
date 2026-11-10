import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const applicationSortOptions = [
  "All",
  "newest",
  "oldest",
  "title_asc",
  "title_desc",
  "popularity",
] as const
export type ApplicationSortOption = (typeof applicationSortOptions)[number]

export const applicationSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  academicClassId: parseAsString.withDefault("All"),
  subjectId: parseAsString.withDefault("All"),
  board: parseAsString.withDefault("All"),
  isActive: parseAsString.withDefault("All"),
  hasReport: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<ApplicationSortOption>(Array.from(applicationSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useApplicationSearchParams() {
  return useQueryStates(applicationSearchParamsParsers, {
    shallow: true,
  })
}

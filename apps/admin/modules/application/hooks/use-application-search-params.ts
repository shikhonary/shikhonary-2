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
  subjectId: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<ApplicationSortOption>(Array.from(applicationSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useApplicationSearchParams() {
  return useQueryStates(applicationSearchParamsParsers, {
    shallow: true,
  })
}

import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const essenceSortOptions = [
  "All",
  "newest",
  "oldest",
  "title_asc",
  "title_desc",
  "popularity",
] as const
export type EssenceSortOption = (typeof essenceSortOptions)[number]

export const essenceSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  academicClassId: parseAsString.withDefault("All"),
  subjectId: parseAsString.withDefault("All"),
  board: parseAsString.withDefault("All"),
  isActive: parseAsString.withDefault("All"),
  hasReport: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<EssenceSortOption>(Array.from(essenceSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useEssenceSearchParams() {
  return useQueryStates(essenceSearchParamsParsers, {
    shallow: true,
  })
}

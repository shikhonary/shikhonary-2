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
  subjectId: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<EssenceSortOption>(Array.from(essenceSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useEssenceSearchParams() {
  return useQueryStates(essenceSearchParamsParsers, {
    shallow: true,
  })
}

import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const essaySortOptions = [
  "All",
  "newest",
  "oldest",
  "title_asc",
  "title_desc",
  "popularity",
] as const
export type EssaySortOption = (typeof essaySortOptions)[number]

export const essaySearchParamsParsers = {
  query: parseAsString.withDefault(""),
  subjectId: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<EssaySortOption>(Array.from(essaySortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useEssaySearchParams() {
  return useQueryStates(essaySearchParamsParsers, {
    shallow: true,
  })
}

import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const paragraphSortOptions = [
  "All",
  "newest",
  "oldest",
  "name_asc",
  "name_desc",
  "popularity",
] as const
export type ParagraphSortOption = (typeof paragraphSortOptions)[number]

export const paragraphSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  subjectId: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<ParagraphSortOption>(Array.from(paragraphSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useParagraphSearchParams() {
  return useQueryStates(paragraphSearchParamsParsers, {
    shallow: true,
  })
}

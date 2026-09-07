import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const partsOfSpeechSortOptions = [
  "All",
  "newest",
  "oldest",
  "content_asc",
  "content_desc",
  "popularity",
] as const
export type PartsOfSpeechSortOption = (typeof partsOfSpeechSortOptions)[number]

export const partsOfSpeechSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  subjectId: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<PartsOfSpeechSortOption>(Array.from(partsOfSpeechSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function usePartsOfSpeechSearchParams() {
  return useQueryStates(partsOfSpeechSearchParamsParsers, {
    shallow: true,
  })
}

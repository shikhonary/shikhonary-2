import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const juktobornoSortOptions = [
  "All",
  "newest",
  "oldest",
  "juktoborno_asc",
  "juktoborno_desc",
  "popularity",
] as const
export type JuktobornoSortOption = (typeof juktobornoSortOptions)[number]

export const juktobornoSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  classId: parseAsString.withDefault("All"),
  subjectId: parseAsString.withDefault("All"),
  chapterId: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<JuktobornoSortOption>(Array.from(juktobornoSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useJuktobornoSearchParams() {
  return useQueryStates(juktobornoSearchParamsParsers, {
    shallow: true,
  })
}

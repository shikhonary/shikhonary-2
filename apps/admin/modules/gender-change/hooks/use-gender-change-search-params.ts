import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const genderChangeSortOptions = [
  "All",
  "newest",
  "oldest",
  "word_asc",
  "word_desc",
  "popularity",
] as const
export type GenderChangeSortOption = (typeof genderChangeSortOptions)[number]

export const genderChangeSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  classId: parseAsString.withDefault("All"),
  subjectId: parseAsString.withDefault("All"),
  chapterId: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<GenderChangeSortOption>(Array.from(genderChangeSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useGenderChangeSearchParams() {
  return useQueryStates(genderChangeSearchParamsParsers, {
    shallow: true,
  })
}

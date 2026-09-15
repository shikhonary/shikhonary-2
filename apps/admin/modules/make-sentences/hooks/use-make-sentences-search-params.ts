import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const makeSentencesSortOptions = [
  "All",
  "newest",
  "oldest",
  "word_asc",
  "word_desc",
  "popularity",
] as const
export type MakeSentencesSortOption = (typeof makeSentencesSortOptions)[number]

export const makeSentencesSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  classId: parseAsString.withDefault("All"),
  subjectId: parseAsString.withDefault("All"),
  chapterId: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<MakeSentencesSortOption>(Array.from(makeSentencesSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useMakeSentencesSearchParams() {
  return useQueryStates(makeSentencesSearchParamsParsers, {
    shallow: true,
  })
}

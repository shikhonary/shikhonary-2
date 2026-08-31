import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const amplificationSortOptions = [
  "All",
  "newest",
  "oldest",
  "name_asc",
  "name_desc",
  "popularity",
] as const
export type AmplificationSortOption = (typeof amplificationSortOptions)[number]

export const amplificationSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  subjectId: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<AmplificationSortOption>(Array.from(amplificationSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useAmplificationSearchParams() {
  return useQueryStates(amplificationSearchParamsParsers, {
    shallow: true,
  })
}

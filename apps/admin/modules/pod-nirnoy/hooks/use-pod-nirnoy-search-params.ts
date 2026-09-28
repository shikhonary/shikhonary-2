import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const podNirnoySortOptions = [
  "All",
  "newest",
  "oldest",
  "content_asc",
  "content_desc",
  "popularity",
] as const
export type PodNirnoySortOption = (typeof podNirnoySortOptions)[number]

export const podNirnoySearchParamsParsers = {
  query: parseAsString.withDefault(""),
  subjectId: parseAsString.withDefault("All"),
  chapterId: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<PodNirnoySortOption>(Array.from(podNirnoySortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function usePodNirnoySearchParams() {
  return useQueryStates(podNirnoySearchParamsParsers, {
    shallow: true,
  })
}

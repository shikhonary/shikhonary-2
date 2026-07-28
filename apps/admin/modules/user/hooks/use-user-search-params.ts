import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const userSortEnum = [
  "All",
  "desc",
  "asc",
  "newest",
  "oldest",
  "name_asc",
  "name_desc",
] as const
export type UserSortOption = (typeof userSortEnum)[number]

export const userSearchParamsParsers = {
  search: parseAsString.withDefault(""),
  role: parseAsString.withDefault("All"),
  status: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<UserSortOption>(Array.from(userSortEnum)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(5),
}

export function useUserSearchParams() {
  return useQueryStates(userSearchParamsParsers, {
    shallow: true,
  })
}

import {
  useQueryStates,
  parseAsString,
  parseAsInteger,
  parseAsStringEnum,
} from "nuqs"

export const trackerTabOptions = ["matrix", "attachments", "quality"] as const
export type TrackerTabOption = (typeof trackerTabOptions)[number]

export const contentTrackerSearchParamsParsers = {
  tab: parseAsStringEnum<TrackerTabOption>(Array.from(trackerTabOptions)).withDefault("matrix"),
  classId: parseAsString.withDefault("All"),
  subjectId: parseAsString.withDefault("All"),
  chapterId: parseAsString.withDefault("All"),
  status: parseAsString.withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useContentTrackerSearchParams() {
  return useQueryStates(contentTrackerSearchParamsParsers, {
    shallow: true,
  })
}

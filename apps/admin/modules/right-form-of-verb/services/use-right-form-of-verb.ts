import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListRightFormOfVerbsInput,
  RightFormOfVerbsStatsInput,
} from "@workspace/api"

/**
 * Hook to list Right Form of Verbs with filtering & pagination.
 */
export function useRightFormOfVerbList(input: ListRightFormOfVerbsInput = { limit: 20 }) {
  return useQuery(trpc.rightFormOfVerb.list.queryOptions(input))
}

/**
 * Hook to fetch summary statistics for Right Form of Verbs using suspense.
 */
export function useRightFormOfVerbStats(input?: RightFormOfVerbsStatsInput) {
  return useSuspenseQuery(trpc.rightFormOfVerb.stats.queryOptions(input))
}

/**
 * Hook to fetch a single Right Form of Verbs by ID.
 */
export function useRightFormOfVerbById(id: string, enabled = true) {
  return useQuery({
    ...trpc.rightFormOfVerb.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to create a new Right Form of Verbs record.
 */
export function useCreateRightFormOfVerb() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.rightFormOfVerb.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.rightFormOfVerb.pathFilter())
    },
  })
}

/**
 * Hook to update an existing Right Form of Verbs record.
 */
export function useUpdateRightFormOfVerb() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.rightFormOfVerb.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.rightFormOfVerb.pathFilter())
    },
  })
}

/**
 * Hook to delete a single Right Form of Verbs record.
 */
export function useDeleteRightFormOfVerb() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.rightFormOfVerb.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.rightFormOfVerb.pathFilter())
    },
  })
}

/**
 * Hook to bulk delete Right Form of Verbs records.
 */
export function useBulkDeleteRightFormOfVerbs() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.rightFormOfVerb.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.rightFormOfVerb.pathFilter())
    },
  })
}

/**
 * Hook to bulk import Right Form of Verbs records.
 */
export function useImportRightFormOfVerbs() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.rightFormOfVerb.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.rightFormOfVerb.pathFilter())
    },
  })
}

/**
 * Hook to fetch academic classes for select options list (returns array directly).
 */
export function useAcademicClassesForSelection() {
  return useQuery({
    ...trpc.academicClass.list.queryOptions({ limit: 100 }),
    select: (data) => data.academicClasses ?? [],
  })
}

/**
 * Hook to fetch academic subjects for dropdown select list (returns array directly).
 */
export function useSubjectsForSelection(input?: { academicClassId?: string }) {
  const classId = input?.academicClassId === "All" ? undefined : input?.academicClassId
  return useQuery({
    ...trpc.academicSubject.list.queryOptions({
      limit: 100,
      classId,
    }),
    select: (data) => data.academicSubjects ?? [],
  })
}

/**
 * Hook to fetch academic chapters for dropdown select list (returns array directly).
 */
export function useChaptersForSelection(input?: { subjectId?: string }) {
  const subjectId = input?.subjectId === "All" ? undefined : input?.subjectId
  return useQuery({
    ...trpc.academicChapter.list.queryOptions({
      limit: 100,
      subjectId,
    }),
    select: (data) => data.academicChapters ?? [],
    enabled: input === undefined || (subjectId !== undefined && subjectId !== ""),
  })
}

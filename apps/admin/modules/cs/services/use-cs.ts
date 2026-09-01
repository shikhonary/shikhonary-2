import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListCsInput,
  CsStatsInput,
} from "@workspace/api"

/**
 * Hook to list CS questions with filtering & pagination.
 */
export function useCsList(input: ListCsInput = { limit: 20 }) {
  return useQuery(trpc.cs.list.queryOptions(input))
}

/**
 * Hook to fetch summary statistics for CS questions using suspense.
 */
export function useCsStats(input?: CsStatsInput) {
  return useSuspenseQuery(trpc.cs.stats.queryOptions(input))
}

/**
 * Hook to fetch a single CS question by ID.
 */
export function useCsById(id: string, enabled = true) {
  return useQuery({
    ...trpc.cs.byId.queryOptions({ id: id || "" }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to create a new CS question record.
 */
export function useCreateCs() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.cs.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.cs.pathFilter())
    },
  })
}

/**
 * Hook to update an existing CS question record.
 */
export function useUpdateCs() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.cs.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.cs.pathFilter())
    },
  })
}

/**
 * Hook to delete a single CS question record.
 */
export function useDeleteCs() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.cs.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.cs.pathFilter())
    },
  })
}

/**
 * Hook to bulk delete CS question records.
 */
export function useBulkDeleteCs() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.cs.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.cs.pathFilter())
    },
  })
}

/**
 * Hook to toggle CS question active state.
 */
export function useToggleCsActive() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.cs.toggleActive.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.cs.pathFilter())
    },
  })
}

/**
 * Hook to bulk import CS question records.
 */
export function useImportCs() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.cs.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.cs.pathFilter())
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

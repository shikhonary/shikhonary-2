import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListChangingSentencesInput,
  ChangingSentencesStatsInput,
} from "@workspace/api"

/**
 * Hook to list Changing Sentences with filtering & pagination.
 */
export function useChangingSentenceList(input: ListChangingSentencesInput = { limit: 20 }) {
  return useQuery(trpc.changingSentence.list.queryOptions(input))
}

/**
 * Hook to fetch summary statistics for Changing Sentences using suspense.
 */
export function useChangingSentenceStats(input?: ChangingSentencesStatsInput) {
  return useSuspenseQuery(trpc.changingSentence.stats.queryOptions(input))
}

/**
 * Hook to fetch a single Changing Sentence by ID.
 */
export function useChangingSentenceById(id: string, enabled = true) {
  return useQuery({
    ...trpc.changingSentence.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to create a new Changing Sentence record.
 */
export function useCreateChangingSentence() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.changingSentence.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.changingSentence.pathFilter())
    },
  })
}

/**
 * Hook to update an existing Changing Sentence record.
 */
export function useUpdateChangingSentence() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.changingSentence.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.changingSentence.pathFilter())
    },
  })
}

/**
 * Hook to delete a single Changing Sentence record.
 */
export function useDeleteChangingSentence() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.changingSentence.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.changingSentence.pathFilter())
    },
  })
}

/**
 * Hook to bulk delete Changing Sentences records.
 */
export function useBulkDeleteChangingSentences() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.changingSentence.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.changingSentence.pathFilter())
    },
  })
}

/**
 * Hook to bulk import Changing Sentences records.
 */
export function useImportChangingSentences() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.changingSentence.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.changingSentence.pathFilter())
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

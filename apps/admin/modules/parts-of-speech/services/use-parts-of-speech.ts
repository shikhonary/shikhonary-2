import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListPartsOfSpeechInput,
  PartsOfSpeechStatsInput,
} from "@workspace/api"

/**
 * Hook to list Parts of Speech with filtering & pagination.
 */
export function usePartsOfSpeechList(input: ListPartsOfSpeechInput = { limit: 20 }) {
  return useQuery(trpc.partsOfSpeech.list.queryOptions(input))
}

/**
 * Hook to fetch summary statistics for Parts of Speech using suspense.
 */
export function usePartsOfSpeechStats(input?: PartsOfSpeechStatsInput) {
  return useSuspenseQuery(trpc.partsOfSpeech.stats.queryOptions(input))
}

/**
 * Hook to fetch a single Parts of Speech by ID.
 */
export function usePartsOfSpeechById(id: string, enabled = true) {
  return useQuery({
    ...trpc.partsOfSpeech.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to create a new Parts of Speech record.
 */
export function useCreatePartsOfSpeech() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.partsOfSpeech.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.partsOfSpeech.pathFilter())
    },
  })
}

/**
 * Hook to update an existing Parts of Speech record.
 */
export function useUpdatePartsOfSpeech() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.partsOfSpeech.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.partsOfSpeech.pathFilter())
    },
  })
}

/**
 * Hook to delete a single Parts of Speech record.
 */
export function useDeletePartsOfSpeech() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.partsOfSpeech.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.partsOfSpeech.pathFilter())
    },
  })
}

/**
 * Hook to bulk delete Parts of Speech records.
 */
export function useBulkDeletePartsOfSpeech() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.partsOfSpeech.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.partsOfSpeech.pathFilter())
    },
  })
}

/**
 * Hook to bulk import Parts of Speech records.
 */
export function useImportPartsOfSpeech() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.partsOfSpeech.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.partsOfSpeech.pathFilter())
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

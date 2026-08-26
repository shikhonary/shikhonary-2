import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListShortAnswersInput,
  ShortAnswerStatsInput,
  CreateShortAnswerInput,
  UpdateShortAnswerInput,
} from "@workspace/api"

export function useShortAnswersList(input: ListShortAnswersInput) {
  return useQuery(trpc.shortAnswer.list.queryOptions(input))
}

export function useShortAnswerStats(input?: ShortAnswerStatsInput) {
  return useSuspenseQuery(trpc.shortAnswer.stats.queryOptions(input || {}))
}

export function useShortAnswerById(id: string, enabled = true) {
  return useQuery({
    ...trpc.shortAnswer.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

export function useCreateShortAnswer() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.shortAnswer.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.shortAnswer.pathFilter())
    },
  })
}

export function useUpdateShortAnswer() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.shortAnswer.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.shortAnswer.pathFilter())
    },
  })
}

export function useDeleteShortAnswer() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.shortAnswer.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.shortAnswer.pathFilter())
    },
  })
}

export function useBulkDeleteShortAnswers() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.shortAnswer.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.shortAnswer.pathFilter())
    },
  })
}

export function useToggleShortAnswerActive() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.shortAnswer.toggleActive.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.shortAnswer.pathFilter())
    },
  })
}

export function useImportShortAnswers() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.shortAnswer.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.shortAnswer.pathFilter())
    },
  })
}

export function useAcademicClassesForSelection() {
  return useQuery({
    ...trpc.academicClass.list.queryOptions({ limit: 100 }),
    select: (data) => data.academicClasses ?? [],
  })
}

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

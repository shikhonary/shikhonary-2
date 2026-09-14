import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListDescriptiveQuestionsInput,
  DescriptiveQuestionStatsInput,
} from "@workspace/api"

export function useDescriptiveQuestionsList(input: ListDescriptiveQuestionsInput = { limit: 20 }) {
  return useQuery(trpc.descriptiveQuestion.list.queryOptions(input))
}

export function useDescriptiveQuestionStats(input?: DescriptiveQuestionStatsInput) {
  return useSuspenseQuery(trpc.descriptiveQuestion.stats.queryOptions(input))
}

export function useDescriptiveQuestionById(id: string, enabled = true) {
  return useQuery({
    ...trpc.descriptiveQuestion.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

export function useCreateDescriptiveQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.descriptiveQuestion.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.descriptiveQuestion.pathFilter())
    },
  })
}

export function useUpdateDescriptiveQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.descriptiveQuestion.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.descriptiveQuestion.pathFilter())
    },
  })
}

export function useDeleteDescriptiveQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.descriptiveQuestion.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.descriptiveQuestion.pathFilter())
    },
  })
}

export function useBulkDeleteDescriptiveQuestions() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.descriptiveQuestion.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.descriptiveQuestion.pathFilter())
    },
  })
}

export function useImportDescriptiveQuestions() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.descriptiveQuestion.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.descriptiveQuestion.pathFilter())
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

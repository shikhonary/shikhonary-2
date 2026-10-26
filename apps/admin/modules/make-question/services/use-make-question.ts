import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListMakeQuestionInput,
  MakeQuestionStatsInput,
  ToggleMakeQuestionActiveInput,
} from "@workspace/api"

export function useMakeQuestionList(input: ListMakeQuestionInput = { limit: 20 }) {
  return useQuery(trpc.makeQuestion.list.queryOptions(input))
}

export function useMakeQuestionStats(input?: MakeQuestionStatsInput) {
  return useSuspenseQuery(trpc.makeQuestion.stats.queryOptions(input))
}

export function useMakeQuestionById(id: string, enabled = true) {
  return useQuery({
    ...trpc.makeQuestion.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

export function useBoardYearsForSelection(input: {
  subjectId?: string
  chapterId?: string
  academicChapterId?: string
}) {
  const subjectId = input.subjectId === "All" || !input.subjectId ? "" : input.subjectId
  const chapterId = input.chapterId === "All" ? undefined : input.chapterId
  const academicChapterId = input.academicChapterId === "All" ? undefined : input.academicChapterId

  return useQuery({
    ...trpc.makeQuestion.boardYears.queryOptions(
      {
        subjectId,
        chapterId,
        academicChapterId,
      },
      {
        enabled: Boolean(subjectId),
      }
    ),
  })
}

export function useToggleMakeQuestionActive() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.makeQuestion.toggleActive.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.makeQuestion.pathFilter())
    },
  })
}

export function useCreateMakeQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.makeQuestion.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.makeQuestion.pathFilter())
    },
  })
}

export function useUpdateMakeQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.makeQuestion.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.makeQuestion.pathFilter())
    },
  })
}

export function useDeleteMakeQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.makeQuestion.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.makeQuestion.pathFilter())
    },
  })
}

export function useBulkDeleteMakeQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.makeQuestion.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.makeQuestion.pathFilter())
    },
  })
}

export function useImportMakeQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.makeQuestion.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.makeQuestion.pathFilter())
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

export function useEssencesForSelection(input?: { subjectId?: string }) {
  const subjectId = input?.subjectId === "All" ? undefined : input?.subjectId
  return useQuery({
    ...trpc.essence.list.queryOptions({
      limit: 100,
      subjectId,
    }),
    select: (data) => data.items ?? [],
    enabled: input === undefined || (subjectId !== undefined && subjectId !== ""),
  })
}

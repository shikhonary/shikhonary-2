import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListMakeSentencesInput,
  MakeSentencesStatsInput,
  ToggleMakeSentencesActiveInput,
} from "@workspace/api"

export function useMakeSentencesList(input: ListMakeSentencesInput = { limit: 20 }) {
  return useQuery(trpc.makeSentences.list.queryOptions(input))
}

export function useMakeSentencesStats(input?: MakeSentencesStatsInput) {
  return useSuspenseQuery(trpc.makeSentences.stats.queryOptions(input))
}

export function useMakeSentencesById(id: string, enabled = true) {
  return useQuery({
    ...trpc.makeSentences.byId.queryOptions({ id }),
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
    ...trpc.makeSentences.boardYears.queryOptions(
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

export function useToggleMakeSentencesActive() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.makeSentences.toggleActive.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.makeSentences.pathFilter())
    },
  })
}

export function useCreateMakeSentences() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.makeSentences.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.makeSentences.pathFilter())
    },
  })
}

export function useUpdateMakeSentences() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.makeSentences.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.makeSentences.pathFilter())
    },
  })
}

export function useDeleteMakeSentences() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.makeSentences.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.makeSentences.pathFilter())
    },
  })
}

export function useBulkDeleteMakeSentences() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.makeSentences.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.makeSentences.pathFilter())
    },
  })
}

export function useImportMakeSentences() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.makeSentences.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.makeSentences.pathFilter())
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

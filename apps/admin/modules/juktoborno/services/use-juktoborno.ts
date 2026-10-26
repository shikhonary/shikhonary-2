import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListJuktobornoInput,
  JuktobornoStatsInput,
  ToggleJuktobornoActiveInput,
} from "@workspace/api"

export function useJuktobornoList(input: ListJuktobornoInput = { limit: 20 }) {
  return useQuery(trpc.juktoborno.list.queryOptions(input))
}

export function useJuktobornoStats(input?: JuktobornoStatsInput) {
  return useSuspenseQuery(trpc.juktoborno.stats.queryOptions(input))
}

export function useJuktobornoById(id: string, enabled = true) {
  return useQuery({
    ...trpc.juktoborno.byId.queryOptions({ id }),
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
    ...trpc.juktoborno.boardYears.queryOptions(
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

export function useToggleJuktobornoActive() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.juktoborno.toggleActive.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.juktoborno.pathFilter())
    },
  })
}

export function useCreateJuktoborno() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.juktoborno.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.juktoborno.pathFilter())
    },
  })
}

export function useUpdateJuktoborno() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.juktoborno.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.juktoborno.pathFilter())
    },
  })
}

export function useDeleteJuktoborno() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.juktoborno.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.juktoborno.pathFilter())
    },
  })
}

export function useBulkDeleteJuktoborno() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.juktoborno.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.juktoborno.pathFilter())
    },
  })
}

export function useImportJuktoborno() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.juktoborno.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.juktoborno.pathFilter())
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

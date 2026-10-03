import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListDanBamMilkoronInput,
  DanBamMilkoronStatsInput,
} from "@workspace/api"

export function useDanBamMilkoronList(input: ListDanBamMilkoronInput = { limit: 20 }) {
  return useQuery(trpc.danBamMilkoron.list.queryOptions(input))
}

export function useDanBamMilkoronStats(input?: DanBamMilkoronStatsInput) {
  return useSuspenseQuery(trpc.danBamMilkoron.stats.queryOptions(input))
}

export function useDanBamMilkoronById(id: string, enabled = true) {
  return useQuery({
    ...trpc.danBamMilkoron.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

export function useCreateDanBamMilkoron() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.danBamMilkoron.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.danBamMilkoron.pathFilter())
    },
  })
}

export function useUpdateDanBamMilkoron() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.danBamMilkoron.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.danBamMilkoron.pathFilter())
    },
  })
}

export function useDeleteDanBamMilkoron() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.danBamMilkoron.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.danBamMilkoron.pathFilter())
    },
  })
}

export function useBulkDeleteDanBamMilkoron() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.danBamMilkoron.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.danBamMilkoron.pathFilter())
    },
  })
}

export function useImportDanBamMilkoron() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.danBamMilkoron.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.danBamMilkoron.pathFilter())
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

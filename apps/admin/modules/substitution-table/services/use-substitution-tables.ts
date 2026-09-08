import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListSubstitutionTablesInput,
  SubstitutionTableStatsInput,
} from "@workspace/api"

/**
 * Hook to list Substitution Tables with filtering & pagination.
 */
export function useSubstitutionTablesList(input: ListSubstitutionTablesInput = { limit: 20 }) {
  return useQuery(trpc.substitutionTable.list.queryOptions(input))
}

/**
 * Hook to fetch summary statistics for Substitution Tables using suspense.
 */
export function useSubstitutionTablesStats(input?: SubstitutionTableStatsInput) {
  return useSuspenseQuery(trpc.substitutionTable.stats.queryOptions(input))
}

/**
 * Hook to fetch a single Substitution Table item by ID.
 */
export function useSubstitutionTableById(id: string, enabled = true) {
  return useQuery({
    ...trpc.substitutionTable.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to create a new Substitution Table record.
 */
export function useCreateSubstitutionTable() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.substitutionTable.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.substitutionTable.pathFilter())
    },
  })
}

/**
 * Hook to update an existing Substitution Table record.
 */
export function useUpdateSubstitutionTable() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.substitutionTable.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.substitutionTable.pathFilter())
    },
  })
}

/**
 * Hook to delete a single Substitution Table record.
 */
export function useDeleteSubstitutionTable() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.substitutionTable.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.substitutionTable.pathFilter())
    },
  })
}

/**
 * Hook to bulk delete Substitution Table records.
 */
export function useBulkDeleteSubstitutionTables() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.substitutionTable.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.substitutionTable.pathFilter())
    },
  })
}

/**
 * Hook to bulk import Substitution Table records.
 */
export function useImportSubstitutionTables() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.substitutionTable.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.substitutionTable.pathFilter())
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

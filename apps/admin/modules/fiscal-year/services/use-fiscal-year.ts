import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type { ListFiscalYearsInput } from "@workspace/api"

/**
 * Hook to list fiscal years.
 */
export function useFiscalYearsList(
  input: ListFiscalYearsInput = { limit: 100 }
) {
  return useQuery(trpc.fiscalYear.list.queryOptions(input))
}

/**
 * Hook to fetch a single fiscal year by ID.
 */
export function useFiscalYearById(id: string, enabled = true) {
  return useQuery({
    ...trpc.fiscalYear.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to fetch tenants/schools list.
 */
export function useTenantsList() {
  return useQuery(trpc.tenant.list.queryOptions({ limit: 100 }))
}

/**
 * Hook to create a new fiscal year.
 */
export function useCreateFiscalYear() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.fiscalYear.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.fiscalYear.pathFilter())
    },
  })
}

/**
 * Hook to update an existing fiscal year.
 */
export function useUpdateFiscalYear() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.fiscalYear.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.fiscalYear.pathFilter())
    },
  })
}

/**
 * Hook to delete a fiscal year.
 */
export function useDeleteFiscalYear() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.fiscalYear.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.fiscalYear.pathFilter())
    },
  })
}

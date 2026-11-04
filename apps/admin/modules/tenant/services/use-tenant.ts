import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type { ListTenantsInput, TenantStatsInput } from "@workspace/api"
import { toast } from "@workspace/ui/components/sonner"

/**
 * Hook to list tenants / institutions with filters and pagination.
 */
export function useTenantsList(
  input: ListTenantsInput = { limit: 10 }
) {
  return useQuery(trpc.tenant.list.queryOptions(input))
}

/**
 * Hook to fetch tenant statistics.
 */
export function useTenantStats(input?: TenantStatsInput) {
  return useQuery(trpc.tenant.stats.queryOptions(input))
}

/**
 * Hook to fetch a single tenant by ID.
 */
export function useTenantById(id: string, enabled = true) {
  return useQuery({
    ...trpc.tenant.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to create a new tenant.
 */
export function useCreateTenant() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.tenant.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.tenant.pathFilter())
    },
  })
}

/**
 * Hook to update an existing tenant.
 */
export function useUpdateTenant() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.tenant.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.tenant.pathFilter())
    },
  })
}

/**
 * Hook to delete a tenant.
 */
export function useDeleteTenant() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.tenant.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.tenant.pathFilter())
    },
  })
}

/**
 * Hook to toggle active status of a tenant.
 */
export function useToggleTenantStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.tenant.toggleStatus.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.tenant.pathFilter())
      toast.success("প্রতিষ্ঠানের স্ট্যাটাস সফলভাবে পরিবর্তন করা হয়েছে।")
    },
    onError: (err: any) => toast.error(err.message || "স্ট্যাটাস পরিবর্তন করতে ব্যর্থ হয়েছে"),
  })
}

/**
 * Hook to send team member invitation.
 */
export function useSendTenantInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.tenant.sendInvitation.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.tenant.pathFilter())
    },
  })
}

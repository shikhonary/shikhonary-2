import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type { ListSubscriptionPlansInput } from "@workspace/api"

/**
 * Hook to list subscription plans.
 */
export function useSubscriptionPlansList(
  input: ListSubscriptionPlansInput = { limit: 50 }
) {
  return useQuery(trpc.subscriptionPlan.list.queryOptions(input))
}

/**
 * Hook to fetch a single subscription plan by ID.
 */
export function useSubscriptionPlanById(id: string, enabled = true) {
  return useQuery({
    ...trpc.subscriptionPlan.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to delete a subscription plan.
 */
export function useDeleteSubscriptionPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.subscriptionPlan.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.subscriptionPlan.pathFilter())
    },
  })
}

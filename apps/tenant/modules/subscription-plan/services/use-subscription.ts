"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { toast } from "@workspace/ui/components/sonner"

export function useMySubscription() {
  return useQuery(trpc.subscription.getMySubscription.queryOptions())
}

export function useAvailableSubscriptionPlans() {
  return useQuery(trpc.subscription.listAvailablePlans.queryOptions())
}

export function useSubscriptionInvoices() {
  return useQuery(trpc.subscription.getMyInvoices.queryOptions())
}

export function useChangeSubscriptionPlan() {
  const queryClient = useQueryClient()

  return useMutation(
    trpc.subscription.requestPlanChange.mutationOptions({
      onSuccess: () => {
        toast.success("সাবস্ক্রিপশন প্ল্যান সফলভাবে হালনাগাদ করা হয়েছে")
        queryClient.invalidateQueries({
          queryKey: trpc.subscription.getMySubscription.queryKey(),
        })
        queryClient.invalidateQueries({
          queryKey: trpc.subscription.getMyInvoices.queryKey(),
        })
      },
      onError: (err: any) => {
        toast.error(err.message || "প্ল্যান পরিবর্তনে ত্রুটি হয়েছে")
      },
    })
  )
}

export function useCreditBalance() {
  return useQuery(trpc.credit.getBalance.queryOptions())
}

export function useCreditTransactions(limit: number = 10) {
  return useQuery(
    trpc.credit.getTransactions.queryOptions({ limit })
  )
}

export function useCreditPacks() {
  return useQuery(trpc.credit.listPacks.queryOptions())
}

export function usePurchaseCreditPack() {
  const queryClient = useQueryClient()

  return useMutation(
    trpc.credit.purchasePack.mutationOptions({
      onSuccess: (data: any) => {
        toast.success(
          `অভিনন্দন! আপনার ওয়ালেটে ${data?.creditsAdded || ""} ক্রেডিট সফলভাবে যোগ হয়েছে`
        )
        queryClient.invalidateQueries({
          queryKey: trpc.credit.getBalance.queryKey(),
        })
        queryClient.invalidateQueries({
          queryKey: trpc.subscription.getMySubscription.queryKey(),
        })
        queryClient.invalidateQueries({
          queryKey: trpc.credit.getTransactions.queryKey(),
        })
      },
      onError: (err: any) => {
        toast.error(err.message || "ক্রেডিট টপ-আপ ব্যর্থ হয়েছে")
      },
    })
  )
}

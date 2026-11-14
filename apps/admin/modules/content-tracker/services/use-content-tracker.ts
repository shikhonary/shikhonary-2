"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  GetGlobalSummaryInput,
  GetMissingAttachmentsInput,
  GetQualityQueueInput,
} from "@workspace/api"

export function useContentTrackerGlobalSummary(input?: GetGlobalSummaryInput) {
  return useQuery(trpc.contentTracker.getGlobalSummary.queryOptions(input ?? {}))
}

export function useContentTrackerSubjectPipeline(subjectId?: string) {
  return useQuery({
    ...trpc.contentTracker.getSubjectPipeline.queryOptions({
      subjectId: subjectId || "",
    }),
    enabled: Boolean(subjectId && subjectId.length > 0),
  })
}

export function useContentTrackerMissingAttachments(
  input: GetMissingAttachmentsInput,
) {
  return useQuery(trpc.contentTracker.getMissingAttachments.queryOptions(input))
}

export function useContentTrackerQualityQueue(input: GetQualityQueueInput) {
  return useQuery(trpc.contentTracker.getQualityQueue.queryOptions(input))
}

export function useContentTrackerUpdateAttachmentUrl() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.contentTracker.updateAttachmentUrl.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.contentTracker.pathFilter())
    },
  })
}

export function useContentTrackerToggleQuestionActive() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.contentTracker.toggleQuestionActive.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.contentTracker.pathFilter())
      queryClient.invalidateQueries(trpc.mcq.pathFilter())
      queryClient.invalidateQueries(trpc.cq.pathFilter())
      queryClient.invalidateQueries(trpc.shortAnswer.pathFilter())
    },
  })
}

export function useContentTrackerResolveReport() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.contentTracker.resolveReport.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.contentTracker.pathFilter())
    },
  })
}

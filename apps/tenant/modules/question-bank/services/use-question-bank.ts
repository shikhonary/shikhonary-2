"use client"

import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type { ListQuestionBankInput } from "@workspace/api"

export function useQuestionBankClasses(enabled = true) {
  return useQuery({
    ...trpc.questionBank.getClasses.queryOptions(),
    enabled,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  })
}

export function useQuestionBankList(
  input: ListQuestionBankInput,
  enabled = true
) {
  return useQuery({
    ...trpc.questionBank.list.queryOptions(input),
    enabled,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2,
  })
}

export function useQuestionBankStats(
  input: { classId?: string; subjectId?: string } = {},
  enabled = true
) {
  return useQuery({
    ...trpc.questionBank.stats.queryOptions(input),
    enabled,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  })
}

export function useQuestionBankFilterOptions(
  input: { classId?: string; subjectId?: string } = {},
  enabled = true
) {
  return useQuery({
    ...trpc.questionBank.filterOptions.queryOptions(input),
    enabled,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  })
}

export function useQuestionBankDetails(
  id: string,
  category: string,
  enabled = true
) {
  return useQuery({
    ...trpc.questionBank.byId.queryOptions({ id, category }),
    enabled: Boolean(id && category) && enabled,
    refetchOnWindowFocus: false,
  })
}

export function useQuestionBankClassDetails(classId: string, enabled = true) {
  return useQuery({
    ...trpc.questionBank.classDetails.queryOptions({ classId }),
    enabled: Boolean(classId) && enabled,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  })
}

export function useQuestionBankSubjectDetails(
  classId: string,
  subjectId: string,
  enabled = true
) {
  return useQuery({
    ...trpc.questionBank.subjectDetails.queryOptions({ classId, subjectId }),
    enabled: Boolean(classId && subjectId) && enabled,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  })
}



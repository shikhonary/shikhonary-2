"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import {
  Layers,
  ArrowLeft,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  CheckSquare,
  Tag,
  Pen,
  AlertTriangle,
  Info,
  Loader2,
  FileText,
  Building,
  Receipt,
  MessageSquare,
  Globe,
  BookOpen,
  UserCheck,
  Library,
  Bus,
  Database,
} from "lucide-react"

interface SubscriptionPlanFormViewProps {
  planId?: string
}

export function SubscriptionPlanFormView({ planId }: SubscriptionPlanFormViewProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const isEdit = !!planId

  // Fetch plan if in edit mode
  const { data: plan, isLoading: isLoadingPlan, isError } = useQuery(
    trpc.subscriptionPlan.byId.queryOptions({ id: planId as string }, { enabled: isEdit })
  )

  // Form states
  const [name, setName] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [description, setDescription] = useState("")
  const [monthlyPriceBDT, setMonthlyPriceBDT] = useState(0)
  const [yearlyPriceBDT, setYearlyPriceBDT] = useState(0)
  const [defaultStudentLimit, setDefaultStudentLimit] = useState(1000)
  const [defaultTeacherLimit, setDefaultTeacherLimit] = useState(10)
  const [defaultExamLimit, setDefaultExamLimit] = useState(500)
  const [defaultStorageLimit, setDefaultStorageLimit] = useState(500)
  const [defaultCreditLimit, setDefaultCreditLimit] = useState(30)

  // Feature Flags
  const [canCreateExams, setCanCreateExams] = useState(true)
  const [canCollectFees, setCanCollectFees] = useState(false)
  const [canUseLms, setCanUseLms] = useState(false)
  const [canManageAttendance, setCanManageAttendance] = useState(false)
  const [canManageLibrary, setCanManageLibrary] = useState(false)
  const [canManageTransport, setCanManageTransport] = useState(false)
  const [canSendSms, setCanSendSms] = useState(false)
  const [canUseCustomDomain, setCanUseCustomDomain] = useState(false)
  const [canUseAiFeatures, setCanUseAiFeatures] = useState(false)
  const [canExportReports, setCanExportReports] = useState(true)
  const [isPopular, setIsPopular] = useState(false)
  const [isActive, setIsActive] = useState(true)

  // Load plan data for editing
  useEffect(() => {
    if (plan) {
      setName(plan.name)
      setDisplayName(plan.displayName)
      setDescription(plan.description || "")
      setMonthlyPriceBDT(plan.monthlyPriceBDT)
      setYearlyPriceBDT(plan.yearlyPriceBDT)
      setDefaultStudentLimit(plan.defaultStudentLimit)
      setDefaultTeacherLimit(plan.defaultTeacherLimit)
      setDefaultExamLimit(plan.defaultExamLimit)
      setDefaultStorageLimit(plan.defaultStorageLimit)
      setDefaultCreditLimit(plan.defaultCreditLimit ?? 30)
      setCanCreateExams(plan.canCreateExams)
      setCanCollectFees(plan.canCollectFees)
      setCanUseLms(plan.canUseLms)
      setCanManageAttendance(plan.canManageAttendance ?? false)
      setCanManageLibrary(plan.canManageLibrary ?? false)
      setCanManageTransport(plan.canManageTransport ?? false)
      setCanSendSms(plan.canSendSms)
      setCanUseCustomDomain(plan.canUseCustomDomain)
      setCanUseAiFeatures(plan.canUseAiFeatures ?? false)
      setCanExportReports(plan.canExportReports ?? true)
      setIsPopular(plan.isPopular)
      setIsActive(plan.isActive)
    }
  }, [plan])

  const createMutation = useMutation({
    ...trpc.subscriptionPlan.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.subscriptionPlan.pathFilter())
      toast.success("Subscription plan created successfully.")
      router.push("/subscription-plans")
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create plan")
    },
  })

  const updateMutation = useMutation({
    ...trpc.subscriptionPlan.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.subscriptionPlan.pathFilter())
      toast.success("Subscription plan updated successfully.")
      router.push("/subscription-plans")
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update plan")
    },
  })

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !displayName) {
      toast.error("Plan name and display name are required.")
      return
    }

    if (isEdit) {
      updateMutation.mutate({
        id: planId as string,
        name,
        displayName,
        description,
        monthlyPriceBDT,
        yearlyPriceBDT,
        defaultStudentLimit,
        defaultTeacherLimit,
        defaultExamLimit,
        defaultStorageLimit,
        defaultCreditLimit,
        canCreateExams,
        canCollectFees,
        canUseLms,
        canManageAttendance,
        canManageLibrary,
        canManageTransport,
        canSendSms,
        canUseCustomDomain,
        canUseAiFeatures,
        canExportReports,
        isPopular,
        isActive,
      })
    } else {
      createMutation.mutate({
        name,
        displayName,
        description,
        monthlyPriceBDT,
        yearlyPriceBDT,
        defaultStudentLimit,
        defaultTeacherLimit,
        defaultExamLimit,
        defaultStorageLimit,
        defaultCreditLimit,
        canCreateExams,
        canCollectFees,
        canUseLms,
        canManageAttendance,
        canManageLibrary,
        canManageTransport,
        canSendSms,
        canUseCustomDomain,
        canUseAiFeatures,
        canExportReports,
        isPopular,
        isActive,
      })
    }
  }

  if (isEdit && isLoadingPlan) {
    return (
      <div className="flex h-96 w-full items-center justify-center gap-3">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        <span className="text-sm font-medium text-on-surface-variant">Loading plan details...</span>
      </div>
    )
  }

  if (isEdit && isError) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center text-red-700 max-w-lg mx-auto mt-12">
        <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-600" />
        <h3 className="font-extrabold text-lg">Error Loading Plan</h3>
        <p className="text-sm mt-1">The requested subscription plan could not be loaded or does not exist.</p>
        <Link href="/subscription-plans" className="mt-4 inline-block text-xs font-bold underline">
          Back to Plans List
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back to list link */}
      <div className="flex items-center">
        <Link
          href="/subscription-plans"
          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Plans List
        </Link>
      </div>

      <Card className="overflow-hidden rounded-xl border border-outline-variant bg-white p-0 shadow-lg ring-0 animate-in fade-in duration-200">
        <CardHeader className="border-b border-outline-variant/40 bg-surface-container-lowest p-6 flex flex-row items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="font-headline-md text-xl font-extrabold text-on-surface normal-case tracking-normal">
              {isEdit ? "Edit Subscription Plan" : "New Subscription Plan"}
            </CardTitle>
            <p className="text-xs font-body-md text-on-surface-variant mt-0.5">
              Configure system slug, pricing tiers, student quotas, and active module features
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Slug Code & Display Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  System Slug Code
                </Label>
                <div className="group relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors h-4.5 w-4.5" />
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="e.g. premium"
                    disabled={isSubmitting || isEdit}
                    required
                    className="w-full rounded-lg border border-outline-variant py-2.5 pl-10 pr-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Display Name
                </Label>
                <div className="group relative">
                  <Pen className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors h-4.5 w-4.5" />
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Premium Enterprise"
                    disabled={isSubmitting}
                    required
                    className="w-full rounded-lg border border-outline-variant py-2.5 pl-10 pr-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Description
              </Label>
              <div className="group relative">
                <Info className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors h-4.5 w-4.5" />
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Full suite for large academies and colleges"
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-outline-variant py-2.5 pl-10 pr-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto disabled:opacity-50"
                />
              </div>
            </div>

            {/* Price Tiers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Monthly Price (BDT ৳)
                </Label>
                <div className="group relative">
                  <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors h-4.5 w-4.5" />
                  <Input
                    type="number"
                    value={monthlyPriceBDT}
                    onChange={(e) => setMonthlyPriceBDT(Number(e.target.value) || 0)}
                    disabled={isSubmitting}
                    min={0}
                    className="w-full rounded-lg border border-outline-variant py-2.5 pl-10 pr-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto disabled:opacity-50 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Yearly Price (BDT ৳)
                </Label>
                <div className="group relative">
                  <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors h-4.5 w-4.5" />
                  <Input
                    type="number"
                    value={yearlyPriceBDT}
                    onChange={(e) => setYearlyPriceBDT(Number(e.target.value) || 0)}
                    disabled={isSubmitting}
                    min={0}
                    className="w-full rounded-lg border border-outline-variant py-2.5 pl-10 pr-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto disabled:opacity-50 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Resource Limits */}
            <div className="border-t border-outline-variant/30 pt-4 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-primary block">Default Resource Limits</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <Label className="block text-[10px] uppercase font-bold text-on-surface-variant">Students</Label>
                  <div className="group relative">
                    <UserCheck className="absolute left-2.5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors h-3.5 w-3.5" />
                    <Input
                      type="number"
                      value={defaultStudentLimit}
                      onChange={(e) => setDefaultStudentLimit(Number(e.target.value) || 0)}
                      disabled={isSubmitting}
                      className="w-full rounded-lg border border-outline-variant py-1.5 pl-8 pr-2 font-body-md text-xs text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-8 disabled:opacity-50 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="block text-[10px] uppercase font-bold text-on-surface-variant">Teacher Seats</Label>
                  <div className="group relative">
                    <UserCheck className="absolute left-2.5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors h-3.5 w-3.5" />
                    <Input
                      type="number"
                      value={defaultTeacherLimit}
                      onChange={(e) => setDefaultTeacherLimit(Number(e.target.value) || 0)}
                      disabled={isSubmitting}
                      className="w-full rounded-lg border border-outline-variant py-1.5 pl-8 pr-2 font-body-md text-xs text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-8 disabled:opacity-50 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="block text-[10px] uppercase font-bold text-on-surface-variant">Exams</Label>
                  <div className="group relative">
                    <FileText className="absolute left-2.5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors h-3.5 w-3.5" />
                    <Input
                      type="number"
                      value={defaultExamLimit}
                      onChange={(e) => setDefaultExamLimit(Number(e.target.value) || 0)}
                      disabled={isSubmitting}
                      className="w-full rounded-lg border border-outline-variant py-1.5 pl-8 pr-2 font-body-md text-xs text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-8 disabled:opacity-50 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="block text-[10px] uppercase font-bold text-on-surface-variant">Credits Limit</Label>
                  <div className="group relative">
                    <RefreshCw className="absolute left-2.5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors h-3.5 w-3.5" />
                    <Input
                      type="number"
                      value={defaultCreditLimit}
                      onChange={(e) => setDefaultCreditLimit(Number(e.target.value) || 0)}
                      disabled={isSubmitting}
                      className="w-full rounded-lg border border-outline-variant py-1.5 pl-8 pr-2 font-body-md text-xs text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-8 disabled:opacity-50 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="block text-[10px] uppercase font-bold text-on-surface-variant">Storage (MB)</Label>
                  <div className="group relative">
                    <Database className="absolute left-2.5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors h-3.5 w-3.5" />
                    <Input
                      type="number"
                      value={defaultStorageLimit}
                      onChange={(e) => setDefaultStorageLimit(Number(e.target.value) || 0)}
                      disabled={isSubmitting}
                      className="w-full rounded-lg border border-outline-variant py-1.5 pl-8 pr-2 font-body-md text-xs text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-8 disabled:opacity-50 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Flags Checkboxes */}
            <div className="border-t border-outline-variant/30 pt-4 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-primary block">Module Feature Flags</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                
                <div className="flex items-center space-x-3 rounded-lg border border-outline-variant/40 p-3 bg-surface-container-low">
                  <input
                    type="checkbox"
                    id="canCreateExams"
                    checked={canCreateExams}
                    disabled={isSubmitting}
                    onChange={(e) => setCanCreateExams(e.target.checked)}
                    className="size-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer disabled:opacity-50"
                  />
                  <div className="grid gap-0.5 leading-none">
                    <label htmlFor="canCreateExams" className="text-xs font-bold text-on-surface cursor-pointer flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-primary" />
                      Create Exams
                    </label>
                    <p className="text-[10px] text-on-surface-variant">Allow creating exams and generating question papers.</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rounded-lg border border-outline-variant/40 p-3 bg-surface-container-low">
                  <input
                    type="checkbox"
                    id="canCollectFees"
                    checked={canCollectFees}
                    disabled={isSubmitting}
                    onChange={(e) => setCanCollectFees(e.target.checked)}
                    className="size-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer disabled:opacity-50"
                  />
                  <div className="grid gap-0.5 leading-none">
                    <label htmlFor="canCollectFees" className="text-xs font-bold text-on-surface cursor-pointer flex items-center gap-1.5">
                      <Receipt className="h-3.5 w-3.5 text-primary" />
                      Fee Collection
                    </label>
                    <p className="text-[10px] text-on-surface-variant">Enable parents billing, invoices, and payment integration.</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rounded-lg border border-outline-variant/40 p-3 bg-surface-container-low">
                  <input
                    type="checkbox"
                    id="canUseAiFeatures"
                    checked={canUseAiFeatures}
                    disabled={isSubmitting}
                    onChange={(e) => setCanUseAiFeatures(e.target.checked)}
                    className="size-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer disabled:opacity-50"
                  />
                  <div className="grid gap-0.5 leading-none">
                    <label htmlFor="canUseAiFeatures" className="text-xs font-bold text-on-surface cursor-pointer flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      AI Features
                    </label>
                    <p className="text-[10px] text-on-surface-variant">Enable AI helper modules and automatic grading helper.</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rounded-lg border border-outline-variant/40 p-3 bg-surface-container-low">
                  <input
                    type="checkbox"
                    id="canExportReports"
                    checked={canExportReports}
                    disabled={isSubmitting}
                    onChange={(e) => setCanExportReports(e.target.checked)}
                    className="size-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer disabled:opacity-50"
                  />
                  <div className="grid gap-0.5 leading-none">
                    <label htmlFor="canExportReports" className="text-xs font-bold text-on-surface cursor-pointer flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-primary" />
                      Export Reports
                    </label>
                    <p className="text-[10px] text-on-surface-variant">Enable advanced Excel and PDF exports.</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rounded-lg border border-outline-variant/40 p-3 bg-surface-container-low">
                  <input
                    type="checkbox"
                    id="canUseLms"
                    checked={canUseLms}
                    disabled={isSubmitting}
                    onChange={(e) => setCanUseLms(e.target.checked)}
                    className="size-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer disabled:opacity-50"
                  />
                  <div className="grid gap-0.5 leading-none">
                    <label htmlFor="canUseLms" className="text-xs font-bold text-on-surface cursor-pointer flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-primary" />
                      LMS & Homework Portal
                    </label>
                    <p className="text-[10px] text-on-surface-variant">Enable assignment submission, lessons, and curriculum.</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rounded-lg border border-outline-variant/40 p-3 bg-surface-container-low">
                  <input
                    type="checkbox"
                    id="canManageAttendance"
                    checked={canManageAttendance}
                    disabled={isSubmitting}
                    onChange={(e) => setCanManageAttendance(e.target.checked)}
                    className="size-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer disabled:opacity-50"
                  />
                  <div className="grid gap-0.5 leading-none">
                    <label htmlFor="canManageAttendance" className="text-xs font-bold text-on-surface cursor-pointer flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-primary" />
                      Attendance System
                    </label>
                    <p className="text-[10px] text-on-surface-variant">RFID or manual attendance logs for students & staff.</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rounded-lg border border-outline-variant/40 p-3 bg-surface-container-low">
                  <input
                    type="checkbox"
                    id="canManageLibrary"
                    checked={canManageLibrary}
                    disabled={isSubmitting}
                    onChange={(e) => setCanManageLibrary(e.target.checked)}
                    className="size-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer disabled:opacity-50"
                  />
                  <div className="grid gap-0.5 leading-none">
                    <label htmlFor="canManageLibrary" className="text-xs font-bold text-on-surface cursor-pointer flex items-center gap-1.5">
                      <Library className="h-3.5 w-3.5 text-primary" />
                      Library Module
                    </label>
                    <p className="text-[10px] text-on-surface-variant">Manage book issues, library cards, and catalogs.</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rounded-lg border border-outline-variant/40 p-3 bg-surface-container-low">
                  <input
                    type="checkbox"
                    id="canManageTransport"
                    checked={canManageTransport}
                    disabled={isSubmitting}
                    onChange={(e) => setCanManageTransport(e.target.checked)}
                    className="size-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer disabled:opacity-50"
                  />
                  <div className="grid gap-0.5 leading-none">
                    <label htmlFor="canManageTransport" className="text-xs font-bold text-on-surface cursor-pointer flex items-center gap-1.5">
                      <Bus className="h-3.5 w-3.5 text-primary" />
                      Transport Module
                    </label>
                    <p className="text-[10px] text-on-surface-variant">Manage school bus routes, drivers, and transport fees.</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rounded-lg border border-outline-variant/40 p-3 bg-surface-container-low">
                  <input
                    type="checkbox"
                    id="canSendSms"
                    checked={canSendSms}
                    disabled={isSubmitting}
                    onChange={(e) => setCanSendSms(e.target.checked)}
                    className="size-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer disabled:opacity-50"
                  />
                  <div className="grid gap-0.5 leading-none">
                    <label htmlFor="canSendSms" className="text-xs font-bold text-on-surface cursor-pointer flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-primary" />
                      SMS Alerts & Notifications
                    </label>
                    <p className="text-[10px] text-on-surface-variant">Send automated SMS notifications to parents & students.</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rounded-lg border border-outline-variant/40 p-3 bg-surface-container-low">
                  <input
                    type="checkbox"
                    id="canUseCustomDomain"
                    checked={canUseCustomDomain}
                    disabled={isSubmitting}
                    onChange={(e) => setCanUseCustomDomain(e.target.checked)}
                    className="size-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer disabled:opacity-50"
                  />
                  <div className="grid gap-0.5 leading-none">
                    <label htmlFor="canUseCustomDomain" className="text-xs font-bold text-on-surface cursor-pointer flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-primary" />
                      Custom Domain SSL
                    </label>
                    <p className="text-[10px] text-on-surface-variant">Allow schools to link custom domains with automatic SSL.</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rounded-lg border border-outline-variant/40 p-3 bg-primary-container/10">
                  <input
                    type="checkbox"
                    id="isPopular"
                    checked={isPopular}
                    disabled={isSubmitting}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="size-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer disabled:opacity-50"
                  />
                  <div className="grid gap-0.5 leading-none">
                    <label htmlFor="isPopular" className="text-xs font-bold text-primary cursor-pointer flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                      Mark Most Popular
                    </label>
                    <p className="text-[10px] text-on-surface-variant">Highlight this plan on public marketing & pricing cards.</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rounded-lg border border-outline-variant/40 p-3 bg-surface-container-low">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    disabled={isSubmitting}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="size-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer disabled:opacity-50"
                  />
                  <div className="grid gap-0.5 leading-none">
                    <label htmlFor="isActive" className="text-xs font-bold text-on-surface cursor-pointer flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      Plan is Active & Selectable
                    </label>
                    <p className="text-[10px] text-on-surface-variant">Determines if the plan can be assigned or renewed.</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-outline-variant">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => router.push("/subscription-plans")}
                className="rounded-lg border border-outline px-6 py-2.5 font-bold text-primary hover:bg-surface-container-low transition-all cursor-pointer h-auto text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-primary-container px-8 py-2.5 font-bold text-on-primary-container shadow-md hover:bg-primary hover:text-white transition-all cursor-pointer h-auto text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : isEdit ? (
                  "Update Plan"
                ) : (
                  "Save Plan"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

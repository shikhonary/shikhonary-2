"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import Link from "next/link"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import {
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Info,
  Loader2,
  FileText,
  Receipt,
  MessageSquare,
  Globe,
  BookOpen,
  UserCheck,
  Library,
  Bus,
} from "lucide-react"

export function SubscriptionPlanListView() {
  const queryClient = useQueryClient()
  const [deletingItem, setDeletingItem] = useState<{ id: string; name: string } | null>(null)

  const { data: plansData, isLoading, isError } = useQuery(
    trpc.subscriptionPlan.list.queryOptions({ limit: 50 })
  )

  const deleteMutation = useMutation({
    ...trpc.subscriptionPlan.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.subscriptionPlan.pathFilter())
      toast.success(`Plan "${deletingItem?.name || ""}" deleted successfully.`)
      setDeletingItem(null)
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete plan")
    },
  })

  const handleConfirmDelete = () => {
    if (deletingItem) {
      deleteMutation.mutate({ id: deletingItem.id })
    }
  }

  const plans = plansData?.plans ?? []

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <section className="mb-6 sm:mb-8 flex flex-col justify-between gap-4 sm:gap-6 md:flex-row md:items-end">
        <div>
          <h2 className="mb-1 font-headline-md text-2xl sm:text-3xl font-extrabold text-primary md:text-4xl">
            Subscription Plans
          </h2>
          <p className="max-w-2xl font-body-md text-xs sm:text-sm md:text-base leading-relaxed text-on-surface-variant">
            Manage SaaS tier plans, pricing, feature flags, and default resource limits for Educational Institutions.
          </p>
        </div>
        <Button
          asChild
          className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary-container px-6 py-2.5 sm:py-3 font-headline-md text-sm sm:text-base font-bold text-on-primary-container shadow-sm hover:shadow-md hover:shadow-primary/20 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95 hover:bg-primary hover:text-white h-auto normal-case tracking-normal cursor-pointer overflow-hidden"
        >
          <Link href="/subscription-plans/create">
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 ease-out group-hover:rotate-90 group-hover:scale-110" />
            <span className="relative z-10">Add Plan</span>
          </Link>
        </Button>
      </section>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-on-surface-variant text-sm flex items-center justify-center gap-3">
            <RefreshCw className="h-5 w-5 animate-spin text-primary" />
            <span>Loading subscription plans...</span>
          </div>
        ) : isError ? (
          <div className="col-span-full p-8 text-center text-error">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-600" />
            <p className="font-body-md font-medium">Failed to load subscription plans.</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="col-span-full p-12 text-center flex flex-col items-center gap-3 border border-outline-variant rounded-2xl bg-surface-container-lowest">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Layers className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-on-surface">No subscription plans created yet.</p>
          </div>
        ) : (
          plans.map((p: any) => (
            <Card
              key={p.id}
              className={`relative overflow-hidden rounded-2xl border transition-all duration-200 ${
                p.isPopular
                  ? "border-primary shadow-md bg-gradient-to-b from-primary/5 via-white to-white"
                  : "border-outline-variant bg-white"
              }`}
            >
              {p.isPopular && (
                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-sm">
                  <Sparkles className="h-3 w-3" /> Most Popular
                </div>
              )}

              <CardHeader className="p-6 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-headline-md text-xl font-extrabold text-primary">
                    {p.displayName}
                  </CardTitle>
                  <Badge variant={p.isActive ? "default" : "secondary"} className="text-[10px] uppercase font-bold">
                    {p.isActive ? "Active" : "Disabled"}
                  </Badge>
                </div>
                <p className="text-xs text-on-surface-variant mt-1 min-h-[36px] line-clamp-2">
                  {p.description || "Standard Educational SaaS tier."}
                </p>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-4">
                <div className="border-t border-b border-outline-variant/30 py-3 flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-extrabold text-on-surface">৳{p.yearlyPriceBDT.toLocaleString()}</span>
                    <span className="text-xs text-outline font-medium"> / year</span>
                  </div>
                  <span className="text-xs text-on-surface-variant font-mono">
                    (৳{p.monthlyPriceBDT}/mo)
                  </span>
                </div>

                {/* Resource Limits */}
                <div className="space-y-1.5 text-xs text-on-surface-variant">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-outline block mb-1">Default Limits</span>
                  <div className="flex justify-between font-medium">
                    <span>Student Seats:</span>
                    <span className="font-bold text-on-surface">{p.defaultStudentLimit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Teacher Seats:</span>
                    <span className="font-bold text-on-surface">{p.defaultTeacherLimit}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Exams:</span>
                    <span className="font-bold text-on-surface">{p.defaultExamLimit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Storage:</span>
                    <span className="font-bold text-on-surface">{p.defaultStorageLimit} MB</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Credits Limit:</span>
                    <span className="font-bold text-on-surface">{p.defaultCreditLimit ?? 30}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-1.5 text-xs pt-2 border-t border-outline-variant/30">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-outline block mb-1">Module Features</span>
                  <div className="flex items-center gap-2">
                    <FileText className={`h-3.5 w-3.5 ${p.canCreateExams ? "text-emerald-600" : "text-outline opacity-40"}`} />
                    <span className={p.canCreateExams ? "text-on-surface font-medium" : "text-outline line-through"}>Create Exams</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Receipt className={`h-3.5 w-3.5 ${p.canCollectFees ? "text-emerald-600" : "text-outline opacity-40"}`} />
                    <span className={p.canCollectFees ? "text-on-surface font-medium" : "text-outline line-through"}>Fee Collection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className={`h-3.5 w-3.5 ${p.canUseAiFeatures ? "text-emerald-600" : "text-outline opacity-40"}`} />
                    <span className={p.canUseAiFeatures ? "text-on-surface font-medium" : "text-outline line-through"}>AI Features</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className={`h-3.5 w-3.5 ${p.canExportReports ? "text-emerald-600" : "text-outline opacity-40"}`} />
                    <span className={p.canExportReports ? "text-on-surface font-medium" : "text-outline line-through"}>Export Reports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className={`h-3.5 w-3.5 ${p.canUseLms ? "text-emerald-600" : "text-outline opacity-40"}`} />
                    <span className={p.canUseLms ? "text-on-surface font-medium" : "text-outline line-through"}>LMS & Homework Portal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCheck className={`h-3.5 w-3.5 ${p.canManageAttendance ? "text-emerald-600" : "text-outline opacity-40"}`} />
                    <span className={p.canManageAttendance ? "text-on-surface font-medium" : "text-outline line-through"}>Attendance Module</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Library className={`h-3.5 w-3.5 ${p.canManageLibrary ? "text-emerald-600" : "text-outline opacity-40"}`} />
                    <span className={p.canManageLibrary ? "text-on-surface font-medium" : "text-outline line-through"}>Library Module</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bus className={`h-3.5 w-3.5 ${p.canManageTransport ? "text-emerald-600" : "text-outline opacity-40"}`} />
                    <span className={p.canManageTransport ? "text-on-surface font-medium" : "text-outline line-through"}>Transport Module</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className={`h-3.5 w-3.5 ${p.canSendSms ? "text-emerald-600" : "text-outline opacity-40"}`} />
                    <span className={p.canSendSms ? "text-on-surface font-medium" : "text-outline line-through"}>SMS Notification Gateway</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className={`h-3.5 w-3.5 ${p.canUseCustomDomain ? "text-emerald-600" : "text-outline opacity-40"}`} />
                    <span className={p.canUseCustomDomain ? "text-on-surface font-medium" : "text-outline line-through"}>Custom Domain SSL</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/30">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="rounded-lg text-xs font-bold"
                  >
                    <Link href={`/subscription-plans/${p.id}/edit`}>
                      Edit Plan
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingItem({ id: p.id, name: p.displayName })}
                    className="h-8 w-8 rounded-lg text-on-surface-variant hover:bg-error-container/20 hover:text-error cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal — Matched with Delete Fiscal Year */}
      <Dialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <DialogContent
          showCloseButton={false}
          style={{ minWidth: "320px", maxWidth: "480px", width: "calc(100vw - 2rem)" }}
          className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-white p-5 sm:p-6 shadow-xl text-left gap-4"
        >
          {/* Warning Header Icon */}
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-red-500/10 text-red-600 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="font-headline-md text-lg font-bold tracking-tight text-on-surface normal-case">
                Delete Subscription Plan?
              </DialogTitle>
              <p className="text-xs text-outline mt-0.5">
                This action requires confirmation
              </p>
            </div>
          </div>

          {/* Description */}
          <DialogHeader className="pt-1">
            <DialogDescription className="font-body-md text-sm leading-relaxed text-on-surface-variant">
              Are you sure you want to delete{" "}
              <span className="font-bold text-on-surface">
                &quot;{deletingItem?.name || "selected plan"}&quot;
              </span>
              ? Any school portals associated with this subscription tier will be affected.
            </DialogDescription>
          </DialogHeader>

          {/* Informational Alert Box */}
          <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-700">
            <Info className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            <p className="leading-snug">
              This process is permanent and cannot be undone. Please ensure no active tenants depend on this subscription plan tier before deleting it.
            </p>
          </div>

          {/* Actions Footer */}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={deleteMutation.isPending}
              onClick={() => setDeletingItem(null)}
              className="w-full sm:w-auto rounded-lg border border-outline-variant px-5 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer h-10 normal-case tracking-normal"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={handleConfirmDelete}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 cursor-pointer h-10 normal-case tracking-normal disabled:opacity-50"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Plan</span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

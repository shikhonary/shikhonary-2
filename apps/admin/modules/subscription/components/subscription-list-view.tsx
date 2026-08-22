"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { DatePicker } from "@workspace/ui/components/date-picker"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@workspace/ui/components/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { CreditCard, Plus, Trash2, CheckCircle2, RefreshCw, ChevronLeft, ChevronRight, AlertTriangle, Info, Loader2, Layers, Building2 } from "lucide-react"

export function SubscriptionListView() {
  const queryClient = useQueryClient()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingSub, setEditingSub] = useState<any | null>(null)
  const [deletingItem, setDeletingItem] = useState<{ id: string; name: string } | null>(null)

  const [tenantId, setTenantId] = useState("")
  const [planId, setPlanId] = useState("")
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("YEARLY")
  const [status, setStatus] = useState<"ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELED" | "EXPIRED">("ACTIVE")
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000))

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const { data: subscriptionData, isLoading, isError } = useQuery(
    trpc.subscription.list.queryOptions({ limit: itemsPerPage * 5 })
  )

  const { data: plansData } = useQuery(
    trpc.subscriptionPlan.forSelection.queryOptions()
  )

  const { data: tenantsData } = useQuery(
    trpc.tenant.list.queryOptions({ limit: 100 })
  )

  const resetForm = () => {
    setShowCreateModal(false)
    setEditingSub(null)
    setTenantId("")
    setPlanId("")
    setBillingCycle("YEARLY")
    setStatus("ACTIVE")
    setStartDate(new Date())
    setEndDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000))
  }

  const createMutation = useMutation({
    ...trpc.subscription.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.subscription.pathFilter())
      toast.success("Subscription created successfully.")
      resetForm()
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create subscription")
    },
  })

  const changePlanMutation = useMutation({
    ...trpc.subscription.changePlan.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.subscription.pathFilter())
      toast.success("Subscription plan updated successfully.")
      resetForm()
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update plan")
    },
  })

  const deleteMutation = useMutation({
    ...trpc.subscription.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.subscription.pathFilter())
      toast.success("Subscription deleted successfully.")
      setDeletingItem(null)
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete subscription")
    },
  })

  const isSubmitting = createMutation.isPending || changePlanMutation.isPending

  const handleEdit = (sub: any) => {
    setEditingSub(sub)
    setTenantId(sub.tenantId)
    setPlanId(sub.planId)
    setBillingCycle(sub.billingCycle)
    setStatus(sub.status)
    setStartDate(new Date(sub.currentPeriodStart))
    setEndDate(new Date(sub.currentPeriodEnd))
    setShowCreateModal(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tenantId || !planId || !startDate || !endDate) {
      toast.error("Please select tenant, subscription plan, and date period.")
      return
    }

    if (editingSub) {
      changePlanMutation.mutate({
        id: editingSub.id,
        planId,
        billingCycle,
      })
    } else {
      createMutation.mutate({
        tenantId,
        planId,
        status,
        billingCycle,
        currentPeriodStart: startDate,
        currentPeriodEnd: endDate,
      })
    }
  }

  const allItems = subscriptionData?.subscriptions ?? []
  const plans = plansData ?? []
  const tenants = tenantsData?.tenants ?? []

  const totalItems = allItems.length
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1
  const displayStart = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0
  const displayEnd = Math.min(currentPage * itemsPerPage, totalItems)
  const pagedItems = allItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <section className="mb-6 sm:mb-8 flex flex-col justify-between gap-4 sm:gap-6 md:flex-row md:items-end">
        <div>
          <h2 className="mb-1 font-headline-md text-2xl sm:text-3xl font-extrabold text-primary md:text-4xl">
            Subscription Management
          </h2>
          <p className="max-w-2xl font-body-md text-xs sm:text-sm md:text-base leading-relaxed text-on-surface-variant">
            Manage active tenant subscriptions, assign plans, and monitor recurring billing cycles.
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setShowCreateModal(true)
          }}
          className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary-container px-6 py-2.5 sm:py-3 font-headline-md text-sm sm:text-base font-bold text-on-primary-container shadow-sm hover:shadow-md hover:shadow-primary/20 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95 hover:bg-primary hover:text-white h-auto normal-case tracking-normal cursor-pointer overflow-hidden"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 ease-out group-hover:rotate-90 group-hover:scale-110" />
          <span className="relative z-10">New Subscription</span>
        </Button>
      </section>

      {/* Main Table */}
      <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-xs">
        {isLoading ? (
          <div className="p-8 text-center text-on-surface-variant text-sm font-body-md flex items-center justify-center gap-3">
            <RefreshCw className="h-5 w-5 animate-spin text-primary" />
            <span>Loading subscriptions...</span>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-error">
            <p className="font-body-md font-medium">Failed to load subscriptions.</p>
          </div>
        ) : allItems.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <CreditCard className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-on-surface">No subscriptions recorded.</p>
            <Button size="sm" onClick={() => { resetForm(); setShowCreateModal(true); }} className="mt-2 rounded-lg bg-primary-container text-on-primary-container hover:bg-primary hover:text-white transition-colors font-bold">
              <Plus className="h-4 w-4 mr-1" /> Add Subscription
            </Button>
          </div>
        ) : (
          <div>
            <Table className="w-full text-left font-body-md">
              <TableHeader className="bg-surface-container-low border-b border-outline-variant">
                <TableRow className="border-b border-outline-variant bg-surface-container-low hover:bg-surface-container-low">
                  <TableHead className="px-6 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
                    Institution (Tenant)
                  </TableHead>
                  <TableHead className="px-6 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
                    Plan Tier
                  </TableHead>
                  <TableHead className="px-6 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
                    Billing Cycle
                  </TableHead>
                  <TableHead className="px-6 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
                    Status
                  </TableHead>
                  <TableHead className="px-6 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
                    Period End Date
                  </TableHead>
                  <TableHead className="px-6 py-4 text-right font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-outline-variant/30">
                {pagedItems.map((sub: any) => (
                  <TableRow key={sub.id} className="hover:bg-surface-container-low transition-all duration-200 ease-in-out group border-b border-outline-variant/30">
                    <TableCell className="py-4 group-hover:py-5 px-6 font-bold text-primary">
                      {sub.tenant?.name || sub.tenantId}
                      <span className="block text-xs font-mono text-outline font-normal">slug: {sub.tenant?.slug || "n/a"}</span>
                    </TableCell>
                    <TableCell className="py-4 group-hover:py-5 px-6 font-semibold text-on-surface">
                      <Badge className="bg-primary/10 text-primary border border-primary/20 shadow-none px-2.5 py-0.5 text-xs">
                        {sub.plan?.displayName || sub.planId}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 group-hover:py-5 px-6 text-xs text-on-surface-variant font-medium">
                      {sub.billingCycle} (৳{sub.pricePerYear ?? sub.pricePerMonth})
                    </TableCell>
                    <TableCell className="py-4 group-hover:py-5 px-6">
                      {sub.status === "ACTIVE" ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-none px-2.5 py-0.5 text-[10px] uppercase font-bold rounded-full">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                        </Badge>
                      ) : (
                        <Badge className="bg-surface-variant text-on-surface-variant border-0 shadow-none px-2.5 py-0.5 text-[10px] uppercase font-bold rounded-full">
                          {sub.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-4 group-hover:py-5 px-6 text-xs font-mono text-on-surface-variant">
                      {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="py-4 group-hover:py-5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(sub)}
                          className="rounded-lg text-xs font-semibold"
                        >
                          Change Plan
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingItem({ id: sub.id, name: sub.tenant?.name || sub.id })}
                          className="h-8 w-8 rounded-lg text-on-surface-variant hover:bg-error-container/20 hover:text-error"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Create / Change Plan Modal */}
      <Dialog open={showCreateModal} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-lg rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg">
              {editingSub ? "Change Subscription Plan" : "New Subscription"}
            </DialogTitle>
            <DialogDescription className="text-xs text-on-surface-variant">
              Associate an educational institution with a SaaS subscription tier.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {!editingSub && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-outline block">Select Institution *</label>
                <Select value={tenantId} onValueChange={setTenantId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose School Tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map((t: any) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} ({t.slug})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-outline block">Select Subscription Plan *</label>
              <Select value={planId} onValueChange={setPlanId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose Subscription Plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.displayName} (৳{p.yearlyPriceBDT}/yr)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-outline block">Billing Cycle</label>
              <Select value={billingCycle} onValueChange={(val: any) => setBillingCycle(val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Cycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="YEARLY">Yearly (Annual)</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {editingSub ? "Update Plan" : "Create Subscription"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@workspace/ui/components/table"
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
  Check,
  Building2,
  AlertTriangle,
  Info,
  Loader2,
  ShieldCheck,
  FileText,
  Building,
  Receipt,
  MessageSquare,
  Globe,
} from "lucide-react"

export function SubscriptionPlanListView() {
  const queryClient = useQueryClient()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<any | null>(null)
  const [deletingItem, setDeletingItem] = useState<{ id: string; name: string } | null>(null)

  // Form states
  const [name, setName] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [description, setDescription] = useState("")
  const [monthlyPriceBDT, setMonthlyPriceBDT] = useState(0)
  const [yearlyPriceBDT, setYearlyPriceBDT] = useState(0)
  const [defaultCitizenLimit, setDefaultCitizenLimit] = useState(1000)
  const [defaultStaffLimit, setDefaultStaffLimit] = useState(10)
  const [defaultCertificateLimit, setDefaultCertificateLimit] = useState(500)
  const [defaultStorageLimit, setDefaultStorageLimit] = useState(500)

  // Feature Flags
  const [canIssueCertificates, setCanIssueCertificates] = useState(true)
  const [canCollectHoldingTax, setCanCollectHoldingTax] = useState(false)
  const [canManageTradeLicense, setCanManageTradeLicense] = useState(false)
  const [canSendSms, setCanSendSms] = useState(false)
  const [canUseCustomDomain, setCanUseCustomDomain] = useState(false)
  const [isPopular, setIsPopular] = useState(false)
  const [isActive, setIsActive] = useState(true)

  const { data: plansData, isLoading, isError } = useQuery(
    trpc.subscriptionPlan.list.queryOptions({ limit: 50 })
  )

  const resetForm = () => {
    setShowCreateModal(false)
    setEditingPlan(null)
    setName("")
    setDisplayName("")
    setDescription("")
    setMonthlyPriceBDT(0)
    setYearlyPriceBDT(0)
    setDefaultCitizenLimit(1000)
    setDefaultStaffLimit(10)
    setDefaultCertificateLimit(500)
    setDefaultStorageLimit(500)
    setCanIssueCertificates(true)
    setCanCollectHoldingTax(false)
    setCanManageTradeLicense(false)
    setCanSendSms(false)
    setCanUseCustomDomain(false)
    setIsPopular(false)
    setIsActive(true)
  }

  const openEditModal = (plan: any) => {
    setEditingPlan(plan)
    setName(plan.name)
    setDisplayName(plan.displayName)
    setDescription(plan.description || "")
    setMonthlyPriceBDT(plan.monthlyPriceBDT)
    setYearlyPriceBDT(plan.yearlyPriceBDT)
    setDefaultCitizenLimit(plan.defaultCitizenLimit)
    setDefaultStaffLimit(plan.defaultStaffLimit)
    setDefaultCertificateLimit(plan.defaultCertificateLimit)
    setDefaultStorageLimit(plan.defaultStorageLimit)
    setCanIssueCertificates(plan.canIssueCertificates)
    setCanCollectHoldingTax(plan.canCollectHoldingTax)
    setCanManageTradeLicense(plan.canManageTradeLicense)
    setCanSendSms(plan.canSendSms)
    setCanUseCustomDomain(plan.canUseCustomDomain)
    setIsPopular(plan.isPopular)
    setIsActive(plan.isActive)
    setShowCreateModal(true)
  }

  const createMutation = useMutation({
    ...trpc.subscriptionPlan.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.subscriptionPlan.pathFilter())
      toast.success("Subscription plan created successfully.")
      resetForm()
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
      resetForm()
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update plan")
    },
  })

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !displayName) {
      toast.error("Plan name and display name are required.")
      return
    }

    if (editingPlan) {
      updateMutation.mutate({
        id: editingPlan.id,
        name,
        displayName,
        description,
        monthlyPriceBDT,
        yearlyPriceBDT,
        defaultCitizenLimit,
        defaultStaffLimit,
        defaultCertificateLimit,
        defaultStorageLimit,
        canIssueCertificates,
        canCollectHoldingTax,
        canManageTradeLicense,
        canSendSms,
        canUseCustomDomain,
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
        defaultCitizenLimit,
        defaultStaffLimit,
        defaultCertificateLimit,
        defaultStorageLimit,
        canIssueCertificates,
        canCollectHoldingTax,
        canManageTradeLicense,
        canSendSms,
        canUseCustomDomain,
        isPopular,
        isActive,
      })
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
            Manage SaaS tier plans, pricing, feature flags, and default resource limits for Union Porishods.
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
          <span className="relative z-10">Add Plan</span>
        </Button>
      </section>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-on-surface-variant text-sm flex items-center justify-center gap-3">
            <RefreshCw className="h-5 w-5 animate-spin text-primary" />
            <span>Loading subscription plans...</span>
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
                  {p.description || "Standard Union Porishod SaaS tier."}
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
                    <span>Citizen Accounts:</span>
                    <span className="font-bold text-on-surface">{p.defaultCitizenLimit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Staff Seats:</span>
                    <span className="font-bold text-on-surface">{p.defaultStaffLimit}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Certificates:</span>
                    <span className="font-bold text-on-surface">{p.defaultCertificateLimit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Storage:</span>
                    <span className="font-bold text-on-surface">{p.defaultStorageLimit} MB</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-1.5 text-xs pt-2 border-t border-outline-variant/30">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-outline block mb-1">Module Features</span>
                  <div className="flex items-center gap-2">
                    <FileText className={`h-3.5 w-3.5 ${p.canIssueCertificates ? "text-emerald-600" : "text-outline opacity-40"}`} />
                    <span className={p.canIssueCertificates ? "text-on-surface font-medium" : "text-outline line-through"}>Citizen Certificates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Receipt className={`h-3.5 w-3.5 ${p.canCollectHoldingTax ? "text-emerald-600" : "text-outline opacity-40"}`} />
                    <span className={p.canCollectHoldingTax ? "text-on-surface font-medium" : "text-outline line-through"}>Holding Tax Collection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className={`h-3.5 w-3.5 ${p.canManageTradeLicense ? "text-emerald-600" : "text-outline opacity-40"}`} />
                    <span className={p.canManageTradeLicense ? "text-on-surface font-medium" : "text-outline line-through"}>Trade Licenses</span>
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
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(p)}
                    className="rounded-lg text-xs font-bold"
                  >
                    Edit Plan
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingItem({ id: p.id, name: p.displayName })}
                    className="h-8 w-8 rounded-lg text-on-surface-variant hover:bg-error-container/20 hover:text-error"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create / Edit Plan Modal */}
      <Dialog open={showCreateModal} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-2xl rounded-2xl p-6 overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="font-headline-md text-xl font-bold">
              {editingPlan ? "Edit Subscription Plan" : "Create Subscription Plan"}
            </DialogTitle>
            <DialogDescription className="text-xs text-on-surface-variant">
              Define SaaS pricing, default limits, and module access.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-outline">System Slug Code *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="standard"
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-outline">Display Name *</Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Standard Plan"
                  className="text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-outline">Description</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comprehensive package for active Union Porishods"
                className="text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-outline">Monthly Price (BDT ৳)</Label>
                <Input
                  type="number"
                  value={monthlyPriceBDT}
                  onChange={(e) => setMonthlyPriceBDT(Number(e.target.value) || 0)}
                  className="text-sm font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-outline">Yearly Price (BDT ৳)</Label>
                <Input
                  type="number"
                  value={yearlyPriceBDT}
                  onChange={(e) => setYearlyPriceBDT(Number(e.target.value) || 0)}
                  className="text-sm font-mono"
                />
              </div>
            </div>

            {/* Limits */}
            <div className="border-t border-outline-variant/30 pt-3 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-primary block">Default Limits</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <Label className="text-[10px] uppercase font-bold text-outline">Citizens</Label>
                  <Input
                    type="number"
                    value={defaultCitizenLimit}
                    onChange={(e) => setDefaultCitizenLimit(Number(e.target.value) || 0)}
                    className="text-xs font-mono"
                  />
                </div>
                <div>
                  <Label className="text-[10px] uppercase font-bold text-outline">Staff Seats</Label>
                  <Input
                    type="number"
                    value={defaultStaffLimit}
                    onChange={(e) => setDefaultStaffLimit(Number(e.target.value) || 0)}
                    className="text-xs font-mono"
                  />
                </div>
                <div>
                  <Label className="text-[10px] uppercase font-bold text-outline">Certificates</Label>
                  <Input
                    type="number"
                    value={defaultCertificateLimit}
                    onChange={(e) => setDefaultCertificateLimit(Number(e.target.value) || 0)}
                    className="text-xs font-mono"
                  />
                </div>
                <div>
                  <Label className="text-[10px] uppercase font-bold text-outline">Storage (MB)</Label>
                  <Input
                    type="number"
                    value={defaultStorageLimit}
                    onChange={(e) => setDefaultStorageLimit(Number(e.target.value) || 0)}
                    className="text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Feature Flags Checkboxes */}
            <div className="border-t border-outline-variant/30 pt-3 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary block">Module Feature Flags</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={canIssueCertificates} onChange={(e) => setCanIssueCertificates(e.target.checked)} className="rounded text-primary" />
                  <span>Citizen Certificates</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={canCollectHoldingTax} onChange={(e) => setCanCollectHoldingTax(e.target.checked)} className="rounded text-primary" />
                  <span>Holding Tax Collection</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={canManageTradeLicense} onChange={(e) => setCanManageTradeLicense(e.target.checked)} className="rounded text-primary" />
                  <span>Trade Licenses</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={canSendSms} onChange={(e) => setCanSendSms(e.target.checked)} className="rounded text-primary" />
                  <span>SMS Alerts</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={canUseCustomDomain} onChange={(e) => setCanUseCustomDomain(e.target.checked)} className="rounded text-primary" />
                  <span>Custom Domain</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isPopular} onChange={(e) => setIsPopular(e.target.checked)} className="rounded text-primary" />
                  <span className="font-bold text-primary">Mark Most Popular</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingPlan ? "Update Plan" : "Create Plan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg">Delete Subscription Plan?</DialogTitle>
            <DialogDescription className="text-xs text-on-surface-variant">
              Are you sure you want to delete &quot;{deletingItem?.name}&quot;?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDeletingItem(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deletingItem && deleteMutation.mutate({ id: deletingItem.id })}
              disabled={deleteMutation.isPending}
            >
              Delete Plan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

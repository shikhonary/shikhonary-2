"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { PageHeader } from "@/components/shared/page-header"
import { StatsCards, type StatCardItem } from "@/components/shared/stats-cards"
import { DataTableFilterBar, type ActiveFilterChip } from "@/components/shared/data-table-filter-bar"
import { DataTablePagination } from "@/components/shared/data-table-pagination"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@workspace/ui/components/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@workspace/ui/components/dialog"
import { toast } from "@workspace/ui/components/sonner"
import { cn } from "@workspace/ui/lib/utils"
import { toBengaliDigits } from "@workspace/utils"
import {
  Building2,
  Inbox,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Share2,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Loader2,
  MoreVertical,
  Check,
  Eye,
  School,
  User,
} from "lucide-react"

const DEFAULT_TYPE_CONFIG = {
  label: "বিদ্যালয়",
  badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
}

const TYPE_CONFIG: Record<
  string,
  { label: string; badgeClass: string }
> = {
  SCHOOL: DEFAULT_TYPE_CONFIG,
  COACHING: {
    label: "কোচিং",
    badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  },
  TUTOR: {
    label: "টিউটর",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  },
  COLLEGE: {
    label: "কলেজ",
    badgeClass: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
  },
  MADRASAH: {
    label: "মাদরাসা",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  },
  OTHER: {
    label: "অন্যান্য",
    badgeClass: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20",
  },
}

function getTypeConfig(type?: string | null) {
  if (type && type in TYPE_CONFIG) {
    return TYPE_CONFIG[type]!
  }
  return DEFAULT_TYPE_CONFIG
}

export function TenantApplicationsView() {
  const router = useRouter()
  const queryClient = useQueryClient()

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL")
  const [typeFilter, setTypeFilter] = useState<string>("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Rejection Dialog State
  const [rejectTarget, setRejectTarget] = useState<any | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  // Fetch Stats
  const { data: statsData, isLoading: isStatsLoading } = useQuery(
    trpc.tenantApplication.stats.queryOptions()
  )

  // Fetch Applications List
  const {
    data: listData,
    isLoading: isListLoading,
    isError,
  } = useQuery(
    trpc.tenantApplication.list.queryOptions({
      status: statusFilter,
      type: typeFilter === "ALL" ? undefined : typeFilter,
      search: searchQuery.trim() || undefined,
      page: currentPage,
      limit: itemsPerPage,
    })
  )

  // Rejection Mutation
  const rejectMutation = useMutation(
    trpc.tenantApplication.reject.mutationOptions({
      onSuccess: () => {
        toast.success("আবেদনটি সফলভাবে বাতিল করা হয়েছে।")
        setRejectTarget(null)
        setRejectionReason("")
        queryClient.invalidateQueries(trpc.tenantApplication.pathFilter())
      },
      onError: (err: any) => {
        toast.error(err?.message || "আবেদন বাতিল করতে সমস্যা হয়েছে।")
      },
    })
  )

  const handleConfirmReject = () => {
    if (!rejectTarget) return
    const reason = rejectionReason.trim()
    if (!reason) {
      toast.error("অনুগ্রহ করে বাতিলের কারণ উল্লেখ করুন।")
      return
    }
    rejectMutation.mutate({
      id: rejectTarget.id,
      rejectionReason: reason,
    })
  }

  const items = listData?.items || []
  const totalItems = listData?.totalItems || 0
  const totalPages = listData?.totalPages || 1

  // Build active filter chips for DataTableFilterBar
  const activeFilterChips: ActiveFilterChip[] = useMemo(() => {
    const chips: ActiveFilterChip[] = []

    if (statusFilter && statusFilter !== "ALL") {
      const statusLabels: Record<string, string> = {
        PENDING: "পর্যালোচনাধীন",
        APPROVED: "অনুমোদিত",
        REJECTED: "বাতিলকৃত",
      }
      chips.push({
        id: "status",
        label: `স্ট্যাটাস: ${statusLabels[statusFilter] || statusFilter}`,
        onRemove: () => {
          setStatusFilter("ALL")
          setCurrentPage(1)
        },
      })
    }

    if (typeFilter && typeFilter !== "ALL") {
      const typeLabel = TYPE_CONFIG[typeFilter]?.label || typeFilter
      chips.push({
        id: "type",
        label: `ধরন: ${typeLabel}`,
        onRemove: () => {
          setTypeFilter("ALL")
          setCurrentPage(1)
        },
      })
    }

    return chips
  }, [statusFilter, typeFilter])

  const handleResetAllFilters = () => {
    setSearchQuery("")
    setStatusFilter("ALL")
    setTypeFilter("ALL")
    setCurrentPage(1)
  }

  // Stats cards config matching Academic Class UI
  const statsCards: StatCardItem[] = [
    {
      title: "মোট আবেদন",
      value: statsData?.totalCount ?? 0,
      icon: Inbox,
      iconColor: "text-indigo-600 dark:text-primary",
      iconBg: "bg-indigo-50 dark:bg-primary/10 border border-indigo-100/80 dark:border-primary/20",
    },
    {
      title: "পর্যালোচনাধীন",
      value: statsData?.pendingCount ?? 0,
      icon: Clock,
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40",
    },
    {
      title: "অনুমোদিত আবেদন",
      value: statsData?.approvedCount ?? 0,
      icon: CheckCircle2,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40",
    },
    {
      title: "বাতিলকৃত আবেদন",
      value: statsData?.rejectedCount ?? 0,
      icon: AlertCircle,
      iconColor: "text-rose-600 dark:text-rose-400",
      iconBg: "bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/40",
    },
  ]

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Page Header matching Academic Class */}
      <PageHeader
        title="অনবোর্ডিং আবেদন ব্যবস্থাপনা (Applications)"
        description="নতুন নিবন্ধিত ব্যবহারকারীদের শিক্ষা প্রতিষ্ঠান আবেদন পর্যালোচনা করুন এবং স্বয়ংক্রিয় ডেটাবেজ প্রভিশন সম্পন্ন করুন।"
        icon={Inbox}
        badge={{
          label: `${toBengaliDigits(statsData?.totalCount ?? totalItems)} টি আবেদন`,
          variant: "indigo",
        }}
        action={{
          label: "প্রতিষ্ঠান তালিকা",
          href: "/tenants",
          icon: Building2,
        }}
      />

      {/* Stats Cards matching Academic Class */}
      <StatsCards
        cards={statsCards}
        isLoading={isStatsLoading}
        ariaLabel="অনবোর্ডিং আবেদন পরিসংখ্যান ওভারভিউ"
      />

      {/* Filters matching Academic Class */}
      <DataTableFilterBar
        searchPlaceholder="প্রতিষ্ঠান, মোবাইল বা ইমেইল দিয়ে খুঁজুন..."
        searchQuery={searchQuery}
        onSearchChange={(query) => {
          setSearchQuery(query)
          setCurrentPage(1)
        }}
        activeFilters={activeFilterChips}
        onResetAll={activeFilterChips.length > 0 || searchQuery ? handleResetAllFilters : undefined}
        filterButtonLabel="ফিল্টার"
        filtersHeading="আবেদন ফিল্টারসমূহ"
        activeFiltersLabel="অ্যাক্টিভ ফিল্টারসমূহ:"
        resetLabel="রিসেট"
        resetAllLabel="সব রিসেট"
        applyFiltersLabel="ফিল্টার প্রয়োগ করুন"
        refineDisplayLabel="স্ট্যাটাস বা প্রতিষ্ঠানের ধরন অনুযায়ী ফিল্টার করুন"
      >
        {/* Status Filter */}
        <Select
          value={statusFilter}
          onValueChange={(val) => {
            setStatusFilter(val as any)
            setCurrentPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-[150px] rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-card text-foreground font-medium text-xs sm:text-sm h-10 px-3">
            <SelectValue placeholder="সকল স্ট্যাটাস" />
          </SelectTrigger>
          <SelectContent className="bg-popover text-popover-foreground border border-slate-200 dark:border-white/[0.08] rounded-xl shadow-lg">
            <SelectItem value="ALL">সকল স্ট্যাটাস</SelectItem>
            <SelectItem value="PENDING">পর্যালোচনাধীন (Pending)</SelectItem>
            <SelectItem value="APPROVED">অনুমোদিত (Approved)</SelectItem>
            <SelectItem value="REJECTED">বাতিলকৃত (Rejected)</SelectItem>
          </SelectContent>
        </Select>

        {/* Institution Type Filter */}
        <Select
          value={typeFilter}
          onValueChange={(val) => {
            setTypeFilter(val)
            setCurrentPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-[150px] rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-card text-foreground font-medium text-xs sm:text-sm h-10 px-3">
            <SelectValue placeholder="সকল ধরন" />
          </SelectTrigger>
          <SelectContent className="bg-popover text-popover-foreground border border-slate-200 dark:border-white/[0.08] rounded-xl shadow-lg">
            <SelectItem value="ALL">সকল ধরন</SelectItem>
            <SelectItem value="SCHOOL">বিদ্যালয় (School)</SelectItem>
            <SelectItem value="COLLEGE">কলেজ (College)</SelectItem>
            <SelectItem value="MADRASAH">মাদরাসা (Madrasah)</SelectItem>
            <SelectItem value="COACHING">কোচিং (Coaching)</SelectItem>
            <SelectItem value="TUTOR">টিউটর (Tutor)</SelectItem>
            <SelectItem value="OTHER">অন্যান্য (Other)</SelectItem>
          </SelectContent>
        </Select>
      </DataTableFilterBar>

      {/* Main Content: Table / Cards */}
      <div className="space-y-4">
        {/* Loading State matching Academic Class */}
        {isListLoading ? (
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.04]">
              <div className="h-5 w-40 bg-slate-200 dark:bg-white/10 rounded-md animate-pulse" />
              <div className="h-8 w-24 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={`skel-${i}`}
                className="h-16 w-full bg-slate-100/80 dark:bg-white/[0.03] rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : isError ? (
          /* Error State matching Academic Class */
          <div className="rounded-2xl border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/10 p-8 text-center text-rose-600 dark:text-rose-400">
            <p className="text-sm font-semibold">আবেদনসমূহ লোড করতে সমস্যা হয়েছে।</p>
            <p className="text-xs text-muted-foreground mt-1">
              অনুগ্রহ করে পুনরায় চেষ্টা করুন বা পেইজটি রিফ্রেশ দিন।
            </p>
          </div>
        ) : items.length === 0 ? (
          /* Empty State matching Academic Class */
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-card shadow-xs py-16 px-6 text-center select-none">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-primary/10 border border-indigo-100/80 dark:border-primary/20 text-indigo-600 dark:text-primary mx-auto flex items-center justify-center mb-4 shadow-sm shadow-indigo-100/50 dark:shadow-none">
              <Inbox className="w-8 h-8 stroke-[1.8]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-foreground font-headline">
              কোনো আবেদন পাওয়া যায়নি
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-muted-foreground max-w-md mx-auto font-body">
              ফিল্টার পরিবর্তন করে দেখুন অথবা অনুসন্ধান শব্দ পরিবর্তন করুন।
            </p>
            {(searchQuery || statusFilter !== "ALL" || typeFilter !== "ALL") && (
              <div className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResetAllFilters}
                  className="rounded-xl font-bold h-10 px-5 gap-2 cursor-pointer font-headline"
                >
                  <span>ফিল্টার রিসেট করুন</span>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View (>= md) matching Academic Class */}
            <div className="hidden md:block rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card shadow-xs overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-200/70 dark:border-white/[0.08] hover:bg-transparent bg-slate-50/50 dark:bg-white/[0.02]">
                    <TableHead className="pl-6 font-semibold text-xs uppercase tracking-wider text-muted-foreground font-headline">
                      প্রতিষ্ঠান ও ধরন
                    </TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground font-headline">
                      আবেদনকারী ও যোগাযোগ
                    </TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground font-headline">
                      অবস্থান
                    </TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground font-headline">
                      রেফারেল কোড
                    </TableHead>
                    <TableHead className="w-32 text-center font-semibold text-xs uppercase tracking-wider text-muted-foreground font-headline">
                      স্ট্যাটাস
                    </TableHead>
                    <TableHead className="w-28 font-semibold text-xs uppercase tracking-wider text-muted-foreground font-headline">
                      তারিখ
                    </TableHead>
                    <TableHead className="w-28 text-right pr-6 font-semibold text-xs uppercase tracking-wider text-muted-foreground font-headline">
                      পদক্ষেপ
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((app: any) => {
                    const typeCfg = getTypeConfig(app.type)
                    const formattedDate = new Date(app.createdAt).toLocaleDateString("bn-BD", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })

                    return (
                      <TableRow
                        key={app.id}
                        className="border-b border-slate-200/60 dark:border-white/[0.05] transition-colors hover:bg-slate-50/60 dark:hover:bg-white/[0.02]"
                      >
                        {/* Institution Name & Type Badge */}
                        <TableCell className="pl-6 py-3.5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={cn(
                                  "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border font-body",
                                  typeCfg.badgeClass
                                )}
                              >
                                {typeCfg.label}
                              </span>
                              <span className="font-bold text-sm text-foreground font-headline line-clamp-1">
                                {app.name}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Applicant & Contact */}
                        <TableCell className="py-3.5">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                              <User className="size-3 text-muted-foreground shrink-0" />
                              <span className="line-clamp-1">{app.user?.name || "ব্যবহারকারী"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1 font-mono">
                                <Phone className="size-3 text-muted-foreground shrink-0" />
                                <span>{toBengaliDigits(app.phone)}</span>
                              </div>
                              {app.user?.email && (
                                <div className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground/80">
                                  <Mail className="size-3 text-muted-foreground shrink-0" />
                                  <span className="truncate max-w-[140px]">{app.user.email}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Location */}
                        <TableCell className="py-3.5">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="size-3.5 text-indigo-500 shrink-0" />
                            <span className="line-clamp-1">
                              {app.district?.nameBn || app.district?.name || "—"}
                              {app.division?.nameBn ? `, ${app.division.nameBn}` : ""}
                            </span>
                          </div>
                        </TableCell>

                        {/* Referral Code */}
                        <TableCell className="py-3.5">
                          {app.referralCode ? (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
                              <Share2 className="size-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span>{app.referralCode}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground/60">—</span>
                          )}
                        </TableCell>

                        {/* Status Badge */}
                        <TableCell className="text-center py-3.5">
                          {app.status === "PENDING" && (
                            <Badge
                              variant="outline"
                              className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 gap-1 text-[11px] font-semibold"
                            >
                              <Clock className="size-3 text-amber-600 dark:text-amber-400 shrink-0" />
                              <span>পর্যালোচনাধীন</span>
                            </Badge>
                          )}
                          {app.status === "APPROVED" && (
                            <Badge
                              variant="outline"
                              className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 gap-1 text-[11px] font-semibold"
                            >
                              <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span>অনুমোদিত</span>
                            </Badge>
                          )}
                          {app.status === "REJECTED" && (
                            <div className="space-y-0.5 flex flex-col items-center">
                              <Badge
                                variant="outline"
                                className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 gap-1 text-[11px] font-semibold"
                              >
                                <XCircle className="size-3 text-rose-600 dark:text-rose-400 shrink-0" />
                                <span>বাতিলকৃত</span>
                              </Badge>
                              {app.rejectionReason && (
                                <p
                                  className="text-[10px] text-rose-600 dark:text-rose-400 max-w-[120px] truncate"
                                  title={app.rejectionReason}
                                >
                                  {app.rejectionReason}
                                </p>
                              )}
                            </div>
                          )}
                        </TableCell>

                        {/* Submission Date */}
                        <TableCell className="py-3.5 text-xs text-muted-foreground font-mono">
                          {formattedDate}
                        </TableCell>

                        {/* Action Menu matching Academic Class */}
                        <TableCell className="text-right pr-6 py-3.5">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="size-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg"
                              >
                                <MoreVertical className="size-4" />
                                <span className="sr-only">অ্যাকশন মেনু</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-48 rounded-xl border border-slate-200/80 dark:border-white/[0.08] shadow-lg p-1.5"
                            >
                              {app.status === "PENDING" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => router.push(`/tenants/create?applicationId=${app.id}`)}
                                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 rounded-lg cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
                                  >
                                    <ArrowRight className="size-3.5" />
                                    <span>প্রভিশন ও অনুমোদন</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="my-1 border-slate-100 dark:border-white/[0.05]" />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setRejectTarget(app)
                                      setRejectionReason("")
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
                                  >
                                    <XCircle className="size-3.5" />
                                    <span>আবেদন বাতিল করুন</span>
                                  </DropdownMenuItem>
                                </>
                              )}

                              {app.status === "APPROVED" && (
                                <>
                                  {app.tenantId ? (
                                    <DropdownMenuItem
                                      onClick={() => router.push(`/tenants/${app.tenantId}`)}
                                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-foreground rounded-lg cursor-pointer"
                                    >
                                      <ExternalLink className="size-3.5 text-indigo-500" />
                                      <span>প্রতিষ্ঠান ড্যাশবোর্ড</span>
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem
                                      onClick={() => router.push(`/tenants`)}
                                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-foreground rounded-lg cursor-pointer"
                                    >
                                      <Building2 className="size-3.5 text-indigo-500" />
                                      <span>প্রতিষ্ঠান তালিকা</span>
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}

                              {app.status === "REJECTED" && (
                                <DropdownMenuItem
                                  onClick={() => router.push(`/tenants/create?applicationId=${app.id}`)}
                                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-foreground rounded-lg cursor-pointer"
                                >
                                  <ArrowRight className="size-3.5 text-indigo-500" />
                                  <span>পুনরায় বিবেচনা করুন</span>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card List View (< md) matching Academic Class */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {items.map((app: any) => {
                const typeCfg = getTypeConfig(app.type)
                const formattedDate = new Date(app.createdAt).toLocaleDateString("bn-BD", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })

                return (
                  <div
                    key={`mob-${app.id}`}
                    className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-4 space-y-3 shadow-xs transition-all"
                  >
                    {/* Header row: Type Badge, Status & Actions */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.04]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border font-body",
                            typeCfg.badgeClass
                          )}
                        >
                          {typeCfg.label}
                        </span>

                        {app.status === "PENDING" && (
                          <Badge
                            variant="outline"
                            className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 gap-1 text-[10px] font-semibold px-2 py-0.5"
                          >
                            <Clock className="size-2.5 text-amber-600 dark:text-amber-400" />
                            <span>পর্যালোচনাধীন</span>
                          </Badge>
                        )}
                        {app.status === "APPROVED" && (
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 gap-1 text-[10px] font-semibold px-2 py-0.5"
                          >
                            <CheckCircle2 className="size-2.5 text-emerald-600 dark:text-emerald-400" />
                            <span>অনুমোদিত</span>
                          </Badge>
                        )}
                        {app.status === "REJECTED" && (
                          <Badge
                            variant="outline"
                            className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 gap-1 text-[10px] font-semibold px-2 py-0.5"
                          >
                            <XCircle className="size-2.5 text-rose-600 dark:text-rose-400" />
                            <span>বাতিলকৃত</span>
                          </Badge>
                        )}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="size-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg"
                          >
                            <MoreVertical className="size-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-44 rounded-xl border border-slate-200/80 dark:border-white/[0.08] shadow-lg p-1.5"
                        >
                          {app.status === "PENDING" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => router.push(`/tenants/create?applicationId=${app.id}`)}
                                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 rounded-lg cursor-pointer"
                              >
                                <ArrowRight className="size-3.5" />
                                <span>প্রভিশন সম্পন্ন করুন</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="my-1 border-slate-100 dark:border-white/[0.05]" />
                              <DropdownMenuItem
                                onClick={() => {
                                  setRejectTarget(app)
                                  setRejectionReason("")
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 rounded-lg cursor-pointer"
                              >
                                <XCircle className="size-3.5" />
                                <span>বাতিল করুন</span>
                              </DropdownMenuItem>
                            </>
                          )}
                          {app.status === "APPROVED" && (
                            <DropdownMenuItem
                              onClick={() =>
                                app.tenantId
                                  ? router.push(`/tenants/${app.tenantId}`)
                                  : router.push(`/tenants`)
                              }
                              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer"
                            >
                              <ExternalLink className="size-3.5 text-indigo-500" />
                              <span>প্রতিষ্ঠান দেখুন</span>
                            </DropdownMenuItem>
                          )}
                          {app.status === "REJECTED" && (
                            <DropdownMenuItem
                              onClick={() => router.push(`/tenants/create?applicationId=${app.id}`)}
                              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer"
                            >
                              <ArrowRight className="size-3.5 text-indigo-500" />
                              <span>পুনরায় দেখুন</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Title */}
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-sm text-foreground font-headline">
                        {app.name}
                      </h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-body">
                        <User className="size-3 text-muted-foreground shrink-0" />
                        <span>{app.user?.name || "ব্যবহারকারী"}</span>
                        {app.user?.email && (
                          <>
                            <span>•</span>
                            <span className="truncate">{app.user.email}</span>
                          </>
                        )}
                      </p>
                    </div>

                    {/* Contact & Location Details */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground font-body pt-1">
                      <div className="flex items-center gap-1.5 font-mono">
                        <Phone className="size-3 text-indigo-500 shrink-0" />
                        <span>{toBengaliDigits(app.phone)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="size-3 text-indigo-500 shrink-0" />
                        <span className="truncate">
                          {app.district?.nameBn || app.district?.name || "—"}
                          {app.division?.nameBn ? `, ${app.division.nameBn}` : ""}
                        </span>
                      </div>
                    </div>

                    {/* Referral & Date Footer */}
                    <div className="pt-2 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="size-3" />
                        <span>{formattedDate}</span>
                      </div>

                      {app.referralCode ? (
                        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono font-bold text-[10px]">
                          <Share2 className="size-2.5" />
                          <span>{app.referralCode}</span>
                        </div>
                      ) : null}
                    </div>

                    {/* Action Button for Pending */}
                    {app.status === "PENDING" && (
                      <div className="pt-2">
                        <Button
                          size="sm"
                          onClick={() => router.push(`/tenants/create?applicationId=${app.id}`)}
                          className="w-full h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 shadow-xs cursor-pointer font-headline"
                        >
                          <span>প্রভিশন ও সম্পন্ন করুন</span>
                          <ArrowRight className="size-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Pagination matching Academic Class */}
            {totalItems > 0 && (
              <DataTablePagination
                page={currentPage}
                limit={itemsPerPage}
                totalItems={totalItems}
                entityName="টি আবেদন"
                isLoading={isListLoading}
                onPageChange={(page) => setCurrentPage(page)}
                onLimitChange={(newLimit) => {
                  setItemsPerPage(newLimit)
                  setCurrentPage(1)
                }}
                pageSizeOptions={[10, 20, 50, 100]}
              />
            )}
          </>
        )}
      </div>

      {/* Reject Confirmation Dialog matching System Standards */}
      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold font-headline text-foreground flex items-center gap-2">
              <ShieldAlert className="size-5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>অনবোর্ডিং আবেদন বাতিলকরণ</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-body">
              আপনি কি নিশ্চিত যে আপনি &quot;{rejectTarget?.name}&quot; প্রতিষ্ঠানের আবেদনটি বাতিল করতে চান?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <label className="text-xs font-semibold text-foreground font-body block">
              বাতিলের কারণ (আবেদনকারী দেখতে পাবেন):
            </label>
            <Textarea
              placeholder="যেমন: প্রদত্ত মোবাইল নম্বরে যোগাযোগ করা সম্ভব হয়নি অথবা তথ্যে অসঙ্গতি রয়েছে..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              className="text-xs rounded-xl border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02]"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectTarget(null)}
              disabled={rejectMutation.isPending}
              className="rounded-xl font-body"
            >
              বাতিল নয়
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmReject}
              disabled={rejectMutation.isPending}
              className="rounded-xl gap-1.5 font-headline font-bold"
            >
              {rejectMutation.isPending && <Loader2 className="size-3.5 animate-spin" />}
              <span>আবেদন বাতিল করুন</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

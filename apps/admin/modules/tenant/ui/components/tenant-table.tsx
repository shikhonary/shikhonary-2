"use client"

import React from "react"
import Link from "next/link"
import {
  Building2,
  Database,
  Edit,
  ExternalLink,
  Eye,
  Mail,
  MapPin,
  MoreVertical,
  Plus,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Check,
  X,
  AlertTriangle,
} from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
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
import { cn } from "@workspace/ui/lib/utils"
import { DataTablePagination } from "@/components/shared/data-table-pagination"
import { toBengaliDigits } from "@workspace/utils"

export interface TenantItem {
  id: string
  name: string
  nameBn?: string | null
  slug: string
  type?: string | null
  logo?: string | null
  subdomain?: string | null
  customDomain?: string | null
  districtName?: string | null
  upazilaName?: string | null
  databaseStatus?: string | null
  isActive: boolean
  isSuspended: boolean
  createdAt: string | Date
  subscription?: {
    plan?: {
      displayName: string
      code?: string
    } | null
  } | null
  _count?: {
    members: number
  } | null
}

interface TenantTableProps {
  items: TenantItem[]
  isLoading: boolean
  isError?: boolean
  onToggleActive?: (id: string, currentStatus: boolean) => void
  onDelete?: (id: string, name: string) => void
  onInvite?: (id: string, name: string) => void
  currentPage: number
  itemsPerPage: number
  totalItems: number
  totalPages: number
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
  onCreateNew?: () => void
}

const TYPE_CONFIG: Record<string, { labelBn: string; color: string; bg: string }> = {
  SCHOOL: { labelBn: "বিদ্যালয়", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200/50" },
  COLLEGE: { labelBn: "কলেজ", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200/50" },
  MADRASAH: { labelBn: "মাদ্রাসা", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/50" },
  UNIVERSITY: { labelBn: "বিশ্ববিদ্যালয়", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200/50" },
}

function DatabaseStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { color: string; bg: string; border: string; label: string }> = {
    PENDING: {
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      border: "border-amber-200 dark:border-amber-800/40",
      label: "পেন্ডিং",
    },
    READY: {
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      border: "border-emerald-200 dark:border-emerald-800/40",
      label: "প্রস্তুত",
    },
    ACTIVE: {
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      border: "border-emerald-200 dark:border-emerald-800/40",
      label: "সক্রিয়",
    },
    FAILED: {
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950/40",
      border: "border-rose-200 dark:border-rose-800/40",
      label: "ব্যর্থ",
    },
  }
  const cfg = configs[status] ?? configs.PENDING!
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold",
        cfg.color,
        cfg.bg,
        cfg.border
      )}
    >
      <Database className="size-3" />
      <span>{cfg.label}</span>
    </span>
  )
}

export function TenantTable({
  items,
  isLoading,
  isError,
  onToggleActive,
  onDelete,
  onInvite,
  currentPage,
  itemsPerPage,
  totalItems,
  totalPages,
  onPageChange,
  onLimitChange,
  onCreateNew,
}: TenantTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
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
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/10 p-8 text-center text-rose-600 dark:text-rose-400">
        <p className="text-sm font-semibold">প্রতিষ্ঠান তালিকা লোড করতে সমস্যা হয়েছে।</p>
        <p className="text-xs text-muted-foreground mt-1">
          অনুগ্রহ করে পুনরায় চেষ্টা করুন বা পেইজটি রিফ্রেশ দিন।
        </p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-card shadow-xs py-16 px-6 text-center select-none">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-primary/10 border border-indigo-100/80 dark:border-primary/20 text-indigo-600 dark:text-primary mx-auto flex items-center justify-center mb-4 shadow-sm shadow-indigo-100/50 dark:shadow-none">
          <Building2 className="w-8 h-8 stroke-[1.8]" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-foreground font-headline">
          কোনো শিক্ষা প্রতিষ্ঠান পাওয়া যায়নি
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-muted-foreground max-w-md mx-auto font-body">
          ফিল্টার পরিবর্তন করে দেখুন অথবা নতুন প্রতিষ্ঠান যুক্ত করুন।
        </p>
        {onCreateNew && (
          <div className="mt-6">
            <Button
              type="button"
              onClick={onCreateNew}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-5 gap-2 shadow-sm shadow-indigo-200 dark:shadow-none transition-all font-headline cursor-pointer"
            >
              <Plus className="size-4" />
              <span>নতুন প্রতিষ্ঠান যুক্ত করুন</span>
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-200/70 dark:border-white/[0.08] hover:bg-transparent bg-slate-50/50 dark:bg-white/[0.02]">
              <TableHead className="w-16 pl-6 font-semibold text-xs uppercase tracking-wider text-muted-foreground font-headline">
                ক্রম
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground font-headline">
                শিক্ষা প্রতিষ্ঠানের নাম
              </TableHead>
              <TableHead className="w-32 font-semibold text-xs uppercase tracking-wider text-muted-foreground font-headline">
                ধরণ
              </TableHead>
              <TableHead className="w-44 font-semibold text-xs uppercase tracking-wider text-muted-foreground font-headline">
                জেলা / উপজেলা
              </TableHead>
              <TableHead className="w-36 font-semibold text-xs uppercase tracking-wider text-muted-foreground font-headline">
                সাবস্ক্রিপশন
              </TableHead>
              <TableHead className="w-28 text-center font-semibold text-xs uppercase tracking-wider text-muted-foreground font-headline">
                ডেটাবেস
              </TableHead>
              <TableHead className="w-28 text-center font-semibold text-xs uppercase tracking-wider text-muted-foreground font-headline">
                স্ট্যাটাস
              </TableHead>
              <TableHead className="w-20 text-right pr-6 font-semibold text-xs uppercase tracking-wider text-muted-foreground font-headline">
                অ্যাকশন
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((tenant, idx) => {
              const displayIndex = (currentPage - 1) * itemsPerPage + idx + 1
              const typeCfg = TYPE_CONFIG[tenant.type || "SCHOOL"] || {
                labelBn: tenant.type || "প্রতিষ্ঠান",
                color: "text-slate-600",
                bg: "bg-slate-100",
              }
              const isLive = tenant.isActive && !tenant.isSuspended

              return (
                <TableRow
                  key={tenant.id}
                  className="border-b border-slate-200/60 dark:border-white/[0.05] transition-colors hover:bg-slate-50/60 dark:hover:bg-white/[0.02]"
                >
                  {/* Serial */}
                  <TableCell className="pl-6">
                    <span className="inline-flex items-center justify-center size-7 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                      {toBengaliDigits(displayIndex)}
                    </span>
                  </TableCell>

                  {/* Name & Subdomain */}
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/40 overflow-hidden mt-0.5">
                        {tenant.logo ? (
                          <img
                            src={tenant.logo}
                            alt={tenant.name}
                            className="size-full object-contain"
                          />
                        ) : (
                          <Building2 className="size-5" />
                        )}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <Link
                          href={`/tenants/${tenant.id}`}
                          className="font-bold text-sm text-foreground hover:text-indigo-600 dark:hover:text-primary transition-colors font-headline block line-clamp-1"
                        >
                          {tenant.nameBn || tenant.name}
                        </Link>
                        {tenant.nameBn && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {tenant.name}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <a
                            href={`https://${tenant.slug}.shikhonary.com`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            <span>{tenant.slug}.shikhonary.com</span>
                            <ExternalLink className="size-2.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Type */}
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border",
                        typeCfg.color,
                        typeCfg.bg
                      )}
                    >
                      <Building2 className="size-3" />
                      <span>{typeCfg.labelBn}</span>
                    </span>
                  </TableCell>

                  {/* Location */}
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="size-3 text-slate-400 shrink-0" />
                      <span className="line-clamp-1">
                        {tenant.districtName
                          ? `${tenant.districtName}${tenant.upazilaName ? ` / ${tenant.upazilaName}` : ""}`
                          : "—"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Subscription Plan */}
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 dark:bg-white/[0.06] text-foreground">
                      {tenant.subscription?.plan?.displayName || "ফ্রি টিয়ার"}
                    </span>
                  </TableCell>

                  {/* Database Status */}
                  <TableCell className="text-center">
                    <DatabaseStatusBadge status={tenant.databaseStatus ?? "PENDING"} />
                  </TableCell>

                  {/* Active / Suspended Status */}
                  <TableCell className="text-center">
                    {tenant.isSuspended ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        <AlertTriangle className="size-3" />
                        <span>স্থগিত</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onToggleActive?.(tenant.id, tenant.isActive)}
                        className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer select-none",
                          tenant.isActive
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                            : "bg-slate-500/10 text-slate-500 border border-slate-500/20 hover:bg-slate-500/20"
                        )}
                      >
                        {tenant.isActive ? (
                          <>
                            <Check className="size-3" />
                            <span>সক্রিয়</span>
                          </>
                        ) : (
                          <>
                            <X className="size-3" />
                            <span>নিষ্ক্রিয়</span>
                          </>
                        )}
                      </button>
                    )}
                  </TableCell>

                  {/* Action Menu */}
                  <TableCell className="text-right pr-6">
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
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/tenants/${tenant.id}`}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer"
                          >
                            <Eye className="size-3.5 text-indigo-500" />
                            <span>বিবরণ দেখুন</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/tenants/${tenant.id}/edit`}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer"
                          >
                            <Edit className="size-3.5 text-slate-500" />
                            <span>সম্পাদনা করুন</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onInvite?.(tenant.id, tenant.nameBn || tenant.name)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer"
                        >
                          <Mail className="size-3.5 text-indigo-500" />
                          <span>সদস্য আমন্ত্রণ</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1 border-slate-100 dark:border-white/[0.05]" />
                        <DropdownMenuItem
                          onClick={() => onToggleActive?.(tenant.id, tenant.isActive)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer"
                        >
                          {tenant.isActive ? (
                            <>
                              <ToggleLeft className="size-3.5 text-amber-500" />
                              <span>নিষ্ক্রিয় করুন</span>
                            </>
                          ) : (
                            <>
                              <ToggleRight className="size-3.5 text-emerald-500" />
                              <span>সক্রিয় করুন</span>
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1 border-slate-100 dark:border-white/[0.05]" />
                        <DropdownMenuItem
                          onClick={() => onDelete?.(tenant.id, tenant.nameBn || tenant.name)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                          <span>মুছে ফেলুন</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card List View (< md) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {items.map((tenant, idx) => {
          const displayIndex = (currentPage - 1) * itemsPerPage + idx + 1
          const typeCfg = TYPE_CONFIG[tenant.type || "SCHOOL"] || {
            labelBn: tenant.type || "প্রতিষ্ঠান",
            color: "text-slate-600",
            bg: "bg-slate-100",
          }

          return (
            <div
              key={`mob-${tenant.id}`}
              className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-4 space-y-3 shadow-xs transition-all"
            >
              {/* Header row: Position, Status & Actions */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.04]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center justify-center size-6 rounded-md bg-slate-100 dark:bg-white/[0.06] text-[11px] font-bold text-slate-700 dark:text-slate-300 font-mono">
                    #{toBengaliDigits(displayIndex)}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                      typeCfg.color,
                      typeCfg.bg
                    )}
                  >
                    {typeCfg.labelBn}
                  </span>
                  {tenant.isSuspended ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                      স্থগিত
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onToggleActive?.(tenant.id, tenant.isActive)}
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold",
                        tenant.isActive
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : "bg-slate-500/10 text-slate-500 border border-slate-500/20"
                      )}
                    >
                      <span>{tenant.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="size-7 p-0 text-muted-foreground hover:text-indigo-600"
                  >
                    <Link href={`/tenants/${tenant.id}`}>
                      <Eye className="size-3.5" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="size-7 p-0 text-muted-foreground hover:text-indigo-600"
                  >
                    <Link href={`/tenants/${tenant.id}/edit`}>
                      <Edit className="size-3.5" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete?.(tenant.id, tenant.nameBn || tenant.name)}
                    className="size-7 p-0 text-muted-foreground hover:text-rose-500"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>

              {/* Title & Subdomain */}
              <div className="space-y-1">
                <Link
                  href={`/tenants/${tenant.id}`}
                  className="font-bold text-sm text-foreground hover:text-indigo-600 dark:hover:text-primary transition-colors font-headline block"
                >
                  {tenant.nameBn || tenant.name}
                </Link>
                {tenant.nameBn && (
                  <p className="text-xs text-muted-foreground">{tenant.name}</p>
                )}
                <div className="flex items-center gap-1.5 text-xs font-mono text-indigo-600 dark:text-indigo-400">
                  <span>{tenant.slug}.shikhonary.com</span>
                </div>
              </div>

              {/* Footer row: Plan & Database */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between text-xs text-muted-foreground font-medium">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {tenant.subscription?.plan?.displayName || "ফ্রি প্ল্যান"}
                </span>
                <DatabaseStatusBadge status={tenant.databaseStatus ?? "PENDING"} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination Footer */}
      {totalItems > 0 && (
        <DataTablePagination
          page={currentPage}
          limit={itemsPerPage}
          totalItems={totalItems}
          entityName="টি প্রতিষ্ঠান"
          isLoading={isLoading}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      )}
    </div>
  )
}

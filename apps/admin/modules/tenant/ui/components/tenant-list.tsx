"use client"

import React from "react"
import {
  Edit,
  Eye,
  MoreVertical,
  ToggleLeft,
  ToggleRight,
  Trash2,
  ExternalLink,
  Building,
  Database,
  Plus,
  Mail,
} from "lucide-react"
import Link from "next/link"

import { Badge } from "@workspace/ui/components/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Button } from "@workspace/ui/components/button"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@workspace/ui/components/table"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "@workspace/ui/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"

import { useDeleteTenantModalStore } from "../store/use-delete-tenant-modal-store"
import { useInvitationModalStore } from "../store/use-invitation-modal-store"

export interface Column<T> {
  key: keyof T | string
  header: string
  hideOnMobile?: boolean
  render?: (item: T) => React.ReactNode
}

const columns: Column<any>[] = [
  {
    key: "name",
    header: "Union Porishod Name",
    render: (tenant) => (
      <div className="flex flex-col gap-1">
        <Link href={`/tenants/${tenant.id}`} className="font-headline-md text-base font-bold text-on-surface hover:text-primary transition-colors">
          {tenant.name}
        </Link>
        {tenant.nameBn && (
          <span className="font-body-md text-xs text-on-surface-variant">{tenant.nameBn}</span>
        )}
        <div className="flex items-center gap-1.5 opacity-80 mt-0.5">
          <a
            href={`https://${tenant.slug}.uphub.gov.bd`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-[11px] font-mono text-outline hover:text-primary hover:underline"
          >
            <span>{tenant.slug}.uphub.gov.bd</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    ),
  },
  {
    key: "type",
    header: "Type",
    hideOnMobile: true,
    render: (tenant) => (
      <Badge
        variant="outline"
        className="bg-primary/5 text-primary border-primary/20 font-bold text-[10px] uppercase tracking-wider rounded-md h-6"
      >
        <Building className="w-3 h-3 mr-1.5" />
        {tenant.type || "UNION_PORISHOD"}
      </Badge>
    ),
  },
  {
    key: "district",
    header: "District / Upazila",
    hideOnMobile: true,
    render: (tenant) => (
      <span className="font-body-md text-sm text-on-surface-variant">
        {tenant.districtName ? `${tenant.districtName} / ${tenant.upazilaName ?? ""}` : "N/A"}
      </span>
    ),
  },
  {
    key: "subscriptionTier",
    header: "Plan Tier",
    hideOnMobile: true,
    render: (tenant) => (
      <Badge className="bg-primary/10 text-primary border-primary/20 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-lg border h-6">
        {tenant.subscription?.plan?.displayName || "FREE"}
      </Badge>
    ),
  },
  {
    key: "databaseStatus",
    header: "Database Status",
    hideOnMobile: true,
    render: (tenant) => (
      <DatabaseStatusBadge status={tenant.databaseStatus ?? "PENDING"} />
    ),
  },
  {
    key: "isActive",
    header: "Status",
    render: (tenant) => (
      <StatusBadge active={tenant.isActive && !tenant.isSuspended} />
    ),
  },
]

interface TenantListProps {
  onActive: (id: string) => Promise<void>
  onDeactivate: (id: string) => Promise<void>
  isLoading: boolean
  handleDelete: (id: string, name: string) => void
}

function DatabaseStatusBadge({ status }: { status: string }) {
  const configs: Record<
    string,
    { color: string; bg: string; border: string }
  > = {
    PENDING: {
      color: "text-amber-600",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    READY: {
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    ACTIVE: {
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    FAILED: {
      color: "text-error",
      bg: "bg-error/10",
      border: "border-error/20",
    },
  }
  const cfg = configs[status] ?? configs.PENDING!
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider",
        cfg.color,
        cfg.bg,
        cfg.border
      )}
    >
      <Database className="w-3 h-3" />
      {status}
    </div>
  )
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <Badge
      variant={active ? "default" : "secondary"}
      className={cn(
        "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all",
        active
          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"
          : "bg-surface-variant text-on-surface-variant border-transparent"
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full mr-1.5",
          active ? "bg-emerald-500 animate-pulse" : "bg-outline"
        )}
      />
      {active ? "Active" : "Inactive"}
    </Badge>
  )
}

export function TenantList({
  onActive,
  onDeactivate,
  isLoading,
  handleDelete,
}: TenantListProps) {
  const openDeleteModal = useDeleteTenantModalStore((state) => state.openModal)
  const openInvitationModal = useInvitationModalStore((state) => state.openModal)

  const { data: tenantData, isLoading: isQueryLoading } = useQuery(
    trpc.tenant.list.queryOptions({ limit: 50 })
  )

  const items = tenantData?.tenants ?? []

  const handleToggleActiveStatus = (id: string, isActive: boolean) => {
    if (isActive) {
      onDeactivate(id)
    } else {
      onActive(id)
    }
  }

  if (isQueryLoading || isLoading) {
    return (
      <div className="p-4 md:p-12">
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 w-full rounded-xl bg-surface-container-high animate-pulse" />
          ))}
        </div>
        <div className="hidden md:flex items-center justify-center p-8 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-3xl text-primary">
            progress_activity
          </span>
          <span className="ml-3 font-body-md">Loading Union Porishod records...</span>
        </div>
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="p-8 sm:p-12 text-center">
        <Building className="mx-auto h-12 w-12 text-outline" />
        <h3 className="mt-4 font-headline-md text-lg font-bold text-on-surface">
          No Union Porishods Found
        </h3>
        <p className="mt-1 font-body-md text-sm text-on-surface-variant">
          Get started by creating your first Union Porishod portal.
        </p>
        <div className="mt-6">
          <Button
            asChild
            className="inline-flex items-center gap-2 rounded-lg bg-primary-container px-6 py-2.5 font-bold text-on-primary-container hover:bg-primary hover:text-white h-auto normal-case tracking-normal cursor-pointer"
          >
            <Link href="/tenants/create">
              <Plus className="h-4 w-4" />
              <span>Create Tenant</span>
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Mobile Card List View (< md) — Matched 1:1 with Role module */}
      <div className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:hidden">
        {items.map((item: any) => (
          <div
            key={item.id}
            className="group relative flex flex-col gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                  <Building className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-headline-md text-base font-extrabold text-on-surface truncate">
                    {item.name}
                  </h4>
                  <p className="font-body-md text-xs leading-relaxed text-on-surface-variant mt-0.5 truncate">
                    {item.slug}.uphub.gov.bd
                  </p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high cursor-pointer h-8 w-8 shrink-0"
                    title="Actions"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border border-outline-variant shadow-md rounded-xl p-1.5 min-w-[150px]">
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                  >
                    <Link href={`/tenants/${item.id}`}>
                      <Eye className="h-3.5 w-3.5" />
                      <span>View Details</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                  >
                    <Link href={`/tenants/${item.id}/edit`}>
                      <Edit className="h-3.5 w-3.5" />
                      <span>Edit Tenant</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => openInvitationModal(item.id, item.name)}
                    className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                  >
                    <Mail className="h-3.5 w-3.5 text-primary" />
                    <span>Invite Member</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1 border-outline-variant/30" />
                  <DropdownMenuItem
                    onClick={() => handleToggleActiveStatus(item.id, item.isActive)}
                    className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                  >
                    {item.isActive ? (
                      <>
                        <ToggleLeft className="h-3.5 w-3.5 text-amber-500" />
                        <span>Deactivate</span>
                      </>
                    ) : (
                      <>
                        <ToggleRight className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Activate</span>
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => openDeleteModal(item.id, item.name)}
                    className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-error hover:bg-error-container/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center justify-between border-t border-outline-variant/20 pt-2.5 text-[11px]">
              <StatusBadge active={item.isActive && !item.isSuspended} />
              <DatabaseStatusBadge status={item.databaseStatus ?? "PENDING"} />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View (>= md) — Matched 1:1 with Role module */}
      <div className="hidden md:block">
        <Table className="w-full text-left font-body-md">
          <TableHeader className="bg-surface-container-low border-b border-outline-variant">
            <TableRow className="border-b border-outline-variant bg-surface-container-low hover:bg-surface-container-low">
              {columns.map((column) => (
                <TableHead
                  key={String(column.key)}
                  className="px-6 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase h-auto"
                >
                  {column.header}
                </TableHead>
              ))}
              <TableHead className="px-6 py-4 text-right font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-outline-variant/30">
            {items.map((item: any) => (
              <TableRow
                key={item.id}
                className="hover:bg-surface-container-low transition-all duration-200 ease-in-out group border-b border-outline-variant/30"
              >
                {columns.map((column) => (
                  <TableCell
                    key={String(column.key)}
                    className="py-4 group-hover:py-5 px-6 transition-all duration-200 ease-in-out"
                  >
                    {column.render ? column.render(item) : ""}
                  </TableCell>
                ))}
                <TableCell className="py-4 group-hover:py-5 px-6 text-right transition-all duration-200 ease-in-out">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high cursor-pointer h-auto w-auto"
                        title="Actions"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border border-outline-variant shadow-md rounded-xl p-1.5 min-w-[150px]">
                      <DropdownMenuItem
                        asChild
                        className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                      >
                        <Link href={`/tenants/${item.id}`}>
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Details</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        asChild
                        className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                      >
                        <Link href={`/tenants/${item.id}/edit`}>
                          <Edit className="h-3.5 w-3.5" />
                          <span>Edit Tenant</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openInvitationModal(item.id, item.name)}
                        className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                      >
                        <Mail className="h-3.5 w-3.5 text-primary" />
                        <span>Invite Member</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-1 border-outline-variant/30" />
                      <DropdownMenuItem
                        onClick={() => handleToggleActiveStatus(item.id, item.isActive)}
                        className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                      >
                        {item.isActive ? (
                          <>
                            <ToggleLeft className="h-3.5 w-3.5 text-amber-500" />
                            <span>Deactivate</span>
                          </>
                        ) : (
                          <>
                            <ToggleRight className="h-3.5 w-3.5 text-emerald-500" />
                            <span>Activate</span>
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-1 border-outline-variant/30" />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => openDeleteModal(item.id, item.name)}
                        className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-error hover:bg-error-container/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

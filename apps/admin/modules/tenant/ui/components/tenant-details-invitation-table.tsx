"use client"

import React, { useState } from "react"
import { format, formatDistanceToNow, differenceInHours } from "date-fns"
import {
  MoreVertical,
  RotateCw,
  XCircle,
  Clock,
  CheckCircle2,
} from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { cn } from "@workspace/ui/lib/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { toast } from "@workspace/ui/components/sonner"

interface TenantDetailsInvitationsTableProps {
  invitations: any[]
}

const statusConfig: Record<
  string,
  {
    label: string;
    icon: React.ReactNode;
    colorClass: string;
  }
> = {
  PENDING: {
    label: "Pending",
    icon: <Clock className="h-3 w-3" />,
    colorClass: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  ACCEPTED: {
    label: "Accepted",
    icon: <CheckCircle2 className="h-3 w-3" />,
    colorClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  REJECTED: {
    label: "Revoked",
    icon: <XCircle className="h-3 w-3" />,
    colorClass: "bg-red-500/10 text-red-600 border-red-500/20",
  },
  EXPIRED: {
    label: "Expired",
    icon: <Clock className="h-3 w-3 opacity-50" />,
    colorClass: "bg-surface-variant text-on-surface-variant border-transparent opacity-60",
  },
}

export function TenantDetailsInvitationsTable({
  invitations,
}: TenantDetailsInvitationsTableProps) {
  const queryClient = useQueryClient()
  const [resendDialogOpen, setResendDialogOpen] = useState(false)
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
  const [selectedInvitation, setSelectedInvitation] = useState<any | null>(null)

  const resendMutation = useMutation({
    ...trpc.tenant.resendInvitation.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.tenant.pathFilter())
      toast.success("Invitation link renewed and resent successfully.")
      setResendDialogOpen(false)
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to resend invitation")
    },
  })

  const revokeMutation = useMutation({
    ...trpc.tenant.revokeInvitation.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.tenant.pathFilter())
      toast.success("Invitation access link revoked.")
      setRevokeDialogOpen(false)
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to revoke invitation")
    },
  })

  const handleResend = () => {
    if (selectedInvitation?.id) {
      resendMutation.mutate({ id: selectedInvitation.id })
    }
  }

  const handleRevoke = () => {
    if (selectedInvitation?.id) {
      revokeMutation.mutate({ id: selectedInvitation.id })
    }
  }

  const isExpiringSoon = (expiresAt: Date) => {
    return differenceInHours(new Date(expiresAt), new Date()) < 24
  }

  return (
    <div className="relative overflow-x-auto">
      <Table className="w-full text-left font-body-md">
        <TableHeader className="bg-surface-container-low border-b border-outline-variant">
          <TableRow className="border-b border-outline-variant bg-surface-container-low hover:bg-surface-container-low">
            <TableHead className="px-6 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
              Admin Details
            </TableHead>
            <TableHead className="px-6 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
              Role
            </TableHead>
            <TableHead className="px-6 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
              Status
            </TableHead>
            <TableHead className="px-6 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
              Sent By
            </TableHead>
            <TableHead className="px-6 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
              Expiration
            </TableHead>
            <TableHead className="px-6 py-4 text-right font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-outline-variant/30">
          {invitations.map((invitation) => {
            const status =
              statusConfig[invitation.status] ?? statusConfig.PENDING!
            const expiringSoon =
              invitation.status === "PENDING" &&
              isExpiringSoon(invitation.expiresAt)

            return (
              <TableRow
                key={invitation.id}
                className="hover:bg-surface-container-low transition-all duration-200 ease-in-out border-b border-outline-variant/30"
              >
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                      {invitation.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-on-surface text-sm">
                        {invitation.email}
                      </span>
                      {invitation.name && (
                        <span className="text-[10px] font-bold text-outline uppercase tracking-wider mt-0.5">
                          {invitation.name}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <Badge
                    variant="outline"
                    className="px-2.5 py-0.5 rounded-lg border-outline-variant/40 bg-surface-container-low text-[10px] font-extrabold uppercase tracking-wider text-on-surface-variant"
                  >
                    {invitation.role || "STAFF"}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <Badge
                    className={cn(
                      "gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all border",
                      status.colorClass
                    )}
                  >
                    {status.icon}
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <span className="text-xs font-semibold text-on-surface-variant">
                    {invitation.invitedBy || "Super Admin"}
                  </span>
                </TableCell>
                <TableCell className="py-4 px-6 font-mono text-xs">
                  {invitation.status === "PENDING" ? (
                    <div className="flex flex-col gap-0.5">
                      <span className={cn("font-bold text-xs", expiringSoon ? "text-amber-600" : "text-on-surface")}>
                        {formatDistanceToNow(new Date(invitation.expiresAt), { addSuffix: true })}
                      </span>
                      <span className="text-[10px] text-outline">
                        {format(new Date(invitation.expiresAt), "MMM d, hh:mm a")}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-outline">
                      {format(new Date(invitation.updatedAt || invitation.createdAt), "MMM d, yyyy")}
                    </span>
                  )}
                </TableCell>
                <TableCell className="py-4 px-6 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high cursor-pointer h-8 w-8"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border border-outline-variant shadow-md rounded-xl p-1.5 min-w-[150px]">
                      {invitation.status === "PENDING" && (
                        <>
                          <DropdownMenuItem
                            className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                            onClick={() => {
                              setSelectedInvitation(invitation)
                              setResendDialogOpen(true)
                            }}
                          >
                            <RotateCw className="h-3.5 w-3.5 text-primary" />
                            <span>Resend Link</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-1 border-outline-variant/30" />
                          <DropdownMenuItem
                            variant="destructive"
                            className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-error hover:bg-error-container/20"
                            onClick={() => {
                              setSelectedInvitation(invitation)
                              setRevokeDialogOpen(true)
                            }}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Revoke Access</span>
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {/* Resend Confirmation Dialog */}
      <AlertDialog open={resendDialogOpen} onOpenChange={setResendDialogOpen}>
        <AlertDialogContent className="rounded-2xl border border-outline-variant/40 bg-white p-6 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline-md text-lg font-bold text-on-surface">
              Resend Invitation Link?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body-md text-sm text-on-surface-variant leading-relaxed">
              This will generate a fresh token and extend expiration by 7 days for{" "}
              <span className="font-bold text-primary">{selectedInvitation?.email}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="rounded-lg border border-outline-variant px-4 py-2 text-xs font-semibold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResend}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90"
            >
              Resend Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke Confirmation Dialog */}
      <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <AlertDialogContent className="rounded-2xl border border-outline-variant/40 bg-white p-6 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline-md text-lg font-bold text-error">
              Revoke Invitation Link?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body-md text-sm text-on-surface-variant leading-relaxed">
              Are you sure you want to invalidate the invitation for{" "}
              <span className="font-bold text-on-surface">{selectedInvitation?.email}</span>? The user will not be able to join using this token.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="rounded-lg border border-outline-variant px-4 py-2 text-xs font-semibold">
              Keep Active
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
            >
              Revoke Access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

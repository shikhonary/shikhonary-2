"use client"

import { Mail } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { useInvitationModalStore } from "../store/use-invitation-modal-store"
import { TenantDetailsInvitationsTable } from "./tenant-details-invitation-table"

interface TenantDetailsInvitationsProps {
  invitations: any[]
  tenant: {
    id: string
    name: string
  }
}

export function TenantDetailsInvitations({
  invitations = [],
  tenant,
}: TenantDetailsInvitationsProps) {
  const openModal = useInvitationModalStore((state) => state.openModal)

  return (
    <Card className="rounded-2xl border border-outline-variant/40 bg-white shadow-xs overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-outline-variant/30 p-5 sm:p-6">
        <div>
          <CardTitle className="font-headline-md text-lg font-bold text-on-surface flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            Team & Admin Invitations
          </CardTitle>
          <CardDescription className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-1">
            Manage administrative access credentials and pending invitations for {tenant.name}.
          </CardDescription>
        </div>
        <Button
          onClick={() => openModal(tenant.id, tenant.name)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90 transition-all cursor-pointer h-10 shrink-0"
        >
          <Mail className="w-4 h-4" />
          <span>Invite Team Member</span>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {invitations.length > 0 ? (
          <TenantDetailsInvitationsTable invitations={invitations} />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="size-16 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-outline" />
            </div>
            <h3 className="font-headline-md text-base font-bold text-on-surface mb-1">
              No Active Team Invitations
            </h3>
            <p className="font-body-md text-xs text-on-surface-variant mb-6 max-w-sm">
              Grant administrative management access to local Union Porishod officials by sending an invitation.
            </p>
            <Button
              variant="outline"
              onClick={() => openModal(tenant.id, tenant.name)}
              className="rounded-xl border border-outline-variant px-5 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer h-10"
            >
              <Mail className="w-4 h-4 mr-2" />
              <span>Send First Invitation</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

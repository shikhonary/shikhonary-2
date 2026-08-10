"use client"

import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { ArrowLeft, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"

import { TenantDetailsHeader } from "../components/tenant-details-header"
import { TenantDetailsHeaderCard } from "../components/tenant-details-header-card"
import { TenantDetailsOverview } from "../components/tenant-details-overview"
import { TenantDetailsUsage } from "../components/tenant-details-usage"
import { TenantDetailsSubscription } from "../components/tenant-details-subscription"
import { TenantDetailsDatabase } from "../components/tenant-details-database"
import { TenantDetailsInvitations } from "../components/tenant-details-invitations"
import { InviteAdminModal } from "../components/invite-admin-modal"

interface TenantViewProps {
  tenantId: string
}

export const TenantView = ({ tenantId }: TenantViewProps) => {
  const router = useRouter()
  const { data: tenant, isLoading } = useQuery(
    trpc.tenant.byId.queryOptions({ id: tenantId })
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-on-surface-variant">
        Loading Union Porishod details...
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="size-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto border border-border/50">
            <XCircle className="size-8 text-muted-foreground/50" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-on-surface">Tenant not found</h2>
            <p className="text-sm text-on-surface-variant">
              The tenant you are looking for does not exist or has been removed.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl"
            onClick={() => router.push("/tenants")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tenants
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 lg:p-6 space-y-8 animate-in fade-in duration-500">
      <div>
        <TenantDetailsHeader
          isSuspended={tenant.isSuspended}
          tenantId={tenant.id}
          tenantName={tenant.name}
        />
      </div>

      <div>
        <TenantDetailsHeaderCard tenant={tenant as any} />
      </div>

      <div>
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-muted/50 p-1.5 rounded-2xl border border-border/50 backdrop-blur-md h-auto inline-flex overflow-x-auto max-w-full">
            <TabsTrigger
              value="overview"
              className="rounded-xl px-5 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-soft data-[state=active]:text-primary transition-all"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="usage"
              className="rounded-xl px-5 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-soft data-[state=active]:text-primary transition-all"
            >
              Usage & Limits
            </TabsTrigger>
            <TabsTrigger
              value="subscription"
              className="rounded-xl px-5 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-soft data-[state=active]:text-primary transition-all"
            >
              Subscription
            </TabsTrigger>
            <TabsTrigger
              value="invitations"
              className="rounded-xl px-5 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-soft data-[state=active]:text-primary transition-all"
            >
              Invitations
            </TabsTrigger>
            <TabsTrigger
              value="database"
              className="rounded-xl px-5 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-soft data-[state=active]:text-primary transition-all"
            >
              Database
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent
              value="overview"
              className="mt-0 focus-visible:outline-none"
            >
              <TenantDetailsOverview tenant={tenant as any} />
            </TabsContent>

            <TabsContent
              value="usage"
              className="mt-0 focus-visible:outline-none"
            >
              <TenantDetailsUsage tenant={tenant as any} />
            </TabsContent>

            <TabsContent
              value="subscription"
              className="mt-0 focus-visible:outline-none"
            >
              <TenantDetailsSubscription tenant={tenant as any} />
            </TabsContent>

            <TabsContent
              value="invitations"
              className="mt-0 focus-visible:outline-none"
            >
              <TenantDetailsInvitations invitations={(tenant as any).invitations || []} tenant={tenant as any} />
            </TabsContent>

            <TabsContent
              value="database"
              className="mt-0 focus-visible:outline-none"
            >
              <TenantDetailsDatabase tenant={tenant as any} />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Invite Admin Modal */}
      <InviteAdminModal />
    </div>
  )
}

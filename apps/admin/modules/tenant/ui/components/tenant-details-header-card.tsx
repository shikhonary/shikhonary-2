import {
  Building2,
  MapPin,
  Clock,
  CreditCard,
  Globe,
  CheckCircle,
  XCircle,
  Calendar,
  AlertTriangle,
} from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"

interface TenantDetailsHeaderCardProps {
  tenant: any
}

export function TenantDetailsHeaderCard({ tenant }: TenantDetailsHeaderCardProps) {
  const domainDisplay = tenant.subdomain
    ? `${tenant.subdomain}.shikhonary.com`
    : tenant.customDomain || `${tenant.slug}.shikhonary.com`

  const formattedDate = new Date(tenant.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <div className="bg-card/40 backdrop-blur-xl rounded-3xl border border-border/50 overflow-hidden shadow-soft">
      {/* Top gradient bar */}
      <div className="h-1 bg-gradient-to-r from-primary via-primary-container to-primary/30" />

      {/* Suspension Alert Banner */}
      {tenant.isSuspended && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-6 py-4 flex items-start gap-3">
          <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-destructive">This institution is currently suspended</p>
            {tenant.suspendReason && (
              <p className="text-xs text-destructive/80 mt-1">Reason: {tenant.suspendReason}</p>
            )}
          </div>
        </div>
      )}

      <div className="p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left: Tenant Identity */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              {/* Logo/Avatar */}
              <div className="size-16 sm:size-20 bg-gradient-to-br from-primary/20 to-primary-container/20 rounded-2xl border border-primary/20 flex items-center justify-center flex-shrink-0 shadow-soft">
                {tenant.logo ? (
                  <img
                    src={tenant.logo}
                    alt={tenant.name}
                    className="size-full object-contain rounded-2xl"
                  />
                ) : (
                  <Building2 className="size-8 sm:size-10 text-primary" />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-black text-foreground tracking-tight">
                    {tenant.name}
                  </h2>
                  {tenant.nameBn && (
                    <span className="text-sm font-semibold text-muted-foreground font-headline">
                      ({tenant.nameBn})
                    </span>
                  )}
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-xl h-auto"
                  >
                    {tenant.type || "SCHOOL"}
                  </Badge>
                  {tenant.isSuspended ? (
                    <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-xl h-auto border">
                      <XCircle className="h-3 w-3 mr-1" />
                      Suspended
                    </Badge>
                  ) : tenant.isActive ? (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-xl h-auto border">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-xl h-auto"
                    >
                      Inactive
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground font-mono">
                  /{tenant.slug}
                </p>

                {tenant.description && (
                  <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
                    {tenant.description}
                  </p>
                )}
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
              <InfoRow
                icon={MapPin}
                label="Division / District"
                value={`${tenant.divisionName || "N/A"}, ${tenant.districtName || "N/A"}`}
              />
              <InfoRow
                icon={Globe}
                label="Domain"
                value={domainDisplay}
                mono
              />
              <InfoRow
                icon={Clock}
                label="Created"
                value={formattedDate}
              />
              <InfoRow
                icon={CreditCard}
                label="Plan"
                value={tenant.subscription?.plan?.displayName ?? "Free Tier"}
              />
              <InfoRow
                icon={Calendar}
                label="Fiscal Year"
                value={tenant.currentFiscalYear?.year ? `FY ${tenant.currentFiscalYear.year}` : "Not Set"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: any
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="size-8 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <p className={`text-sm font-bold text-foreground ${mono ? "font-mono" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  )
}

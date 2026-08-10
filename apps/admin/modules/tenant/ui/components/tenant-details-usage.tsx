import { Users, FileText, HardDrive, TrendingUp, UserCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

interface TenantDetailsUsageProps {
  tenant: any
}

function UsageBar({ label, used, max, icon: Icon, colorClass }: {
  label: string
  used: number
  max: number
  icon: any
  colorClass: string
}) {
  const pct = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0
  const isHigh = pct >= 80
  const isMedium = pct >= 50

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-muted/50 rounded-lg border border-border/50">
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <span className="text-xs font-bold text-foreground">{label}</span>
        </div>
        <div className="text-right">
          <span className="text-xs font-black text-foreground">{used.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground"> / {max.toLocaleString()}</span>
        </div>
      </div>
      <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            isHigh ? "bg-destructive" : isMedium ? "bg-amber-500" : colorClass
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground">{pct}% used</p>
    </div>
  )
}

export function TenantDetailsUsage({ tenant }: TenantDetailsUsageProps) {
  const plan = tenant.subscription?.plan

  const maxCitizens = tenant.customCitizenLimit ?? plan?.defaultCitizenLimit ?? 1000
  const maxStaff = tenant.customStaffLimit ?? plan?.defaultStaffLimit ?? 10
  const maxCertificates = tenant.customCertificateLimit ?? plan?.defaultCertificateLimit ?? 500
  const maxStorage = tenant.customStorageLimit ?? plan?.defaultStorageLimit ?? 500

  return (
    <div className="space-y-6">
      <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-3xl shadow-soft">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-xl text-primary border border-primary/20">
              <TrendingUp className="w-4 h-4" />
            </div>
            Resource Usage & Quotas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <UsageBar
            label="Registered Citizens"
            used={tenant.citizenCount ?? 0}
            max={maxCitizens}
            icon={Users}
            colorClass="bg-primary"
          />
          <UsageBar
            label="Staff Seats"
            used={tenant.staffCount ?? 0}
            max={maxStaff}
            icon={UserCheck}
            colorClass="bg-blue-500"
          />
          <UsageBar
            label="Certificates Issued"
            used={tenant.certificateCount ?? 0}
            max={maxCertificates}
            icon={FileText}
            colorClass="bg-purple-500"
          />
          <UsageBar
            label="Storage Used (MB)"
            used={tenant.storageUsedMB ?? 0}
            max={maxStorage}
            icon={HardDrive}
            colorClass="bg-amber-500"
          />
        </CardContent>
      </Card>
    </div>
  )
}

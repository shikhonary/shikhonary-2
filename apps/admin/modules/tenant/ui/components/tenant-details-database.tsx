import {
  Database,
  Server,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"

interface TenantDetailsDatabaseProps {
  tenant: any
}

export function TenantDetailsDatabase({ tenant }: TenantDetailsDatabaseProps) {
  const getStatusConfig = (status: string | null) => {
    switch (status) {
      case "READY":
      case "ACTIVE":
        return {
          color: "text-green-600",
          bg: "bg-green-500/10",
          border: "border-green-500/20",
          icon: CheckCircle2,
          label: "Ready",
        }
      case "PROVISIONING":
        return {
          color: "text-blue-600",
          bg: "bg-blue-500/10",
          border: "border-blue-500/20",
          icon: Clock,
          label: "Provisioning",
        }
      case "FAILED":
        return {
          color: "text-destructive",
          bg: "bg-destructive/10",
          border: "border-destructive/20",
          icon: AlertTriangle,
          label: "Failed",
        }
      default:
        return {
          color: "text-amber-600",
          bg: "bg-amber-500/10",
          border: "border-amber-500/20",
          icon: Clock,
          label: "Pending",
        }
    }
  }

  const statusCfg = getStatusConfig(tenant.databaseStatus)
  const StatusIcon = statusCfg.icon

  return (
    <div className="space-y-6">
      <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-3xl shadow-soft">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-xl text-primary border border-primary/20">
              <Database className="w-4 h-4" />
            </div>
            Database Instance
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center">
                <Server className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Database Name
                </p>
                <p className="text-sm font-bold font-mono text-foreground">
                  {tenant.databaseName || `tenant_${tenant.slug}`}
                </p>
              </div>
            </div>
            <Badge
              className={`${statusCfg.bg} ${statusCfg.color} ${statusCfg.border} border font-black text-xs uppercase px-3 py-1.5 rounded-xl`}
            >
              <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
              {statusCfg.label}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

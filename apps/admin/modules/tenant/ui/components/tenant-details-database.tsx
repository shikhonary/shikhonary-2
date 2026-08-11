"use client"

import { useState } from "react"
import {
  Database,
  Server,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Copy,
  Check,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"

interface TenantDetailsDatabaseProps {
  tenant: any
}

export function TenantDetailsDatabase({ tenant }: TenantDetailsDatabaseProps) {
  const [showConnStr, setShowConnStr] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (!tenant.connectionString) return
    navigator.clipboard.writeText(tenant.connectionString)
    setCopied(true)
    toast.success("Connection string copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

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
          {/* Status & Name */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-muted/30 border border-border/50">
            <div className="flex items-center gap-3.5">
              <div className="size-11 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center shrink-0">
                <Server className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Database Instance Name
                </p>
                <p className="text-base font-black font-mono text-foreground mt-0.5">
                  {tenant.databaseName || `tenant_${tenant.slug}`}
                </p>
              </div>
            </div>
            <Badge
              className={`${statusCfg.bg} ${statusCfg.color} ${statusCfg.border} border font-black text-xs uppercase px-3 py-1.5 rounded-xl`}
            >
              <StatusIcon className="h-3.5 w-3.5 mr-1.5 shrink-0" />
              {statusCfg.label}
            </Badge>
          </div>

          {/* Secure Connection String */}
          <div className="space-y-2.5">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Database Connection URI (Credentials)
            </p>
            <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-muted/20 border border-border/40 font-mono text-xs overflow-hidden relative">
              <div className="flex-1 truncate pr-20 select-all font-semibold">
                {tenant.connectionString ? (
                  showConnStr ? (
                    tenant.connectionString
                  ) : (
                    "postgresql://••••••••••••••••••••••••••••••••"
                  )
                ) : (
                  <span className="text-muted-foreground/60 italic font-sans font-normal">
                    Connection string not configured or provisioned
                  </span>
                )}
              </div>

              {tenant.connectionString && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-background/80 backdrop-blur-md p-1 rounded-xl border border-border/50">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowConnStr(!showConnStr)}
                    className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    {showConnStr ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground/80 leading-relaxed max-w-xl">
              <strong className="text-destructive">Warning:</strong> This URI contains superuser access credentials to the tenant database instance. Never share or display this in client screenshots or untrusted endpoints.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

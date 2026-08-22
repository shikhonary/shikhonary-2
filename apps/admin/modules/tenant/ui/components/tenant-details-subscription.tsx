import { CreditCard, Calendar, AlertTriangle, CheckCircle2, Check, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"

interface TenantDetailsSubscriptionProps {
  tenant: any
}

export function TenantDetailsSubscription({ tenant }: TenantDetailsSubscriptionProps) {
  const sub = tenant.subscription
  const plan = sub?.plan

  if (!sub || !plan) {
    return (
      <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-3xl shadow-soft">
        <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="size-16 bg-muted/50 rounded-2xl flex items-center justify-center">
            <CreditCard className="size-8 text-muted-foreground/50" />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-foreground">No Subscription</h3>
            <p className="text-sm text-muted-foreground mt-1">
              This tenant doesn't have an active subscription plan.
            </p>
          </div>
          <Button size="sm" className="rounded-xl">Assign Plan</Button>
        </CardContent>
      </Card>
    )
  }

  const features = [
    { label: "Issue Certificates & Transcripts", enabled: plan.canIssueCertificates },
    { label: "Online Fee Collection & Billing", enabled: plan.canCollectOnlineFees },
    { label: "LMS & Homework Portal", enabled: plan.canUseLms },
    { label: "Digital/RFID Attendance System", enabled: plan.canManageAttendance },
    { label: "School Library Management", enabled: plan.canManageLibrary },
    { label: "Transport & Route Tracking", enabled: plan.canManageTransport },
    { label: "Automated SMS Notifications", enabled: plan.canSendSms },
    { label: "Use Custom Branding & Domain", enabled: plan.canUseCustomDomain },
  ]

  const formattedPeriodEnd = new Date(sub.currentPeriodEnd).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="space-y-6">
      <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-3xl shadow-soft">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-xl text-primary border border-primary/20">
              <CreditCard className="w-4 h-4" />
            </div>
            Subscription Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plan Header Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-muted/30 border border-border/50">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current Plan</p>
              <p className="text-2xl font-black text-foreground mt-1">{plan.displayName}</p>
              {plan.description && (
                <p className="text-xs text-muted-foreground mt-1.5">{plan.description}</p>
              )}
            </div>
            <div className="flex flex-col items-start sm:items-end gap-1.5">
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20 border font-black text-xs uppercase px-3 py-1.5 rounded-xl">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                {sub.status || "ACTIVE"}
              </Badge>
              {sub.currentPeriodEnd && (
                <p className="text-[10px] text-muted-foreground font-medium">
                  Renews: {formattedPeriodEnd}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-muted/20 border border-border/40">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Billing Cycle</p>
              <p className="text-xl font-black text-foreground mt-1 uppercase tracking-tight">
                {sub.billingCycle || "Yearly"}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-muted/20 border border-border/40">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pricing Rate</p>
              <p className="text-xl font-black text-foreground mt-1">
                {sub.billingCycle === "MONTHLY"
                  ? plan.monthlyPriceBDT === 0 ? "Free" : `৳${plan.monthlyPriceBDT.toLocaleString()} / mo`
                  : plan.yearlyPriceBDT === 0 ? "Free" : `৳${plan.yearlyPriceBDT.toLocaleString()} / yr`
                }
              </p>
            </div>
          </div>

          {/* Features Checklist */}
          <div className="space-y-3 pt-2">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Included Features & Modules</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-border/40 bg-card/25"
                >
                  <div className={`p-1 rounded-lg shrink-0 ${
                    feature.enabled
                      ? "bg-green-500/10 text-green-600 border border-green-500/20"
                      : "bg-muted text-muted-foreground/40 border border-border/50"
                  }`}>
                    {feature.enabled ? (
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    ) : (
                      <X className="h-3.5 w-3.5 stroke-[3]" />
                    )}
                  </div>
                  <span className={`text-xs font-bold ${feature.enabled ? "text-foreground" : "text-muted-foreground/60 line-through"}`}>
                    {feature.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { CreditCard, Calendar, AlertTriangle, CheckCircle2 } from "lucide-react"
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
          <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current Plan</p>
              <p className="text-xl font-black text-foreground mt-1">{plan.displayName}</p>
              {plan.description && (
                <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
              )}
            </div>
            <Badge className="bg-green-500/10 text-green-600 border-green-500/20 border font-black text-xs uppercase px-3 py-1.5 rounded-xl">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              {sub.status || "ACTIVE"}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-muted/20 border border-border/40">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Monthly Price</p>
              <p className="text-2xl font-black text-foreground mt-1">
                {plan.monthlyPriceBDT === 0 ? "Free" : `৳${plan.monthlyPriceBDT.toLocaleString()}`}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-muted/20 border border-border/40">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Yearly Price</p>
              <p className="text-2xl font-black text-foreground mt-1">
                {plan.yearlyPriceBDT === 0 ? "Free" : `৳${plan.yearlyPriceBDT.toLocaleString()}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

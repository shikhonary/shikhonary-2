"use client"

import { useTenant } from "@/modules/layout/ui/components/tenant-provider"
import { Building2, Mail, Phone, ShieldCheck } from "lucide-react"

export function DashboardOverview() {
  const { tenant, user } = useTenant()

  return (
    <div className="w-full space-y-6 max-w-6xl mx-auto py-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/10">
        <h2 className="text-xl sm:text-2xl font-bold text-primary mb-2 font-solaiman">
          স্বাগতম, {user.name || "অ্যাডমিন"}!
        </h2>
        <p className="text-sm text-muted-foreground font-solaiman">
          শিখনারী (Shikhonary) এডুকেশনাল ম্যানেজমেন্ট পোর্টালে আপনাকে স্বাগতম। এখান থেকে আপনার প্রতিষ্ঠানের সকল কার্যক্রম পরিচালনা করতে পারবেন।
        </p>
      </div>

      {/* Institution Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-6 rounded-2xl shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm font-solaiman">প্রতিষ্ঠানের বিবরণ</h3>
              <p className="text-xs text-muted-foreground font-solaiman">মৌলিক তথ্য ও পরিচিতি</p>
            </div>
          </div>

          <div className="space-y-3 mt-4 text-sm font-solaiman">
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground">নাম (বাংলা):</span>
              <span className="font-bold">{tenant.nameBn || "N/A"}</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground">নাম (ইংরেজি):</span>
              <span className="font-bold">{tenant.name}</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground">ইউনিক স্ল্যাগ (Slug):</span>
              <span className="font-mono text-xs font-bold">{tenant.slug}</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm font-solaiman">যোগাযোগ ও অ্যাক্সেস</h3>
              <p className="text-xs text-muted-foreground font-solaiman">অ্যাডমিন যোগাযোগের তথ্য</p>
            </div>
          </div>

          <div className="space-y-3 mt-4 text-sm font-solaiman">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground flex items-center gap-1.5"><Mail className="w-4 h-4" /> ইমেইল:</span>
              <span className="font-bold">{tenant.email || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground flex items-center gap-1.5"><Phone className="w-4 h-4" /> ফোন নম্বর:</span>
              <span className="font-bold">{tenant.phone || "N/A"}</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground">অধ্যক্ষ/প্রধান শিক্ষক:</span>
              <span className="font-bold">{tenant.principalName || "N/A"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

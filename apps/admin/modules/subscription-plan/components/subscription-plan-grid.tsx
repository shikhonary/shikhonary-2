"use client"

import Link from "next/link"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import {
  Layers,
  Trash2,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  FileText,
  Receipt,
  MessageSquare,
  Globe,
  BookOpen,
  UserCheck,
  Library,
  Bus,
} from "lucide-react"

export interface SubscriptionPlanItem {
  id: string
  name: string
  displayName: string
  description: string | null
  monthlyPriceBDT: number
  yearlyPriceBDT: number
  isActive: boolean
  isPopular: boolean
  defaultStudentLimit: number
  defaultTeacherLimit: number
  defaultExamLimit: number
  defaultStorageLimit: number
  defaultCreditLimit: number | null
  canCreateExams: boolean
  canCollectFees: boolean
  canUseLms: boolean
  canManageAttendance: boolean
  canManageLibrary: boolean
  canManageTransport: boolean
  canSendSms: boolean
  canUseCustomDomain: boolean
  canUseAiFeatures: boolean
  canExportReports: boolean
}

interface SubscriptionPlanGridProps {
  items: SubscriptionPlanItem[]
  isLoading: boolean
  isError: boolean
  onDelete: (id: string, name: string) => void
}

export function SubscriptionPlanGrid({
  items,
  isLoading,
  isError,
  onDelete,
}: SubscriptionPlanGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {isLoading ? (
        <div className="col-span-full p-8 text-center text-on-surface-variant text-sm flex items-center justify-center gap-3">
          <RefreshCw className="h-5 w-5 animate-spin text-primary" />
          <span>Loading subscription plans...</span>
        </div>
      ) : isError ? (
        <div className="col-span-full p-8 text-center text-error">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-600" />
          <p className="font-body-md font-medium">Failed to load subscription plans.</p>
        </div>
      ) : items.length === 0 ? (
        <div className="col-span-full p-12 text-center flex flex-col items-center gap-3 border border-outline-variant rounded-2xl bg-surface-container-lowest">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Layers className="h-6 w-6" />
          </div>
          <p className="text-sm font-bold text-on-surface">No subscription plans found.</p>
        </div>
      ) : (
        items.map((p) => (
          <Card
            key={p.id}
            className={`relative overflow-hidden rounded-2xl border transition-all duration-200 ${
              p.isPopular
                ? "border-primary shadow-md bg-gradient-to-b from-primary/5 via-white to-white"
                : "border-outline-variant bg-white"
            }`}
          >
            {p.isPopular && (
              <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-sm">
                <Sparkles className="h-3 w-3" /> Most Popular
              </div>
            )}

            <CardHeader className="p-6 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="font-headline-md text-xl font-extrabold text-primary">
                  {p.displayName}
                </CardTitle>
                <Badge variant={p.isActive ? "default" : "secondary"} className="text-[10px] uppercase font-bold">
                  {p.isActive ? "Active" : "Disabled"}
                </Badge>
              </div>
              <p className="text-xs text-on-surface-variant mt-1 min-h-[36px] line-clamp-2">
                {p.description || "Standard Educational SaaS tier."}
              </p>
            </CardHeader>

            <CardContent className="p-6 pt-0 space-y-4">
              <div className="border-t border-b border-outline-variant/30 py-3 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-extrabold text-on-surface">৳{p.yearlyPriceBDT.toLocaleString()}</span>
                  <span className="text-xs text-outline font-medium"> / year</span>
                </div>
                <span className="text-xs text-on-surface-variant font-mono">
                  (৳{p.monthlyPriceBDT}/mo)
                </span>
              </div>

              {/* Resource Limits */}
              <div className="space-y-1.5 text-xs text-on-surface-variant">
                <span className="text-[10px] font-bold uppercase tracking-wider text-outline block mb-1">Default Limits</span>
                <div className="flex justify-between font-medium">
                  <span>Student Seats:</span>
                  <span className="font-bold text-on-surface">{p.defaultStudentLimit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Teacher Seats:</span>
                  <span className="font-bold text-on-surface">{p.defaultTeacherLimit}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Exams:</span>
                  <span className="font-bold text-on-surface">{p.defaultExamLimit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Storage:</span>
                  <span className="font-bold text-on-surface">{p.defaultStorageLimit} MB</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Credits Limit:</span>
                  <span className="font-bold text-on-surface">{p.defaultCreditLimit ?? 30}</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-1.5 text-xs pt-2 border-t border-outline-variant/30">
                <span className="text-[10px] font-bold uppercase tracking-wider text-outline block mb-1">Module Features</span>
                <div className="flex items-center gap-2">
                  <FileText className={`h-3.5 w-3.5 ${p.canCreateExams ? "text-emerald-600" : "text-outline opacity-40"}`} />
                  <span className={p.canCreateExams ? "text-on-surface font-medium" : "text-outline line-through"}>Create Exams</span>
                </div>
                <div className="flex items-center gap-2">
                  <Receipt className={`h-3.5 w-3.5 ${p.canCollectFees ? "text-emerald-600" : "text-outline opacity-40"}`} />
                  <span className={p.canCollectFees ? "text-on-surface font-medium" : "text-outline line-through"}>Fee Collection</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className={`h-3.5 w-3.5 ${p.canUseAiFeatures ? "text-emerald-600" : "text-outline opacity-40"}`} />
                  <span className={p.canUseAiFeatures ? "text-on-surface font-medium" : "text-outline line-through"}>AI Features</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className={`h-3.5 w-3.5 ${p.canExportReports ? "text-emerald-600" : "text-outline opacity-40"}`} />
                  <span className={p.canExportReports ? "text-on-surface font-medium" : "text-outline line-through"}>Export Reports</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className={`h-3.5 w-3.5 ${p.canUseLms ? "text-emerald-600" : "text-outline opacity-40"}`} />
                  <span className={p.canUseLms ? "text-on-surface font-medium" : "text-outline line-through"}>LMS & Homework Portal</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserCheck className={`h-3.5 w-3.5 ${p.canManageAttendance ? "text-emerald-600" : "text-outline opacity-40"}`} />
                  <span className={p.canManageAttendance ? "text-on-surface font-medium" : "text-outline line-through"}>Attendance Module</span>
                </div>
                <div className="flex items-center gap-2">
                  <Library className={`h-3.5 w-3.5 ${p.canManageLibrary ? "text-emerald-600" : "text-outline opacity-40"}`} />
                  <span className={p.canManageLibrary ? "text-on-surface font-medium" : "text-outline line-through"}>Library Module</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bus className={`h-3.5 w-3.5 ${p.canManageTransport ? "text-emerald-600" : "text-outline opacity-40"}`} />
                  <span className={p.canManageTransport ? "text-on-surface font-medium" : "text-outline line-through"}>Transport Module</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className={`h-3.5 w-3.5 ${p.canSendSms ? "text-emerald-600" : "text-outline opacity-40"}`} />
                  <span className={p.canSendSms ? "text-on-surface font-medium" : "text-outline line-through"}>SMS Notification Gateway</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className={`h-3.5 w-3.5 ${p.canUseCustomDomain ? "text-emerald-600" : "text-outline opacity-40"}`} />
                  <span className={p.canUseCustomDomain ? "text-on-surface font-medium" : "text-outline line-through"}>Custom Domain SSL</span>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/30">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-lg text-xs font-bold"
                >
                  <Link href={`/subscription-plans/${p.id}/edit`}>
                    Edit Plan
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(p.id, p.displayName)}
                  className="h-8 w-8 rounded-lg text-on-surface-variant hover:bg-error-container/20 hover:text-error cursor-pointer flex items-center justify-center"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

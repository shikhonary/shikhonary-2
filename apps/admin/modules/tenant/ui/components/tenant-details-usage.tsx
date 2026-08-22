import { Users, FileText, HardDrive, TrendingUp, UserCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

interface TenantDetailsUsageProps {
  tenant: any
}

function UsageBar({
  label,
  used,
  max,
  defaultMax,
  isOverridden,
  icon: Icon,
  colorClass,
}: {
  label: string
  used: number
  max: number
  defaultMax: number
  isOverridden: boolean
  icon: any
  colorClass: string
}) {
  const pct = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0
  const isHigh = pct >= 80
  const isMedium = pct >= 50

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-muted/20 border border-border/40 hover:bg-muted/30 transition-all duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-card rounded-xl border border-border/50 shrink-0">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <span className="text-sm font-bold text-foreground block leading-none">{label}</span>
            {isOverridden && (
              <span className="inline-flex items-center text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md mt-1.5">
                Custom Override
              </span>
            )}
          </div>
        </div>
        <div className="text-right flex flex-col items-end shrink-0">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-black text-foreground">{used.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground"> / {max.toLocaleString()}</span>
          </div>
          {isOverridden && (
            <span className="text-[9px] text-muted-foreground mt-0.5 font-medium">
              Plan Default: {defaultMax.toLocaleString()}
            </span>
          )}
        </div>
      </div>
      <div className="h-2 bg-muted/50 rounded-full overflow-hidden border border-border/20">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            isHigh ? "bg-destructive" : isMedium ? "bg-amber-500" : colorClass
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{pct}% utilized</span>
        <span>{(max - used) >= 0 ? `${(max - used).toLocaleString()} remaining` : "Limit exceeded"}</span>
      </div>
    </div>
  )
}

export function TenantDetailsUsage({ tenant }: TenantDetailsUsageProps) {
  const plan = tenant.subscription?.plan

  const defaultStudents = plan?.defaultStudentLimit ?? 1000
  const maxStudents = tenant.customStudentLimit ?? defaultStudents
  const hasStudentsOverride = tenant.customStudentLimit !== null && tenant.customStudentLimit !== undefined

  const defaultTeachers = plan?.defaultTeacherLimit ?? 10
  const maxTeachers = tenant.customTeacherLimit ?? defaultTeachers
  const hasTeachersOverride = tenant.customTeacherLimit !== null && tenant.customTeacherLimit !== undefined

  const defaultExams = plan?.defaultExamLimit ?? 500
  const maxExams = tenant.customExamLimit ?? defaultExams
  const hasExamsOverride = tenant.customExamLimit !== null && tenant.customExamLimit !== undefined

  const defaultStorage = plan?.defaultStorageLimit ?? 500
  const maxStorage = tenant.customStorageLimit ?? defaultStorage
  const hasStorageOverride = tenant.customStorageLimit !== null && tenant.customStorageLimit !== undefined

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
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UsageBar
              label="Enrolled Students"
              used={tenant.studentCount ?? 0}
              max={maxStudents}
              defaultMax={defaultStudents}
              isOverridden={hasStudentsOverride}
              icon={Users}
              colorClass="bg-primary"
            />
            <UsageBar
              label="Teacher Seats"
              used={tenant.teacherCount ?? 0}
              max={maxTeachers}
              defaultMax={defaultTeachers}
              isOverridden={hasTeachersOverride}
              icon={UserCheck}
              colorClass="bg-blue-500"
            />
            <UsageBar
              label="Exams Created"
              used={tenant.examCount ?? 0}
              max={maxExams}
              defaultMax={defaultExams}
              isOverridden={hasExamsOverride}
              icon={FileText}
              colorClass="bg-purple-500"
            />
            <UsageBar
              label="Storage Capacity (MB)"
              used={tenant.storageUsedMB ?? 0}
              max={maxStorage}
              defaultMax={defaultStorage}
              isOverridden={hasStorageOverride}
              icon={HardDrive}
              colorClass="bg-amber-500"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

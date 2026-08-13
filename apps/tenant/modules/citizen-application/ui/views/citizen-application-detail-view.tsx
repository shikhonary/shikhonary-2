"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@workspace/ui/components/dialog"
import {
  ArrowLeft,
  User,
  Phone,
  CreditCard,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookOpen,
  Calendar,
  Building,
  Info,
  FileText,
  Printer,
} from "lucide-react"
import { toast } from "sonner"
import {
  GENDER_MAP,
  RELIGION_MAP,
  RESIDENT_TYPE_MAP,
  MARITAL_STATUS_MAP,
  Gender,
  Religion,
  ResidentType,
  MaritalStatus,
} from "@workspace/utils"

const statusMap: Record<string, { label: string; variant: string; icon: any }> = {
  PENDING: { label: "পেন্ডিং", variant: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20", icon: Clock },
  APPROVED: { label: "অনুমোদিত", variant: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20", icon: CheckCircle },
  REJECTED: { label: "প্রত্যাখ্যাত", variant: "bg-rose-500/10 text-rose-500 border border-rose-500/20", icon: XCircle },
}

interface CitizenApplicationDetailViewProps {
  applicationId: string
}

export const CitizenApplicationDetailView: React.FC<CitizenApplicationDetailViewProps> = ({ applicationId }) => {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState<"info" | "address" | "action">("info")
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Fetch application details
  const { data: application, isLoading, refetch } = useQuery(
    trpc.citizenApplication.byId.queryOptions({ id: applicationId })
  )

  // Mutations
  const approveMutation = useMutation(
    trpc.citizenApplication.approve.mutationOptions({
      onSuccess: () => {
        toast.success("আবেদনটি সফলভাবে অনুমোদিত হয়েছে এবং নাগরিককে তালিকাভুক্ত করা হয়েছে।")
        setApproveDialogOpen(false)
        void queryClient.invalidateQueries(trpc.citizenApplication.pathFilter())
        void refetch()
      },
      onError: (err: any) => {
        toast.error(`অনুমোদনে ব্যর্থ হয়েছে: ${err.message}`)
      },
    })
  )

  const rejectMutation = useMutation(
    trpc.citizenApplication.reject.mutationOptions({
      onSuccess: () => {
        toast.success("আবেদনটি প্রত্যাখ্যাত করা হয়েছে।")
        setRejectDialogOpen(false)
        void queryClient.invalidateQueries(trpc.citizenApplication.pathFilter())
        void refetch()
      },
      onError: (err: any) => {
        toast.error(`প্রত্যাখ্যানে ব্যর্থ হয়েছে: ${err.message}`)
      },
    })
  )

  const deleteMutation = useMutation(
    trpc.citizenApplication.delete.mutationOptions({
      onSuccess: () => {
        toast.success("আবেদনটি সফলভাবে মুছে ফেলা হয়েছে।")
        setDeleteDialogOpen(false)
        void queryClient.invalidateQueries(trpc.citizenApplication.pathFilter())
        router.push("/citizen-applications")
      },
      onError: (err: any) => {
        toast.error(`মুছে ফেলতে ব্যর্থ হয়েছে: ${err.message}`)
      },
    })
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    )
  }

  if (!application) {
    return (
      <div className="text-center py-20 space-y-4">
        <h3 className="text-xl font-bold text-foreground font-display">আবেদনের তথ্য পাওয়া যায়নি</h3>
        <p className="text-sm text-muted-foreground font-body">
          অনুরোধকৃত আবেদনের আইডি ডাটাবেজে রেকর্ড করা নেই।
        </p>
        <Button onClick={() => router.push("/citizen-applications")} variant="outline" className="rounded-xl">
          <ArrowLeft className="w-4 h-4 mr-2" />
          নাগরিক আবেদনের তালিকায় ফিরুন
        </Button>
      </div>
    )
  }

  const handleApprove = () => {
    approveMutation.mutate({ id: applicationId })
  }

  const handleReject = () => {
    rejectMutation.mutate({ id: applicationId, rejectionReason: rejectionReason.trim() || undefined })
  }

  const handleDelete = () => {
    deleteMutation.mutate({ id: applicationId })
  }

  const StatusIcon = statusMap[application.status]?.icon || Clock
  const wardName = application.presentAddress.ward?.nameBn || application.presentAddress.ward?.name || "N/A"

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/citizen-applications")}
          className="gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-xl w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>আবেদনের তালিকায় ফিরুন</span>
        </Button>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {(application.status === "PENDING" || application.status === "REJECTED") && (
            <Button
              size="sm"
              onClick={() => setApproveDialogOpen(true)}
              className="flex-1 sm:flex-none gap-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
            >
              <CheckCircle className="h-4 w-4" />
              <span>অনুমোদন করুন</span>
            </Button>
          )}

          {application.status === "PENDING" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRejectionReason("")
                setRejectDialogOpen(true)
              }}
              className="flex-1 sm:flex-none gap-1.5 text-xs font-bold rounded-xl border-rose-600/30 text-rose-600 hover:bg-rose-50 cursor-pointer"
            >
              <XCircle className="h-4 w-4" />
              <span>প্রত্যাখ্যান করুন</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/citizen-applications/${applicationId}/preview`, "_blank")}
            className="flex-1 sm:flex-none gap-1.5 text-xs font-bold rounded-xl border-blue-600/30 bg-blue-50 text-blue-700 hover:bg-blue-100"
          >
            <Printer className="h-3.5 w-3.5 text-blue-600" />
            <span>আবেদনপত্র প্রিন্ট</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            className="flex-1 sm:flex-none gap-1.5 text-xs font-bold rounded-xl border-rose-600/30 text-rose-600 hover:bg-rose-50 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>মুছে ফেলুন</span>
          </Button>
        </div>
      </div>

      {/* Main Profile Header Banner Card */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card/90 to-primary/5 p-4 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex size-12 sm:size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0 border border-primary/20 shadow-xs">
              <User className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${statusMap[application.status]?.variant || "bg-muted"}`}>
                  <StatusIcon className="h-3.5 w-3.5 shrink-0" />
                  <span>অবস্থা: {statusMap[application.status]?.label || application.status}</span>
                </span>
                {application.status === "REJECTED" && (
                  <span className="text-xs text-rose-500 font-semibold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg">
                    প্রত্যাখ্যাত
                  </span>
                )}
              </div>

              <h1 className="font-display text-xl sm:text-3xl font-extrabold text-foreground tracking-tight break-words">
                {application.nameBn}
              </h1>

              {application.nameEn && (
                <p className="text-sm text-muted-foreground font-mono leading-none">
                  {application.nameEn}
                </p>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground font-body pt-1.5 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>ওয়ার্ড: <strong>{wardName}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>গ্রাম/মহল্লা: <strong>{application.presentAddress.villageBn}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 font-mono">
                  <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{application.mobile}</span>
                </div>
                {application.nid && (
                  <div className="flex items-center gap-1.5 font-mono">
                    <CreditCard className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>NID: {application.nid}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats / Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Resident Type Card */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-muted-foreground block font-body">বাসিন্দার ধরন</span>
          <div className="text-lg font-extrabold text-foreground">
            {RESIDENT_TYPE_MAP[application.residentType as ResidentType] || application.residentType}
          </div>
        </div>

        {/* Identity Docs Found Count */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-muted-foreground block font-body">প্রদত্ত আইডেন্টিটি নথি</span>
          <div className="text-lg font-extrabold text-foreground">
            {([application.nid, application.birthRegNo, application.passportNo].filter(Boolean).length)} টি
          </div>
        </div>

        {/* Date Submitted */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-muted-foreground block font-body">দাখিলের তারিখ</span>
          <div className="text-lg font-extrabold text-foreground font-mono">
            {new Date(application.createdAt).toLocaleDateString("bn-BD")}
          </div>
        </div>

        {/* Education background */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-muted-foreground block font-body">শিক্ষাগত যোগ্যতা</span>
          <div className="text-lg font-extrabold text-foreground truncate">
            {application.education || "অনির্দিষ্ট"}
          </div>
        </div>
      </div>

      {/* Main Tabs Container */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
        {/* Tab Header — Grid without scrollbar */}
        <div className="grid grid-cols-3 border-b border-border/60 bg-muted/20 p-1 sm:p-1.5 gap-1">
          <Button
            variant="ghost"
            onClick={() => setActiveTab("info")}
            className={`w-full justify-center rounded-xl px-1 sm:px-4 py-2 sm:py-2.5 text-[11px] xs:text-xs sm:text-sm font-extrabold cursor-pointer transition-all truncate text-center h-auto ${
              activeTab === "info"
                ? "bg-card text-primary shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent"
            }`}
          >
            <span>
              <span className="hidden sm:inline">ব্যক্তিগত ও পরিচয় তথ্য</span>
              <span className="sm:hidden">ব্যক্তিগত তথ্য</span>
            </span>
          </Button>

          <Button
            variant="ghost"
            onClick={() => setActiveTab("address")}
            className={`w-full justify-center rounded-xl px-1 sm:px-4 py-2 sm:py-2.5 text-[11px] xs:text-xs sm:text-sm font-extrabold cursor-pointer transition-all truncate text-center h-auto ${
              activeTab === "address"
                ? "bg-card text-primary shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent"
            }`}
          >
            <span>ঠিকানা বিবরণী</span>
          </Button>

          <Button
            variant="ghost"
            onClick={() => setActiveTab("action")}
            className={`w-full justify-center rounded-xl px-1 sm:px-4 py-2 sm:py-2.5 text-[11px] xs:text-xs sm:text-sm font-extrabold cursor-pointer transition-all truncate text-center h-auto ${
              activeTab === "action"
                ? "bg-card text-primary shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent"
            }`}
          >
            <span>আবেদন নিষ্পত্তি</span>
          </Button>
        </div>

        {/* Tab 1: Personal & Identity Info */}
        {activeTab === "info" && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Details */}
              <div className="space-y-4 rounded-xl border border-border/60 p-5 bg-muted/10">
                <h4 className="font-display text-sm font-bold text-primary flex items-center gap-2 border-b border-border/60 pb-2">
                  <User className="h-4 w-4" />
                  <span>ব্যক্তিগত তথ্যসমূহ</span>
                </h4>
                <div className="space-y-3 text-xs font-body">
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">আবেদনকারীর নাম (বাংলা):</span>
                    <span className="font-bold text-foreground">{application.nameBn}</span>
                  </div>
                  {application.nameEn && (
                    <div className="flex justify-between border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">আবেদনকারীর নাম (ইংরেজি):</span>
                      <span className="font-bold text-foreground">{application.nameEn}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">পিতার নাম (বাংলা):</span>
                    <span className="font-bold text-foreground">{application.fatherNameBn}</span>
                  </div>
                  {application.fatherNameEn && (
                    <div className="flex justify-between border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">পিতার নাম (ইংরেজি):</span>
                      <span className="font-bold text-foreground">{application.fatherNameEn}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">মাতার নাম (বাংলা):</span>
                    <span className="font-bold text-foreground">{application.motherNameBn}</span>
                  </div>
                  {application.motherNameEn && (
                    <div className="flex justify-between border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">মাতার নাম (ইংরেজি):</span>
                      <span className="font-bold text-foreground">{application.motherNameEn}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">জন্ম তারিখ:</span>
                    <span className="font-bold text-foreground font-mono">
                      {application.dob ? new Date(application.dob).toLocaleDateString("bn-BD") : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">লিঙ্গ:</span>
                    <span className="font-bold text-foreground">{GENDER_MAP[application.gender as Gender] || application.gender}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">ধর্ম:</span>
                    <span className="font-bold text-foreground">{RELIGION_MAP[application.religion as Religion] || application.religion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">বৈবাহিক অবস্থা:</span>
                    <span className="font-bold text-foreground">{MARITAL_STATUS_MAP[application.maritalStatus as MaritalStatus] || application.maritalStatus}</span>
                  </div>
                </div>
              </div>

              {/* ID Docs & Contact details */}
              <div className="space-y-6">
                <div className="space-y-4 rounded-xl border border-border/60 p-5 bg-muted/10">
                  <h4 className="font-display text-sm font-bold text-primary flex items-center gap-2 border-b border-border/60 pb-2">
                    <BookOpen className="h-4 w-4" />
                    <span>পরিচিতি ও সনাক্তকরণ নথিপত্র</span>
                  </h4>
                  <div className="space-y-3 text-xs font-body">
                    <div className="flex justify-between border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">জাতীয় পরিচয়পত্র (NID):</span>
                      <span className="font-mono font-bold text-foreground">{application.nid || "N/A"}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">জন্ম নিবন্ধন নং:</span>
                      <span className="font-mono font-bold text-foreground">{application.birthRegNo || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">পাসপোর্ট নং:</span>
                      <span className="font-mono font-bold text-foreground">{application.passportNo || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-xl border border-border/60 p-5 bg-muted/10">
                  <h4 className="font-display text-sm font-bold text-primary flex items-center gap-2 border-b border-border/60 pb-2">
                    <Phone className="h-4 w-4" />
                    <span>যোগাযোগ মাধ্যম</span>
                  </h4>
                  <div className="space-y-3 text-xs font-body">
                    <div className="flex justify-between border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">মোবাইল নম্বর:</span>
                      <span className="font-mono font-bold text-foreground">{application.mobile}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ইমেইল ঠিকানা:</span>
                      <span className="font-mono font-bold text-foreground">{application.email || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments / Notes */}
            {(application.commentsBn || application.commentsEn) && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold flex items-center gap-1.5 text-primary">
                  <Building className="w-4 h-4" />
                  মন্তব্য / অতিরিক্ত তথ্য
                </h4>
                <div className="bg-muted/15 p-4 rounded-2xl border text-sm text-foreground space-y-2 leading-relaxed font-body">
                  {application.commentsBn && <p>{application.commentsBn}</p>}
                  {application.commentsEn && <p className="font-mono text-xs text-muted-foreground">{application.commentsEn}</p>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Addresses Info */}
        {activeTab === "address" && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Present Address */}
              <div className="space-y-4 rounded-xl border border-border/60 p-5 bg-muted/10">
                <h4 className="font-display text-sm font-bold text-primary flex items-center gap-2 border-b border-border/60 pb-2">
                  <MapPin className="h-4 w-4" />
                  <span>বর্তমান ঠিকানা</span>
                </h4>
                <div className="space-y-3 text-xs font-body">
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">গ্রাম/মহল্লা (বাংলা):</span>
                    <span className="font-bold text-foreground">{application.presentAddress.villageBn}</span>
                  </div>
                  {application.presentAddress.villageEn && (
                    <div className="flex justify-between border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">গ্রাম/মহল্লা (ইংরেজি):</span>
                      <span className="font-bold text-foreground">{application.presentAddress.villageEn}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">রোড/ব্লক/সেক্টর:</span>
                    <span className="font-bold text-foreground">{application.presentAddress.roadBn || application.presentAddress.roadEn || "N/A"}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">হোল্ডিং নং:</span>
                    <span className="font-bold text-foreground">{application.presentAddress.holdingNo || "N/A"}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">ওয়ার্ড নম্বর ও নাম:</span>
                    <span className="font-bold text-foreground">ওয়ার্ড {application.presentAddress.ward?.nameBn || application.presentAddress.ward?.name || "N/A"}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">পোষ্ট অফিস:</span>
                    <span className="font-bold text-foreground">{application.presentAddress.postOfficeBn}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">উপজেলা ও জেলা:</span>
                    <span className="font-bold text-foreground">{application.presentAddress.upazilaNameBn}, {application.presentAddress.districtNameBn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">বিভাগ:</span>
                    <span className="font-bold text-foreground">{application.presentAddress.divisionNameBn}</span>
                  </div>
                </div>
              </div>

              {/* Permanent Address */}
              <div className="space-y-4 rounded-xl border border-border/60 p-5 bg-muted/10">
                <h4 className="font-display text-sm font-bold text-primary flex items-center gap-2 border-b border-border/60 pb-2">
                  <MapPin className="h-4 w-4" />
                  <span>স্থায়ী ঠিকানা</span>
                </h4>
                {application.sameAsPresent ? (
                  <div className="bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-600 border border-emerald-500/20 rounded-xl flex items-center gap-2 font-body h-[200px] justify-center flex-col text-center">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                    <span>বর্তমান ঠিকানা এবং স্থায়ী ঠিকানা একই</span>
                  </div>
                ) : application.permanentAddress ? (
                  <div className="space-y-3 text-xs font-body">
                    <div className="flex justify-between border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">গ্রাম/মহল্লা (বাংলা):</span>
                      <span className="font-bold text-foreground">{application.permanentAddress.villageBn}</span>
                    </div>
                    {application.permanentAddress.villageEn && (
                      <div className="flex justify-between border-b border-border/40 pb-2">
                        <span className="text-muted-foreground">গ্রাম/মহল্লা (ইংরেজি):</span>
                        <span className="font-bold text-foreground">{application.permanentAddress.villageEn}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">রোড/ব্লক/সেক্টর:</span>
                      <span className="font-bold text-foreground">{application.permanentAddress.roadBn || application.permanentAddress.roadEn || "N/A"}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">হোল্ডিং নং:</span>
                      <span className="font-bold text-foreground">{application.permanentAddress.holdingNo || "N/A"}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">ওয়ার্ড নম্বর ও নাম:</span>
                      <span className="font-bold text-foreground">ওয়ার্ড {application.permanentAddress.ward?.nameBn || application.permanentAddress.ward?.name || "N/A"}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">পোষ্ট অফিস:</span>
                      <span className="font-bold text-foreground">{application.permanentAddress.postOfficeBn}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">উপজেলা ও জেলা:</span>
                      <span className="font-bold text-foreground">{application.permanentAddress.upazilaNameBn}, {application.permanentAddress.districtNameBn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">বিভাগ:</span>
                      <span className="font-bold text-foreground">{application.permanentAddress.divisionNameBn}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted/20 border border-dashed rounded-xl text-xs text-muted-foreground font-body">
                    স্থায়ী ঠিকানার তথ্য প্রদান করা হয়নি।
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Action & Decision Controls */}
        {activeTab === "action" && (
          <div className="p-6 space-y-6 font-body">
            {application.status === "PENDING" ? (
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-yellow-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-foreground">আবেদনটি বর্তমানে মুলতুবি (Pending) অবস্থায় রয়েছে</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      আবেদনকারীর প্রদত্ত সকল তথ্য সঠিক থাকলে আপনি এটিকে অনুমোদন (Approve) করতে পারেন। তথ্য ভুল বা অসম্পূর্ণ থাকলে তা প্রত্যাখ্যান (Reject) করার সুযোগ রয়েছে।
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    onClick={() => setApproveDialogOpen(true)}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs gap-2 px-5 py-2.5 cursor-pointer justify-center"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>অনুমোদন করুন</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setRejectionReason("")
                      setRejectDialogOpen(true)
                    }}
                    className="w-full sm:w-auto border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-xs gap-2 px-5 py-2.5 cursor-pointer justify-center"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>প্রত্যাখ্যান করুন</span>
                  </Button>
                </div>
              </div>
            ) : application.status === "APPROVED" ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 flex items-start gap-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                <div className="space-y-1">
                  <h4 className="font-bold text-foreground text-base">আবেদনপত্রটি সফলভাবে অনুমোদিত হয়েছে</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    এই আবেদনকারীকে ইউনিয়ন পরিষদের স্থায়ী নাগরিক তালিকায় সফলভাবে স্থানান্তরিত ও নিবন্ধিত করা হয়েছে।
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <XCircle className="w-8 h-8 text-rose-500 shrink-0" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-foreground text-base">আবেদনপত্রটি প্রত্যাখ্যাত করা হয়েছে</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      এই নাগরিক আবেদনপত্রটি পর্যালোচনা কমিটি কর্তৃক প্রত্যাখ্যাত বলে গণ্য করা হয়েছে।
                    </p>
                  </div>
                </div>

                {application.rejectionReason && (
                  <div className="p-4 bg-rose-500/10 rounded-xl border border-rose-500/10 text-xs">
                    <strong className="text-rose-600 block mb-1">প্রত্যাখ্যানের সুনির্দিষ্ট কারণ:</strong>
                    <span className="text-muted-foreground leading-relaxed">{application.rejectionReason}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    onClick={() => setApproveDialogOpen(true)}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs gap-2 px-5 py-2.5 cursor-pointer justify-center"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>অনুমোদন করুন</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Dialogs */}

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={(open) => !open && setApproveDialogOpen(false)}>
        <DialogContent className="bg-card border border-white/[0.08] shadow-2xl rounded-2xl overflow-hidden text-foreground max-w-md p-0 gap-0">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-600/90 to-emerald-500 p-6 text-white">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white shrink-0 shadow-sm">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="font-display text-lg font-bold text-white">
                  আবেদন অনুমোদন করবেন?
                </DialogTitle>
                <DialogDescription className="font-body text-xs text-white/90 mt-0.5 font-medium">
                  অনুমোদনের পূর্বে তথ্য যাচাই করে নিন
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4 font-body">
            <p className="font-body text-sm leading-relaxed text-muted-foreground">
              আপনি কি নিশ্চিত যে আপনি{" "}
              <span className="font-bold text-foreground">
                &quot;{application.nameBn}&quot;
              </span>{" "}
              এর আবেদনটি অনুমোদন করতে চান?
            </p>

            <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-3.5 text-xs text-muted-foreground">
              <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              <p className="leading-snug">
                অনুমোদনের পর আবেদনকারীর বিবরণ ইউনিয়ন পরিষদের স্থায়ী নাগরিক তালিকাভুক্ত হবে এবং এই তথ্য পরিবর্তন করা যাবে না।
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                disabled={approveMutation.isPending}
                onClick={() => setApproveDialogOpen(false)}
                className="border-border text-foreground hover:bg-muted rounded-xl px-5 py-2.5 text-xs font-medium cursor-pointer"
              >
                বাতিল
              </Button>
              <Button
                type="button"
                disabled={approveMutation.isPending}
                onClick={handleApprove}
                className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold rounded-xl px-6 py-2.5 text-xs cursor-pointer shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                {approveMutation.isPending ? (
                  <div className="flex items-center gap-1.5">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>অনুমোদন হচ্ছে...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4" />
                    <span>অনুমোদন করুন</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={(open) => !open && setRejectDialogOpen(false)}>
        <DialogContent className="bg-card border border-white/[0.08] shadow-2xl rounded-2xl overflow-hidden text-foreground max-w-md p-0 gap-0">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-red-600 via-red-600/90 to-red-500 p-6 text-white">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white shrink-0 shadow-sm">
                <XCircle className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="font-display text-lg font-bold text-white">
                  আবেদন প্রত্যাখ্যান করবেন?
                </DialogTitle>
                <DialogDescription className="font-body text-xs text-white/90 mt-0.5 font-medium">
                  প্রত্যাখ্যানের কারণ উল্লেখ করুন
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4 font-body">
            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-muted-foreground">
                প্রত্যাখ্যানের কারণ (ঐচ্ছিক)
              </Label>
              <div className="relative group">
                <FileText className="absolute left-3.5 top-3 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                <Textarea
                  placeholder="যেমন: ভুল NID বা অস্পষ্ট ছবি প্রদান করা হয়েছে..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="min-h-[100px] bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 pt-3 rounded-xl text-sm transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                disabled={rejectMutation.isPending}
                onClick={() => setRejectDialogOpen(false)}
                className="border-border text-foreground hover:bg-muted rounded-xl px-5 py-2.5 text-xs font-medium cursor-pointer"
              >
                বাতিল
              </Button>
              <Button
                type="button"
                disabled={rejectMutation.isPending}
                onClick={handleReject}
                className="bg-red-600 text-white hover:bg-red-700 font-bold rounded-xl px-6 py-2.5 text-xs cursor-pointer shadow-md shadow-red-600/20 disabled:opacity-50"
              >
                {rejectMutation.isPending ? (
                  <div className="flex items-center gap-1.5">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>প্রত্যাখ্যান হচ্ছে...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <XCircle className="h-4 w-4" />
                    <span>প্রত্যাখ্যান করুন</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={(open) => !open && setDeleteDialogOpen(false)}>
        <DialogContent className="bg-card border border-white/[0.08] shadow-2xl rounded-2xl overflow-hidden text-foreground max-w-md p-0 gap-0">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-6 text-primary-foreground">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-primary-foreground shrink-0 shadow-sm">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="font-display text-lg font-bold text-primary-foreground">
                  আবেদন মুছে ফেলবেন?
                </DialogTitle>
                <DialogDescription className="font-body text-xs text-primary-foreground/90 mt-0.5">
                  এই প্রক্রিয়া নিশ্চিতকরণ আবশ্যক
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4 font-body">
            <p className="font-body text-sm leading-relaxed text-muted-foreground">
              আপনি কি নিশ্চিত যে আপনি{" "}
              <span className="font-bold text-foreground">
                &quot;{application.nameBn}&quot;
              </span>{" "}
              মুছে ফেলতে চান?
            </p>

            <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-3.5 text-xs text-muted-foreground">
              <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              <p className="leading-snug">
                এই প্রক্রিয়াটি স্থায়ী এবং মুছে ফেলার পর পুনরায় ফিরিয়ে আনা যাবে না।
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                disabled={deleteMutation.isPending}
                onClick={() => setDeleteDialogOpen(false)}
                className="border-border text-foreground hover:bg-muted rounded-xl px-5 py-2.5 text-xs font-medium cursor-pointer"
              >
                বাতিল
              </Button>
              <Button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={handleDelete}
                className="bg-red-600 text-white hover:bg-red-700 font-bold rounded-xl px-6 py-2.5 text-xs cursor-pointer shadow-md shadow-red-600/20 disabled:opacity-50"
              >
                {deleteMutation.isPending ? (
                  <div className="flex items-center gap-1.5">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>মুছে ফেলা হচ্ছে...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Trash2 className="h-4 w-4" />
                    <span>আবেদন মুছুন</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

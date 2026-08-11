"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@workspace/ui/components/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building,
  CheckCircle,
  XCircle,
  Trash2,
  Loader2,
  Heart,
  Briefcase,
  GraduationCap,
  BookOpen,
} from "lucide-react"
import { useCitizenApplicationDetailStore } from "../store/use-citizen-application-detail-store"

interface CitizenApplicationDetailSheetProps {
  applicationId?: string | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
}

const residentTypeMap: Record<string, string> = {
  TEMPORARY: "অস্থায়ী",
  PERMANENT: "স্থায়ী",
}

const religionMap: Record<string, string> = {
  ISLAM: "ইসলাম",
  HINDU: "হিন্দু",
  BUDDHIST: "বৌদ্ধ ধর্ম",
  CHRISTIAN: "খ্রিস্ট ধর্ম",
  OTHER: "অন্যান্য",
}

const genderMap: Record<string, string> = {
  MALE: "পুরুষ",
  FEMALE: "মহিলা",
  OTHER: "অন্যান্য",
}

const maritalStatusMap: Record<string, string> = {
  UNMARRIED: "অবিবাহিত",
  MARRIED: "বিবাহিত",
  DIVORCED: "তালাক প্রাপ্ত",
  WIDOWED: "বিধবা",
  OTHER: "অন্যান্য",
}

const statusMap: Record<string, { label: string; variant: string }> = {
  PENDING: { label: "পেন্ডিং", variant: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" },
  APPROVED: { label: "অনুমোদিত", variant: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" },
  REJECTED: { label: "প্রত্যাখ্যাত", variant: "bg-rose-500/10 text-rose-500 border border-rose-500/20" },
}

export function CitizenApplicationDetailSheet({
  applicationId,
  open,
  onOpenChange,
  onSuccess,
}: CitizenApplicationDetailSheetProps) {
  const queryClient = useQueryClient()
  const store = useCitizenApplicationDetailStore()

  const finalOpen = open !== undefined ? open : store.isOpen
  const finalOnOpenChange = onOpenChange !== undefined ? onOpenChange : (val: boolean) => { if (!val) store.closeSheet() }
  const finalApplicationId = applicationId !== undefined ? applicationId : store.applicationId

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Fetch application details
  const { data: application, isLoading, refetch } = useQuery(
    trpc.citizenApplication.byId.queryOptions(
      { id: finalApplicationId || "" },
      { enabled: !!finalApplicationId && finalOpen }
    )
  )

  // Mutations
  const approveMutation = useMutation(
    trpc.citizenApplication.approve.mutationOptions({
      onSuccess: () => {
        toast.success("আবেদনটি সফলভাবে অনুমোদিত হয়েছে এবং নাগরিককে তালিকাভুক্ত করা হয়েছে।")
        setApproveDialogOpen(false)
        finalOnOpenChange(false)
        queryClient.invalidateQueries()
        onSuccess?.()
      },
      onError: (err) => {
        toast.error(`অনুমোদনে ব্যর্থ হয়েছে: ${err.message}`)
      },
    })
  )

  const rejectMutation = useMutation(
    trpc.citizenApplication.reject.mutationOptions({
      onSuccess: () => {
        toast.success("আবেদনটি প্রত্যাখ্যাত করা হয়েছে।")
        setRejectDialogOpen(false)
        finalOnOpenChange(false)
        queryClient.invalidateQueries()
        onSuccess?.()
      },
      onError: (err) => {
        toast.error(`প্রত্যাখ্যানে ব্যর্থ হয়েছে: ${err.message}`)
      },
    })
  )

  const deleteMutation = useMutation(
    trpc.citizenApplication.delete.mutationOptions({
      onSuccess: () => {
        toast.success("আবেদনটি সফলভাবে মুছে ফেলা হয়েছে।")
        setDeleteDialogOpen(false)
        finalOnOpenChange(false)
        queryClient.invalidateQueries()
        onSuccess?.()
      },
      onError: (err) => {
        toast.error(`মুছে ফেলতে ব্যর্থ হয়েছে: ${err.message}`)
      },
    })
  )

  if (!finalOpen) return null

  const handleApprove = () => {
    if (!finalApplicationId) return
    approveMutation.mutate({ id: finalApplicationId })
  }

  const handleReject = () => {
    if (!finalApplicationId) return
    rejectMutation.mutate({ id: finalApplicationId, rejectionReason: rejectionReason.trim() || undefined })
  }

  const handleDelete = () => {
    if (!finalApplicationId) return
    deleteMutation.mutate({ id: finalApplicationId })
  }

  return (
    <>
      <Sheet open={finalOpen} onOpenChange={finalOnOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-card text-foreground border-l border-border/80">
          <SheetHeader className="pb-4 border-b border-border/60">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2 text-xl font-bold font-display">
                <User className="w-5 h-5 text-primary" />
                নাগরিক আবেদন প্রোফাইল
              </SheetTitle>
              {application && (
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusMap[application.status]?.variant || "bg-muted"}`}>
                    {statusMap[application.status]?.label || application.status}
                  </span>
                </div>
              )}
            </div>
            <SheetDescription className="font-body text-muted-foreground">
              আবেদনকারীর বিস্তারিত তথ্যসমূহ যাচাই করুন এবং অনুমোদন বা প্রত্যাখ্যান সম্পন্ন করুন।
            </SheetDescription>
          </SheetHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !application ? (
            <div className="text-center py-12 text-muted-foreground font-body">
              আবেদনের তথ্য পাওয়া যায়নি।
            </div>
          ) : (
            <div className="space-y-6 pt-4 font-body">
              {/* Applicant Basic Info Header */}
              <div className="bg-muted/40 p-4 rounded-2xl border border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground leading-snug">
                      {application.nameBn}
                    </h3>
                    {application.nameEn && (
                      <p className="text-sm text-muted-foreground font-mono">
                        {application.nameEn}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {application.status === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-emerald-950 border-emerald-500/20 font-bold"
                          onClick={() => setApproveDialogOpen(true)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          অনুমোদন
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-rose-950 border-rose-500/20 font-bold"
                          onClick={() => {
                            setRejectionReason("")
                            setRejectDialogOpen(true)}
                          }
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          প্রত্যাখ্যান
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white border-rose-500/20"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {application.status === "REJECTED" && application.rejectionReason && (
                  <div className="mt-3 p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                    <span className="text-xs font-bold text-rose-500 block mb-0.5">প্রত্যাখ্যানের কারণ:</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">{application.rejectionReason}</p>
                  </div>
                )}
              </div>

              {/* Personal Information */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold flex items-center gap-1.5 text-primary">
                  <User className="w-4 h-4" />
                  ব্যক্তিগত বিবরণ
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-2xl border">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">পিতার নাম (বাংলায়)</span>
                    <span className="text-sm font-semibold">{application.fatherNameBn}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">পিতার নাম (ইংরেজিতে)</span>
                    <span className="text-sm font-semibold">{application.fatherNameEn || "N/A"}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">মাতার নাম (বাংলায়)</span>
                    <span className="text-sm font-semibold">{application.motherNameBn}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">মাতার নাম (ইংরেজিতে)</span>
                    <span className="text-sm font-semibold">{application.motherNameEn || "N/A"}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">জম্ম তারিখ</span>
                    <span className="text-sm font-semibold">
                      {application.dob ? new Date(application.dob).toLocaleDateString("bn-BD") : "N/A"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">লিঙ্গ</span>
                    <span className="text-sm font-semibold">{genderMap[application.gender] || application.gender}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">ধর্ম</span>
                    <span className="text-sm font-semibold">{religionMap[application.religion] || application.religion}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">বৈবাহিক সম্পর্ক</span>
                    <span className="text-sm font-semibold">{maritalStatusMap[application.maritalStatus] || application.maritalStatus}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">পেশা</span>
                    <span className="text-sm font-semibold">{application.occupation || "N/A"}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">বাসিন্দা টাইপ</span>
                    <span className="text-sm font-semibold">{residentTypeMap[application.residentType] || application.residentType}</span>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <span className="text-xs text-muted-foreground block">শিক্ষাগত যোগ্যতা</span>
                    <span className="text-sm font-semibold">{application.education || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Identification Documents */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold flex items-center gap-1.5 text-primary">
                  <BookOpen className="w-4 h-4" />
                  পরিচিতি ও সনাক্তকরণ নথিপত্র
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-muted/20 p-4 rounded-2xl border">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">ন্যাশনাল আইডি (NID)</span>
                    <span className="text-sm font-semibold font-mono">{application.nid || "N/A"}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">জন্ম নিবন্ধন নং</span>
                    <span className="text-sm font-semibold font-mono">{application.birthRegNo || "N/A"}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">পাসপোর্ট নং</span>
                    <span className="text-sm font-semibold font-mono">{application.passportNo || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold flex items-center gap-1.5 text-primary">
                  <Phone className="w-4 h-4" />
                  যোগাযোগ মাধ্যম
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-2xl border">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">মোবাইল নম্বর</span>
                    <a href={`tel:${application.mobile}`} className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {application.mobile}
                    </a>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">ইমেল এড্রেস</span>
                    {application.email ? (
                      <a href={`mailto:${application.email}`} className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {application.email}
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground">N/A</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Present Address */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold flex items-center gap-1.5 text-primary">
                  <MapPin className="w-4 h-4" />
                  বর্তমান ঠিকানা
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-2xl border">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">গ্রাম/মহল্লা (বাংলায়)</span>
                    <span className="text-sm font-semibold">{application.presentAddress.villageBn}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">গ্রাম/মহল্লা (ইংরেজিতে)</span>
                    <span className="text-sm font-semibold">{application.presentAddress.villageEn || "N/A"}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">রোড/ব্লক/সেক্টর</span>
                    <span className="text-sm font-semibold">
                      {application.presentAddress.roadBn || application.presentAddress.roadEn || "N/A"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">হোল্ডিং নং</span>
                    <span className="text-sm font-semibold">{application.presentAddress.holdingNo || "N/A"}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">ওয়ার্ড নং</span>
                    <span className="text-sm font-semibold">
                      {application.presentAddress.ward?.nameBn || application.presentAddress.ward?.name || "N/A"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">পোষ্ট অফিস ও কোড</span>
                    <span className="text-sm font-semibold">
                      {application.presentAddress.postOfficeBn} ({application.presentAddress.postCode})
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">উপজেলা ও জেলা</span>
                    <span className="text-sm font-semibold">
                      {application.presentAddress.upazilaNameBn}, {application.presentAddress.districtNameBn}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">বিভাগ</span>
                    <span className="text-sm font-semibold">{application.presentAddress.divisionNameBn}</span>
                  </div>
                </div>
              </div>

              {/* Permanent Address */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold flex items-center gap-1.5 text-primary">
                  <MapPin className="w-4 h-4" />
                  স্থায়ী ঠিকানা
                </h4>
                {application.sameAsPresent ? (
                  <div className="bg-muted/10 p-3 text-xs font-semibold text-emerald-500 border border-emerald-500/10 rounded-xl flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    বর্তমান ঠিকানা এবং স্থায়ী ঠিকানা একই
                  </div>
                ) : application.permanentAddress ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-2xl border">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground block">গ্রাম/মহল্লা (বাংলায়)</span>
                      <span className="text-sm font-semibold">{application.permanentAddress.villageBn}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground block">গ্রাম/মহল্লা (ইংরেজিতে)</span>
                      <span className="text-sm font-semibold">{application.permanentAddress.villageEn || "N/A"}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground block">রোড/ব্লক/সেক্টর</span>
                      <span className="text-sm font-semibold">
                        {application.permanentAddress.roadBn || application.permanentAddress.roadEn || "N/A"}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground block">হোল্ডিং নং</span>
                      <span className="text-sm font-semibold">{application.permanentAddress.holdingNo || "N/A"}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground block">ওয়ার্ড নং</span>
                      <span className="text-sm font-semibold">
                        {application.permanentAddress.ward?.nameBn || application.permanentAddress.ward?.name || "N/A"}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground block">পোষ্ট অফিস ও কোড</span>
                      <span className="text-sm font-semibold">
                        {application.permanentAddress.postOfficeBn} ({application.permanentAddress.postCode})
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground block">উপজেলা ও জেলা</span>
                      <span className="text-sm font-semibold">
                        {application.permanentAddress.upazilaNameBn}, {application.permanentAddress.districtNameBn}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground block">বিভাগ</span>
                      <span className="text-sm font-semibold">{application.permanentAddress.divisionNameBn}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 bg-muted/20 border border-dashed rounded-xl text-xs text-muted-foreground">
                    স্থায়ী ঠিকানার তথ্য প্রদান করা হয়নি।
                  </div>
                )}
              </div>

              {/* Comments/Notes */}
              {(application.commentsBn || application.commentsEn) && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold flex items-center gap-1.5 text-primary">
                    <Building className="w-4 h-4" />
                    মন্তব্য/অতিরিক্ত তথ্য
                  </h4>
                  <div className="bg-muted/20 p-4 rounded-2xl border text-sm text-foreground space-y-2 leading-relaxed">
                    {application.commentsBn && <p>{application.commentsBn}</p>}
                    {application.commentsEn && <p className="font-mono text-xs text-muted-foreground">{application.commentsEn}</p>}
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Confirmation Modals */}

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card text-foreground border border-border">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-lg text-emerald-500 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              আবেদন অনুমোদন নিশ্চিতকরণ
            </DialogTitle>
            <DialogDescription className="font-body text-muted-foreground text-sm pt-1.5">
              আপনি কি নিশ্চিত যে আবেদনটি অনুমোদন করতে চান? অনুমোদনের পর আবেদনকারীর বিবরণ ইউনিয়ন পরিষদের স্থায়ী নাগরিক তালিকাভুক্ত হবে।
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 font-body">
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              বাতিল
            </Button>
            <Button
              className="bg-emerald-500 text-emerald-950 hover:bg-emerald-600 font-bold"
              disabled={approveMutation.isPending}
              onClick={handleApprove}
            >
              {approveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  অনুমোদন হচ্ছে...
                </>
              ) : (
                "অনুমোদন করুন"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card text-foreground border border-border">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-lg text-rose-500 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              আবেদন প্রত্যাখ্যানের কারণ দিন
            </DialogTitle>
            <DialogDescription className="font-body text-muted-foreground text-sm pt-1.5">
              আবেদনটি প্রত্যাখ্যান করার কারণটি উল্লেখ করুন (ঐচ্ছিক)। এটি পরবর্তীতে ট্র্যাক করতে সাহায্য করবে।
            </DialogDescription>
          </DialogHeader>
          <div className="py-3 font-body">
            <Textarea
              placeholder="যেমন: ভুল NID বা ভুল সনাক্তকরণ নথিপত্র প্রদান..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0 font-body">
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              বাতিল
            </Button>
            <Button
              variant="destructive"
              className="font-bold"
              disabled={rejectMutation.isPending}
              onClick={handleReject}
            >
              {rejectMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  প্রত্যাখ্যান হচ্ছে...
                </>
              ) : (
                "প্রত্যাখ্যান করুন"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card text-foreground border border-border">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-lg text-rose-500 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              আবেদন মুছে ফেলার নিশ্চয়তা
            </DialogTitle>
            <DialogDescription className="font-body text-muted-foreground text-sm pt-1.5">
              আপনি কি নিশ্চিতভাবে এই আবেদনটি মুছে ফেলতে চান? এই অ্যাকশনটি স্থায়ী এবং এটি পুনরুদ্ধার করা যাবে না।
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 font-body">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              বাতিল
            </Button>
            <Button
              variant="destructive"
              className="font-bold"
              disabled={deleteMutation.isPending}
              onClick={handleDelete}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  মুছে ফেলা হচ্ছে...
                </>
              ) : (
                "হ্যাঁ, মুছে ফেলুন"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { useRouter } from "next/navigation"
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
  Edit,
  Hash,
} from "lucide-react"
import { useCitizenDetailStore } from "../store/use-citizen-detail-store"

interface CitizenDetailSheetProps {
  citizenId?: string | null
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
  WIDOWED: "বিধবা/বিপত্নীক",
  OTHER: "অন্যান্য",
}

export function CitizenDetailSheet({
  citizenId,
  open,
  onOpenChange,
  onSuccess,
}: CitizenDetailSheetProps) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const store = useCitizenDetailStore()

  const finalOpen = open !== undefined ? open : store.isOpen
  const finalOnOpenChange = onOpenChange !== undefined ? onOpenChange : (val: boolean) => { if (!val) store.closeSheet() }
  const finalCitizenId = citizenId !== undefined ? citizenId : store.citizenId

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Fetch citizen details
  const { data: citizen, isLoading } = useQuery(
    trpc.citizen.byId.queryOptions(
      { id: finalCitizenId || "" },
      { enabled: !!finalCitizenId && finalOpen }
    )
  )

  // Mutation
  const deleteMutation = useMutation(
    trpc.citizen.delete.mutationOptions({
      onSuccess: () => {
        toast.success("নাগরিকের তথ্য সফলভাবে মুছে ফেলা হয়েছে।")
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

  const handleDelete = () => {
    if (!finalCitizenId) return
    deleteMutation.mutate({ id: finalCitizenId })
  }

  const handleEdit = () => {
    if (!citizen) return
    finalOnOpenChange(false)
    router.push(`/citizens/${citizen.id}/edit`)
  }

  return (
    <>
      <Sheet open={finalOpen} onOpenChange={finalOnOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-card text-foreground border-l border-border/80">
          <SheetHeader className="pb-4 border-b border-border/60">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2 text-xl font-bold font-display">
                <User className="w-5 h-5 text-primary" />
                নাগরিক প্রোফাইল বিবরণ
              </SheetTitle>
              {citizen && (
                <div className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  <Hash className="w-3.5 h-3.5" />
                  ID: {citizen.citizenId}
                </div>
              )}
            </div>
            <SheetDescription className="font-body text-muted-foreground">
              ইউনিয়ন পরিষদের নিবন্ধিত নাগরিকের বিস্তারিত বিবরণ দেখুন, প্রোফাইল সংশোধন বা অপসারণ করুন।
            </SheetDescription>
          </SheetHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !citizen ? (
            <div className="text-center py-12 text-muted-foreground font-body">
              নাগরিকের তথ্য পাওয়া যায়নি।
            </div>
          ) : (
            <div className="space-y-6 pt-4 font-body">
              {/* Actions Header */}
              <div className="bg-muted/40 p-4 rounded-2xl border border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground leading-snug">
                      {citizen.nameBn}
                    </h3>
                    {citizen.nameEn && (
                      <p className="text-sm text-muted-foreground font-mono">
                        {citizen.nameEn}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border-primary/20 font-bold"
                      onClick={handleEdit}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      সম্পাদনা করুন
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white border-rose-500/20"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      মুছে ফেলুন
                    </Button>
                  </div>
                </div>
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
                    <span className="text-sm font-semibold">{citizen.fatherNameBn}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">পিতার নাম (ইংরেজিতে)</span>
                    <span className="text-sm font-semibold">{citizen.fatherNameEn || "N/A"}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">মাতার নাম (বাংলায়)</span>
                    <span className="text-sm font-semibold">{citizen.motherNameBn}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">মাতার নাম (ইংরেজিতে)</span>
                    <span className="text-sm font-semibold">{citizen.motherNameEn || "N/A"}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">জন্ম তারিখ</span>
                    <span className="text-sm font-semibold">
                      {citizen.dob ? new Date(citizen.dob).toLocaleDateString("bn-BD") : "N/A"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">লিঙ্গ</span>
                    <span className="text-sm font-semibold">{genderMap[citizen.gender] || citizen.gender}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">ধর্ম</span>
                    <span className="text-sm font-semibold">{religionMap[citizen.religion] || citizen.religion}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">বৈবাহিক সম্পর্ক</span>
                    <span className="text-sm font-semibold">{maritalStatusMap[citizen.maritalStatus] || citizen.maritalStatus}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">পেশা</span>
                    <span className="text-sm font-semibold">{citizen.occupation || "N/A"}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">বাসিন্দা ধরন</span>
                    <span className="text-sm font-semibold">{residentTypeMap[citizen.residentType] || citizen.residentType}</span>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <span className="text-xs text-muted-foreground block">শিক্ষাগত যোগ্যতা</span>
                    <span className="text-sm font-semibold">{citizen.education || "N/A"}</span>
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
                    <span className="text-sm font-semibold font-mono">{citizen.nid || "N/A"}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">জন্ম নিবন্ধন নং</span>
                    <span className="text-sm font-semibold font-mono">{citizen.birthRegNo || "N/A"}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">পাসপোর্ট নং</span>
                    <span className="text-sm font-semibold font-mono">{citizen.passportNo || "N/A"}</span>
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
                    <a href={`tel:${citizen.mobile}`} className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {citizen.mobile}
                    </a>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">ইমেল এড্রেস</span>
                    {citizen.email ? (
                      <a href={`mailto:${citizen.email}`} className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {citizen.email}
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
                    <span className="text-sm font-semibold">{citizen.presentAddress.villageBn}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">গ্রাম/মহল্লা (ইংরেজিতে)</span>
                    <span className="text-sm font-semibold">{citizen.presentAddress.villageEn || "N/A"}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">রোড/ব্লক/সেক্টর</span>
                    <span className="text-sm font-semibold">
                      {citizen.presentAddress.roadBn || citizen.presentAddress.roadEn || "N/A"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">হোল্ডিং নং</span>
                    <span className="text-sm font-semibold">{citizen.presentAddress.holdingNo || "N/A"}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">ওয়ার্ড নং</span>
                    <span className="text-sm font-semibold">
                      {citizen.presentAddress.ward?.nameBn || citizen.presentAddress.ward?.name || "N/A"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">পোষ্ট অফিস</span>
                    <span className="text-sm font-semibold">
                      {citizen.presentAddress.postOfficeBn}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">উপজেলা ও জেলা</span>
                    <span className="text-sm font-semibold">
                      {citizen.presentAddress.upazilaNameBn}, {citizen.presentAddress.districtNameBn}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">বিভাগ</span>
                    <span className="text-sm font-semibold">{citizen.presentAddress.divisionNameBn}</span>
                  </div>
                </div>
              </div>

              {/* Permanent Address */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold flex items-center gap-1.5 text-primary">
                  <MapPin className="w-4 h-4" />
                  স্থায়ী ঠিকানা
                </h4>
                {citizen.sameAsPresent ? (
                  <div className="bg-muted/10 p-3 text-xs font-semibold text-emerald-500 border border-emerald-500/10 rounded-xl flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    বর্তমান ঠিকানা এবং স্থায়ী ঠিকানা একই
                  </div>
                ) : citizen.permanentAddress ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-2xl border">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground block">গ্রাম/মহল্লা (বাংলায়)</span>
                      <span className="text-sm font-semibold">{citizen.permanentAddress.villageBn}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground block">গ্রাম/মহল্লা (ইংরেজিতে)</span>
                      <span className="text-sm font-semibold">{citizen.permanentAddress.villageEn || "N/A"}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground block">রোড/ব্লক/সেক্টর</span>
                      <span className="text-sm font-semibold">
                        {citizen.permanentAddress.roadBn || citizen.permanentAddress.roadEn || "N/A"}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground block">হোল্ডিং নং</span>
                      <span className="text-sm font-semibold">{citizen.permanentAddress.holdingNo || "N/A"}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground block">ওয়ার্ড নং</span>
                      <span className="text-sm font-semibold">
                        {citizen.permanentAddress.ward?.nameBn || citizen.permanentAddress.ward?.name || "N/A"}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground block">পোষ্ট অফিস</span>
                      <span className="text-sm font-semibold">
                        {citizen.permanentAddress.postOfficeBn}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground block">উপজেলা ও জেলা</span>
                      <span className="text-sm font-semibold">
                        {citizen.permanentAddress.upazilaNameBn}, {citizen.permanentAddress.districtNameBn}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground block">বিভাগ</span>
                      <span className="text-sm font-semibold">{citizen.permanentAddress.divisionNameBn}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 bg-muted/20 border border-dashed rounded-xl text-xs text-muted-foreground">
                    স্থায়ী ঠিকানার তথ্য প্রদান করা হয়নি।
                  </div>
                )}
              </div>

              {/* Comments/Notes */}
              {(citizen.commentsBn || citizen.commentsEn) && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold flex items-center gap-1.5 text-primary">
                    <Building className="w-4 h-4" />
                    মন্তব্য/অতিরিক্ত তথ্য
                  </h4>
                  <div className="bg-muted/20 p-4 rounded-2xl border text-sm text-foreground space-y-2 leading-relaxed">
                    {citizen.commentsBn && <p>{citizen.commentsBn}</p>}
                    {citizen.commentsEn && <p className="font-mono text-xs text-muted-foreground">{citizen.commentsEn}</p>}
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card text-foreground border border-border">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-lg text-rose-500 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              নাগরিক তথ্য মুছে ফেলার নিশ্চয়তা
            </DialogTitle>
            <DialogDescription className="font-body text-muted-foreground text-sm pt-1.5">
              আপনি কি নিশ্চিতভাবে এই নাগরিকের বিবরণ মুছে ফেলতে চান? এই অ্যাকশনটি স্থায়ী এবং এটি পুনরুদ্ধার করা যাবে না।
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

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { DatePicker } from "@workspace/ui/components/date-picker"
import { useTenant } from "@/modules/layout/ui/components/tenant-provider"
import {
  GENDER_OPTIONS,
  RELIGION_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  RESIDENT_TYPE_OPTIONS,
} from "@workspace/utils"
import { ArrowLeft, Save, Loader2, MapPin, User, BookOpen, Phone } from "lucide-react"

interface EditCitizenFormProps {
  citizen: any
}

export function EditCitizenForm({ citizen }: EditCitizenFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { tenant } = useTenant()

  const [activeTab, setActiveTab] = useState("personal")

  // ── Step 1: Personal Info ──────────────────────────────────
  const [nameBn, setNameBn] = useState(citizen.nameBn || "")
  const [nameEn, setNameEn] = useState(citizen.nameEn || "")
  const [fatherNameBn, setFatherNameBn] = useState(citizen.fatherNameBn || "")
  const [fatherNameEn, setFatherNameEn] = useState(citizen.fatherNameEn || "")
  const [motherNameBn, setMotherNameBn] = useState(citizen.motherNameBn || "")
  const [motherNameEn, setMotherNameEn] = useState(citizen.motherNameEn || "")
  const [dob, setDob] = useState<Date | undefined>(citizen.dob ? new Date(citizen.dob) : undefined)
  const [gender, setGender] = useState(citizen.gender || "")
  const [religion, setReligion] = useState(citizen.religion || "")
  const [maritalStatus, setMaritalStatus] = useState(citizen.maritalStatus || "")
  const [residentType, setResidentType] = useState(citizen.residentType || "PERMANENT")
  const [occupation, setOccupation] = useState(citizen.occupation || "")
  const [education, setEducation] = useState(citizen.education || "")

  // ── Step 2: Contact & Identity ─────────────────────────────
  const [mobile, setMobile] = useState(citizen.mobile || "")
  const [email, setEmail] = useState(citizen.email || "")
  const [nid, setNid] = useState(citizen.nid || "")
  const [birthRegNo, setBirthRegNo] = useState(citizen.birthRegNo || "")
  const [passportNo, setPassportNo] = useState(citizen.passportNo || "")
  const [commentsBn, setCommentsBn] = useState(citizen.commentsBn || "")
  const [commentsEn, setCommentsEn] = useState(citizen.commentsEn || "")

  // ── Step 3: Present Address ────────────────────────────────
  const [presWardId, setPresWardId] = useState(citizen.presentAddress?.wardId || "")
  const [presVillageBn, setPresVillageBn] = useState(citizen.presentAddress?.villageBn || "")
  const [presVillageEn, setPresVillageEn] = useState(citizen.presentAddress?.villageEn || "")
  const [presRoadBn, setPresRoadBn] = useState(citizen.presentAddress?.roadBn || "")
  const [presRoadEn, setPresRoadEn] = useState(citizen.presentAddress?.roadEn || "")
  const [presHoldingNo, setPresHoldingNo] = useState(citizen.presentAddress?.holdingNo || "")
  const [presDivisionId, setPresDivisionId] = useState(citizen.presentAddress?.divisionId || "")
  const [presDivisionNameBn, setPresDivisionNameBn] = useState(citizen.presentAddress?.divisionNameBn || "")
  const [presDistrictId, setPresDistrictId] = useState(citizen.presentAddress?.districtId || "")
  const [presDistrictNameBn, setPresDistrictNameBn] = useState(citizen.presentAddress?.districtNameBn || "")
  const [presUpazilaId, setPresUpazilaId] = useState(citizen.presentAddress?.upazilaId || "")
  const [presUpazilaNameBn, setPresUpazilaNameBn] = useState(citizen.presentAddress?.upazilaNameBn || "")
  const [presUnionId, setPresUnionId] = useState(citizen.presentAddress?.unionId || "")
  const [presUnionNameBn, setPresUnionNameBn] = useState(citizen.presentAddress?.unionNameBn || "")
  const [presPostId, setPresPostId] = useState(citizen.presentAddress?.postId || "")
  const [presPostOfficeBn, setPresPostOfficeBn] = useState(citizen.presentAddress?.postOfficeBn || "")

  // ── Step 4: Permanent Address ──────────────────────────────
  const [sameAsPresent, setSameAsPresent] = useState(citizen.sameAsPresent ?? false)
  const [permWardId, setPermWardId] = useState(citizen.permanentAddress?.wardId || "")
  const [permVillageBn, setPermVillageBn] = useState(citizen.permanentAddress?.villageBn || "")
  const [permVillageEn, setPermVillageEn] = useState(citizen.permanentAddress?.villageEn || "")
  const [permRoadBn, setPermRoadBn] = useState(citizen.permanentAddress?.roadBn || "")
  const [permRoadEn, setPermRoadEn] = useState(citizen.permanentAddress?.roadEn || "")
  const [permHoldingNo, setPermHoldingNo] = useState(citizen.permanentAddress?.holdingNo || "")
  const [permDivisionId, setPermDivisionId] = useState(citizen.permanentAddress?.divisionId || "")
  const [permDivisionNameBn, setPermDivisionNameBn] = useState(citizen.permanentAddress?.divisionNameBn || "")
  const [permDistrictId, setPermDistrictId] = useState(citizen.permanentAddress?.districtId || "")
  const [permDistrictNameBn, setPermDistrictNameBn] = useState(citizen.permanentAddress?.districtNameBn || "")
  const [permUpazilaId, setPermUpazilaId] = useState(citizen.permanentAddress?.upazilaId || "")
  const [permUpazilaNameBn, setPermUpazilaNameBn] = useState(citizen.permanentAddress?.upazilaNameBn || "")
  const [permUnionId, setPermUnionId] = useState(citizen.permanentAddress?.unionId || "")
  const [permUnionNameBn, setPermUnionNameBn] = useState(citizen.permanentAddress?.unionNameBn || "")
  const [permPostId, setPermPostId] = useState(citizen.permanentAddress?.postId || "")
  const [permPostOfficeBn, setPermPostOfficeBn] = useState(citizen.permanentAddress?.postOfficeBn || "")

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch Wards for select triggers
  const { data: wardsData } = useQuery(
    trpc.tenantWard.list.queryOptions({ limit: 100 })
  )
  const wards = wardsData?.wards || []

  // Location details queries
  const { data: presDivisions = [] } = useQuery(
    trpc.location.divisions.queryOptions()
  )
  const { data: presDistricts = [] } = useQuery(
    trpc.location.districts.queryOptions({ divisionId: presDivisionId }, { enabled: !!presDivisionId })
  )
  const { data: presUpazilas = [] } = useQuery(
    trpc.location.upazilas.queryOptions({ districtId: presDistrictId }, { enabled: !!presDistrictId })
  )
  const { data: presUnions = [] } = useQuery(
    trpc.location.unions.queryOptions({ upazilaId: presUpazilaId }, { enabled: !!presUpazilaId })
  )
  const { data: presPosts = [] } = useQuery(
    trpc.location.posts.queryOptions({ upazilaId: presUpazilaId }, { enabled: !!presUpazilaId })
  )

  const { data: permDivisions = [] } = useQuery(
    trpc.location.divisions.queryOptions(undefined, { enabled: !sameAsPresent })
  )
  const { data: permDistricts = [] } = useQuery(
    trpc.location.districts.queryOptions({ divisionId: permDivisionId }, { enabled: !sameAsPresent && !!permDivisionId })
  )
  const { data: permUpazilas = [] } = useQuery(
    trpc.location.upazilas.queryOptions({ districtId: permDistrictId }, { enabled: !sameAsPresent && !!permDistrictId })
  )
  const { data: permUnions = [] } = useQuery(
    trpc.location.unions.queryOptions({ upazilaId: permUpazilaId }, { enabled: !sameAsPresent && !!permUpazilaId })
  )
  const { data: permPosts = [] } = useQuery(
    trpc.location.posts.queryOptions({ upazilaId: permUpazilaId }, { enabled: !sameAsPresent && !!permUpazilaId })
  )

  const handlePresDivisionChange = (val: string) => {
    setPresDivisionId(val)
    const selected = presDivisions.find((d: any) => d.id === val)
    setPresDivisionNameBn(selected ? selected.nameBn || selected.name : "")
    setPresDistrictId("")
    setPresDistrictNameBn("")
    setPresUpazilaId("")
    setPresUpazilaNameBn("")
    setPresUnionId("")
    setPresUnionNameBn("")
    setPresPostId("")
    setPresPostOfficeBn("")
  }

  const handlePresDistrictChange = (val: string) => {
    setPresDistrictId(val)
    const selected = presDistricts.find((d: any) => d.id === val)
    setPresDistrictNameBn(selected ? selected.nameBn || selected.name : "")
    setPresUpazilaId("")
    setPresUpazilaNameBn("")
    setPresUnionId("")
    setPresUnionNameBn("")
    setPresPostId("")
    setPresPostOfficeBn("")
  }

  const handlePresUpazilaChange = (val: string) => {
    setPresUpazilaId(val)
    const selected = presUpazilas.find((d: any) => d.id === val)
    setPresUpazilaNameBn(selected ? selected.nameBn || selected.name : "")
    setPresUnionId("")
    setPresUnionNameBn("")
    setPresPostId("")
    setPresPostOfficeBn("")
  }

  const handlePresUnionChange = (val: string) => {
    setPresUnionId(val)
    const selected = presUnions.find((d: any) => d.id === val)
    setPresUnionNameBn(selected ? selected.nameBn || selected.name : "")
  }

  const handlePresPostChange = (val: string) => {
    setPresPostId(val)
    const selected = presPosts.find((p: any) => p.id === val)
    setPresPostOfficeBn(selected ? selected.postOfficeBn || selected.nameBn : "")
  }

  const handlePermDivisionChange = (val: string) => {
    setPermDivisionId(val)
    const selected = permDivisions.find((d: any) => d.id === val)
    setPermDivisionNameBn(selected ? selected.nameBn || selected.name : "")
    setPermDistrictId("")
    setPermDistrictNameBn("")
    setPermUpazilaId("")
    setPermUpazilaNameBn("")
    setPermUnionId("")
    setPermUnionNameBn("")
    setPermPostId("")
    setPermPostOfficeBn("")
  }

  const handlePermDistrictChange = (val: string) => {
    setPermDistrictId(val)
    const selected = permDistricts.find((d: any) => d.id === val)
    setPermDistrictNameBn(selected ? selected.nameBn || selected.name : "")
    setPermUpazilaId("")
    setPermUpazilaNameBn("")
    setPermUnionId("")
    setPermUnionNameBn("")
    setPermPostId("")
    setPermPostOfficeBn("")
  }

  const handlePermUpazilaChange = (val: string) => {
    setPermUpazilaId(val)
    const selected = permUpazilas.find((d: any) => d.id === val)
    setPermUpazilaNameBn(selected ? selected.nameBn || selected.name : "")
    setPermUnionId("")
    setPermUnionNameBn("")
    setPermPostId("")
    setPermPostOfficeBn("")
  }

  const handlePermUnionChange = (val: string) => {
    setPermUnionId(val)
    const selected = permUnions.find((d: any) => d.id === val)
    setPermUnionNameBn(selected ? selected.nameBn || selected.name : "")
  }

  const handlePermPostChange = (val: string) => {
    setPermPostId(val)
    const selected = permPosts.find((p: any) => p.id === val)
    setPermPostOfficeBn(selected ? selected.postOfficeBn || selected.nameBn : "")
  }

  // Form Mutation
  const updateMutation = useMutation(
    trpc.citizen.update.mutationOptions({
      onSuccess: () => {
        toast.success("নাগরিক তথ্য সফলভাবে হালনাগাদ করা হয়েছে।")
        queryClient.invalidateQueries()
        router.push("/citizens")
      },
      onError: (err) => {
        toast.error(`নাগরিক তথ্য হালনাগাদ করতে ব্যর্থ হয়েছে: ${err.message}`)
      },
    })
  )

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    const mobileRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const nidRegex = /^(?:\d{10}|\d{13}|\d{17})$/
    const birthRegRegex = /^\d{17}$/
    const banglaRegex = /^[\u0980-\u09FF\s\d\-,./()]+$/

    // Personal Validation
    if (!nameBn.trim()) newErrors.nameBn = "নাম (বাংলায়) আবশ্যক"
    else if (!banglaRegex.test(nameBn.trim())) newErrors.nameBn = "দয়া করে শুধুমাত্র বাংলা অক্ষর ব্যবহার করুন"

    if (!fatherNameBn.trim()) newErrors.fatherNameBn = "পিতার নাম (বাংলায়) আবশ্যক"
    else if (!banglaRegex.test(fatherNameBn.trim())) newErrors.fatherNameBn = "দয়া করে শুধুমাত্র বাংলা অক্ষর ব্যবহার করুন"

    if (!motherNameBn.trim()) newErrors.motherNameBn = "মাতার নাম (বাংলায়) আবশ্যক"
    else if (!banglaRegex.test(motherNameBn.trim())) newErrors.motherNameBn = "দয়া করে শুধুমাত্র বাংলা অক্ষর ব্যবহার করুন"

    if (!gender) newErrors.gender = "লিঙ্গ নির্বাচন করুন"
    if (!religion) newErrors.religion = "ধর্ম নির্বাচন করুন"
    if (!maritalStatus) newErrors.maritalStatus = "বৈবাহিক অবস্থা নির্বাচন করুন"

    // Contact/Identity Validation
    if (!mobile.trim()) {
      newErrors.mobile = "মোবাইল নম্বর আবশ্যক"
    } else if (!mobileRegex.test(mobile.trim())) {
      newErrors.mobile = "সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন (যেমন: 01712345678)"
    }

    if (email.trim() && !emailRegex.test(email.trim())) {
      newErrors.email = "সঠিক ইমেইল ঠিকানা প্রদান করুন"
    }

    if (nid.trim() && !nidRegex.test(nid.trim())) {
      newErrors.nid = "NID ১০, ১৩ অথবা ১৭ ডিজিটের হতে হবে"
    }

    if (birthRegNo.trim() && !birthRegRegex.test(birthRegNo.trim())) {
      newErrors.birthRegNo = "জন্ম নিবন্ধন নম্বর ১৭ ডিজিটের হতে হবে"
    }

    // Present Address Validation
    if (!presDivisionId) newErrors.presDivisionId = "বিভাগ নির্বাচন করুন"
    if (!presDistrictId) newErrors.presDistrictId = "জেলা নির্বাচন করুন"
    if (!presUpazilaId) newErrors.presUpazilaId = "উপজেলা নির্বাচন করুন"
    if (!presUnionId) newErrors.presUnionId = "ইউনিয়ন নির্বাচন করুন"
    if (!presWardId) newErrors.presWardId = "ওয়ার্ড নম্বর নির্বাচন করুন"

    if (!presVillageBn.trim()) {
      newErrors.presVillageBn = "গ্রামের নাম আবশ্যক"
    } else if (!banglaRegex.test(presVillageBn.trim())) {
      newErrors.presVillageBn = "দয়া করে শুধুমাত্র বাংলা অক্ষর ব্যবহার করুন"
    }

    if (!presPostOfficeBn.trim()) {
      newErrors.presPostOfficeBn = "ডাকঘর আবশ্যক"
    } else if (!banglaRegex.test(presPostOfficeBn.trim())) {
      newErrors.presPostOfficeBn = "দয়া করে শুধুমাত্র বাংলা অক্ষর ব্যবহার করুন"
    }

    // Permanent Address Validation
    if (!sameAsPresent) {
      if (!permDivisionId) newErrors.permDivisionId = "বিভাগ নির্বাচন করুন"
      if (!permDistrictId) newErrors.permDistrictId = "জেলা নির্বাচন করুন"
      if (!permUpazilaId) newErrors.permUpazilaId = "উপজেলা নির্বাচন করুন"
      if (!permUnionId) newErrors.permUnionId = "ইউনিয়ন নির্বাচন করুন"
      if (!permWardId) newErrors.permWardId = "ওয়ার্ড নম্বর নির্বাচন করুন"

      if (!permVillageBn.trim()) {
        newErrors.permVillageBn = "গ্রামের নাম আবশ্যক"
      } else if (!banglaRegex.test(permVillageBn.trim())) {
        newErrors.permVillageBn = "দয়া করে শুধুমাত্র বাংলা অক্ষর ব্যবহার করুন"
      }

      if (!permPostOfficeBn.trim()) {
        newErrors.permPostOfficeBn = "ডাকঘর আবশ্যক"
      } else if (!banglaRegex.test(permPostOfficeBn.trim())) {
        newErrors.permPostOfficeBn = "দয়া করে শুধুমাত্র বাংলা অক্ষর ব্যবহার করুন"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("অনুগ্রহ করে সকল লাল তারকা (*) চিহ্নিত প্রয়োজনীয় ক্ষেত্র সঠিকভাবে পূরণ করুন।")
      return
    }

    const payload: any = {
      id: citizen.id,
      nid: nid.trim() || null,
      birthRegNo: birthRegNo.trim() || null,
      passportNo: passportNo.trim() || null,
      nameEn: nameEn.trim() || null,
      nameBn: nameBn.trim(),
      dob: dob || null,
      fatherNameEn: fatherNameEn.trim() || null,
      fatherNameBn: fatherNameBn.trim(),
      motherNameEn: motherNameEn.trim() || null,
      motherNameBn: motherNameBn.trim(),
      occupation: occupation.trim() || null,
      residentType,
      education: education.trim() || null,
      religion,
      gender,
      maritalStatus,
      mobile: mobile.trim(),
      email: email.trim() || null,
      commentsBn: commentsBn.trim() || null,
      commentsEn: commentsEn.trim() || null,
      sameAsPresent,
      presentAddress: {
        villageBn: presVillageBn.trim(),
        villageEn: presVillageEn.trim() || null,
        roadBn: presRoadBn.trim() || null,
        roadEn: presRoadEn.trim() || null,
        holdingNo: presHoldingNo.trim() || null,
        wardId: presWardId,
        divisionId: presDivisionId,
        divisionNameBn: presDivisionNameBn,
        districtId: presDistrictId,
        districtNameBn: presDistrictNameBn,
        upazilaId: presUpazilaId,
        upazilaNameBn: presUpazilaNameBn,
        unionId: presUnionId,
        unionNameBn: presUnionNameBn,
        postId: presPostId,
        postOfficeBn: presPostOfficeBn.trim(),
      },
    }

    if (!sameAsPresent) {
      payload.permanentAddress = {
        villageBn: permVillageBn.trim(),
        villageEn: permVillageEn.trim() || null,
        roadBn: permRoadBn.trim() || null,
        roadEn: permRoadEn.trim() || null,
        holdingNo: permHoldingNo.trim() || null,
        wardId: permWardId,
        divisionId: permDivisionId,
        divisionNameBn: permDivisionNameBn,
        districtId: permDistrictId,
        districtNameBn: permDistrictNameBn,
        upazilaId: permUpazilaId,
        upazilaNameBn: permUpazilaNameBn,
        unionId: permUnionId,
        unionNameBn: permUnionNameBn,
        postId: permPostId,
        postOfficeBn: permPostOfficeBn.trim(),
      }
    }

    updateMutation.mutate(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto font-body">
      <div className="flex items-center justify-between pb-4 border-b border-border/65">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => router.push("/citizens")}
            className="rounded-xl cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Button>
          <div>
            <h3 className="text-xl font-bold text-foreground font-display">নাগরিক প্রোফাইল সংশোধন</h3>
            <p className="text-xs text-muted-foreground">নিবন্ধিত নাগরিকের বিবরণ ও ঠিকানা সংশোধন সম্পন্ন করুন।</p>
          </div>
        </div>
        <Button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl px-5 font-bold gap-2 cursor-pointer"
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          সংরক্ষণ করুন
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full rounded-2xl bg-muted/50 p-1 border">
          <TabsTrigger value="personal" className="rounded-xl font-bold text-xs py-2 gap-1.5">
            <User className="w-3.5 h-3.5" />
            ব্যক্তিগত তথ্য
          </TabsTrigger>
          <TabsTrigger value="contact" className="rounded-xl font-bold text-xs py-2 gap-1.5">
            <Phone className="w-3.5 h-3.5" />
            যোগাযোগ ও পরিচিতি
          </TabsTrigger>
          <TabsTrigger value="present" className="rounded-xl font-bold text-xs py-2 gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            বর্তমান ঠিকানা
          </TabsTrigger>
          <TabsTrigger value="permanent" className="rounded-xl font-bold text-xs py-2 gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            স্থায়ী ঠিকানা
          </TabsTrigger>
        </TabsList>

        {/* ── Personal Info Content ────────────────────────────── */}
        <TabsContent value="personal" className="bg-card border rounded-2xl p-5 mt-4 space-y-4 shadow-xs">
          <h4 className="text-sm font-bold text-primary flex items-center gap-1.5">
            <User className="w-4 h-4" />
            ব্যক্তিগত বিবরণী
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">নাম (বাংলায়) <span className="text-rose-500">*</span></Label>
              <Input
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                placeholder="যেমন: আবদুর রহমান"
                className={errors.nameBn ? "border-rose-500 rounded-xl" : "rounded-xl"}
              />
              {errors.nameBn && <p className="text-[10px] text-rose-500">{errors.nameBn}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">নাম (ইংরেজিতে)</Label>
              <Input
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Abdur Rahman"
                className="rounded-xl font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">পিতার নাম (বাংলায়) <span className="text-rose-500">*</span></Label>
              <Input
                value={fatherNameBn}
                onChange={(e) => setFatherNameBn(e.target.value)}
                placeholder="পিতার নাম বাংলায়"
                className={errors.fatherNameBn ? "border-rose-500 rounded-xl" : "rounded-xl"}
              />
              {errors.fatherNameBn && <p className="text-[10px] text-rose-500">{errors.fatherNameBn}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">পিতার নাম (ইংরেজিতে)</Label>
              <Input
                value={fatherNameEn}
                onChange={(e) => setFatherNameEn(e.target.value)}
                placeholder="Father's Name in English"
                className="rounded-xl font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">মাতার নাম (বাংলায়) <span className="text-rose-500">*</span></Label>
              <Input
                value={motherNameBn}
                onChange={(e) => setMotherNameBn(e.target.value)}
                placeholder="মাতার নাম বাংলায়"
                className={errors.motherNameBn ? "border-rose-500 rounded-xl" : "rounded-xl"}
              />
              {errors.motherNameBn && <p className="text-[10px] text-rose-500">{errors.motherNameBn}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">মাতার নাম (ইংরেজিতে)</Label>
              <Input
                value={motherNameEn}
                onChange={(e) => setMotherNameEn(e.target.value)}
                placeholder="Mother's Name in English"
                className="rounded-xl font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">জন্ম তারিখ</Label>
              <DatePicker
                date={dob}
                setDate={setDob}
                className="rounded-xl w-full"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">লিঙ্গ <span className="text-rose-500">*</span></Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="লিঙ্গ নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {GENDER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-[10px] text-rose-500">{errors.gender}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">ধর্ম <span className="text-rose-500">*</span></Label>
              <Select value={religion} onValueChange={setReligion}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="ধর্ম নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {RELIGION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.religion && <p className="text-[10px] text-rose-500">{errors.religion}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">বৈবাহিক অবস্থা <span className="text-rose-500">*</span></Label>
              <Select value={maritalStatus} onValueChange={setMaritalStatus}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="বৈবাহিক অবস্থা নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {MARITAL_STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.maritalStatus && <p className="text-[10px] text-rose-500">{errors.maritalStatus}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">বাসিন্দা ধরণ <span className="text-rose-500">*</span></Label>
              <Select value={residentType} onValueChange={setResidentType}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="বাসিন্দা ধরণ নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {RESIDENT_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">পেশা</Label>
              <Input
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="যেমন: ব্যবসা, চাকুরিজীবী"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-semibold text-muted-foreground">শিক্ষাগত যোগ্যতা</Label>
              <Input
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="যেমন: এসএসসি, বিএসসি"
                className="rounded-xl"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button type="button" onClick={() => setActiveTab("contact")} className="bg-primary hover:bg-primary/90 rounded-xl px-5 font-bold">
              পরবর্তী ধাপ
            </Button>
          </div>
        </TabsContent>

        {/* ── Contact & Identity Content ────────────────────────── */}
        <TabsContent value="contact" className="bg-card border rounded-2xl p-5 mt-4 space-y-4 shadow-xs">
          <h4 className="text-sm font-bold text-primary flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            যোগাযোগ ও জাতীয় পরিচয়পত্র
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">মোবাইল নম্বর <span className="text-rose-500">*</span></Label>
              <Input
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="মোবাইল নম্বর লিখুন"
                className={errors.mobile ? "border-rose-500 rounded-xl font-mono" : "rounded-xl font-mono"}
              />
              {errors.mobile && <p className="text-[10px] text-rose-500">{errors.mobile}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">ইমেইল ঠিকানা</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ইমেইল এড্রেস"
                className={errors.email ? "border-rose-500 rounded-xl font-mono" : "rounded-xl font-mono"}
              />
              {errors.email && <p className="text-[10px] text-rose-500">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">জাতীয় পরিচয়পত্র নম্বর (NID)</Label>
              <Input
                value={nid}
                onChange={(e) => setNid(e.target.value)}
                placeholder="NID নম্বর"
                className={errors.nid ? "border-rose-500 rounded-xl font-mono" : "rounded-xl font-mono"}
              />
              {errors.nid && <p className="text-[10px] text-rose-500">{errors.nid}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">জন্ম নিবন্ধন নম্বর (BRN)</Label>
              <Input
                value={birthRegNo}
                onChange={(e) => setBirthRegNo(e.target.value)}
                placeholder="১৭ ডিজিটের জন্ম নিবন্ধন নং"
                className={errors.birthRegNo ? "border-rose-500 rounded-xl font-mono" : "rounded-xl font-mono"}
              />
              {errors.birthRegNo && <p className="text-[10px] text-rose-500">{errors.birthRegNo}</p>}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-semibold text-muted-foreground">পাসপোর্ট নম্বর</Label>
              <Input
                value={passportNo}
                onChange={(e) => setPassportNo(e.target.value)}
                placeholder="পাসপোর্ট নম্বর"
                className="rounded-xl font-mono"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-semibold text-muted-foreground">মন্তব্য (বাংলায়)</Label>
              <Textarea
                value={commentsBn}
                onChange={(e) => setCommentsBn(e.target.value)}
                placeholder="বাংলায় কোনো মন্তব্য থাকলে লিখুন..."
                className="rounded-xl min-h-[60px]"
              />
            </div>
            
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-semibold text-muted-foreground">Comments (English)</Label>
              <Textarea
                value={commentsEn}
                onChange={(e) => setCommentsEn(e.target.value)}
                placeholder="Add comments in English if any..."
                className="rounded-xl min-h-[60px]"
              />
            </div>
          </div>
          <div className="flex justify-between pt-2">
            <Button type="button" variant="outline" onClick={() => setActiveTab("personal")} className="rounded-xl px-5 font-bold">
              পূর্ববর্তী ধাপ
            </Button>
            <Button type="button" onClick={() => setActiveTab("present")} className="bg-primary hover:bg-primary/90 rounded-xl px-5 font-bold">
              পরবর্তী ধাপ
            </Button>
          </div>
        </TabsContent>

        {/* ── Present Address Content ──────────────────────────── */}
        <TabsContent value="present" className="bg-card border rounded-2xl p-5 mt-4 space-y-4 shadow-xs">
          <h4 className="text-sm font-bold text-primary flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            বর্তমান ঠিকানা
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">বিভাগ <span className="text-rose-500">*</span></Label>
              <Select value={presDivisionId} onValueChange={handlePresDivisionChange}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {presDivisions.map((d: any) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.nameBn || d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">জেলা <span className="text-rose-500">*</span></Label>
              <Select value={presDistrictId} onValueChange={handlePresDistrictChange} disabled={!presDivisionId}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="জেলা নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {presDistricts.map((d: any) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.nameBn || d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">উপজেলা <span className="text-rose-500">*</span></Label>
              <Select value={presUpazilaId} onValueChange={handlePresUpazilaChange} disabled={!presDistrictId}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="উপজেলা নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {presUpazilas.map((u: any) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.nameBn || u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">ইউনিয়ন <span className="text-rose-500">*</span></Label>
              <Select value={presUnionId} onValueChange={handlePresUnionChange} disabled={!presUpazilaId}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="ইউনিয়ন নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {presUnions.map((u: any) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.nameBn || u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">ওয়ার্ড নম্বর <span className="text-rose-500">*</span></Label>
              <Select value={presWardId} onValueChange={setPresWardId}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="ওয়ার্ড নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {wards.map((w: any) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.nameBn || w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">গ্রাম/মহল্লা (বাংলায়) <span className="text-rose-500">*</span></Label>
              <Input
                value={presVillageBn}
                onChange={(e) => setPresVillageBn(e.target.value)}
                placeholder="গ্রাম/মহল্লা বাংলায়"
                className={errors.presVillageBn ? "border-rose-500 rounded-xl" : "rounded-xl"}
              />
              {errors.presVillageBn && <p className="text-[10px] text-rose-500">{errors.presVillageBn}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">গ্রাম/মহল্লা (ইংরেজিতে)</Label>
              <Input
                value={presVillageEn}
                onChange={(e) => setPresVillageEn(e.target.value)}
                placeholder="Village/Mahalla in English"
                className="rounded-xl font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">রোড/ব্লক/সেক্টর (বাংলায়)</Label>
              <Input
                value={presRoadBn}
                onChange={(e) => setPresRoadBn(e.target.value)}
                placeholder="রোড/ব্লক/সেক্টর বাংলায়"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">রোড/ব্লক/সেক্টর (ইংরেজিতে)</Label>
              <Input
                value={presRoadEn}
                onChange={(e) => setPresRoadEn(e.target.value)}
                placeholder="Road/Block/Sector in English"
                className="rounded-xl font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">হোল্ডিং নং</Label>
              <Input
                value={presHoldingNo}
                onChange={(e) => setPresHoldingNo(e.target.value)}
                placeholder="হোল্ডিং নং লিখুন"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">ডাকঘর নির্বাচন করুন <span className="text-rose-500">*</span></Label>
              <Select value={presPostId} onValueChange={handlePresPostChange} disabled={!presUpazilaId}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="ডাকঘর নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {presPosts.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.postOfficeBn} ({p.postId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">ডাকঘর (ম্যানুয়াল বাংলায়) <span className="text-rose-500">*</span></Label>
              <Input
                value={presPostOfficeBn}
                onChange={(e) => setPresPostOfficeBn(e.target.value)}
                placeholder="ডাকঘর বাংলায়"
                className={errors.presPostOfficeBn ? "border-rose-500 rounded-xl" : "rounded-xl"}
              />
              {errors.presPostOfficeBn && <p className="text-[10px] text-rose-500">{errors.presPostOfficeBn}</p>}
            </div>
          </div>
          <div className="flex justify-between pt-2">
            <Button type="button" variant="outline" onClick={() => setActiveTab("contact")} className="rounded-xl px-5 font-bold">
              পূর্ববর্তী ধাপ
            </Button>
            <Button type="button" onClick={() => setActiveTab("permanent")} className="bg-primary hover:bg-primary/90 rounded-xl px-5 font-bold">
              পরবর্তী ধাপ
            </Button>
          </div>
        </TabsContent>

        {/* ── Permanent Address Content ────────────────────────── */}
        <TabsContent value="permanent" className="bg-card border rounded-2xl p-5 mt-4 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b">
            <h4 className="text-sm font-bold text-primary flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              স্থায়ী ঠিকানা
            </h4>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sameAsPresent"
                checked={sameAsPresent}
                onCheckedChange={(checked) => setSameAsPresent(!!checked)}
                className="rounded cursor-pointer"
              />
              <label htmlFor="sameAsPresent" className="text-xs font-bold text-foreground cursor-pointer">
                বর্তমান ঠিকানার মতো একই
              </label>
            </div>
          </div>

          {sameAsPresent ? (
            <div className="py-8 text-center text-muted-foreground text-xs font-semibold bg-muted/20 border border-dashed rounded-2xl">
              স্থায়ী ঠিকানা বর্তমান ঠিকানার সাথে মিলানো রয়েছে।
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">বিভাগ <span className="text-rose-500">*</span></Label>
                <Select value={permDivisionId} onValueChange={handlePermDivisionChange}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {permDivisions.map((d: any) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.nameBn || d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">জেলা <span className="text-rose-500">*</span></Label>
                <Select value={permDistrictId} onValueChange={handlePermDistrictChange} disabled={!permDivisionId}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="জেলা নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {permDistricts.map((d: any) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.nameBn || d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">উপজেলা <span className="text-rose-500">*</span></Label>
                <Select value={permUpazilaId} onValueChange={handlePermUpazilaChange} disabled={!permDistrictId}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="উপজেলা নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {permUpazilas.map((u: any) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.nameBn || u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">ইউনিয়ন <span className="text-rose-500">*</span></Label>
                <Select value={permUnionId} onValueChange={handlePermUnionChange} disabled={!permUpazilaId}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="ইউনিয়ন নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {permUnions.map((u: any) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.nameBn || u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">ওয়ার্ড নম্বর <span className="text-rose-500">*</span></Label>
                <Select value={permWardId} onValueChange={setPermWardId}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="ওয়ার্ড নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {wards.map((w: any) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.nameBn || w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">গ্রাম/মহল্লা (বাংলায়) <span className="text-rose-500">*</span></Label>
                <Input
                  value={permVillageBn}
                  onChange={(e) => setPermVillageBn(e.target.value)}
                  placeholder="গ্রাম/মহল্লা বাংলায়"
                  className={errors.permVillageBn ? "border-rose-500 rounded-xl" : "rounded-xl"}
                />
                {errors.permVillageBn && <p className="text-[10px] text-rose-500">{errors.permVillageBn}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">গ্রাম/মহল্লা (ইংরেজিতে)</Label>
                <Input
                  value={permVillageEn}
                  onChange={(e) => setPermVillageEn(e.target.value)}
                  placeholder="Village/Mahalla in English"
                  className="rounded-xl font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">রোড/ব্লক/সেক্টর (বাংলায়)</Label>
                <Input
                  value={permRoadBn}
                  onChange={(e) => setPermRoadBn(e.target.value)}
                  placeholder="রোড/ব্লক/সেক্টর বাংলায়"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">রোড/ব্লক/সেক্টর (ইংরেজিতে)</Label>
                <Input
                  value={permRoadEn}
                  onChange={(e) => setPermRoadEn(e.target.value)}
                  placeholder="Road/Block/Sector in English"
                  className="rounded-xl font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">হোল্ডিং নং</Label>
                <Input
                  value={permHoldingNo}
                  onChange={(e) => setPermHoldingNo(e.target.value)}
                  placeholder="হোল্ডিং নং লিখুন"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">ডাকঘর নির্বাচন করুন <span className="text-rose-500">*</span></Label>
                <Select value={permPostId} onValueChange={handlePermPostChange} disabled={!permUpazilaId}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="ডাকঘর নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {permPosts.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.postOfficeBn} ({p.postId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">ডাকঘর (ম্যানুয়াল বাংলায়) <span className="text-rose-500">*</span></Label>
                <Input
                  value={permPostOfficeBn}
                  onChange={(e) => setPermPostOfficeBn(e.target.value)}
                  placeholder="ডাকঘর বাংলায়"
                  className={errors.permPostOfficeBn ? "border-rose-500 rounded-xl" : "rounded-xl"}
                />
                {errors.permPostOfficeBn && <p className="text-[10px] text-rose-500">{errors.permPostOfficeBn}</p>}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button type="button" variant="outline" onClick={() => setActiveTab("present")} className="rounded-xl px-5 font-bold">
              পূর্ববর্তী ধাপ
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl px-6 font-bold gap-2 cursor-pointer"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              সংরক্ষণ করুন
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </form>
  )
}

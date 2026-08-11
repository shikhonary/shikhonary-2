"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { useTenant } from "@/modules/layout/ui/components/tenant-provider"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@workspace/ui/components/card"
import {
  User,
  Phone,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Check,
  UserCheck,
  LucideIcon,
  Users,
} from "lucide-react"

// Import modular steps
import { PersonalInfoStep } from "./steps/personal-info-step"
import { ContactIdentityStep } from "./steps/contact-identity-step"
import { PresentAddressStep } from "./steps/present-address-step"
import { PermanentAddressStep } from "./steps/permanent-address-step"
import { ReviewStep } from "./steps/review-step"
import { SubmissionProgress } from "./steps/submission-progress"

type SubmissionStatus = "idle" | "pending" | "success" | "error"

const steps = [
  { id: 1, title: "ব্যক্তিগত তথ্য", icon: User, description: "নাম, পিতা-মাতার নাম ও ব্যক্তিগত বিবরণ" },
  { id: 2, title: "পরিচয় ও যোগাযোগ", icon: Phone, description: "মোবাইল, ইমেইল, NID ও পরিচয়পত্র" },
  { id: 3, title: "বর্তমান ঠিকানা", icon: MapPin, description: "বর্তমান বসবাসের ঠিকানা বিবরণ" },
  { id: 4, title: "স্থায়ী ঠিকানা", icon: MapPin, description: "স্থায়ী বসবাসের ঠিকানা বিবরণ" },
  { id: 5, title: "পর্যালোচনা ও দাখিল", icon: UserCheck, description: "প্রদত্ত সকল তথ্যের বিবরণ যাচাই" },
]

export function CreateCitizenApplicationForm() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [currentStep, setCurrentStep] = useState(1)
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>("idle")
  const [activeSubStep, setActiveSubStep] = useState(1)
  const [submissionError, setSubmissionError] = useState<string | undefined>()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [showEnglishFields, setShowEnglishFields] = useState(false)

  // ── Step 1: Personal Info ──────────────────────────────────
  const [nameBn, setNameBn] = useState("")
  const [nameEn, setNameEn] = useState("")
  const [fatherNameBn, setFatherNameBn] = useState("")
  const [fatherNameEn, setFatherNameEn] = useState("")
  const [motherNameBn, setMotherNameBn] = useState("")
  const [motherNameEn, setMotherNameEn] = useState("")
  const [dob, setDob] = useState<Date | undefined>(undefined)
  const [gender, setGender] = useState("")
  const [religion, setReligion] = useState("")
  const [maritalStatus, setMaritalStatus] = useState("")
  const [residentType, setResidentType] = useState("PERMANENT")
  const [occupation, setOccupation] = useState("")
  const [education, setEducation] = useState("")

  // ── Step 2: Contact & Identity ─────────────────────────────
  const [mobile, setMobile] = useState("")
  const [email, setEmail] = useState("")
  const [nid, setNid] = useState("")
  const [birthRegNo, setBirthRegNo] = useState("")
  const [passportNo, setPassportNo] = useState("")
  const [commentsBn, setCommentsBn] = useState("")

  // ── Step 3: Present Address ────────────────────────────────
  const [presWardId, setPresWardId] = useState("")
  const [presVillageBn, setPresVillageBn] = useState("")
  const [presVillageEn, setPresVillageEn] = useState("")
  const [presRoadBn, setPresRoadBn] = useState("")
  const [presRoadEn, setPresRoadEn] = useState("")
  const [presHoldingNo, setPresHoldingNo] = useState("")
  const [presDivisionId, setPresDivisionId] = useState("")
  const [presDivisionNameBn, setPresDivisionNameBn] = useState("")
  const [presDistrictId, setPresDistrictId] = useState("")
  const [presDistrictNameBn, setPresDistrictNameBn] = useState("")
  const [presUpazilaId, setPresUpazilaId] = useState("")
  const [presUpazilaNameBn, setPresUpazilaNameBn] = useState("")
  const [presUnionId, setPresUnionId] = useState("")
  const [presUnionNameBn, setPresUnionNameBn] = useState("")
  const [presPostId, setPresPostId] = useState("")
  const [presPostOfficeBn, setPresPostOfficeBn] = useState("")
  const [presPostCode, setPresPostCode] = useState("")

  // ── Step 4: Permanent Address ──────────────────────────────
  const [sameAsPresent, setSameAsPresent] = useState(false)
  const [permWardId, setPermWardId] = useState("")
  const [permVillageBn, setPermVillageBn] = useState("")
  const [permVillageEn, setPermVillageEn] = useState("")
  const [permHoldingNo, setPermHoldingNo] = useState("")
  const [permRoadBn, setPermRoadBn] = useState("")
  const [permRoadEn, setPermRoadEn] = useState("")
  const [permDivisionId, setPermDivisionId] = useState("")
  const [permDivisionNameBn, setPermDivisionNameBn] = useState("")
  const [permDistrictId, setPermDistrictId] = useState("")
  const [permDistrictNameBn, setPermDistrictNameBn] = useState("")
  const [permUpazilaId, setPermUpazilaId] = useState("")
  const [permUpazilaNameBn, setPermUpazilaNameBn] = useState("")
  const [permUnionId, setPermUnionId] = useState("")
  const [permUnionNameBn, setPermUnionNameBn] = useState("")
  const [permPostId, setPermPostId] = useState("")
  const [permPostOfficeBn, setPermPostOfficeBn] = useState("")
  const [permPostCode, setPermPostCode] = useState("")

  // Fetch Wards for selects
  const { data: wardsData } = useQuery(
    trpc.tenantWard.list.queryOptions({ limit: 100 })
  )
  const wards = wardsData?.wards || []

  // ── Tenant Context (for auto-filling address) ──────────────
  const { tenant } = useTenant()

  // ── Present Address Location Queries ───────────────────────
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

  // ── Auto-fill address fields from tenant context ──────────
  useEffect(() => {
    if (tenant.divisionId) {
      setPresDivisionId(tenant.divisionId)
      setPresDivisionNameBn(tenant.divisionNameBn || tenant.divisionName || "")
      setPermDivisionId(tenant.divisionId)
      setPermDivisionNameBn(tenant.divisionNameBn || tenant.divisionName || "")
    }
    if (tenant.districtId) {
      setPresDistrictId(tenant.districtId)
      setPresDistrictNameBn(tenant.districtNameBn || tenant.districtName || "")
      setPermDistrictId(tenant.districtId)
      setPermDistrictNameBn(tenant.districtNameBn || tenant.districtName || "")
    }
    if (tenant.upazilaId) {
      setPresUpazilaId(tenant.upazilaId)
      setPresUpazilaNameBn(tenant.upazilaNameBn || tenant.upazilaName || "")
      setPermUpazilaId(tenant.upazilaId)
      setPermUpazilaNameBn(tenant.upazilaNameBn || tenant.upazilaName || "")
    }
    if (tenant.unionId) {
      setPresUnionId(tenant.unionId)
      setPresUnionNameBn(tenant.unionNameBn || tenant.unionName || "")
      setPermUnionId(tenant.unionId)
      setPermUnionNameBn(tenant.unionNameBn || tenant.unionName || "")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant.divisionId, tenant.districtId, tenant.upazilaId, tenant.unionId])

  const handlePresDivisionChange = (val: string) => {
    setPresDivisionId(val)
    const selected = presDivisions.find((d: any) => d.id === val)
    setPresDivisionNameBn(selected ? selected.nameBn || selected.name : "")

    // Reset downstream
    setPresDistrictId("")
    setPresDistrictNameBn("")
    setPresUpazilaId("")
    setPresUpazilaNameBn("")
    setPresUnionId("")
    setPresUnionNameBn("")
    setPresPostId("")
    setPresPostOfficeBn("")
    setPresPostCode("")
  }

  const handlePresDistrictChange = (val: string) => {
    setPresDistrictId(val)
    const selected = presDistricts.find((d: any) => d.id === val)
    setPresDistrictNameBn(selected ? selected.nameBn || selected.name : "")

    // Reset downstream
    setPresUpazilaId("")
    setPresUpazilaNameBn("")
    setPresUnionId("")
    setPresUnionNameBn("")
    setPresPostId("")
    setPresPostOfficeBn("")
    setPresPostCode("")
  }

  const handlePresUpazilaChange = (val: string) => {
    setPresUpazilaId(val)
    const selected = presUpazilas.find((u: any) => u.id === val)
    setPresUpazilaNameBn(selected ? selected.nameBn || selected.name : "")

    // Reset downstream
    setPresUnionId("")
    setPresUnionNameBn("")
    setPresPostId("")
    setPresPostOfficeBn("")
    setPresPostCode("")
  }

  const handlePresUnionChange = (val: string) => {
    setPresUnionId(val)
    const selected = presUnions.find((u: any) => u.id === val)
    setPresUnionNameBn(selected ? selected.nameBn || selected.name : "")
  }

  // ── Permanent Address Location Queries ─────────────────────
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

  const handlePermDivisionChange = (val: string) => {
    setPermDivisionId(val)
    const selected = permDivisions.find((d: any) => d.id === val)
    setPermDivisionNameBn(selected ? selected.nameBn || selected.name : "")

    // Reset downstream
    setPermDistrictId("")
    setPermDistrictNameBn("")
    setPermUpazilaId("")
    setPermUpazilaNameBn("")
    setPermUnionId("")
    setPermUnionNameBn("")
    setPermPostId("")
    setPermPostOfficeBn("")
    setPermPostCode("")
  }

  const handlePermDistrictChange = (val: string) => {
    setPermDistrictId(val)
    const selected = permDistricts.find((d: any) => d.id === val)
    setPermDistrictNameBn(selected ? selected.nameBn || selected.name : "")

    // Reset downstream
    setPermUpazilaId("")
    setPermUpazilaNameBn("")
    setPermUnionId("")
    setPermUnionNameBn("")
    setPermPostId("")
    setPermPostOfficeBn("")
    setPermPostCode("")
  }

  const handlePermUpazilaChange = (val: string) => {
    setPermUpazilaId(val)
    const selected = permUpazilas.find((u: any) => u.id === val)
    setPermUpazilaNameBn(selected ? selected.nameBn || selected.name : "")

    // Reset downstream
    setPermUnionId("")
    setPermUnionNameBn("")
    setPermPostId("")
    setPermPostOfficeBn("")
    setPermPostCode("")
  }

  const handlePermUnionChange = (val: string) => {
    setPermUnionId(val)
    const selected = permUnions.find((u: any) => u.id === val)
    setPermUnionNameBn(selected ? selected.nameBn || selected.name : "")
  }

  // ── Mutation ───────────────────────────────────────────────
  const createMutation = useMutation(
    trpc.citizenApplication.create.mutationOptions()
  )

  // ── Validation Helpers ─────────────────────────────────────
  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev }
        delete updated[field]
        return updated
      })
    }
  }

  const validateStep = (stepNum: number): boolean => {
    const newErrors: Record<string, string> = {}

    // Regex definitions
    const banglaRegex = /^[ \u0980-\u09FF.,\-\(\)\/\s]+$/
    const englishRegex = /^[a-zA-Z0-9\s.,\-\(\)\/\'\"]*$/
    const mobileRegex = /^(?:\+88|88)?01[3-9]\d{8}$/
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const nidRegex = /^\d{10}$|^\d{13}$|^\d{17}$/
    const birthRegRegex = /^\d{17}$/
    const postCodeRegex = /^\d{4}$/

    if (stepNum === 1) {
      // Required Checks
      if (!nameBn.trim()) {
        newErrors.nameBn = "আবেদনকারীর নাম আবশ্যক"
      } else if (!banglaRegex.test(nameBn.trim())) {
        newErrors.nameBn = "দয়া করে শুধুমাত্র বাংলা অক্ষর ব্যবহার করুন"
      }

      if (showEnglishFields && nameEn.trim() && !englishRegex.test(nameEn.trim())) {
        newErrors.nameEn = "দয়া করে শুধুমাত্র ইংরেজি অক্ষর ব্যবহার করুন"
      }

      if (!fatherNameBn.trim()) {
        newErrors.fatherNameBn = "পিতার নাম আবশ্যক"
      } else if (!banglaRegex.test(fatherNameBn.trim())) {
        newErrors.fatherNameBn = "দয়া করে শুধুমাত্র বাংলা অক্ষর ব্যবহার করুন"
      }

      if (showEnglishFields && fatherNameEn.trim() && !englishRegex.test(fatherNameEn.trim())) {
        newErrors.fatherNameEn = "দয়া করে শুধুমাত্র ইংরেজি অক্ষর ব্যবহার করুন"
      }

      if (!motherNameBn.trim()) {
        newErrors.motherNameBn = "মাতার নাম আবশ্যক"
      } else if (!banglaRegex.test(motherNameBn.trim())) {
        newErrors.motherNameBn = "দয়া করে শুধুমাত্র বাংলা অক্ষর ব্যবহার করুন"
      }

      if (showEnglishFields && motherNameEn.trim() && !englishRegex.test(motherNameEn.trim())) {
        newErrors.motherNameEn = "দয়া করে শুধুমাত্র ইংরেজি অক্ষর ব্যবহার করুন"
      }

      if (!dob) newErrors.dob = "জন্ম তারিখ নির্বাচন করুন"
      if (!gender) newErrors.gender = "লিঙ্গ নির্বাচন করুন"
      if (!religion) newErrors.religion = "ধর্ম নির্বাচন করুন"
      if (!maritalStatus) newErrors.maritalStatus = "বৈবাহিক অবস্থা নির্বাচন করুন"
      if (!residentType) newErrors.residentType = "বাসিন্দার ধরন নির্বাচন করুন"
    }

    if (stepNum === 2) {
      if (!mobile.trim()) {
        newErrors.mobile = "মোবাইল নম্বর আবশ্যক"
      } else if (!mobileRegex.test(mobile.trim())) {
        newErrors.mobile = "সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন (যেমন: 017XXXXXXXX)"
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
    }

    if (stepNum === 3) {
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

      if (showEnglishFields && presVillageEn.trim() && !englishRegex.test(presVillageEn.trim())) {
        newErrors.presVillageEn = "দয়া করে শুধুমাত্র ইংরেজি অক্ষর ব্যবহার করুন"
      }

      if (showEnglishFields && presRoadEn.trim() && !englishRegex.test(presRoadEn.trim())) {
        newErrors.presRoadEn = "দয়া করে শুধুমাত্র ইংরেজি অক্ষর ব্যবহার করুন"
      }

      if (!presPostOfficeBn.trim()) {
        newErrors.presPostOfficeBn = "ডাকঘর আবশ্যক"
      } else if (!banglaRegex.test(presPostOfficeBn.trim())) {
        newErrors.presPostOfficeBn = "দয়া করে শুধুমাত্র বাংলা অক্ষর ব্যবহার করুন"
      }

      if (!presPostCode.trim()) {
        newErrors.presPostCode = "ডাক কোড আবশ্যক"
      } else if (!postCodeRegex.test(presPostCode.trim())) {
        newErrors.presPostCode = "ডাক কোড ৪ ডিজিটের হতে হবে"
      }
    }

    if (stepNum === 4 && !sameAsPresent) {
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

      if (showEnglishFields && permVillageEn.trim() && !englishRegex.test(permVillageEn.trim())) {
        newErrors.permVillageEn = "দয়া করে শুধুমাত্র ইংরেজি অক্ষর ব্যবহার করুন"
      }

      if (showEnglishFields && permRoadEn.trim() && !englishRegex.test(permRoadEn.trim())) {
        newErrors.permRoadEn = "দয়া করে শুধুমাত্র ইংরেজি অক্ষর ব্যবহার করুন"
      }

      if (!permPostOfficeBn.trim()) {
        newErrors.permPostOfficeBn = "ডাকঘর আবশ্যক"
      } else if (!banglaRegex.test(permPostOfficeBn.trim())) {
        newErrors.permPostOfficeBn = "দয়া করে শুধুমাত্র বাংলা অক্ষর ব্যবহার করুন"
      }

      if (!permPostCode.trim()) {
        newErrors.permPostCode = "ডাক কোড আবশ্যক"
      } else if (!postCodeRegex.test(permPostCode.trim())) {
        newErrors.permPostCode = "ডাক কোড ৪ ডিজিটের হতে হবে"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    const isValid = validateStep(currentStep)
    if (!isValid) {
      toast.error("অনুগ্রহ করে সকল লাল তারকা (*) চিহ্নিত প্রয়োজনীয় ক্ষেত্র সঠিকভাবে পূরণ করুন।", {
        position: "top-center",
      })
      return
    }

    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    } else {
      router.push("/citizen-applications")
    }
  }

  const handleStepClick = (stepNum: number) => {
    if (stepNum < currentStep) {
      setCurrentStep(stepNum)
    } else if (stepNum === currentStep + 1) {
      handleNext()
    }
  }

  const handleFinalSubmit = () => {
    setSubmissionStatus("pending")
    setActiveSubStep(1)
    setSubmissionError(undefined)

    // Run simple animations for visual feedback
    setTimeout(() => setActiveSubStep(2), 1000)
    setTimeout(() => setActiveSubStep(3), 3500)

    const payload: any = {
      nid: nid.trim() || undefined,
      birthRegNo: birthRegNo.trim() || undefined,
      passportNo: passportNo.trim() || undefined,
      nameEn: nameEn.trim() || undefined,
      nameBn: nameBn.trim(),
      dob: dob || undefined,
      fatherNameEn: fatherNameEn.trim() || undefined,
      fatherNameBn: fatherNameBn.trim(),
      motherNameEn: motherNameEn.trim() || undefined,
      motherNameBn: motherNameBn.trim(),
      occupation: occupation.trim() || undefined,
      residentType,
      education: education.trim() || undefined,
      religion,
      gender,
      maritalStatus,
      mobile: mobile.trim(),
      email: email.trim() || undefined,
      commentsBn: commentsBn.trim() || undefined,
      sameAsPresent,
      presentAddress: {
        villageBn: presVillageBn.trim(),
        villageEn: presVillageEn.trim() || undefined,
        roadBn: presRoadBn.trim() || undefined,
        roadEn: presRoadEn.trim() || undefined,
        holdingNo: presHoldingNo.trim() || undefined,
        wardId: presWardId,
        divisionId: presDivisionId,
        divisionNameBn: presDivisionNameBn,
        districtId: presDistrictId,
        districtNameBn: presDistrictNameBn,
        upazilaId: presUpazilaId,
        upazilaNameBn: presUpazilaNameBn,
        unionId: presUnionId,
        unionNameBn: presUnionNameBn,
        postId: presPostId.trim(),
        postOfficeBn: presPostOfficeBn.trim(),
        postCode: presPostCode.trim(),
      },
    }

    if (!sameAsPresent) {
      payload.permanentAddress = {
        villageBn: permVillageBn.trim(),
        villageEn: permVillageEn.trim() || undefined,
        roadBn: permRoadBn.trim() || undefined,
        roadEn: permRoadEn.trim() || undefined,
        holdingNo: permHoldingNo.trim() || undefined,
        wardId: permWardId,
        divisionId: permDivisionId,
        divisionNameBn: permDivisionNameBn,
        districtId: permDistrictId,
        districtNameBn: permDistrictNameBn,
        upazilaId: permUpazilaId,
        upazilaNameBn: permUpazilaNameBn,
        unionId: permUnionId,
        unionNameBn: permUnionNameBn,
        postId: permPostId.trim(),
        postOfficeBn: permPostOfficeBn.trim(),
        postCode: permPostCode.trim(),
      }
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        setSubmissionStatus("success")
        setActiveSubStep(4)
        queryClient.invalidateQueries(trpc.citizenApplication.pathFilter())
        toast.success("নাগরিক আবেদনপত্রটি সফলভাবে দাখিল হয়েছে!")
      },
      onError: (err: any) => {
        setSubmissionStatus("error")
        setSubmissionError(err?.message || "আবেদনটি জমা দেওয়ার সময় ত্রুটি ঘটেছে।")
      },
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentStep < 5) {
      handleNext()
    } else {
      handleFinalSubmit()
    }
  }

  // Render Provisioning / Submission screen
  if (submissionStatus !== "idle") {
    return (
      <SubmissionProgress
        submissionStatus={submissionStatus}
        activeSubStep={activeSubStep}
        submissionError={submissionError}
        nameBn={nameBn}
        onRetry={() => setSubmissionStatus("idle")}
        onBack={() => router.push("/citizen-applications")}
      />
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-12 relative font-body animate-in fade-in duration-300">
      {/* Back to Registry Button */}
      <div className="flex flex-col gap-4">
        <Link
          href="/citizen-applications"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-primary transition-colors w-fit cursor-pointer font-display"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>নাগরিক আবেদন তালিকায় ফিরে যান</span>
        </Link>
      </div>

      {/* Desktop Stepper Indicator */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-xs relative">
        <div className="hidden sm:flex justify-between items-center relative">
          <div className="absolute top-5 left-0 w-full h-0.5 bg-border/40 -z-0" />
          <div
            className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500 -z-0"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((step) => {
            const isActiveStep = currentStep === step.id
            const isCompletedStep = currentStep > step.id
            const StepIcon = step.icon

            return (
              <div
                key={step.id}
                onClick={() => handleStepClick(step.id)}
                className="flex-1 flex flex-col items-center cursor-pointer z-10 group"
              >
                <div
                  className={`size-10 rounded-xl flex items-center justify-center transition-all duration-300 border-2 bg-card ${isActiveStep
                    ? "bg-primary text-primary-foreground border-primary shadow-md scale-110"
                    : isCompletedStep
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "text-muted-foreground border-border hover:border-primary/40"
                    }`}
                >
                  {isCompletedStep ? <Check className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                </div>
                <div className="mt-2 text-center hidden md:block">
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${isActiveStep ? "text-primary" : "text-muted-foreground"}`}>
                    ধাপ {step.id}
                  </span>
                  <p className={`text-xs font-bold ${isActiveStep ? "text-foreground" : "text-muted-foreground"}`}>
                    {step.title}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Mobile Stepper Indicator */}
        <div className="sm:hidden space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase text-primary">ধাপ {currentStep} / {steps.length}</span>
            <span className="font-bold text-foreground">{steps[currentStep - 1]?.title}</span>
          </div>
          <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full transition-all duration-300" style={{ width: `${(currentStep / steps.length) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Stepper Card */}
      <Card className="overflow-hidden rounded-2xl border border-border/60 bg-card p-5 sm:p-6 shadow-xl text-left gap-4">
        <CardHeader className="p-0 pb-4 border-b border-border/50 flex flex-row items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            {(() => {
              const StepIcon = steps[currentStep - 1]?.icon as LucideIcon
              return <StepIcon className="h-5 w-5" />
            })()}
          </div>
          <div>
            <CardTitle className="font-headline text-lg font-bold tracking-tight text-foreground normal-case">
              ধাপ {currentStep}: {steps[currentStep - 1]?.title}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {steps[currentStep - 1]?.description}
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-0 pt-5">
          {/* Form Header Info - Instructions and English Fields Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-5 border-b border-border/40 font-body">
            <p className="text-xs text-destructive flex items-center gap-1 font-display">
              <span className="font-bold text-sm sm:text-base">*</span> চিহ্নিত ক্ষেত্রগুলো পূরণ করা বাধ্যতামূলক
            </p>
            <div className="flex items-center space-x-2.5 shrink-0 font-body">
              <Checkbox
                id="showEnglishFields"
                checked={showEnglishFields}
                onCheckedChange={(checked) => setShowEnglishFields(!!checked)}
              />
              <Label htmlFor="showEnglishFields" className="text-xs sm:text-sm font-semibold text-foreground cursor-pointer select-none font-display">
                ইংরেজি তথ্য প্রদান করুন
              </Label>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <PersonalInfoStep
                nameBn={nameBn}
                setNameBn={setNameBn}
                nameEn={nameEn}
                setNameEn={setNameEn}
                fatherNameBn={fatherNameBn}
                setFatherNameBn={setFatherNameBn}
                fatherNameEn={fatherNameEn}
                setFatherNameEn={setFatherNameEn}
                motherNameBn={motherNameBn}
                setMotherNameBn={setMotherNameBn}
                motherNameEn={motherNameEn}
                setMotherNameEn={setMotherNameEn}
                dob={dob}
                setDob={setDob}
                gender={gender}
                setGender={setGender}
                religion={religion}
                setReligion={setReligion}
                maritalStatus={maritalStatus}
                setMaritalStatus={setMaritalStatus}
                residentType={residentType}
                setResidentType={setResidentType}
                occupation={occupation}
                setOccupation={setOccupation}
                education={education}
                setEducation={setEducation}
                showEnglishFields={showEnglishFields}
                errors={errors}
                clearError={clearError}
              />
            )}

            {/* Step 2: Contact & Identity */}
            {currentStep === 2 && (
              <ContactIdentityStep
                mobile={mobile}
                setMobile={setMobile}
                email={email}
                setEmail={setEmail}
                nid={nid}
                setNid={setNid}
                birthRegNo={birthRegNo}
                setBirthRegNo={setBirthRegNo}
                passportNo={passportNo}
                setPassportNo={setPassportNo}
                commentsBn={commentsBn}
                setCommentsBn={setCommentsBn}
                errors={errors}
                clearError={clearError}
              />
            )}

            {/* Step 3: Present Address */}
            {currentStep === 3 && (
              <PresentAddressStep
                presDivisionId={presDivisionId}
                presDistrictId={presDistrictId}
                presUpazilaId={presUpazilaId}
                presUnionId={presUnionId}
                presWardId={presWardId}
                presVillageBn={presVillageBn}
                presVillageEn={presVillageEn}
                presHoldingNo={presHoldingNo}
                presRoadBn={presRoadBn}
                presRoadEn={presRoadEn}
                presPostId={presPostId}
                presPostOfficeBn={presPostOfficeBn}
                presPostCode={presPostCode}
                setPresPostOfficeBn={setPresPostOfficeBn}
                setPresPostId={setPresPostId}
                setPresPostCode={setPresPostCode}
                setPresVillageBn={setPresVillageBn}
                setPresVillageEn={setPresVillageEn}
                setPresHoldingNo={setPresHoldingNo}
                setPresRoadBn={setPresRoadBn}
                setPresRoadEn={setPresRoadEn}
                setPresWardId={setPresWardId}
                handlePresDivisionChange={handlePresDivisionChange}
                handlePresDistrictChange={handlePresDistrictChange}
                handlePresUpazilaChange={handlePresUpazilaChange}
                handlePresUnionChange={handlePresUnionChange}
                presDivisions={presDivisions}
                presDistricts={presDistricts}
                presUpazilas={presUpazilas}
                presUnions={presUnions}
                presPosts={presPosts}
                wards={wards}
                showEnglishFields={showEnglishFields}
                errors={errors}
                clearError={clearError}
              />
            )}

            {/* Step 4: Permanent Address */}
            {currentStep === 4 && (
              <PermanentAddressStep
                sameAsPresent={sameAsPresent}
                setSameAsPresent={setSameAsPresent}
                permDivisionId={permDivisionId}
                permDistrictId={permDistrictId}
                permUpazilaId={permUpazilaId}
                permUnionId={permUnionId}
                permWardId={permWardId}
                permVillageBn={permVillageBn}
                permVillageEn={permVillageEn}
                permHoldingNo={permHoldingNo}
                permRoadBn={permRoadBn}
                permRoadEn={permRoadEn}
                permPostId={permPostId}
                permPostOfficeBn={permPostOfficeBn}
                permPostCode={permPostCode}
                setPermPostOfficeBn={setPermPostOfficeBn}
                setPermPostId={setPermPostId}
                setPermPostCode={setPermPostCode}
                setPermVillageBn={setPermVillageBn}
                setPermVillageEn={setPermVillageEn}
                setPermHoldingNo={setPermHoldingNo}
                setPermRoadBn={setPermRoadBn}
                setPermRoadEn={setPermRoadEn}
                setPermWardId={setPermWardId}
                handlePermDivisionChange={handlePermDivisionChange}
                handlePermDistrictChange={handlePermDistrictChange}
                handlePermUpazilaChange={handlePermUpazilaChange}
                handlePermUnionChange={handlePermUnionChange}
                permDivisions={permDivisions}
                permDistricts={permDistricts}
                permUpazilas={permUpazilas}
                permUnions={permUnions}
                permPosts={permPosts}
                wards={wards}
                showEnglishFields={showEnglishFields}
                errors={errors}
                clearError={clearError}
              />
            )}

            {/* Step 5: Review & Submit */}
            {currentStep === 5 && (
              <ReviewStep
                nameBn={nameBn}
                nameEn={nameEn}
                fatherNameBn={fatherNameBn}
                fatherNameEn={fatherNameEn}
                motherNameBn={motherNameBn}
                motherNameEn={motherNameEn}
                dob={dob ? dob.toLocaleDateString("bn-BD") : ""}
                gender={gender}
                religion={religion}
                residentType={residentType}
                mobile={mobile}
                email={email}
                nid={nid}
                birthRegNo={birthRegNo}
                passportNo={passportNo}
                presDivisionNameBn={presDivisionNameBn}
                presDistrictNameBn={presDistrictNameBn}
                presUpazilaNameBn={presUpazilaNameBn}
                presUnionNameBn={presUnionNameBn}
                presWardId={presWardId}
                presVillageBn={presVillageBn}
                presVillageEn={presVillageEn}
                presHoldingNo={presHoldingNo}
                presRoadEn={presRoadEn}
                presPostOfficeBn={presPostOfficeBn}
                presPostCode={presPostCode}
                sameAsPresent={sameAsPresent}
                permDivisionNameBn={permDivisionNameBn}
                permDistrictNameBn={permDistrictNameBn}
                permUpazilaNameBn={permUpazilaNameBn}
                permUnionNameBn={permUnionNameBn}
                permWardId={permWardId}
                permVillageBn={permVillageBn}
                permVillageEn={permVillageEn}
                permHoldingNo={permHoldingNo}
                permRoadEn={permRoadEn}
                permPostOfficeBn={permPostOfficeBn}
                permPostCode={permPostCode}
                wards={wards}
                showEnglishFields={showEnglishFields}
              />
            )}

            {/* Form footer controls */}
            <div className="flex items-center justify-between pt-6 border-t border-border/50 mt-6 font-body">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                className="rounded-xl border px-5 py-2 text-xs sm:text-sm font-semibold hover:bg-muted cursor-pointer h-10 transition-all"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                পূর্ববর্তী
              </Button>

              <Button
                type="submit"
                className="rounded-xl bg-primary px-6 py-2 text-xs sm:text-sm font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer h-10 shadow-md shadow-primary/10 transition-all active:scale-95"
              >
                {currentStep === 5 ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    দাখিল করুন
                  </>
                ) : (
                  <>
                    পরবর্তী ধাপ
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

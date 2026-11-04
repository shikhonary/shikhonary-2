"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@workspace/ui/components/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { PageHeader } from "@/components/shared/page-header"
import { TENANT_TYPE_OPTIONS, toBengaliDigits } from "@workspace/utils"
import {
  Building2,
  Globe,
  MapPin,
  Tag,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  UserCheck,
  ShieldCheck,
  Database,
  Server,
  CreditCard,
  Settings2,
  AlertCircle,
  RefreshCw,
  LucideIcon,
  Save,
  CheckCircle2,
  Phone,
  Mail,
  GraduationCap,
} from "lucide-react"

type ProvisionStatus = "idle" | "pending" | "success" | "error"

const steps = [
  { id: 1, title: "মৌলিক তথ্য", titleEn: "Basic Info", icon: Building2, description: "পোর্টাল স্লাগ ও প্রতিষ্ঠানের প্রাথমিক বিবরণ" },
  { id: 2, title: "অবস্থান ও যোগাযোগ", titleEn: "Location & Contact", icon: MapPin, description: "ভৌগোলিক তথ্য, ঠিকানা ও অফিসিয়াল যোগাযোগ" },
  { id: 3, title: "প্রশাসন", titleEn: "Administration", icon: UserCheck, description: "প্রতিষ্ঠান প্রধান ও স্বাক্ষর কনফিগারেশন" },
  { id: 4, title: "সাবস্ক্রিপশন ও সীমা", titleEn: "Subscription & Limits", icon: CreditCard, description: "প্ল্যান নির্ধারণ ও কাস্টম রিসোর্স কোটা" },
]

const provisionSteps = [
  {
    id: 1,
    label: "প্রতিষ্ঠান রেকর্ড ও মেটাডেটা তৈরি",
    description: "মাস্টার ডেটাবেসে প্রতিষ্ঠানের তথ্য ও সাবস্ক্রিপশন রেকর্ড সংরক্ষণ করা হচ্ছে",
    icon: Server,
  },
  {
    id: 2,
    label: "ক্লাউড ডেটাবেস প্রভিশনিং",
    description: "এই প্রতিষ্ঠানের জন্য একটি স্বতন্ত্র PostgreSQL ডেটাবেস তৈরি করা হচ্ছে",
    icon: Database,
  },
  {
    id: 3,
    label: "স্কিমা ও নিরাপত্তা প্রোটোকল প্রয়োগ",
    description: "স্কিমা মাইগ্রেশন সম্পন্ন ও অ্যাক্সেস প্রিভিলেজ ইনিশিয়ালাইজ করা হচ্ছে",
    icon: ShieldCheck,
  },
]

export function CreateTenantView() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [currentStep, setCurrentStep] = useState(1)
  const [provisionStatus, setProvisionStatus] = useState<ProvisionStatus>("idle")
  const [activeProvisionStep, setActiveProvisionStep] = useState(1)
  const [provisionError, setProvisionError] = useState<string | undefined>()

  // Step 1: Basic Info
  const [slug, setSlug] = useState("")
  const [name, setName] = useState("")
  const [nameBn, setNameBn] = useState("")
  const [type, setType] = useState("SCHOOL")
  const [description, setDescription] = useState("")
  const [logo, setLogo] = useState("")
  const [customDomain, setCustomDomain] = useState("")
  const [eiin, setEiin] = useState("")
  const [board, setBoard] = useState("")
  const [address, setAddress] = useState("")

  // Step 2: Geography & Contact
  const [divisionId, setDivisionId] = useState("")
  const [divisionName, setDivisionName] = useState("")
  const [districtId, setDistrictId] = useState("")
  const [districtName, setDistrictName] = useState("")
  const [upazilaId, setUpazilaId] = useState("")
  const [upazilaName, setUpazilaName] = useState("")
  const [unionId, setUnionId] = useState("")
  const [unionName, setUnionName] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [website, setWebsite] = useState("")

  // Step 3: School Officials & Signatures
  const [principalName, setPrincipalName] = useState("")
  const [vicePrincipalName, setVicePrincipalName] = useState("")
  const [principalSignature, setPrincipalSignature] = useState("")
  const [vicePrincipalSignature, setVicePrincipalSignature] = useState("")

  // Step 4: Subscription Plan & Limits
  const [planId, setPlanId] = useState<string>("")
  const [isActive, setIsActive] = useState(true)
  const [customStudentLimit, setCustomStudentLimit] = useState<number | undefined>()
  const [customTeacherLimit, setCustomTeacherLimit] = useState<number | undefined>()
  const [customExamLimit, setCustomExamLimit] = useState<number | undefined>()
  const [customStorageLimit, setCustomStorageLimit] = useState<number | undefined>()

  // Cascading location queries
  const { data: divisions = [] } = useQuery(trpc.location.divisions.queryOptions())
  const { data: districts = [] } = useQuery(
    trpc.location.districts.queryOptions({ divisionId }, { enabled: !!divisionId })
  )
  const { data: upazilas = [] } = useQuery(
    trpc.location.upazilas.queryOptions({ districtId }, { enabled: !!districtId })
  )
  const { data: unions = [] } = useQuery(
    trpc.location.unions.queryOptions({ upazilaId }, { enabled: !!upazilaId })
  )

  // Subscription plans
  const { data: plansData } = useQuery(trpc.subscriptionPlan.forSelection.queryOptions())

  // Create mutation
  const createMutation = trpc.tenant.create.mutationOptions()
  const createTenantMutation = (data: any, options: any) => {
    return queryClient
      .getMutationCache()
      .build(queryClient, {
        ...createMutation,
        mutationFn: createMutation.mutationFn,
      })
      .execute(data)
      .then(options.onSuccess)
      .catch(options.onError)
  }

  const handleDivisionChange = (val: string) => {
    setDivisionId(val)
    const selected = divisions.find((d: any) => d.id === val)
    setDivisionName(selected ? selected.name : "")
    setDistrictId("")
    setDistrictName("")
    setUpazilaId("")
    setUpazilaName("")
    setUnionId("")
    setUnionName("")
  }

  const handleDistrictChange = (val: string) => {
    setDistrictId(val)
    const selected = districts.find((d: any) => d.id === val)
    setDistrictName(selected ? selected.name : "")
    setUpazilaId("")
    setUpazilaName("")
    setUnionId("")
    setUnionName("")
  }

  const handleUpazilaChange = (val: string) => {
    setUpazilaId(val)
    const selected = upazilas.find((u: any) => u.id === val)
    setUpazilaName(selected ? selected.name : "")
    setUnionId("")
    setUnionName("")
  }

  const handleUnionChange = (val: string) => {
    setUnionId(val)
    const selected = unions.find((u: any) => u.id === val)
    setUnionName(selected ? selected.name : "")
  }

  const isStep1Valid = slug.trim().length > 0 && name.trim().length > 0
  const isStep2Valid =
    divisionId.trim().length > 0 &&
    districtId.trim().length > 0 &&
    upazilaId.trim().length > 0 &&
    unionId.trim().length > 0
  const isEmailValid = !email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const isPhoneValid = !phone.trim() || /^[+\d\s-]{8,20}$/.test(phone.trim())

  const handleNext = () => {
    if (currentStep === 1 && !isStep1Valid) {
      toast.error("অনুগ্রহ করে একটি সঠিক পোর্টাল স্লাগ এবং ইংরেজি নাম প্রদান করুন।")
      return
    }
    if (currentStep === 2) {
      if (!isStep2Valid) {
        toast.error("অনুগ্রহ করে বিভাগ, জেলা, উপজেলা এবং ইউনিয়ন নির্বাচন করুন।")
        return
      }
      if (!isEmailValid || !isPhoneValid) {
        toast.error("অনুগ্রহ করে সঠিক ইমেইল ও ফোন নম্বর প্রদান করুন।")
        return
      }
    }
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    } else {
      router.push("/tenants")
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
    if (!isStep1Valid || !isStep2Valid) {
      toast.error("প্রয়োজনীয় ফিল্ডসমূহ যথাযথভাবে পূরণ করুন।")
      return
    }

    setProvisionStatus("pending")
    setActiveProvisionStep(1)
    setProvisionError(undefined)
    setTimeout(() => setActiveProvisionStep(2), 1500)
    setTimeout(() => setActiveProvisionStep(3), 6000)

    createTenantMutation(
      {
        slug,
        name,
        nameBn: nameBn || undefined,
        type: type || undefined,
        description: description || undefined,
        logo: logo || undefined,
        eiin: eiin || undefined,
        board: board || undefined,
        address: address || undefined,
        divisionId: divisionId || undefined,
        divisionName: divisionName || undefined,
        districtId: districtId || undefined,
        districtName: districtName || undefined,
        upazilaId: upazilaId || undefined,
        upazilaName: upazilaName || undefined,
        unionId: unionId || undefined,
        unionName: unionName || undefined,
        postalCode: postalCode || undefined,
        principalName: principalName || undefined,
        vicePrincipalName: vicePrincipalName || undefined,
        phone: phone?.trim() || undefined,
        email: email && email.trim().length > 0 ? email.trim() : undefined,
        principalSignature: principalSignature || undefined,
        vicePrincipalSignature: vicePrincipalSignature || undefined,
        website: website || undefined,
        planId: planId || undefined,
        isActive,
        customDomain: customDomain || undefined,
        customStudentLimit: customStudentLimit !== undefined ? Number(customStudentLimit) : undefined,
        customTeacherLimit: customTeacherLimit !== undefined ? Number(customTeacherLimit) : undefined,
        customExamLimit: customExamLimit !== undefined ? Number(customExamLimit) : undefined,
        customStorageLimit: customStorageLimit !== undefined ? Number(customStorageLimit) : undefined,
      },
      {
        onSuccess: () => {
          setProvisionStatus("success")
          setActiveProvisionStep(4)
          queryClient.invalidateQueries(trpc.tenant.pathFilter())
          toast.success("প্রতিষ্ঠান সফলভাবে নিবন্ধিত ও প্রভিশন করা হয়েছে।")
        },
        onError: (err: any) => {
          setProvisionStatus("error")
          setProvisionError(err?.message || "ডেটাবেস প্রভিশন করতে সমস্যা হয়েছে।")
          toast.error(err?.message || "প্রতিষ্ঠান তৈরি ব্যর্থ হয়েছে")
        },
      }
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (currentStep < 4) {
      handleNext()
    } else {
      handleFinalSubmit()
    }
  }

  const plans = plansData ?? []

  // ── Provisioning Progress Screen ──────────────────────────────────────────
  if (provisionStatus !== "idle") {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6 py-10 animate-in fade-in duration-300">
        <Card className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
          <CardHeader className="p-0 pb-5 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-3.5">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 shrink-0">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {provisionStatus === "success"
                    ? "প্রতিষ্ঠান পোর্টাল প্রস্তুত ও সক্রিয়!"
                    : provisionStatus === "error"
                    ? "প্রভিশনিং ব্যর্থ হয়েছে"
                    : "প্রতিষ্ঠান ক্লাউড পোর্টাল তৈরি হচ্ছে"}
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {provisionStatus === "success"
                    ? `"${name}" সফলভাবে নিবন্ধিত হয়েছে এবং স্বতন্ত্র ক্লাউড ডেটাবেস সক্রিয় রয়েছে।`
                    : provisionStatus === "error"
                    ? "ডেটাবেস ইনস্ট্যান্স প্রস্তুত করার সময় একটি সমস্যা দেখা দিয়েছে।"
                    : `"${name || slug}"-এর জন্য নতুন PostgreSQL ডেটাবেস ও সিকিউরিটি প্রোটোকল কনফিগার হচ্ছে।`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 pt-6 space-y-5">
            <div className="space-y-3.5">
              {provisionSteps.map((step) => {
                const isDone =
                  provisionStatus === "success" ||
                  (provisionStatus !== "error" && activeProvisionStep > step.id)
                const isActiveStep =
                  provisionStatus !== "success" &&
                  provisionStatus !== "error" &&
                  activeProvisionStep === step.id
                const isFailed = provisionStatus === "error" && activeProvisionStep === step.id
                const StepIcon = step.icon

                return (
                  <div
                    key={step.id}
                    className={`flex items-start gap-3.5 p-4 rounded-xl border transition-all duration-300 ${
                      isDone
                        ? "border-emerald-200/80 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                        : isActiveStep
                        ? "border-indigo-300 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-950/30 ring-1 ring-indigo-500/20"
                        : isFailed
                        ? "border-rose-200 bg-rose-50/50 dark:border-rose-900/40 dark:bg-rose-950/20"
                        : "border-slate-200/60 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 opacity-50"
                    }`}
                  >
                    <div
                      className={`size-10 rounded-xl flex items-center justify-center border shrink-0 ${
                        isDone
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : isActiveStep
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : isFailed
                          ? "bg-rose-600 text-white border-rose-600"
                          : "bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      {isDone ? (
                        <Check className="h-5 w-5" />
                      ) : isActiveStep ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : isFailed ? (
                        <AlertCircle className="h-5 w-5" />
                      ) : (
                        <StepIcon className="h-5 w-5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-bold ${
                          isDone
                            ? "text-emerald-700 dark:text-emerald-400"
                            : isActiveStep
                            ? "text-indigo-600 dark:text-indigo-400"
                            : isFailed
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{step.description}</p>
                    </div>

                    {isDone && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-1 rounded-lg">
                        সম্পন্ন
                      </span>
                    )}
                    {isActiveStep && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 px-2.5 py-1 rounded-lg animate-pulse">
                        চলমান
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            {provisionStatus === "error" && provisionError && (
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/30 text-xs text-rose-700 dark:text-rose-400 font-medium">
                <span className="font-bold">ত্রুটি: </span>
                {provisionError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              {provisionStatus === "error" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setProvisionStatus("idle")}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 px-5 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 h-10"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  পুনরায় চেষ্টা করুন
                </Button>
              )}
              {provisionStatus === "success" && (
                <Button
                  type="button"
                  onClick={() => router.push("/tenants")}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 text-xs font-bold text-white h-10 shadow-sm"
                >
                  <Check className="mr-2 h-4 w-4" />
                  প্রতিষ্ঠান তালিকায় যান
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Multi-Step Form View ──────────────────────────────────────────────────
  return (
    <div className="w-full min-w-0 max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200 pb-16">
      {/* Shared Page Header */}
      <PageHeader
        title="নতুন প্রতিষ্ঠান তৈরি (Register Institution)"
        description="শিক্ষা প্রতিষ্ঠানের বিবরণ, প্রশাসনিক তথ্য, ভৌগোলিক অবস্থান ও ক্লাউড ডেটাবেস কনফিগার করুন।"
        icon={Building2}
        badge={{ label: "টেন্যান্ট মডিউল", variant: "indigo" }}
        breadcrumbs={[
          { label: "প্রতিষ্ঠান তালিকা", href: "/tenants" },
          { label: "নতুন প্রতিষ্ঠান তৈরি" },
        ]}
      >
        <Button
          asChild
          variant="outline"
          className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 font-medium text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Link href="/tenants" prefetch={true}>
            <ArrowLeft className="w-4 h-4" />
            <span>তালিকায় ফিরে যান</span>
          </Link>
        </Button>
      </PageHeader>

      {/* 4-Step Indicator */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs relative">
        <div className="hidden sm:flex justify-between items-center relative">
          <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-100 dark:bg-slate-800 -z-0" />
          <div
            className="absolute top-5 left-0 h-0.5 bg-indigo-600 transition-all duration-500 -z-0"
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
                  className={`size-10 rounded-xl flex items-center justify-center transition-all duration-300 border-2 bg-white dark:bg-slate-900 ${
                    isActiveStep
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md ring-4 ring-indigo-500/20 scale-110"
                      : isCompletedStep
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-400"
                  }`}
                >
                  {isCompletedStep ? <Check className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                </div>
                <div className="mt-2 text-center hidden md:block">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      isActiveStep ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"
                    }`}
                  >
                    ধাপ {toBengaliDigits(step.id)}
                  </span>
                  <p
                    className={`text-xs font-bold ${
                      isActiveStep ? "text-slate-900 dark:text-slate-100" : "text-slate-500"
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Mobile Step Indicator */}
        <div className="sm:hidden space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase text-indigo-600 dark:text-indigo-400">
              ধাপ {toBengaliDigits(currentStep)} / {toBengaliDigits(steps.length)}
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{steps[currentStep - 1]?.title}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Multi-Step Form Card */}
      <Card className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <CardHeader className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/80 p-5 sm:p-6 flex flex-row items-center gap-3.5">
          <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 shrink-0">
            {(() => {
              const StepIcon = steps[currentStep - 1]?.icon as LucideIcon
              return <StepIcon className="h-5 w-5" />
            })()}
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              ধাপ {toBengaliDigits(currentStep)}: {steps[currentStep - 1]?.title} ({steps[currentStep - 1]?.titleEn})
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {steps[currentStep - 1]?.description}
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      পোর্টাল স্লাগ (Subdomain Slug) <span className="text-rose-500">*</span>
                    </Label>
                    <div className="relative">
                      <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        placeholder="savar-school"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 pl-10 pr-4 font-mono text-sm bg-white dark:bg-slate-950 focus-visible:ring-indigo-500 h-10 sm:h-11"
                      />
                    </div>
                    {slug && (
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono flex items-center gap-1 mt-1">
                        <Globe className="h-3.5 w-3.5" /> https://{slug}.shikhonary.com
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      প্রতিষ্ঠানের নাম (ইংরেজি) <span className="text-rose-500">*</span>
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Savar High School"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 pl-10 pr-4 text-sm bg-white dark:bg-slate-950 focus-visible:ring-indigo-500 h-10 sm:h-11"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      প্রতিষ্ঠানের বাংলা নাম (ঐচ্ছিক)
                    </Label>
                    <Input
                      value={nameBn}
                      onChange={(e) => setNameBn(e.target.value)}
                      placeholder="যেমন: সাভার পাইলট উচ্চ বিদ্যালয়"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 px-3.5 text-sm bg-white dark:bg-slate-950 focus-visible:ring-indigo-500 h-10 sm:h-11"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      প্রতিষ্ঠানের ধরন <span className="text-rose-500">*</span>
                    </Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 px-3.5 text-sm bg-white dark:bg-slate-950 focus-visible:ring-indigo-500 h-10 sm:h-11">
                        <SelectValue placeholder="ধরন বাছাই করুন" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                        {TENANT_TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      EIIN নম্বর (ঐচ্ছিক)
                    </Label>
                    <Input
                      value={eiin}
                      onChange={(e) => setEiin(e.target.value)}
                      placeholder="যেমন: 130456"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 px-3.5 text-sm bg-white dark:bg-slate-950 focus-visible:ring-indigo-500 h-10 sm:h-11"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      শিক্ষা বোর্ড (Board)
                    </Label>
                    <Input
                      value={board}
                      onChange={(e) => setBoard(e.target.value)}
                      placeholder="যেমন: ঢাকা বা কারিগরি"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 px-3.5 text-sm bg-white dark:bg-slate-950 focus-visible:ring-indigo-500 h-10 sm:h-11"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    কাস্টম ডোমেন (Custom Domain - ঐচ্ছিক)
                  </Label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      placeholder="যেমন: schoolname.edu.bd"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 pl-10 pr-4 text-sm bg-white dark:bg-slate-950 focus-visible:ring-indigo-500 h-10 sm:h-11"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    ঠিকানা (Physical Address)
                  </Label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="যেমন: মজিদপুর, সাভার, ঢাকা"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 px-3.5 text-sm bg-white dark:bg-slate-950 focus-visible:ring-indigo-500 h-10 sm:h-11"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    প্রতিষ্ঠানের বিবরণ (Description)
                  </Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="প্রতিষ্ঠানের পরিচিতি বা সংক্ষিপ্ত পটভূমি..."
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 py-2 px-3.5 text-sm bg-white dark:bg-slate-950 focus-visible:ring-indigo-500 min-h-[75px]"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Location & Contact */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      বিভাগ (Division) <span className="text-rose-500">*</span>
                    </Label>
                    <Select value={divisionId} onValueChange={handleDivisionChange}>
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 px-3.5 text-sm bg-white dark:bg-slate-950 focus-visible:ring-indigo-500 h-10 sm:h-11">
                        <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                        {divisions.map((d: any) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.nameBn ? `${d.name} (${d.nameBn})` : d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      জেলা (District) <span className="text-rose-500">*</span>
                    </Label>
                    <Select
                      value={districtId}
                      onValueChange={handleDistrictChange}
                      disabled={!divisionId}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 px-3.5 text-sm bg-white dark:bg-slate-950 focus-visible:ring-indigo-500 h-10 sm:h-11 disabled:opacity-50">
                        <SelectValue placeholder={divisionId ? "জেলা নির্বাচন করুন" : "আগে বিভাগ নির্বাচন করুন"} />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                        {districts.map((d: any) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.nameBn ? `${d.name} (${d.nameBn})` : d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      উপজেলা (Upazila) <span className="text-rose-500">*</span>
                    </Label>
                    <Select
                      value={upazilaId}
                      onValueChange={handleUpazilaChange}
                      disabled={!districtId}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 px-3.5 text-sm bg-white dark:bg-slate-950 focus-visible:ring-indigo-500 h-10 sm:h-11 disabled:opacity-50">
                        <SelectValue placeholder={districtId ? "উপজেলা নির্বাচন করুন" : "আগে জেলা নির্বাচন করুন"} />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                        {upazilas.map((u: any) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.nameBn ? `${u.name} (${u.nameBn})` : u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      ইউনিয়ন / ওয়ার্ড (Union) <span className="text-rose-500">*</span>
                    </Label>
                    <Select
                      value={unionId}
                      onValueChange={handleUnionChange}
                      disabled={!upazilaId}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 px-3.5 text-sm bg-white dark:bg-slate-950 focus-visible:ring-indigo-500 h-10 sm:h-11 disabled:opacity-50">
                        <SelectValue placeholder={upazilaId ? "ইউনিয়ন নির্বাচন করুন" : "আগে উপজেলা নির্বাচন করুন"} />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                        {unions.map((u: any) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.nameBn ? `${u.name} (${u.nameBn})` : u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      পোস্ট কোড (Postal Code)
                    </Label>
                    <Input
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="যেমন: 1340"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 px-3.5 text-sm bg-white dark:bg-slate-950 focus-visible:ring-indigo-500 h-10 sm:h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      ওয়েবসাইট লিঙ্ক (Website URL)
                    </Label>
                    <Input
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://institution.edu.bd"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 px-3.5 text-sm bg-white dark:bg-slate-950 focus-visible:ring-indigo-500 h-10 sm:h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      যোগাযোগের ফোন নম্বর
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+880 1700-000000"
                        className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm bg-white dark:bg-slate-950 h-10 sm:h-11 ${
                          !isPhoneValid
                            ? "border-rose-400 focus-visible:ring-rose-400"
                            : "border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500"
                        }`}
                      />
                    </div>
                    {!isPhoneValid && (
                      <p className="text-xs text-rose-500 font-medium">সঠিক ফোন নম্বর ফরম্যাট প্রদান করুন</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      অফিসিয়াল ইমেইল
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="info@school.shikhonary.com"
                        className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm bg-white dark:bg-slate-950 h-10 sm:h-11 ${
                          !isEmailValid
                            ? "border-rose-400 focus-visible:ring-rose-400"
                            : "border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500"
                        }`}
                      />
                    </div>
                    {!isEmailValid && (
                      <p className="text-xs text-rose-500 font-medium">সঠিক ইমেইল ফরম্যাট প্রদান করুন</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: School Officials & Signatures */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      প্রতিষ্ঠান প্রধানের নাম (Principal / Headmaster)
                    </Label>
                    <Input
                      value={principalName}
                      onChange={(e) => setPrincipalName(e.target.value)}
                      placeholder="যেমন: ড. মুহাম্মদ রফিকুল ইসলাম"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 px-3.5 text-sm bg-white dark:bg-slate-950 focus-visible:ring-indigo-500 h-10 sm:h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      সহকারী প্রধানের নাম (Vice Principal)
                    </Label>
                    <Input
                      value={vicePrincipalName}
                      onChange={(e) => setVicePrincipalName(e.target.value)}
                      placeholder="যেমন: মোছা: নাজমুন নাহার"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 px-3.5 text-sm bg-white dark:bg-slate-950 focus-visible:ring-indigo-500 h-10 sm:h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      প্রধানের ডিজিটাল স্বাক্ষর ইমেজ URL
                    </Label>
                    <Input
                      value={principalSignature}
                      onChange={(e) => setPrincipalSignature(e.target.value)}
                      placeholder="https://example.com/signatures/principal.png"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 px-3.5 text-sm bg-white dark:bg-slate-950 focus-visible:ring-indigo-500 h-10 sm:h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      সহকারী প্রধানের স্বাক্ষর ইমেজ URL
                    </Label>
                    <Input
                      value={vicePrincipalSignature}
                      onChange={(e) => setVicePrincipalSignature(e.target.value)}
                      placeholder="https://example.com/signatures/vice_principal.png"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 px-3.5 text-sm bg-white dark:bg-slate-950 focus-visible:ring-indigo-500 h-10 sm:h-11"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Subscription & Limits */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-3">
                  <Label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    সাবস্ক্রিপশন প্ল্যান নির্বাচন করুন
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {plans.map((p: any) => {
                      const isSelected = planId === p.id
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPlanId(p.id)}
                          className={`p-4 rounded-2xl border text-left transition-all duration-200 relative flex items-start gap-3.5 cursor-pointer ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs ring-1 ring-indigo-500/30"
                              : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/40"
                          }`}
                        >
                          <div
                            className={`size-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 transition-all ${
                              isSelected
                                ? "border-indigo-600 bg-indigo-600 text-white"
                                : "border-slate-300 dark:border-slate-700"
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                                {p.displayName}
                              </h3>
                              <div className="text-right shrink-0">
                                {p.yearlyPriceBDT === 0 ? (
                                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                    ফ্রি
                                  </span>
                                ) : (
                                  <div>
                                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                      ৳{toBengaliDigits(p.yearlyPriceBDT?.toLocaleString())}
                                    </span>
                                    <span className="text-[10px] text-slate-400">/বছর</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {p.description && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                {p.description}
                              </p>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      কাস্টম রিসোর্স কোটা ওভাররাইড (ঐচ্ছিক)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      প্ল্যানের ডিফল্ট কোটার পরিবর্তে এই প্রতিষ্ঠানের জন্য নির্দিষ্ট সীমা নির্ধারণ করুন। খালি রাখলে প্ল্যানের ডিফল্ট সীমা কার্যকর হবে।
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        শিক্ষার্থী সীমা (Student Limit)
                      </Label>
                      <Input
                        type="number"
                        value={customStudentLimit ?? ""}
                        onChange={(e) =>
                          setCustomStudentLimit(e.target.value ? Number(e.target.value) : undefined)
                        }
                        placeholder="প্ল্যানের ডিফল্ট সীমা"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 px-3.5 text-sm bg-white dark:bg-slate-950 focus-visible:ring-indigo-500 h-10 sm:h-11"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        শিক্ষক আসন (Teacher Seats)
                      </Label>
                      <Input
                        type="number"
                        value={customTeacherLimit ?? ""}
                        onChange={(e) =>
                          setCustomTeacherLimit(e.target.value ? Number(e.target.value) : undefined)
                        }
                        placeholder="প্ল্যানের ডিফল্ট আসন"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 px-3.5 text-sm bg-white dark:bg-slate-950 focus-visible:ring-indigo-500 h-10 sm:h-11"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        পরীক্ষা কোটা (Exam Quota)
                      </Label>
                      <Input
                        type="number"
                        value={customExamLimit ?? ""}
                        onChange={(e) =>
                          setCustomExamLimit(e.target.value ? Number(e.target.value) : undefined)
                        }
                        placeholder="প্ল্যানের ডিফল্ট কোটা"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 px-3.5 text-sm bg-white dark:bg-slate-950 focus-visible:ring-indigo-500 h-10 sm:h-11"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        স্টোরেজ কোটা (Storage in MB)
                      </Label>
                      <Input
                        type="number"
                        value={customStorageLimit ?? ""}
                        onChange={(e) =>
                          setCustomStorageLimit(e.target.value ? Number(e.target.value) : undefined)
                        }
                        placeholder="যেমন: 5120 (MB)"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 px-3.5 text-sm bg-white dark:bg-slate-950 focus-visible:ring-indigo-500 h-10 sm:h-11"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/40">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="size-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="isActive" className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                    নিবন্ধনের সাথে সাথে প্রতিষ্ঠান পোর্টাল সক্রিয় (Active) রাখুন
                  </label>
                </div>
              </div>
            )}

            {/* Actions Footer */}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-5 border-t border-slate-100 dark:border-slate-800/80">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-slate-800 px-5 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 h-10"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                {currentStep === 1 ? "বাতিল" : "পূর্ববর্তী ধাপ"}
              </Button>

              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 text-xs font-semibold text-white h-10 shadow-xs"
                >
                  <span>পরবর্তী ধাপ</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={!isStep1Valid || !isStep2Valid}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-2 text-xs font-semibold text-white h-10 shadow-sm disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>প্রতিষ্ঠান নিবন্ধন ও ক্লাউড প্রভিশনিং সম্পন্ন করুন</span>
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

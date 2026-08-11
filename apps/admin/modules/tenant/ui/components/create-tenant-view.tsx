"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@workspace/ui/components/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
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
  CheckCircle2,
  ShieldCheck,
  Database,
  Server,
  CreditCard,
  Settings2,
  AlertCircle,
  RefreshCw,
  LucideIcon,
  Save,
} from "lucide-react"

type ProvisionStatus = "idle" | "pending" | "success" | "error"

const steps = [
  { id: 1, title: "Basic Info", icon: Building2, description: "Portal slug & official titles" },
  { id: 2, title: "Location & Contact", icon: MapPin, description: "Geographical hierarchy & office contact" },
  { id: 3, title: "UP Officials", icon: UserCheck, description: "Officials & signature credentials" },
  { id: 4, title: "Subscription & Limits", icon: CreditCard, description: "SaaS plan & custom resource limits" },
]

const provisionSteps = [
  {
    id: 1,
    label: "Creating tenant record",
    description: "Saving Union Porishod metadata and subscription to master database",
    icon: Server,
  },
  {
    id: 2,
    label: "Provisioning database",
    description: "Creating a dedicated PostgreSQL database instance for this Union Porishod",
    icon: Database,
  },
  {
    id: 3,
    label: "Applying schema & protocols",
    description: "Pushing tenant schema and initializing security access",
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
  const [type, setType] = useState("UNION_PORISHOD")
  const [description, setDescription] = useState("")
  const [logo, setLogo] = useState("")

  // Step 2: Geography & Contact (Cascading Dropdowns)
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
  const [facebookUrl, setFacebookUrl] = useState("")

  // Step 3: UP Officials & Signatures
  const [secretaryName, setSecretaryName] = useState("")
  const [chairmanName, setChairmanName] = useState("")
  const [secretarySignature, setSecretarySignature] = useState("")
  const [chairmanSignature, setChairmanSignature] = useState("")

  // Step 4: Subscription Plan & Limits
  const [planId, setPlanId] = useState<string>("")
  const [isActive, setIsActive] = useState(true)
  const [customCitizenLimit, setCustomCitizenLimit] = useState<number | undefined>()
  const [customStaffLimit, setCustomStaffLimit] = useState<number | undefined>()
  const [customCertificateLimit, setCustomCertificateLimit] = useState<number | undefined>()
  const [customStorageLimit, setCustomStorageLimit] = useState<number | undefined>()

  // Cascading location queries
  const { data: divisions = [] } = useQuery(
    trpc.location.divisions.queryOptions()
  )
  const { data: districts = [] } = useQuery(
    trpc.location.districts.queryOptions({ divisionId }, { enabled: !!divisionId })
  )
  const { data: upazilas = [] } = useQuery(
    trpc.location.upazilas.queryOptions({ districtId }, { enabled: !!districtId })
  )
  const { data: unions = [] } = useQuery(
    trpc.location.unions.queryOptions({ upazilaId }, { enabled: !!upazilaId })
  )

  const handleDivisionChange = (val: string) => {
    setDivisionId(val)
    const selected = divisions.find((d: any) => d.id === val)
    setDivisionName(selected ? selected.name : "")

    // Reset downstream
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

    // Reset downstream
    setUpazilaId("")
    setUpazilaName("")
    setUnionId("")
    setUnionName("")
  }

  const handleUpazilaChange = (val: string) => {
    setUpazilaId(val)
    const selected = upazilas.find((u: any) => u.id === val)
    setUpazilaName(selected ? selected.name : "")

    // Reset downstream
    setUnionId("")
    setUnionName("")
  }

  const handleUnionChange = (val: string) => {
    setUnionId(val)
    const selected = unions.find((u: any) => u.id === val)
    setUnionName(selected ? selected.name : "")
  }

  const { data: plansData } = useQuery(
    trpc.subscriptionPlan.forSelection.queryOptions()
  )

  // Auto-select first/free plan by default if non-selected
  useEffect(() => {
    if (!planId && plansData && plansData.length > 0 && plansData[0]?.id) {
      setPlanId(plansData[0].id)
    }
  }, [plansData, planId])

  // Auto-fill Step 4 quota limits based on selected plan tier
  useEffect(() => {
    if (planId && plansData) {
      const selectedPlan = plansData.find((p: any) => p.id === planId)
      if (selectedPlan) {
        setCustomCitizenLimit(selectedPlan.defaultCitizenLimit)
        setCustomStaffLimit(selectedPlan.defaultStaffLimit)
        setCustomCertificateLimit(selectedPlan.defaultCertificateLimit)
        setCustomStorageLimit(selectedPlan.defaultStorageLimit)
      }
    }
  }, [planId, plansData])

  const createMutation = useMutation(
    trpc.tenant.create.mutationOptions()
  )

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
      toast.error("Please enter a valid URL slug and English Name.")
      return
    }
    if (currentStep === 2) {
      if (!isStep2Valid) {
        toast.error("Please select a Division, District, Upazila, and Union.")
        return
      }
      if (!isEmailValid || !isPhoneValid) {
        toast.error("Please enter a valid email address and phone number.")
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
      toast.error("Please complete required basic info and geography fields.")
      return
    }

    setProvisionStatus("pending")
    setActiveProvisionStep(1)
    setProvisionError(undefined)
    setTimeout(() => setActiveProvisionStep(2), 1500)
    setTimeout(() => setActiveProvisionStep(3), 6000)

    createMutation.mutate(
      {
        slug,
        name,
        nameBn: nameBn || undefined,
        type: type || undefined,
        description: description || undefined,
        logo: logo || undefined,
        divisionId: divisionId || undefined,
        divisionName: divisionName || undefined,
        districtId: districtId || undefined,
        districtName: districtName || undefined,
        upazilaId: upazilaId || undefined,
        upazilaName: upazilaName || undefined,
        unionId: unionId || undefined,
        unionName: unionName || undefined,
        postalCode: postalCode || undefined,
        secretaryName: secretaryName || undefined,
        chairmanName: chairmanName || undefined,
        phone: phone?.trim() || undefined,
        email: email && email.trim().length > 0 ? email.trim() : undefined,
        secretarySignature: secretarySignature || undefined,
        chairmanSignature: chairmanSignature || undefined,
        facebookUrl: facebookUrl || undefined,
        planId: planId || undefined,
        isActive,
      },
      {
        onSuccess: () => {
          setProvisionStatus("success")
          setActiveProvisionStep(4)
          queryClient.invalidateQueries(trpc.tenant.pathFilter())
        },
        onError: (err: any) => {
          setProvisionStatus("error")
          setProvisionError(err?.message || "Failed to provision database.")
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
      <div className="w-full max-w-3xl mx-auto space-y-8 py-8 animate-in fade-in duration-500">
        <Card className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-white p-5 sm:p-6 shadow-xl text-left gap-4 relative">
          <CardHeader className="p-0 pb-4 border-b border-outline-variant/30">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="font-headline-md text-lg font-bold tracking-tight text-on-surface">
                  {provisionStatus === "success"
                    ? "Union Porishod Live!"
                    : provisionStatus === "error"
                    ? "Provisioning Error"
                    : "Setting Up Union Porishod Portal"}
                </CardTitle>
                <CardDescription className="text-xs text-outline mt-0.5">
                  {provisionStatus === "success"
                    ? `"${name}" has been registered and its PostgreSQL database is live.`
                    : provisionStatus === "error"
                    ? "An error occurred during database provisioning."
                    : `Provisioning "${name || slug}" — creating PostgreSQL database & schema.`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 pt-6 space-y-6">
            <div className="space-y-4">
              {provisionSteps.map((step) => {
                const isDone = provisionStatus === "success" || (provisionStatus !== "error" && activeProvisionStep > step.id)
                const isActiveStep = provisionStatus !== "success" && provisionStatus !== "error" && activeProvisionStep === step.id
                const isFailed = provisionStatus === "error" && activeProvisionStep === step.id
                const StepIcon = step.icon

                return (
                  <div
                    key={step.id}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 ${
                      isDone
                        ? "border-emerald-500/20 bg-emerald-500/5"
                        : isActiveStep
                        ? "border-primary/40 bg-primary/10"
                        : isFailed
                        ? "border-red-500/30 bg-red-500/5"
                        : "border-outline-variant/30 bg-surface-container-low opacity-50"
                    }`}
                  >
                    <div
                      className={`size-10 rounded-xl flex items-center justify-center border shrink-0 ${
                        isDone
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : isActiveStep
                          ? "bg-primary text-white border-primary"
                          : isFailed
                          ? "bg-red-500 text-white border-red-500"
                          : "bg-surface-variant text-outline border-outline-variant"
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
                      <p className={`text-sm font-bold ${isDone ? "text-emerald-700" : isActiveStep ? "text-primary" : "text-on-surface"}`}>
                        {step.label}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{step.description}</p>
                    </div>

                    {isDone && <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-lg">Done</span>}
                    {isActiveStep && <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-lg animate-pulse">Running</span>}
                  </div>
                )
              })}
            </div>

            {provisionStatus === "error" && provisionError && (
              <div className="p-4 rounded-xl border border-error/30 bg-error-container/20 text-xs text-error font-medium">
                <span className="font-bold">Error: </span>
                {provisionError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30">
              {provisionStatus === "error" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setProvisionStatus("idle")}
                  className="rounded-lg border border-outline-variant px-5 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer h-10"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Setup
                </Button>
              )}
              {provisionStatus === "success" && (
                <Button
                  type="button"
                  onClick={() => router.push("/tenants")}
                  className="rounded-lg bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primary/90 cursor-pointer h-10 shadow-sm"
                >
                  <Check className="mr-2 h-4 w-4" />
                  View All Union Porishods
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
    <div className="w-full max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-12 relative">
      {/* Back Button & Page Header */}
      <div className="flex flex-col gap-4">
        <Link
          href="/tenants"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-outline hover:text-primary transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Union Porishod List</span>
        </Link>

        <div>
          <h2 className="font-headline-md text-2xl sm:text-3xl font-extrabold text-primary md:text-4xl">
            Register Union Porishod
          </h2>
          <p className="max-w-2xl font-body-md text-xs sm:text-sm md:text-base leading-relaxed text-on-surface-variant mt-1">
            Setup a dedicated multi-tenant digital portal for local municipal government.
          </p>
        </div>
      </div>

      {/* 5-Step Desktop Step Indicator */}
      <div className="rounded-2xl border border-outline-variant/40 bg-white p-6 shadow-xs relative">
        <div className="hidden sm:flex justify-between items-center relative">
          <div className="absolute top-5 left-0 w-full h-0.5 bg-outline-variant/30 -z-0" />
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
                  className={`size-10 rounded-xl flex items-center justify-center transition-all duration-300 border-2 bg-white ${
                    isActiveStep
                      ? "bg-primary text-white border-primary shadow-md scale-110"
                      : isCompletedStep
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "text-outline border-outline-variant hover:border-primary/40"
                  }`}
                >
                  {isCompletedStep ? <Check className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                </div>
                <div className="mt-2 text-center hidden md:block">
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${isActiveStep ? "text-primary" : "text-outline"}`}>
                    Step {step.id}
                  </span>
                  <p className={`text-xs font-bold ${isActiveStep ? "text-on-surface" : "text-outline"}`}>
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
            <span className="font-bold uppercase text-primary">Step {currentStep} of {steps.length}</span>
            <span className="font-bold text-on-surface">{steps[currentStep - 1]?.title}</span>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full transition-all duration-300" style={{ width: `${(currentStep / steps.length) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Main Multi-Step Form Card — Matched with Role Modal Form UI */}
      <Card className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-white p-5 sm:p-6 shadow-xl text-left gap-4">
        <CardHeader className="p-0 pb-4 border-b border-outline-variant/30 flex flex-row items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            {(() => {
              const StepIcon = steps[currentStep - 1]?.icon as LucideIcon
              return <StepIcon className="h-5 w-5" />
            })()}
          </div>
          <div>
            <CardTitle className="font-headline-md text-lg font-bold tracking-tight text-on-surface normal-case">
              Step {currentStep}: {steps[currentStep - 1]?.title}
            </CardTitle>
            <p className="text-xs text-outline mt-0.5">
              {steps[currentStep - 1]?.description}
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-0 pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      Portal Slug (URL Subdomain) *
                    </Label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-outline h-4 w-4" />
                      <Input
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        placeholder="savar-up"
                        className="w-full rounded-lg border border-outline-variant py-2.5 pl-9 pr-4 font-mono text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                      />
                    </div>
                    {slug && (
                      <p className="text-[11px] text-primary font-mono flex items-center gap-1">
                        <Globe className="h-3 w-3" /> https://{slug}.uphub.gov.bd
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      English Name *
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-outline h-4 w-4" />
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Savar Union Porishod"
                        className="w-full rounded-lg border border-outline-variant py-2.5 pl-9 pr-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    বাংলা নাম (Official Bangla Title)
                  </Label>
                  <Input
                    value={nameBn}
                    onChange={(e) => setNameBn(e.target.value)}
                    placeholder="সাভার ইউনিয়ন পরিষদ"
                    className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Description
                  </Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Municipal government portal for Savar UP..."
                    rows={3}
                    className="w-full rounded-lg border border-outline-variant py-2 px-3 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden min-h-[80px]"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Location & Contact */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      Division (বিভাগ) *
                    </Label>
                    <Select value={divisionId} onValueChange={handleDivisionChange}>
                      <SelectTrigger className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10 cursor-pointer">
                        <SelectValue placeholder="Select Division" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-outline-variant">
                        {divisions.map((d: any) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.nameBn ? `${d.name} (${d.nameBn})` : d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      District (জেলা) *
                    </Label>
                    <Select
                      value={districtId}
                      onValueChange={handleDistrictChange}
                      disabled={!divisionId}
                    >
                      <SelectTrigger className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10 cursor-pointer disabled:opacity-50">
                        <SelectValue placeholder={divisionId ? "Select District" : "Select Division first"} />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-outline-variant">
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
                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      Upazila (উপজেলা) *
                    </Label>
                    <Select
                      value={upazilaId}
                      onValueChange={handleUpazilaChange}
                      disabled={!districtId}
                    >
                      <SelectTrigger className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10 cursor-pointer disabled:opacity-50">
                        <SelectValue placeholder={districtId ? "Select Upazila" : "Select District first"} />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-outline-variant">
                        {upazilas.map((u: any) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.nameBn ? `${u.name} (${u.nameBn})` : u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      Union Name (ইউনিয়ন) *
                    </Label>
                    <Select
                      value={unionId}
                      onValueChange={handleUnionChange}
                      disabled={!upazilaId}
                    >
                      <SelectTrigger className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10 cursor-pointer disabled:opacity-50">
                        <SelectValue placeholder={upazilaId ? "Select Union" : "Select Upazila first"} />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-outline-variant">
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
                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      Postal Code (ডাক কোড)
                    </Label>
                    <Input
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="e.g. 1230"
                      className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      Official Contact Phone
                    </Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+880 1700-000000"
                      className={`w-full rounded-lg border py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10 ${
                        !isPhoneValid ? "border-error focus:border-error focus-visible:ring-error/20" : "border-outline-variant"
                      }`}
                    />
                    {!isPhoneValid && (
                      <p className="text-xs text-error font-medium">Please enter a valid phone number (e.g. +880 1700-000000)</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      Official Contact Email
                    </Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="info@savar.uphub.gov.bd"
                      className={`w-full rounded-lg border py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10 ${
                        !isEmailValid ? "border-error focus:border-error focus-visible:ring-error/20" : "border-outline-variant"
                      }`}
                    />
                    {!isEmailValid && (
                      <p className="text-xs text-error font-medium">Please enter a valid email address (e.g. info@savar.uphub.gov.bd)</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      Official Facebook Page URL
                    </Label>
                    <Input
                      value={facebookUrl}
                      onChange={(e) => setFacebookUrl(e.target.value)}
                      placeholder="https://facebook.com/your-union-porishod"
                      className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: UP Officials & Signatures */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      UP Secretary Name
                    </Label>
                    <Input
                      value={secretaryName}
                      onChange={(e) => setSecretaryName(e.target.value)}
                      placeholder="Md. Rahim Uddin"
                      className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      UP Chairman Name
                    </Label>
                    <Input
                      value={chairmanName}
                      onChange={(e) => setChairmanName(e.target.value)}
                      placeholder="Chairman Name"
                      className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      Secretary Signature Image URL
                    </Label>
                    <Input
                      value={secretarySignature}
                      onChange={(e) => setSecretarySignature(e.target.value)}
                      placeholder="https://example.com/signatures/sec.png"
                      className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      Chairman Signature Image URL
                    </Label>
                    <Input
                      value={chairmanSignature}
                      onChange={(e) => setChairmanSignature(e.target.value)}
                      placeholder="https://example.com/signatures/chair.png"
                      className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Subscription & Limits */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-4">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Select Subscription Plan *
                  </Label>
                  <div className="space-y-3">
                    {plans.map((p: any) => {
                      const isSelected = planId === p.id
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPlanId(p.id)}
                          className={`w-full p-4 rounded-xl border border-outline-variant text-left transition-all duration-200 relative group flex items-start gap-4 cursor-pointer ${
                            isSelected
                              ? "border-primary bg-primary/5 shadow-xs"
                              : "bg-white hover:border-primary/40 hover:bg-surface-container-low"
                          }`}
                        >
                          <div
                            className={`size-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 transition-all ${
                              isSelected ? "border-primary bg-primary text-white" : "border-outline-variant"
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-bold text-on-surface text-sm">{p.displayName}</h3>
                              <div className="text-right">
                                {p.yearlyPriceBDT === 0 ? (
                                  <span className="text-sm font-extrabold text-primary">Free</span>
                                ) : (
                                  <div>
                                    <span className="text-sm font-extrabold text-on-surface">
                                      ৳{p.yearlyPriceBDT?.toLocaleString()}
                                    </span>
                                    <span className="text-[10px] text-outline font-medium">/year</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {p.description && (
                              <p className="text-xs text-on-surface-variant mt-0.5 font-medium">{p.description}</p>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-outline-variant/30">
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">Custom Resource Quota Overrides</h4>
                    <p className="text-xs text-outline mt-0.5">
                      Optionally override default plan quotas specifically for this Union Porishod. Leave empty to use plan defaults.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                        Custom Citizen Limit
                      </Label>
                      <Input
                        type="number"
                        value={customCitizenLimit ?? ""}
                        onChange={(e) => setCustomCitizenLimit(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="Default plan limit"
                        className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-mono text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                        Custom Staff Seats
                      </Label>
                      <Input
                        type="number"
                        value={customStaffLimit ?? ""}
                        onChange={(e) => setCustomStaffLimit(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="Default plan seats"
                        className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-mono text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                        Custom Certificate Quota
                      </Label>
                      <Input
                        type="number"
                        value={customCertificateLimit ?? ""}
                        onChange={(e) => setCustomCertificateLimit(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="Default plan quota"
                        className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-mono text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                        Custom Storage Quota (MB)
                      </Label>
                      <Input
                        type="number"
                        value={customStorageLimit ?? ""}
                        onChange={(e) => setCustomStorageLimit(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="Default storage MB"
                        className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-mono text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rounded-lg border border-outline-variant p-4 bg-surface-container-low">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="size-4 rounded text-primary cursor-pointer"
                  />
                  <label htmlFor="isActive" className="text-xs font-bold text-on-surface cursor-pointer">
                    Enable Union Porishod Portal Access Immediately
                  </label>
                </div>
              </div>
            )}

            {/* Actions Footer — Matched with Role Modal Footer */}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-4 border-t border-outline-variant/30">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                className="w-full sm:w-auto rounded-lg border border-outline-variant px-5 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer h-10 normal-case tracking-normal"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                {currentStep === 1 ? "Cancel" : "Previous Step"}
              </Button>

              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primary/90 cursor-pointer h-10 normal-case tracking-normal shadow-sm"
                >
                  <span>Next Step</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={!isStep1Valid || !isStep2Valid}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primary/90 cursor-pointer h-10 normal-case tracking-normal shadow-sm disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>Register & Provision UP</span>
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

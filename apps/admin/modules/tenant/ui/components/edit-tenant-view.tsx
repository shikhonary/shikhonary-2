"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import {
  Building2,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  UserCheck,
  CreditCard,
  Settings2,
  Save,
  CheckCircle2,
} from "lucide-react"

interface EditTenantViewProps {
  tenantId: string
}

const steps = [
  { id: 1, title: "Basic Info", icon: Building2, description: "Portal slug & official titles" },
  { id: 2, title: "Geography", icon: MapPin, description: "Division & district boundaries" },
  { id: 3, title: "Contact", icon: UserCheck, description: "Officials & office contact" },
  { id: 4, title: "Subscription", icon: CreditCard, description: "SaaS plan & billing" },
  { id: 5, title: "Limits", icon: Settings2, description: "Resource quota overrides" },
]

export function EditTenantView({ tenantId }: EditTenantViewProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: tenant, isLoading: isLoadingTenant } = useQuery(
    trpc.tenant.byId.queryOptions({ id: tenantId })
  )

  const { data: plansData } = useQuery(
    trpc.subscriptionPlan.forSelection.queryOptions()
  )

  const [currentStep, setCurrentStep] = useState(1)

  // Step 1: Basic Info
  const [slug, setSlug] = useState("")
  const [name, setName] = useState("")
  const [nameBn, setNameBn] = useState("")
  const [type, setType] = useState("UNION_PORISHOD")
  const [description, setDescription] = useState("")
  const [logo, setLogo] = useState("")

  // Step 2: Geography
  const [divisionName, setDivisionName] = useState("")
  const [districtName, setDistrictName] = useState("")
  const [upazilaName, setUpazilaName] = useState("")
  const [unionName, setUnionName] = useState("")
  const [postalCode, setPostalCode] = useState("")

  // Step 3: Contacts & Officials
  const [secretaryName, setSecretaryName] = useState("")
  const [chairmanName, setChairmanName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [secretarySignature, setSecretarySignature] = useState("")
  const [chairmanSignature, setChairmanSignature] = useState("")
  const [facebookUrl, setFacebookUrl] = useState("")

  // Step 4: Subscription Plan
  const [planId, setPlanId] = useState<string>("")
  const [isActive, setIsActive] = useState(true)

  // Step 5: Custom Quotas
  const [customCitizenLimit, setCustomCitizenLimit] = useState<number | undefined>()
  const [customStaffLimit, setCustomStaffLimit] = useState<number | undefined>()
  const [customCertificateLimit, setCustomCertificateLimit] = useState<number | undefined>()
  const [customStorageLimit, setCustomStorageLimit] = useState<number | undefined>()

  useEffect(() => {
    if (tenant) {
      setSlug(tenant.slug || "")
      setName(tenant.name || "")
      setNameBn(tenant.nameBn || "")
      setType(tenant.type || "UNION_PORISHOD")
      setDescription(tenant.description || "")
      setLogo(tenant.logo || "")
      setDivisionName(tenant.divisionName || "")
      setDistrictName(tenant.districtName || "")
      setUpazilaName(tenant.upazilaName || "")
      setUnionName(tenant.unionName || "")
      setPostalCode(tenant.postalCode || "")
      setSecretaryName(tenant.secretaryName || "")
      setChairmanName(tenant.chairmanName || "")
      setPhone(tenant.phone || "")
      setEmail(tenant.email || "")
      setSecretarySignature(tenant.secretarySignature || "")
      setChairmanSignature(tenant.chairmanSignature || "")
      setFacebookUrl(tenant.facebookUrl || "")
      setPlanId(tenant.subscription?.planId || "")
      setIsActive(tenant.isActive ?? true)
      if (tenant.customCitizenLimit !== null && tenant.customCitizenLimit !== undefined) {
        setCustomCitizenLimit(tenant.customCitizenLimit)
      }
      if (tenant.customStaffLimit !== null && tenant.customStaffLimit !== undefined) {
        setCustomStaffLimit(tenant.customStaffLimit)
      }
      if (tenant.customCertificateLimit !== null && tenant.customCertificateLimit !== undefined) {
        setCustomCertificateLimit(tenant.customCertificateLimit)
      }
      if (tenant.customStorageLimit !== null && tenant.customStorageLimit !== undefined) {
        setCustomStorageLimit(tenant.customStorageLimit)
      }
    }
  }, [tenant])

  const updateMutation = useMutation({
    ...trpc.tenant.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.tenant.pathFilter())
      toast.success("Union Porishod account updated successfully.")
      router.push(`/tenants/${tenantId}`)
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update Union Porishod")
    },
  })

  const isSubmitting = updateMutation.isPending

  const isStep1Valid = slug.trim().length > 0 && name.trim().length > 0
  const isStep2Valid = divisionName.trim().length > 0 && districtName.trim().length > 0
  const isEmailValid = !email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const isPhoneValid = !phone.trim() || /^[+\d\s-]{8,20}$/.test(phone.trim())

  const handleNext = () => {
    if (currentStep === 1 && !isStep1Valid) {
      toast.error("Please enter a valid URL slug and English Name.")
      return
    }
    if (currentStep === 2 && !isStep2Valid) {
      toast.error("Please enter Division and District name.")
      return
    }
    if (currentStep === 3 && (!isEmailValid || !isPhoneValid)) {
      toast.error("Please enter a valid email address and phone number.")
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
      router.push(`/tenants/${tenantId}`)
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
    if (!isStep1Valid || !isStep2Valid || !isEmailValid || !isPhoneValid) {
      toast.error("Please fix all form validation errors before saving.")
      return
    }

    updateMutation.mutate({
      id: tenantId,
      slug,
      name,
      nameBn: nameBn || undefined,
      type: type || undefined,
      description: description || undefined,
      logo: logo || undefined,
      divisionName: divisionName || undefined,
      districtName: districtName || undefined,
      upazilaName: upazilaName || undefined,
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
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (currentStep < 5) {
      handleNext()
    } else {
      handleFinalSubmit()
    }
  }

  if (isLoadingTenant) {
    return (
      <div className="p-12 text-center text-on-surface-variant flex items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span>Loading tenant configuration...</span>
      </div>
    )
  }

  const plans = plansData ?? []

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-12 relative">
      {/* Header Back Navigation */}
      <div className="flex flex-col gap-4">
        <Link
          href={`/tenants/${tenantId}`}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-outline hover:text-primary transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Tenant Overview</span>
        </Link>

        <div>
          <h2 className="font-headline-md text-2xl sm:text-3xl font-extrabold text-primary md:text-4xl">
            Edit Union Porishod
          </h2>
          <p className="max-w-2xl font-body-md text-xs sm:text-sm md:text-base text-on-surface-variant mt-1">
            Update metadata, administrative contacts, SaaS subscription plan, and quota limits.
          </p>
        </div>
      </div>

      {/* 5-Step Desktop Step Indicator matched 1:1 with Create Tenant View */}
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

        {/* Mobile Progress Bar */}
        <div className="sm:hidden space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-on-surface">
            <span>Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.title}</span>
            <span className="text-primary">{Math.round((currentStep / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-outline-variant/30 rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Form Card — Matched 1:1 with Create Tenant View */}
      <Card className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-white p-5 sm:p-6 shadow-xl text-left gap-4">
        <CardHeader className="p-0 pb-4 border-b border-outline-variant/30 flex flex-row items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            {(() => {
              const StepIcon = steps[currentStep - 1]?.icon as any
              return <StepIcon className="h-5 w-5" />
            })()}
          </div>
          <div>
            <CardTitle className="font-headline-md text-lg font-bold tracking-tight text-on-surface normal-case">
              {currentStep === 1 && "Step 1: Portal & Basic Details"}
              {currentStep === 2 && "Step 2: Geographical Boundaries"}
              {currentStep === 3 && "Step 3: Administration & Contact"}
              {currentStep === 4 && "Step 4: SaaS Subscription Plan"}
              {currentStep === 5 && "Step 5: Resource Quota Limits"}
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
                      Portal Slug *
                    </Label>
                    <Input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      placeholder="savar-up"
                      disabled={isSubmitting}
                      className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-mono text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                    />
                    <span className="text-[10px] text-outline font-mono">
                      Subdomain: https://{slug || "slug"}.uphub.gov.bd
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      English Name *
                    </Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Savar Union Porishod"
                      disabled={isSubmitting}
                      className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Bangla Title (বাংলা নাম)
                  </Label>
                  <Input
                    value={nameBn}
                    onChange={(e) => setNameBn(e.target.value)}
                    placeholder="সাভার ইউনিয়ন পরিষদ"
                    disabled={isSubmitting}
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
                    placeholder="Brief description of this Union Porishod portal..."
                    rows={3}
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-outline-variant py-2 px-3 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden min-h-[80px]"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Geography */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      Division (বিভাগ) *
                    </Label>
                    <Input
                      value={divisionName}
                      onChange={(e) => setDivisionName(e.target.value)}
                      placeholder="Dhaka"
                      disabled={isSubmitting}
                      className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      District (জেলা) *
                    </Label>
                    <Input
                      value={districtName}
                      onChange={(e) => setDistrictName(e.target.value)}
                      placeholder="Dhaka"
                      disabled={isSubmitting}
                      className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      Upazila (উপজেলা)
                    </Label>
                    <Input
                      value={upazilaName}
                      onChange={(e) => setUpazilaName(e.target.value)}
                      placeholder="Savar"
                      disabled={isSubmitting}
                      className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      Union Name (ইউনিয়ন)
                    </Label>
                    <Input
                      value={unionName}
                      onChange={(e) => setUnionName(e.target.value)}
                      placeholder="Savar Sadar"
                      disabled={isSubmitting}
                      className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Contact */}
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
                      className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      Official Contact Phone
                    </Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+880 1700-000000"
                      disabled={isSubmitting}
                      className={`w-full rounded-lg border py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10 ${
                        !isPhoneValid ? "border-error focus:border-error focus-visible:ring-error/20" : "border-outline-variant"
                      }`}
                    />
                    {!isPhoneValid && (
                      <p className="text-xs text-error font-medium">Please enter a valid phone number (e.g. +880 1700-000000)</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      Official Contact Email
                    </Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="info@savar.uphub.gov.bd"
                      disabled={isSubmitting}
                      className={`w-full rounded-lg border py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10 ${
                        !isEmailValid ? "border-error focus:border-error focus-visible:ring-error/20" : "border-outline-variant"
                      }`}
                    />
                    {!isEmailValid && (
                      <p className="text-xs text-error font-medium">Please enter a valid email address (e.g. info@savar.uphub.gov.bd)</p>
                    )}
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
                      className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Official Facebook Page URL
                  </Label>
                  <Input
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    placeholder="https://facebook.com/your-union-porishod"
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Subscription */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-in fade-in duration-200">
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
                            ? "bg-primary/10 border-primary shadow-xs"
                            : "bg-white hover:border-primary/40 hover:bg-surface-container-low"
                        }`}
                      >
                        <div
                          className={`size-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected ? "border-primary bg-primary text-white" : "border-outline"
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-headline-md text-sm font-bold text-on-surface">
                              {p.displayName}
                            </span>
                            <div className="flex items-center gap-2">
                              {p.isPopular && (
                                <span className="bg-primary/10 text-primary text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-primary/20">
                                  POPULAR
                                </span>
                              )}
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
            )}

            {/* Step 5: Limits */}
            {currentStep === 5 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <p className="text-xs text-on-surface-variant font-medium">
                  Optionally override default plan quotas specifically for this Union Porishod. Leave empty to use plan defaults.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      Custom Citizen Limit
                    </Label>
                    <Input
                      type="number"
                      value={customCitizenLimit ?? ""}
                      onChange={(e) => setCustomCitizenLimit(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Default citizen quota"
                      disabled={isSubmitting}
                      className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-mono text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      Custom Staff Limit
                    </Label>
                    <Input
                      type="number"
                      value={customStaffLimit ?? ""}
                      onChange={(e) => setCustomStaffLimit(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Default staff quota"
                      disabled={isSubmitting}
                      className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-mono text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      Custom Certificate Limit
                    </Label>
                    <Input
                      type="number"
                      value={customCertificateLimit ?? ""}
                      onChange={(e) => setCustomCertificateLimit(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Default certificate quota"
                      disabled={isSubmitting}
                      className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-mono text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      Custom Storage Limit (MB)
                    </Label>
                    <Input
                      type="number"
                      value={customStorageLimit ?? ""}
                      onChange={(e) => setCustomStorageLimit(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Default storage MB"
                      disabled={isSubmitting}
                      className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-mono text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 rounded-lg border border-outline-variant p-4 bg-surface-container-low">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    disabled={isSubmitting}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="size-4 rounded text-primary cursor-pointer"
                  />
                  <label htmlFor="isActive" className="text-xs font-bold text-on-surface cursor-pointer">
                    Enable Union Porishod Portal Access
                  </label>
                </div>
              </div>
            )}

            {/* Actions Footer — Matched 1:1 with Create Tenant View */}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-4 border-t border-outline-variant/30">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={handlePrevious}
                className="w-full sm:w-auto rounded-lg border border-outline-variant px-5 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer h-10 normal-case tracking-normal"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                {currentStep === 1 ? "Cancel" : "Previous Step"}
              </Button>

              {currentStep < 5 ? (
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
                  disabled={isSubmitting || !isStep1Valid || !isStep2Valid || !isEmailValid || !isPhoneValid}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primary/90 cursor-pointer h-10 normal-case tracking-normal shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Union Porishod</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

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
import { TENANT_TYPE_OPTIONS } from "@workspace/utils"
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
  CreditCard,
  Save,
} from "lucide-react"

const steps = [
  { id: 1, title: "Basic Info", icon: Building2, description: "Portal slug & school details" },
  { id: 2, title: "Location & Contact", icon: MapPin, description: "Geographical hierarchy & contact" },
  { id: 3, title: "Administration", icon: UserCheck, description: "Principal & Vice Principal details" },
  { id: 4, title: "Subscription & Limits", icon: CreditCard, description: "SaaS plan & custom resource limits" },
]

interface EditTenantViewProps {
  tenantId: string
}

export function EditTenantView({ tenantId }: EditTenantViewProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: tenant, isLoading: isLoadingTenant } = useQuery(
    trpc.tenant.byId.queryOptions({ id: tenantId })
  )

  const [currentStep, setCurrentStep] = useState(1)

  // Step 1: Basic Info
  const [slug, setSlug] = useState("")
  const [name, setName] = useState("")
  const [nameBn, setNameBn] = useState("")
  const [type, setType] = useState("SCHOOL")
  const [description, setDescription] = useState("")
  const [logo, setLogo] = useState("")
  const [customDomain, setCustomDomain] = useState("")
  const [customDomainVerified, setCustomDomainVerified] = useState(false)
  const [eiin, setEiin] = useState("")
  const [board, setBoard] = useState("")
  const [address, setAddress] = useState("")

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

  // Initialize fields from tenant data
  useEffect(() => {
    if (tenant) {
      setSlug(tenant.slug || "")
      setName(tenant.name || "")
      setNameBn(tenant.nameBn || "")
      setType(tenant.type || "SCHOOL")
      setDescription(tenant.description || "")
      setLogo(tenant.logo || "")
      setEiin((tenant as any).eiin || "")
      setBoard((tenant as any).board || "")
      setAddress((tenant as any).address || "")
      
      setDivisionId(tenant.divisionId || "")
      setDivisionName(tenant.divisionName || "")
      setDistrictId(tenant.districtId || "")
      setDistrictName(tenant.districtName || "")
      setUpazilaId(tenant.upazilaId || "")
      setUpazilaName(tenant.upazilaName || "")
      setUnionId(tenant.unionId || "")
      setUnionName(tenant.unionName || "")

      setPostalCode(tenant.postalCode || "")
      setPrincipalName((tenant as any).principalName || "")
      setVicePrincipalName((tenant as any).vicePrincipalName || "")
      setPhone(tenant.phone || "")
      setEmail(tenant.email || "")
      setPrincipalSignature((tenant as any).principalSignature || "")
      setVicePrincipalSignature((tenant as any).vicePrincipalSignature || "")
      setWebsite(tenant.website || "")
      setPlanId(tenant.subscription?.planId || "")
      setIsActive(tenant.isActive ?? true)
      setCustomDomain(tenant.customDomain || "")
      setCustomDomainVerified(tenant.customDomainVerified ?? false)
      if ((tenant as any).customStudentLimit !== null && (tenant as any).customStudentLimit !== undefined) {
        setCustomStudentLimit((tenant as any).customStudentLimit)
      }
      if (tenant.customTeacherLimit !== null && tenant.customTeacherLimit !== undefined) {
        setCustomTeacherLimit(tenant.customTeacherLimit)
      }
      if (tenant.customExamLimit !== null && tenant.customExamLimit !== undefined) {
        setCustomExamLimit(tenant.customExamLimit)
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
      toast.success("Institution account updated successfully.")
      router.push(`/tenants/${tenantId}`)
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update Institution")
    },
  })

  const isSubmitting = updateMutation.isPending

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
    if (!isStep1Valid || !isStep2Valid) {
      toast.error("Please complete required basic info and geography fields.")
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
      customDomainVerified,
      customStudentLimit: customStudentLimit !== undefined ? Number(customStudentLimit) : null,
      customTeacherLimit: customTeacherLimit !== undefined ? Number(customTeacherLimit) : null,
      customExamLimit: customExamLimit !== undefined ? Number(customExamLimit) : null,
      customStorageLimit: customStorageLimit !== undefined ? Number(customStorageLimit) : null,
    })
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
            Edit Institution
          </h2>
          <p className="max-w-2xl font-body-md text-xs sm:text-sm md:text-base text-on-surface-variant mt-1">
            Update portal configurations, location settings, officials, and quotas.
          </p>
        </div>
      </div>

      {/* Steps Navigation Bar */}
      <div className="bg-card border border-outline-variant/60 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => {
            const StepIcon = step.icon
            const isCompleted = currentStep > step.id
            const isActiveStep = currentStep === step.id

            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-initial">
                <button
                  type="button"
                  onClick={() => handleStepClick(step.id)}
                  className="flex items-center gap-2.5 text-left group focus:outline-hidden cursor-pointer"
                >
                  <div
                    className={`size-8 sm:size-10 rounded-xl flex items-center justify-center border text-xs sm:text-sm font-bold transition-all duration-300 ${
                      isCompleted
                        ? "bg-primary border-primary text-white shadow-xs"
                        : isActiveStep
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-surface-variant/40 border-outline-variant text-outline-variant hover:border-outline"
                    }`}
                  >
                    {isCompleted ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : step.id}
                  </div>
                  <div className="hidden md:block">
                    <p className={`text-xs font-bold leading-none ${isActiveStep ? "text-primary" : "text-on-surface-variant"}`}>
                      {step.title}
                    </p>
                    <p className="text-[10px] text-outline mt-0.5 max-w-[130px] line-clamp-1">{step.description}</p>
                  </div>
                </button>

                {idx < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-3 sm:mx-4 rounded-full transition-all duration-500 ${
                      isCompleted ? "bg-primary" : "bg-outline-variant/30"
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Step Panel View */}
      <Card className="bg-card border border-outline-variant/60 shadow-md p-5 sm:p-6 md:p-8 rounded-3xl overflow-visible">
        <CardHeader className="p-0 pb-5 border-b border-outline-variant/40 flex flex-row items-center gap-4">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            {(() => {
              const StepIcon = steps[currentStep - 1]?.icon as any
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
                        placeholder="savar-school"
                        className="w-full rounded-lg border border-outline-variant py-2.5 pl-9 pr-4 font-mono text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                      />
                    </div>
                    {slug && (
                      <p className="text-[11px] text-primary font-mono flex items-center gap-1">
                        <Globe className="h-3 w-3" /> https://{slug}.shikhonary.com
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
                        placeholder="Savar High School"
                        className="w-full rounded-lg border border-outline-variant py-2.5 pl-9 pr-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      Custom Domain
                    </Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-outline h-4 w-4" />
                      <Input
                        value={customDomain}
                        onChange={(e) => setCustomDomain(e.target.value)}
                        placeholder="e.g. savarup.gov.bd"
                        className="w-full rounded-lg border border-outline-variant py-2.5 pl-9 pr-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="customDomainVerified"
                        checked={customDomainVerified}
                        onChange={(e) => setCustomDomainVerified(e.target.checked)}
                        disabled={isSubmitting}
                        className="rounded border-outline-variant text-primary focus:ring-primary/20 cursor-pointer"
                      />
                      <Label htmlFor="customDomainVerified" className="text-[11px] text-on-surface-variant cursor-pointer font-body-md">
                        Custom Domain Verified
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      Institution Type *
                    </Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10 cursor-pointer">
                        <SelectValue placeholder="Select Institution Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-outline-variant">
                        {TENANT_TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    বাংলা নাম (Official Bangla Title)
                  </Label>
                  <Input
                    value={nameBn}
                    onChange={(e) => setNameBn(e.target.value)}
                    placeholder="যেমনঃ সাভার হাই স্কুল"
                    className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      School EIIN Code
                    </Label>
                    <Input
                      value={eiin}
                      onChange={(e) => setEiin(e.target.value)}
                      placeholder="e.g. 130456"
                      className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      Education Board
                    </Label>
                    <Input
                      value={board}
                      onChange={(e) => setBoard(e.target.value)}
                      placeholder="e.g. Dhaka"
                      className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    School Physical Address
                  </Label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Majidpur, Savar, Dhaka"
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
                      Union (ইউনিয়ন) *
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
                      Postal Code
                    </Label>
                    <Input
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="e.g. 1340"
                      className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      Website
                    </Label>
                    <Input
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="e.g. https://savarschool.edu.bd"
                      className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                    />
                  </div>
                </div>

                <hr className="border-outline-variant/40" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      Office Telephone / Mobile
                    </Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +8801700000000"
                      className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      Office Email Address
                    </Label>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. info@school.shikhonary.com"
                      className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                    />
                  </div>
                </div>

                
              </div>
            )}

            {/* Step 3: School Officials */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      Principal Name (অধ্যক্ষের নাম)
                    </Label>
                    <Input
                      value={principalName}
                      onChange={(e) => setPrincipalName(e.target.value)}
                      placeholder="অধ্যক্ষের নাম"
                      className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      Vice Principal Name (উপাধ্যক্ষের নাম)
                    </Label>
                    <Input
                      value={vicePrincipalName}
                      onChange={(e) => setVicePrincipalName(e.target.value)}
                      placeholder="উপাধ্যক্ষের নাম"
                      className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      Principal Signature Image URL
                    </Label>
                    <Input
                      value={principalSignature}
                      onChange={(e) => setPrincipalSignature(e.target.value)}
                      placeholder="https://imgur.com/signature-principal.png"
                      className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      Vice Principal Signature Image URL
                    </Label>
                    <Input
                      value={vicePrincipalSignature}
                      onChange={(e) => setVicePrincipalSignature(e.target.value)}
                      placeholder="https://imgur.com/signature-vp.png"
                      className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Subscription & Limits */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      Subscription SaaS Plan
                    </Label>
                    <Select value={planId} onValueChange={setPlanId}>
                      <SelectTrigger className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10 cursor-pointer">
                        <SelectValue placeholder="Select Plan Tier" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-outline-variant">
                        {plans.map((p: any) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.displayName} ({p.monthlyPriceBDT} BDT/mo)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      Portal Lifecycle State
                    </Label>
                    <Select value={isActive ? "active" : "disabled"} onValueChange={(val) => setIsActive(val === "active")}>
                      <SelectTrigger className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10 cursor-pointer">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-outline-variant">
                        <SelectItem value="active">Active & Provisioned</SelectItem>
                        <SelectItem value="disabled">Suspended / Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="font-headline-sm text-sm font-bold text-on-surface-variant border-b border-outline-variant/30 pb-2 mb-4">
                    Custom Quota Resource Limits (Subscription Plan Overrides)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                        Student Limit (ছাত্র-ছাত্রীর সীমা)
                      </Label>
                      <Input
                        type="number"
                        value={customStudentLimit ?? ""}
                        onChange={(e) => setCustomStudentLimit(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="e.g. 10000"
                        className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                        Teacher Accounts Limit (শিক্ষক সীমা)
                      </Label>
                      <Input
                        type="number"
                        value={customTeacherLimit ?? ""}
                        onChange={(e) => setCustomTeacherLimit(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="e.g. 50"
                        className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                        Exam Limit (পরীক্ষা সীমা)
                      </Label>
                      <Input
                        type="number"
                        value={customExamLimit ?? ""}
                        onChange={(e) => setCustomExamLimit(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="e.g. 2000"
                        className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                        Max Storage (MB)
                      </Label>
                      <Input
                        type="number"
                        value={customStorageLimit ?? ""}
                        onChange={(e) => setCustomStorageLimit(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="e.g. 2048"
                        className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Step Actions (Back / Next / Save) */}
            <div className="flex items-center justify-between pt-5 border-t border-outline-variant/40 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={isSubmitting}
                className="rounded-xl border-outline text-on-surface hover:bg-surface-variant/40 font-semibold px-5 py-2 cursor-pointer transition-all text-xs sm:text-sm h-10"
              >
                {currentStep === 1 ? (
                  "Cancel"
                ) : (
                  <div className="flex items-center gap-1.5">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </div>
                )}
              </Button>

              {currentStep < steps.length ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-primary text-white hover:bg-primary/90 font-bold rounded-xl px-6 py-2 cursor-pointer shadow-md shadow-primary/10 transition-all text-xs sm:text-sm h-10"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Next Step</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary text-white hover:bg-primary/90 font-bold rounded-xl px-7 py-2 cursor-pointer shadow-md shadow-primary/10 transition-all text-xs sm:text-sm h-10"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-1.5">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </div>
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

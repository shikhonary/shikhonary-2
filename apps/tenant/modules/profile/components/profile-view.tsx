"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { trpc } from "@/trpc/client"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@workspace/ui/components/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  GraduationCap,
  Building2,
  Globe,
  MapPin,
  User,
  Save,
  Image as ImageIcon,
  Mail,
  Phone,
  FileText,
  Hash,
  Calendar,
  Layers,
  Award,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from "lucide-react"

export function ProfileView() {
  const queryClient = useQueryClient()
  const router = useRouter()

  // 1. Fetch current tenant profile
  const { data: tenant, isLoading, isError } = useQuery(
    trpc.tenant.current.queryOptions()
  )

  // ── Form States ──────────────────────────────────────────────────────────

  // Basic Details
  const [name, setName] = useState("")
  const [nameBn, setNameBn] = useState("")
  const [description, setDescription] = useState("")
  const [establishedYear, setEstablishedYear] = useState<string>("")

  // Location & Contact Details
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [website, setWebsite] = useState("")
  const [divisionId, setDivisionId] = useState("")
  const [divisionName, setDivisionName] = useState("")
  const [districtId, setDistrictId] = useState("")
  const [districtName, setDistrictName] = useState("")
  const [upazilaId, setUpazilaId] = useState("")
  const [upazilaName, setUpazilaName] = useState("")
  const [unionId, setUnionId] = useState("")
  const [unionName, setUnionName] = useState("")

  // Officials & Signatures
  const [principalName, setPrincipalName] = useState("")
  const [principalSignature, setPrincipalSignature] = useState("")
  const [vicePrincipalName, setVicePrincipalName] = useState("")
  const [vicePrincipalSignature, setVicePrincipalSignature] = useState("")

  // Branding & Logo
  const [logo, setLogo] = useState("")

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

  // Populate form states when data is loaded
  useEffect(() => {
    if (tenant) {
      setName(tenant.name || "")
      setNameBn(tenant.nameBn || "")
      setDescription(tenant.description || "")
      setEstablishedYear(
        (tenant as any).establishedYear ? String((tenant as any).establishedYear) : ""
      )

      setEmail(tenant.email || "")
      setPhone(tenant.phone || "")
      setWebsite(tenant.website || "")
      setDivisionId(tenant.divisionId || "")
      setDivisionName(tenant.divisionName || "")
      setDistrictId(tenant.districtId || "")
      setDistrictName(tenant.districtName || "")
      setUpazilaId(tenant.upazilaId || "")
      setUpazilaName(tenant.upazilaName || "")
      setUnionId(tenant.unionId || "")
      setUnionName(tenant.unionName || "")

      setPrincipalName((tenant as any).principalName || "")
      setPrincipalSignature((tenant as any).principalSignature || "")
      setVicePrincipalName((tenant as any).vicePrincipalName || "")
      setVicePrincipalSignature((tenant as any).vicePrincipalSignature || "")

      setLogo(tenant.logo || "")
    }
  }, [tenant])

  // 3. Mutation for updating profile
  const updateMutation = useMutation({
    ...trpc.tenant.updateCurrent.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.tenant.pathFilter())
      toast.success("প্রতিষ্ঠানের প্রোফাইল সফলভাবে আপডেট করা হয়েছে।")
      router.refresh()
    },
    onError: (err: any) => {
      toast.error(err.message || "প্রোফাইল আপডেট করতে ব্যর্থ হয়েছে।")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("প্রতিষ্ঠানের ইংরেজি নামটি আবশ্যক।")
      return
    }

    const estYearNum = establishedYear.trim()
      ? parseInt(establishedYear.trim(), 10)
      : null

    updateMutation.mutate({
      name: name.trim(),
      nameBn: nameBn.trim() || null,
      description: description.trim() || null,
      logo: logo.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      website: website.trim() || null,

      establishedYear: Number.isInteger(estYearNum) ? estYearNum : null,

      divisionId: divisionId || null,
      divisionName: divisionName.trim() || null,
      districtId: districtId || null,
      districtName: districtName.trim() || null,
      upazilaId: upazilaId || null,
      upazilaName: upazilaName.trim() || null,
      unionId: unionId || null,
      unionName: unionName.trim() || null,

      principalName: principalName.trim() || null,
      principalSignature: principalSignature.trim() || null,
      vicePrincipalName: vicePrincipalName.trim() || null,
      vicePrincipalSignature: vicePrincipalSignature.trim() || null,
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-8 select-none animate-pulse">
        {/* ── Hero Banner Skeleton ── */}
        <div className="relative overflow-hidden rounded-3xl bg-indigo-950/60 border border-indigo-800/40 p-6 sm:p-10 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5 w-full md:w-auto">
            {/* Logo Box Skeleton */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/10 border border-white/15 shrink-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-2xl bg-white/10" />
            </div>

            <div className="space-y-3 flex-1 min-w-0">
              {/* Badges Skeleton */}
              <div className="flex items-center gap-2">
                <div className="h-6 w-36 rounded-full bg-white/15" />
                <div className="h-5 w-24 rounded-full bg-emerald-500/20" />
              </div>

              {/* Title Skeleton */}
              <div className="h-8 w-56 sm:w-80 rounded-lg bg-white/20" />

              {/* Sub-meta Skeleton */}
              <div className="flex items-center gap-3">
                <div className="h-4 w-28 rounded-md bg-white/10" />
                <div className="h-4 w-32 rounded-md bg-white/10" />
              </div>
            </div>
          </div>

          {/* Action Button Skeleton */}
          <div className="h-12 w-full sm:w-36 rounded-2xl bg-white/20 shrink-0" />
        </div>

        {/* ── Tabs List Pill Bar Skeleton ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 max-w-4xl bg-muted/40 rounded-2xl p-1 border border-border/60 gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-11 rounded-xl flex items-center justify-center gap-2 ${
                i === 1 ? "bg-card shadow-xs border border-border/50" : ""
              }`}
            >
              <div className="w-4 h-4 rounded-md bg-muted/80" />
              <div className="h-4 w-24 bg-muted/70 rounded-md" />
            </div>
          ))}
        </div>

        {/* ── Form Card Skeleton (Simulating Tab 1 Content) ── */}
        <div className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8 shadow-xs space-y-6">
          {/* Card Header Skeleton */}
          <div className="border-b border-border/50 pb-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-primary/20" />
              <div className="h-6 w-48 bg-muted/90 rounded-md" />
            </div>
            <div className="h-3.5 w-72 bg-muted/50 rounded-md" />
          </div>

          {/* Form Fields Grid Skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="h-3.5 w-36 bg-muted/70 rounded-md" />
              <div className="h-11 w-full bg-muted/30 border border-border/40 rounded-xl" />
            </div>

            <div className="space-y-2">
              <div className="h-3.5 w-36 bg-muted/70 rounded-md" />
              <div className="h-11 w-full bg-muted/30 border border-border/40 rounded-xl" />
            </div>

            <div className="space-y-2">
              <div className="h-3.5 w-28 bg-muted/70 rounded-md" />
              <div className="h-11 w-full bg-muted/30 border border-border/40 rounded-xl" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="h-3.5 w-44 bg-muted/70 rounded-md" />
              <div className="h-28 w-full bg-muted/30 border border-border/40 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isError || !tenant) {
    return (
      <div className="max-w-2xl mx-auto rounded-3xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-3">
        <h3 className="font-headline text-lg font-bold text-destructive">ত্রুটি ঘটেছে</h3>
        <p className="font-body text-sm text-muted-foreground">
          প্রতিষ্ঠানের প্রোফাইল তথ্য লোড করতে ব্যর্থ হয়েছে। অনুগ্রহ করে পেজটি রিফ্রেশ করুন।
        </p>
      </div>
    )
  }

  const institutionDisplayName = nameBn || name || "আপনার শিক্ষা প্রতিষ্ঠান"

  return (
    <form onSubmit={handleSubmit} className="space-y-8 font-body">
      
      {/* ── 1. Hero Banner: Institution Profile Overview ──────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-indigo-700/30">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Logo Avatar Box */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-2 flex items-center justify-center shrink-0 shadow-inner">
              {logo ? (
                <img
                  src={logo}
                  alt={institutionDisplayName}
                  className="w-full h-full object-contain drop-shadow"
                  onError={(e) => {
                    ;(e.target as any).style.display = "none"
                  }}
                />
              ) : (
                <GraduationCap className="w-10 h-10 sm:w-12 sm:h-12 text-secondary-fixed" />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-indigo-200 border border-white/20">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>শিক্ষা প্রতিষ্ঠান প্রোফাইল</span>
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                  <ShieldCheck className="w-3 h-3" />
                  <span>সক্রিয় প্রতিষ্ঠান</span>
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-headline tracking-tight text-white">
                {institutionDisplayName}
              </h1>

              <div className="flex items-center gap-3 text-xs text-indigo-200/90 font-body flex-wrap">
                {establishedYear && (
                  <span className="font-mono bg-white/10 px-2 py-0.5 rounded-md">
                    প্রতিষ্ঠা: {establishedYear}
                  </span>
                )}
                {divisionName && districtName && (
                  <span>• {upazilaName ? `${upazilaName}, ` : ""}{districtName}</span>
                )}
              </div>
            </div>
          </div>

          {/* Header Action Button */}
          <Button
            type="submit"
            size="lg"
            disabled={updateMutation.isPending}
            className="w-full sm:w-auto bg-white hover:bg-white/90 text-indigo-950 font-bold rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 px-6 shrink-0"
          >
            {updateMutation.isPending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-950 border-t-transparent shrink-0"></div>
            ) : (
              <Save className="w-4 h-4 text-indigo-800" />
            )}
            <span>সংরক্ষণ করুন</span>
          </Button>
        </div>
      </section>

      {/* ── 2. Tab Navigation & Form Panels ─────────────────────────── */}
      <Tabs defaultValue="basic" className="w-full space-y-6">
        {/* Navigation Tabs Pill Bar */}
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 max-w-4xl bg-muted/40 rounded-2xl p-1 border border-border/60 h-auto gap-1">
          <TabsTrigger
            value="basic"
            className="rounded-xl flex items-center justify-center gap-2 py-3 data-[state=active]:bg-card data-[state=active]:shadow-xs transition-all cursor-pointer"
          >
            <GraduationCap className="w-4 h-4 text-primary" />
            <span className="font-headline text-xs sm:text-sm font-bold">মৌলিক ও অ্যাকাডেমিক</span>
          </TabsTrigger>

          <TabsTrigger
            value="location"
            className="rounded-xl flex items-center justify-center gap-2 py-3 data-[state=active]:bg-card data-[state=active]:shadow-xs transition-all cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span className="font-headline text-xs sm:text-sm font-bold">ঠিকানা ও যোগাযোগ</span>
          </TabsTrigger>

          <TabsTrigger
            value="officials"
            className="rounded-xl flex items-center justify-center gap-2 py-3 data-[state=active]:bg-card data-[state=active]:shadow-xs transition-all cursor-pointer"
          >
            <User className="w-4 h-4 text-amber-600" />
            <span className="font-headline text-xs sm:text-sm font-bold">কর্মকর্তা ও স্বাক্ষর</span>
          </TabsTrigger>

          <TabsTrigger
            value="branding"
            className="rounded-xl flex items-center justify-center gap-2 py-3 data-[state=active]:bg-card data-[state=active]:shadow-xs transition-all cursor-pointer"
          >
            <ImageIcon className="w-4 h-4 text-indigo-600" />
            <span className="font-headline text-xs sm:text-sm font-bold">লোগো ও ব্র্যান্ডিং</span>
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Basic & Academic Details ───────────────────────── */}
        <TabsContent value="basic" className="space-y-6">
          <Card className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-border/50 pb-4">
              <h3 className="text-lg font-bold font-headline text-foreground flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                <span>অ্যাকাডেমিক পরিচিতি ও প্রতিষ্ঠানের তথ্য</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                শিক্ষা বোর্ড, EIIN, পাঠ্যক্রম ও মাধ্যমের বিবরণ যা প্রশ্নপত্রের হেডারে স্বয়ংক্রিয়ভাবে ব্যবহৃত হবে
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Institution Name (English) */}
                <div className="space-y-1.5">
                  <Label className="block text-xs font-bold text-foreground">
                    প্রতিষ্ঠানের নাম (English) <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative group">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={updateMutation.isPending}
                      placeholder="e.g. Dhaka Residential Model College"
                      className="bg-muted/20 border-border text-foreground pl-10 h-11 rounded-xl text-sm"
                    />
                  </div>
                </div>

                {/* Institution Name (Bangla) */}
                <div className="space-y-1.5">
                  <Label className="block text-xs font-bold text-foreground">
                    প্রতিষ্ঠানের নাম (বাংলা)
                  </Label>
                  <div className="relative group">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                    <Input
                      value={nameBn}
                      onChange={(e) => setNameBn(e.target.value)}
                      disabled={updateMutation.isPending}
                      placeholder="যেমনঃ ঢাকা রেসিডেন্সিয়াল মডেল কলেজ"
                      className="bg-muted/20 border-border text-foreground pl-10 h-11 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Established Year */}
              <div className="space-y-1.5 max-w-sm">
                <Label className="block text-xs font-bold text-foreground">
                  প্রতিষ্ঠার সাল (Established Year)
                </Label>
                <div className="relative group">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                  <Input
                    type="number"
                    value={establishedYear}
                    onChange={(e) => setEstablishedYear(e.target.value)}
                    disabled={updateMutation.isPending}
                    placeholder="যেমনঃ ১৯৬০"
                    className="bg-muted/20 border-border text-foreground pl-10 h-11 rounded-xl text-sm font-mono"
                  />
                </div>
              </div>

              {/* Institution Description */}
              <div className="space-y-1.5">
                <Label className="block text-xs font-bold text-foreground">
                  প্রতিষ্ঠানের সংক্ষিপ্ত বিবরণ বা নীতিবাক্য
                </Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={updateMutation.isPending}
                  rows={3}
                  placeholder="প্রতিষ্ঠান সম্পর্কিত সংক্ষিপ্ত বিবরণ বা মূল লক্ষ্য..."
                  className="bg-muted/20 border-border text-foreground rounded-2xl p-3 text-sm resize-none"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* ── Tab 2: Location & Contact ─────────────────────────────── */}
        <TabsContent value="location" className="space-y-6">
          <Card className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-border/50 pb-4">
              <h3 className="text-lg font-bold font-headline text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span>ক্যাম্পাস ঠিকানা ও অফিসিয়াল যোগাযোগ</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                অভিভাবক ও শিক্ষার্থীদের সাথে যোগাযোগের অফিসিয়াল ইমেইল, ফোন এবং ভৌগোলিক অবস্থান
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Official Email */}
                <div className="space-y-1.5">
                  <Label className="block text-xs font-bold text-foreground">
                    অফিসিয়াল ইমেইল
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={updateMutation.isPending}
                      placeholder="info@institution.edu.bd"
                      className="bg-muted/20 border-border text-foreground pl-10 h-11 rounded-xl text-sm"
                    />
                  </div>
                </div>

                {/* Official Phone */}
                <div className="space-y-1.5">
                  <Label className="block text-xs font-bold text-foreground">
                    অফিসিয়াল ফোন / মোবাইল নম্বর
                  </Label>
                  <div className="relative group">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={updateMutation.isPending}
                      placeholder="যেমনঃ ০১৭০০০০০০০০"
                      className="bg-muted/20 border-border text-foreground pl-10 h-11 rounded-xl text-sm"
                    />
                  </div>
                </div>

                {/* Website */}
                <div className="space-y-1.5">
                  <Label className="block text-xs font-bold text-foreground">
                    অফিসিয়াল ওয়েবসাইট (Website)
                  </Label>
                  <div className="relative group">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                    <Input
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      disabled={updateMutation.isPending}
                      placeholder="https://institution.edu.bd"
                      className="bg-muted/20 border-border text-foreground pl-10 h-11 rounded-xl text-sm font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Geographic Hierarchy (Cascading Dropdowns) */}
              <div className="pt-2 border-t border-border/40">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-4">
                  প্রশাসনিক ভৌগোলিক অবস্থান (বিভাগ, জেলা, উপজেলা ও ইউনিয়ন)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* Division */}
                  <div className="space-y-1.5">
                    <Label className="block text-xs font-bold text-foreground">
                      বিভাগ (Division)
                    </Label>
                    <Select
                      value={divisionId}
                      onValueChange={handleDivisionChange}
                      disabled={updateMutation.isPending}
                    >
                      <SelectTrigger className="w-full bg-muted/20 border-border text-foreground h-11 rounded-xl text-sm px-3.5 focus:border-primary">
                        <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border max-h-60">
                        {divisions.map((d: any) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.nameBn ? `${d.nameBn} (${d.name})` : d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* District */}
                  <div className="space-y-1.5">
                    <Label className="block text-xs font-bold text-foreground">
                      জেলা (District)
                    </Label>
                    <Select
                      value={districtId}
                      onValueChange={handleDistrictChange}
                      disabled={!divisionId || updateMutation.isPending}
                    >
                      <SelectTrigger className="w-full bg-muted/20 border-border text-foreground h-11 rounded-xl text-sm px-3.5 focus:border-primary disabled:opacity-50">
                        <SelectValue
                          placeholder={
                            divisionId
                              ? "জেলা নির্বাচন করুন"
                              : "প্রথমে বিভাগ নির্বাচন করুন"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border max-h-60">
                        {districts.map((d: any) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.nameBn ? `${d.nameBn} (${d.name})` : d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Upazila */}
                  <div className="space-y-1.5">
                    <Label className="block text-xs font-bold text-foreground">
                      উপজেলা / থানা (Upazila)
                    </Label>
                    <Select
                      value={upazilaId}
                      onValueChange={handleUpazilaChange}
                      disabled={!districtId || updateMutation.isPending}
                    >
                      <SelectTrigger className="w-full bg-muted/20 border-border text-foreground h-11 rounded-xl text-sm px-3.5 focus:border-primary disabled:opacity-50">
                        <SelectValue
                          placeholder={
                            districtId
                              ? "উপজেলা নির্বাচন করুন"
                              : "প্রথমে জেলা নির্বাচন করুন"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border max-h-60">
                        {upazilas.map((u: any) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.nameBn ? `${u.nameBn} (${u.name})` : u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Union */}
                  <div className="space-y-1.5">
                    <Label className="block text-xs font-bold text-foreground">
                      ইউনিয়ন / এলাকা (Union)
                    </Label>
                    <Select
                      value={unionId}
                      onValueChange={handleUnionChange}
                      disabled={!upazilaId || updateMutation.isPending}
                    >
                      <SelectTrigger className="w-full bg-muted/20 border-border text-foreground h-11 rounded-xl text-sm px-3.5 focus:border-primary disabled:opacity-50">
                        <SelectValue
                          placeholder={
                            upazilaId
                              ? "ইউনিয়ন নির্বাচন করুন"
                              : "প্রথমে উপজেলা নির্বাচন করুন"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border max-h-60">
                        {unions.map((u: any) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.nameBn ? `${u.nameBn} (${u.name})` : u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* ── Tab 3: Officials & Signatures ─────────────────────────── */}
        <TabsContent value="officials" className="space-y-6">
          <Card className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-border/50 pb-4">
              <h3 className="text-lg font-bold font-headline text-foreground flex items-center gap-2">
                <User className="w-5 h-5 text-amber-600" />
                <span>প্রতিষ্ঠান প্রধান ও ডিজিটাল স্বাক্ষর</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                প্রশ্নপত্র প্রিন্ট করার সময় ফুটারে স্বয়ংক্রিয়ভাবে অধ্যক্ষের নাম ও স্বাক্ষর সংযুক্ত করার জন্য ব্যবহার হয়
              </p>
            </div>

            <div className="space-y-6">
              {/* Principal Box */}
              <div className="p-6 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    অধ্যক্ষ / প্রধান শিক্ষক
                  </span>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/25">
                    প্রশ্নপত্রে মুদ্রণযোগ্য
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label className="block text-xs font-bold text-foreground">
                      অধ্যক্ষের পূর্ণ নাম
                    </Label>
                    <div className="relative group">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                      <Input
                        value={principalName}
                        onChange={(e) => setPrincipalName(e.target.value)}
                        disabled={updateMutation.isPending}
                        placeholder="যেমনঃ প্রফেসর ড. মোস্তাফিজুর রহমান"
                        className="bg-card border-border text-foreground pl-10 h-11 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="block text-xs font-bold text-foreground">
                      ডিজিটাল স্বাক্ষরের ছবি লিংক (Signature URL)
                    </Label>
                    <div className="relative group">
                      <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                      <Input
                        value={principalSignature}
                        onChange={(e) => setPrincipalSignature(e.target.value)}
                        disabled={updateMutation.isPending}
                        placeholder="https://example.com/signatures/principal.png"
                        className="bg-card border-border text-foreground pl-10 h-11 rounded-xl text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>

                {principalSignature && (
                  <div className="mt-3 flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 w-fit">
                    <span className="text-xs font-medium text-muted-foreground">স্বাক্ষর প্রিভিউ:</span>
                    <img
                      src={principalSignature}
                      alt="অধ্যক্ষের স্বাক্ষর"
                      className="h-10 max-w-[150px] object-contain"
                      onError={(e) => {
                        ;(e.target as any).style.display = "none"
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Vice Principal Box */}
              <div className="p-6 rounded-2xl bg-muted/20 border border-border/50 space-y-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground block">
                  উপাধ্যক্ষ / সহকারী প্রধান শিক্ষক
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label className="block text-xs font-bold text-foreground">
                      উপাধ্যক্ষের পূর্ণ নাম
                    </Label>
                    <div className="relative group">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                      <Input
                        value={vicePrincipalName}
                        onChange={(e) => setVicePrincipalName(e.target.value)}
                        disabled={updateMutation.isPending}
                        placeholder="যেমনঃ মোহাম্মদ রফিকুল ইসলাম"
                        className="bg-card border-border text-foreground pl-10 h-11 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="block text-xs font-bold text-foreground">
                      ডিজিটাল স্বাক্ষরের ছবি লিংক (Signature URL)
                    </Label>
                    <div className="relative group">
                      <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                      <Input
                        value={vicePrincipalSignature}
                        onChange={(e) => setVicePrincipalSignature(e.target.value)}
                        disabled={updateMutation.isPending}
                        placeholder="https://example.com/signatures/vice-principal.png"
                        className="bg-card border-border text-foreground pl-10 h-11 rounded-xl text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>

                {vicePrincipalSignature && (
                  <div className="mt-3 flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 w-fit">
                    <span className="text-xs font-medium text-muted-foreground">স্বাক্ষর প্রিভিউ:</span>
                    <img
                      src={vicePrincipalSignature}
                      alt="উপাধ্যক্ষের স্বাক্ষর"
                      className="h-10 max-w-[150px] object-contain"
                      onError={(e) => {
                        ;(e.target as any).style.display = "none"
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* ── Tab 4: Branding & Logo ─────────────────────────────────── */}
        <TabsContent value="branding" className="space-y-6">
          <Card className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-border/50 pb-4">
              <h3 className="text-lg font-bold font-headline text-foreground flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-600" />
                <span>লোগো ও প্রাতিষ্ঠানিক পরিচয়</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                প্রশ্নপত্রের হেডারে এবং পোর্টালে প্রদর্শিত লোগো ও ব্র্যান্ডিং প্রিভিউ
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-1.5">
                <Label className="block text-xs font-bold text-foreground">
                  লোগোর ইমেজ লিংক (Logo Image URL)
                </Label>
                <div className="relative group">
                  <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                  <Input
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    disabled={updateMutation.isPending}
                    placeholder="https://example.com/logo.png"
                    className="bg-muted/20 border-border text-foreground pl-10 h-11 rounded-xl text-sm font-mono"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  স্বচ্ছ ব্যাকগ্রাউন্ডসহ উচ্চ রেজুলেশনের PNG বা SVG ফরম্যাটের লোগো ব্যবহার করা শ্রেয়।
                </p>
              </div>

              {/* Logo Preview Card */}
              <div className="p-6 rounded-3xl bg-muted/20 border border-border/60 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-2xl border-2 border-border/80 bg-card flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  {logo ? (
                    <img
                      src={logo}
                      alt="Institution Logo Preview"
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        ;(e.target as any).style.display = "none"
                      }}
                    />
                  ) : (
                    <GraduationCap className="w-10 h-10 text-muted-foreground/40" />
                  )}
                </div>

                <div className="space-y-1.5 text-center sm:text-left">
                  <h4 className="text-base font-bold font-headline text-foreground">
                    {institutionDisplayName}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    প্রশ্নপত্র প্রিন্ট বা পিডিএফ ডাউনলোড করার সময় শীর্ষ ব্যানারে এই লোগোটি প্রতিষ্ঠানের নাম ও ঠিকানার সাথে সংযুক্ত থাকবে।
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── 3. Bottom Sticky / Save Bar ─────────────────────────────── */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/60 shadow-xs">
        <div className="text-xs text-muted-foreground hidden sm:block">
          যেকোনো পরিবর্তন সম্পন্ন করার পর নিচে সংরক্ষণ করুন বোতামে ক্লিক করুন।
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={updateMutation.isPending}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-2.5 font-headline text-sm font-bold text-primary-foreground shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer ml-auto"
        >
          {updateMutation.isPending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent shrink-0"></div>
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>প্রোফাইল সংরক্ষণ করুন</span>
        </Button>
      </div>
    </form>
  )
}

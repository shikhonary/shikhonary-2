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
  Building2, 
  Globe, 
  MapPin, 
  User, 
  Save, 
  Info, 
  Image, 
  Mail, 
  Phone, 
  FileText, 
  Hash 
} from "lucide-react"

export function ProfileView() {
  const queryClient = useQueryClient()
  const router = useRouter()

  // 1. Fetch current tenant profile
  const { data: tenant, isLoading, isError } = useQuery(
    trpc.tenant.current.queryOptions()
  )

  // 2. Form states
  const [name, setName] = useState("")
  const [nameBn, setNameBn] = useState("")
  const [description, setDescription] = useState("")
  const [logo, setLogo] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [secretarySignature, setSecretarySignature] = useState("")
  const [chairmanSignature, setChairmanSignature] = useState("")
  const [facebookUrl, setFacebookUrl] = useState("")
  
  const [divisionName, setDivisionName] = useState("")
  const [districtName, setDistrictName] = useState("")
  const [upazilaName, setUpazilaName] = useState("")
  const [unionName, setUnionName] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [geoCode, setGeoCode] = useState("")
  
  const [secretaryName, setSecretaryName] = useState("")
  const [chairmanName, setChairmanName] = useState("")

  // Populate form states when data is loaded
  useEffect(() => {
    if (tenant) {
      setName(tenant.name || "")
      setNameBn(tenant.nameBn || "")
      setDescription(tenant.description || "")
      setLogo(tenant.logo || "")
      setEmail(tenant.email || "")
      setPhone(tenant.phone || "")
      setSecretarySignature(tenant.secretarySignature || "")
      setChairmanSignature(tenant.chairmanSignature || "")
      setFacebookUrl(tenant.facebookUrl || "")
      setDivisionName(tenant.divisionName || "")
      setDistrictName(tenant.districtName || "")
      setUpazilaName(tenant.upazilaName || "")
      setUnionName(tenant.unionName || "")
      setPostalCode(tenant.postalCode || "")
      setGeoCode(tenant.geoCode || "")
      setSecretaryName(tenant.secretaryName || "")
      setChairmanName(tenant.chairmanName || "")
    }
  }, [tenant])

  // 3. Mutation for updating profile
  const updateMutation = useMutation({
    ...trpc.tenant.updateCurrent.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.tenant.pathFilter())
      toast.success("ইউনিয়ন প্রোফাইল সফলভাবে আপডেট করা হয়েছে।")
      router.refresh()
    },
    onError: (err: any) => {
      toast.error(err.message || "ইউনিয়ন প্রোফাইল আপডেট করতে ব্যর্থ হয়েছে।")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error("ইউনিয়নের ইংরেজি নামটি আবশ্যক।")
      return
    }

    updateMutation.mutate({
      name: name.trim(),
      nameBn: nameBn.trim() || null,
      description: description.trim() || null,
      logo: logo.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      secretarySignature: secretarySignature.trim() || null,
      chairmanSignature: chairmanSignature.trim() || null,
      facebookUrl: facebookUrl.trim() || null,
      divisionName: divisionName.trim() || null,
      districtName: districtName.trim() || null,
      upazilaName: upazilaName.trim() || null,
      unionName: unionName.trim() || null,
      postalCode: postalCode.trim() || null,
      geoCode: geoCode.trim() || null,
      secretaryName: secretaryName.trim() || null,
      chairmanName: chairmanName.trim() || null,
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-muted-foreground font-body text-sm font-medium">তথ্য লোড হচ্ছে...</p>
      </div>
    )
  }

  if (isError || !tenant) {
    return (
      <div className="max-w-2xl mx-auto rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center space-y-3">
        <h3 className="font-display text-lg font-bold text-destructive">ত্রুটি ঘটেছে</h3>
        <p className="font-body text-sm text-muted-foreground">
          ইউনিয়নের প্রোফাইল তথ্য লোড করতে ব্যর্থ হয়েছে। অনুগ্রহ করে পেজটি রিফ্রেশ করুন অথবা সিস্টেম অ্যাডমিনের সাথে যোগাযোগ করুন।
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-body">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md bg-muted/30 rounded-xl p-1 mb-6 border border-border/60">
          <TabsTrigger value="general" className="rounded-lg flex items-center justify-center gap-2 py-2">
            <Building2 className="w-4 h-4" />
            <span className="font-display text-xs sm:text-sm">সাধারণ তথ্য</span>
          </TabsTrigger>
          <TabsTrigger value="geo" className="rounded-lg flex items-center justify-center gap-2 py-2">
            <MapPin className="w-4 h-4" />
            <span className="font-display text-xs sm:text-sm">ভৌগোলিক তথ্য</span>
          </TabsTrigger>
          <TabsTrigger value="officials" className="rounded-lg flex items-center justify-center gap-2 py-2">
            <User className="w-4 h-4" />
            <span className="font-display text-xs sm:text-sm">কর্মকর্তাগণ</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: General Info */}
        <TabsContent value="general" className="space-y-6">
          <Card className="overflow-hidden rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xs shadow-sm p-0">
            <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-5 sm:p-6 text-primary-foreground">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-primary-foreground shrink-0 shadow-sm">
                  <Info className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-extrabold text-primary-foreground">
                    পরিষদের মৌলিক বিবরণ
                  </h3>
                  <p className="font-body text-xs text-primary-foreground/90 mt-0.5">
                    ইউনিয়ন পরিষদের মৌলিক পরিচিতি এবং যোগাযোগের বিস্তারিত বিবরণ প্রদান করুন
                  </p>
                </div>
              </div>
            </div>

            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Union Name (English) */}
                <div className="space-y-1.5">
                  <Label className="block text-xs font-semibold text-muted-foreground font-display">
                    ইউনিয়নের নাম (English) <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative group font-body">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={updateMutation.isPending}
                      placeholder="e.g. Sreepur Union Porishod"
                      className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all"
                    />
                  </div>
                </div>

                {/* Union Name (Bangla) */}
                <div className="space-y-1.5">
                  <Label className="block text-xs font-semibold text-muted-foreground font-display">
                    ইউনিয়নের নাম (বাংলা)
                  </Label>
                  <div className="relative group font-body">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                    <Input
                      value={nameBn}
                      onChange={(e) => setNameBn(e.target.value)}
                      disabled={updateMutation.isPending}
                      placeholder="যেমনঃ শ্রীপুর ইউনিয়ন পরিষদ"
                      className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Official Email */}
                <div className="space-y-1.5">
                  <Label className="block text-xs font-semibold text-muted-foreground font-display">
                    অফিসিয়াল ইমেইল
                  </Label>
                  <div className="relative group font-body">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={updateMutation.isPending}
                      placeholder="contact@sreepurup.gov.bd"
                      className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all"
                    />
                  </div>
                </div>

                {/* Official Phone */}
                <div className="space-y-1.5">
                  <Label className="block text-xs font-semibold text-muted-foreground font-display">
                    অফিসিয়াল ফোন নম্বর
                  </Label>
                  <div className="relative group font-body">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={updateMutation.isPending}
                      placeholder="যেমনঃ ০১৭০০০০০০০০"
                      className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Logo URL */}
              <div className="space-y-1.5">
                <Label className="block text-xs font-semibold text-muted-foreground font-display">
                  লোগো URL
                </Label>
                <div className="flex items-center gap-4">
                  <div className="relative group flex-1 font-body">
                    <Image className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                    <Input
                      value={logo}
                      onChange={(e) => setLogo(e.target.value)}
                      disabled={updateMutation.isPending}
                      placeholder="https://example.com/logo.png"
                      className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all"
                    />
                  </div>
                  {logo && (
                    <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-border bg-muted flex items-center justify-center shrink-0 shadow-xs">
                      <img
                        src={logo}
                        alt="Logo Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Facebook URL */}
              <div className="space-y-1.5">
                <Label className="block text-xs font-semibold text-muted-foreground font-display">
                  অফিসিয়াল ফেসবুক পেজ লিংক
                </Label>
                <div className="relative group font-body">
                  <Globe className="absolute left-3.5 top-3 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                  <Input
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    disabled={updateMutation.isPending}
                    placeholder="https://facebook.com/your-union-porishod"
                    className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label className="block text-xs font-semibold text-muted-foreground font-display">
                  বর্ণনা / পটভূমি
                </Label>
                <div className="relative group font-body">
                  <FileText className="absolute left-3.5 top-3 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={updateMutation.isPending}
                    rows={3}
                    placeholder="ইউনিয়নের সংক্ষিপ্ত বিবরণ বা ইতিহাস..."
                    className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 pt-2.5 rounded-xl text-sm transition-all resize-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Geo Info */}
        <TabsContent value="geo" className="space-y-6">
          <Card className="overflow-hidden rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xs shadow-sm p-0">
            <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-5 sm:p-6 text-primary-foreground">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-primary-foreground shrink-0 shadow-sm">
                  <Globe className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-extrabold text-primary-foreground">
                    ভৌগোলিক তথ্য ও এলাকা
                  </h3>
                  <p className="font-body text-xs text-primary-foreground/90 mt-0.5">
                    বাংলাদেশ জাতীয় তথ্য বাতায়নের সাথে সামঞ্জস্যপূর্ণ ভৌগোলিক বিবরণ প্রদান করুন
                  </p>
                </div>
              </div>
            </div>

            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Division */}
                <div className="space-y-1.5">
                  <Label className="block text-xs font-semibold text-muted-foreground font-display">
                    বিভাগ
                  </Label>
                  <div className="relative group font-body">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                    <Input
                      value={divisionName}
                      onChange={(e) => setDivisionName(e.target.value)}
                      disabled={updateMutation.isPending}
                      placeholder="যেমনঃ ঢাকা"
                      className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all"
                    />
                  </div>
                </div>

                {/* District */}
                <div className="space-y-1.5">
                  <Label className="block text-xs font-semibold text-muted-foreground font-display">
                    জেলা
                  </Label>
                  <div className="relative group font-body">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                    <Input
                      value={districtName}
                      onChange={(e) => setDistrictName(e.target.value)}
                      disabled={updateMutation.isPending}
                      placeholder="যেমনঃ গাজীপুর"
                      className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all"
                    />
                  </div>
                </div>

                {/* Upazila */}
                <div className="space-y-1.5">
                  <Label className="block text-xs font-semibold text-muted-foreground font-display">
                    উপজেলা
                  </Label>
                  <div className="relative group font-body">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                    <Input
                      value={upazilaName}
                      onChange={(e) => setUpazilaName(e.target.value)}
                      disabled={updateMutation.isPending}
                      placeholder="যেমনঃ শ্রীপুর"
                      className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Union Name */}
                <div className="space-y-1.5">
                  <Label className="block text-xs font-semibold text-muted-foreground font-display">
                    ইউনিয়ন
                  </Label>
                  <div className="relative group font-body">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                    <Input
                      value={unionName}
                      onChange={(e) => setUnionName(e.target.value)}
                      disabled={updateMutation.isPending}
                      placeholder="যেমনঃ শ্রীপুর"
                      className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all"
                    />
                  </div>
                </div>

                {/* Postal Code */}
                <div className="space-y-1.5">
                  <Label className="block text-xs font-semibold text-muted-foreground font-display">
                    পোস্টাল কোড (ডাক কোড)
                  </Label>
                  <div className="relative group font-body">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                    <Input
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      disabled={updateMutation.isPending}
                      placeholder="যেমনঃ ১৭৪০"
                      className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Geo Code */}
                <div className="space-y-1.5">
                  <Label className="block text-xs font-semibold text-muted-foreground font-display">
                    জিও কোড (Geo Code)
                  </Label>
                  <div className="relative group font-body">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                    <Input
                      value={geoCode}
                      onChange={(e) => setGeoCode(e.target.value)}
                      disabled={updateMutation.isPending}
                      placeholder="যেমনঃ ৩০৮৬"
                      className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all font-mono"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: UP Officials */}
        <TabsContent value="officials" className="space-y-6">
          <Card className="overflow-hidden rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xs shadow-sm p-0">
            <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-5 sm:p-6 text-primary-foreground">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-primary-foreground shrink-0 shadow-sm">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-extrabold text-primary-foreground">
                    প্রধান কর্মকর্তা ও দায়িত্বশীল ব্যক্তিবর্গ
                  </h3>
                  <p className="font-body text-xs text-primary-foreground/90 mt-0.5">
                    ইউনিয়ন পরিষদের প্রধান প্রশাসনিক দায়িত্বশীল ব্যক্তিবর্গের নাম যুক্ত করুন
                  </p>
                </div>
              </div>
            </div>

            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Chairman Name */}
                <div className="space-y-1.5">
                  <Label className="block text-xs font-semibold text-muted-foreground font-display">
                    ইউনিয়ন পরিষদ চেয়ারম্যান
                  </Label>
                  <div className="relative group font-body">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                    <Input
                      value={chairmanName}
                      onChange={(e) => setChairmanName(e.target.value)}
                      disabled={updateMutation.isPending}
                      placeholder="যেমনঃ মোঃ আব্দুল জলিল"
                      className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all"
                    />
                  </div>
                </div>

                {/* Secretary Name */}
                <div className="space-y-1.5">
                  <Label className="block text-xs font-semibold text-muted-foreground font-display">
                    ইউনিয়ন পরিষদ সচিব
                  </Label>
                  <div className="relative group font-body">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                    <Input
                      value={secretaryName}
                      onChange={(e) => setSecretaryName(e.target.value)}
                      disabled={updateMutation.isPending}
                      placeholder="যেমনঃ অমল চন্দ্র শর্মা"
                      className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                {/* Chairman Signature */}
                <div className="space-y-1.5">
                  <Label className="block text-xs font-semibold text-muted-foreground font-display">
                    চেয়ারম্যানের স্বাক্ষরের ছবি (Image URL)
                  </Label>
                  <div className="relative group font-body">
                    <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                    <Input
                      value={chairmanSignature}
                      onChange={(e) => setChairmanSignature(e.target.value)}
                      disabled={updateMutation.isPending}
                      placeholder="https://example.com/signatures/chair.png"
                      className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all"
                    />
                  </div>
                </div>

                {/* Secretary Signature */}
                <div className="space-y-1.5">
                  <Label className="block text-xs font-semibold text-muted-foreground font-display">
                    সচিবের স্বাক্ষরের ছবি (Image URL)
                  </Label>
                  <div className="relative group font-body">
                    <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                    <Input
                      value={secretarySignature}
                      onChange={(e) => setSecretarySignature(e.target.value)}
                      disabled={updateMutation.isPending}
                      placeholder="https://example.com/signatures/sec.png"
                      className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Submission Button */}
      <div className="flex items-center justify-end">
        <Button
          type="submit"
          disabled={updateMutation.isPending}
          className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 font-display text-sm sm:text-base font-bold text-primary-foreground shadow-md hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95 cursor-pointer overflow-hidden h-auto disabled:opacity-50 disabled:pointer-events-none"
        >
          {updateMutation.isPending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent shrink-0"></div>
          ) : (
            <Save className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
          )}
          <span>প্রোফাইল আপডেট করুন</span>
        </Button>
      </div>
    </form>
  )
}

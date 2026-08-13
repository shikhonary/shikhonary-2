import {
  Mail,
  Phone,
  MapPin,
  Globe,
  UserCheck,
  User,
  AlertTriangle,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@workspace/ui/components/avatar"

interface TenantDetailsOverviewProps {
  tenant: any
}

export const TenantDetailsOverview = ({ tenant }: TenantDetailsOverviewProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Suspension Details (If Suspended) */}
      {tenant.isSuspended && (
        <Card className="bg-destructive/5 border border-destructive/20 rounded-3xl overflow-hidden shadow-soft col-span-1 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2.5 text-destructive">
              <div className="p-2 bg-destructive/10 rounded-xl text-destructive border border-destructive/20">
                <AlertTriangle className="w-4 h-4" />
              </div>
              Suspension Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-foreground">
              This tenant has been suspended and is currently unable to access their local portal.
            </p>
            {tenant.suspendReason && (
              <div className="p-4 bg-destructive/10 rounded-2xl border border-destructive/20 mt-3">
                <p className="text-[10px] font-black text-destructive uppercase tracking-widest">Reason for Suspension</p>
                <p className="text-sm font-bold text-foreground mt-1">{tenant.suspendReason}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Administration & Contacts */}
      <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-3xl overflow-hidden shadow-soft">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-xl text-primary border border-primary/20">
              <Mail className="w-4 h-4" />
            </div>
            Contact & Socials
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4 pt-2">
            {tenant.email && (
              <div className="flex items-center gap-4 group/item">
                <div className="size-9 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center text-muted-foreground">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    Official Email
                  </span>
                  <a
                    href={`mailto:${tenant.email}`}
                    className="text-sm font-bold text-foreground hover:text-primary transition-colors"
                  >
                    {tenant.email}
                  </a>
                </div>
              </div>
            )}
            {tenant.phone && (
              <div className="flex items-center gap-4 group/item">
                <div className="size-9 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center text-muted-foreground">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    Phone Number
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {tenant.phone}
                  </span>
                </div>
              </div>
            )}
            {tenant.facebookUrl && (
              <div className="flex items-start gap-4 group/item">
                <div className="size-9 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center text-muted-foreground">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    Facebook Page
                  </span>
                  <a
                    href={tenant.facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-bold text-primary hover:underline break-all"
                  >
                    {tenant.facebookUrl}
                  </a>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Geography Breakdown */}
      <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-3xl overflow-hidden shadow-soft">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-xl text-primary border border-primary/20">
              <MapPin className="w-4 h-4" />
            </div>
            Geographical Boundary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                Division (বিভাগ)
              </span>
              <span className="text-sm font-bold text-foreground mt-0.5 block">
                {tenant.divisionName || "N/A"}
                {tenant.divisionNameBn && (
                  <span className="text-xs font-medium text-muted-foreground ml-1.5 font-headline">
                    ({tenant.divisionNameBn})
                  </span>
                )}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                District (জেলা)
              </span>
              <span className="text-sm font-bold text-foreground mt-0.5 block">
                {tenant.districtName || "N/A"}
                {tenant.districtNameBn && (
                  <span className="text-xs font-medium text-muted-foreground ml-1.5 font-headline">
                    ({tenant.districtNameBn})
                  </span>
                )}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                Upazila (উপজেলা)
              </span>
              <span className="text-sm font-bold text-foreground mt-0.5 block">
                {tenant.upazilaName || "N/A"}
                {tenant.upazilaNameBn && (
                  <span className="text-xs font-medium text-muted-foreground ml-1.5 font-headline">
                    ({tenant.upazilaNameBn})
                  </span>
                )}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                Union Name (ইউনিয়ন)
              </span>
              <span className="text-sm font-bold text-foreground mt-0.5 block">
                {tenant.unionName || "N/A"}
                {tenant.unionNameBn && (
                  <span className="text-xs font-medium text-muted-foreground ml-1.5 font-headline">
                    ({tenant.unionNameBn})
                  </span>
                )}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50 col-span-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                Postal Code (পোস্ট কোড)
              </span>
              <span className="text-sm font-bold text-foreground mt-0.5 block font-mono">
                {tenant.postalCode || "N/A"}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50 col-span-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                Geo Code (জিও কোড)
              </span>
              <span className="text-sm font-bold text-foreground mt-0.5 block font-mono">
                {tenant.geoCode || "N/A"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* UP Officials & Signatures */}
      <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-3xl overflow-hidden shadow-soft">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-xl text-primary border border-primary/20">
              <UserCheck className="w-4 h-4" />
            </div>
            UP Officials & Signatures
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Chairman */}
            <div className="p-4 rounded-2xl bg-muted/20 border border-border/40 flex flex-col justify-between min-h-[140px]">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 block">
                  UP Chairman
                </span>
                <span className="text-sm font-black text-foreground block mt-1">
                  {tenant.chairmanName || "Not Assigned"}
                </span>
              </div>
              <div className="mt-4 border border-dashed border-border/60 rounded-xl p-3 bg-card/60 flex items-center justify-center min-h-[64px] relative overflow-hidden">
                {tenant.chairmanSignature ? (
                  <img
                    src={tenant.chairmanSignature}
                    alt="Chairman Signature"
                    className="max-h-12 object-contain"
                  />
                ) : (
                  <span className="text-xs text-muted-foreground/50 font-medium italic">
                    No signature uploaded
                  </span>
                )}
              </div>
            </div>

            {/* Secretary */}
            <div className="p-4 rounded-2xl bg-muted/20 border border-border/40 flex flex-col justify-between min-h-[140px]">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 block">
                  UP Secretary
                </span>
                <span className="text-sm font-black text-foreground block mt-1">
                  {tenant.secretaryName || "Not Assigned"}
                </span>
              </div>
              <div className="mt-4 border border-dashed border-border/60 rounded-xl p-3 bg-card/60 flex items-center justify-center min-h-[64px] relative overflow-hidden">
                {tenant.secretarySignature ? (
                  <img
                    src={tenant.secretarySignature}
                    alt="Secretary Signature"
                    className="max-h-12 object-contain"
                  />
                ) : (
                  <span className="text-xs text-muted-foreground/50 font-medium italic">
                    No signature uploaded
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tenant Owner Details */}
      <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-3xl overflow-hidden shadow-soft">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-xl text-primary border border-primary/20">
              <User className="w-4 h-4" />
            </div>
            Creator / Owner Details
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {tenant.owner ? (
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 border border-border/40">
              <Avatar className="size-12 border border-border/50">
                {tenant.owner.image ? (
                  <AvatarImage src={tenant.owner.image} alt={tenant.owner.name || "Owner"} />
                ) : (
                  <AvatarFallback className="bg-primary/5 text-primary font-black text-sm">
                    {tenant.owner.name
                      ? tenant.owner.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : "OW"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm font-black text-foreground">
                  {tenant.owner.name || "Unnamed Owner"}
                </p>
                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                  {tenant.owner.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="size-3 shrink-0" />
                      <a href={`mailto:${tenant.owner.email}`} className="hover:text-primary transition-colors">
                        {tenant.owner.email}
                      </a>
                    </span>
                  )}
                  {tenant.owner.phoneNumber && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="size-3 shrink-0" />
                      <span>{tenant.owner.phoneNumber}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-muted/10 border border-dashed border-border/60 rounded-2xl">
              <User className="size-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No creator/owner assigned to this Union Porishod.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

import {
  Mail,
  Phone,
  MapPin,
  Globe,
  UserCheck,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

interface TenantDetailsOverviewProps {
  tenant: any
}

export const TenantDetailsOverview = ({ tenant }: TenantDetailsOverviewProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Administration & Contacts */}
      <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-3xl overflow-hidden shadow-soft">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-xl text-primary border border-primary/20">
              <UserCheck className="w-4 h-4" />
            </div>
            Administration & Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4 pt-2">
            {tenant.secretaryName && (
              <div className="flex items-center gap-4 group/item">
                <div className="size-9 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center text-muted-foreground">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    UP Secretary
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {tenant.secretaryName}
                  </span>
                </div>
              </div>
            )}
            {tenant.chairmanName && (
              <div className="flex items-center gap-4 group/item">
                <div className="size-9 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center text-muted-foreground">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    UP Chairman
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {tenant.chairmanName}
                  </span>
                </div>
              </div>
            )}
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
            {tenant.address && (
              <div className="flex items-start gap-4 group/item">
                <div className="size-9 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    Office Address
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {tenant.address}
                  </span>
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
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                District (জেলা)
              </span>
              <span className="text-sm font-bold text-foreground mt-0.5 block">
                {tenant.districtName || "N/A"}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                Upazila (উপজেলা)
              </span>
              <span className="text-sm font-bold text-foreground mt-0.5 block">
                {tenant.upazilaName || "N/A"}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                Union Name (ইউনিয়ন)
              </span>
              <span className="text-sm font-bold text-foreground mt-0.5 block">
                {tenant.unionName || "N/A"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

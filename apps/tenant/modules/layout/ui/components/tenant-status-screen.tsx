import Link from "next/link";
import { ShieldOff, PowerOff, UserX, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

type StatusType = "suspended" | "inactive" | "no-membership";

interface TenantStatusScreenProps {
  type: StatusType;
  tenantName?: string;
}

const STATUS_CONFIG = {
  suspended: {
    icon: ShieldOff,
    accent: "hsl(0 72% 51%)", // Sharp red
    accentMuted: "hsl(0 72% 51% / 0.08)",
    accentBorder: "hsl(0 72% 51% / 0.2)",
    badge: "অ্যাকাউন্ট স্থগিত",
    badgeBg: "hsl(0 72% 51% / 0.1)",
    badgeColor: "hsl(0 72% 51%)",
    headline: "এই প্রতিষ্ঠানটির কার্যক্রম স্থগিত করা হয়েছে।",
    subtext:
      "প্ল্যাটফর্ম অ্যাডমিনিস্ট্রেটর কর্তৃক এই ড্যাশবোর্ডে প্রবেশাধিকার সীমাবদ্ধ করা হয়েছে। সহায়তা পেতে কর্তৃপক্ষের সাথে যোগাযোগ করুন।",
    cta: "সাপোর্টে ইমেইল পাঠান",
    ctaHref: "mailto:support@shikhonary.com",
    secondaryText: "লগইন পৃষ্ঠায় ফিরে যান",
  },
  inactive: {
    icon: PowerOff,
    accent: "hsl(38 92% 50%)", // Amber
    accentMuted: "hsl(38 92% 50% / 0.08)",
    accentBorder: "hsl(38 92% 50% / 0.2)",
    badge: "প্রতিষ্ঠান নিষ্ক্রিয়",
    badgeBg: "hsl(38 92% 50% / 0.1)",
    badgeColor: "hsl(38 92% 50%)",
    headline: "এই প্রতিষ্ঠানটি বর্তমানে নিষ্ক্রিয় রয়েছে।",
    subtext:
      "ড্যাশবোর্ডটি নিষ্ক্রিয় করা হয়েছে। পুনরায় সক্রিয় করতে আপনার প্ল্যাটফর্ম অ্যাডমিনিস্ট্রেটরের সাথে যোগাযোগ করুন।",
    cta: "সাপোর্টে ইমেইল পাঠান",
    ctaHref: "mailto:support@shikhonary.com",
    secondaryText: "লগইন পৃষ্ঠায় ফিরে যান",
  },
  "no-membership": {
    icon: UserX,
    accent: "hsl(215 20% 65%)", // Slate
    accentMuted: "hsl(215 20% 65% / 0.08)",
    accentBorder: "hsl(215 20% 65% / 0.2)",
    badge: "প্রবেশাধিকার নেই",
    badgeBg: "hsl(215 20% 65% / 0.1)",
    badgeColor: "hsl(215 20% 65%)",
    headline: "আপনার অ্যাকাউন্টে কোনো প্রতিষ্ঠানের প্রবেশাধিকার নেই।",
    subtext:
      "আপনার অ্যাকাউন্টটি কোনো সক্রিয় প্রতিষ্ঠানের সাথে যুক্ত নেই। দায়িত্বপ্রাপ্ত অ্যাডমিনকে আপনাকে আমন্ত্রণ লিংক পাঠাতে অনুরোধ করুন।",
    cta: "অ্যাডমিনের সাথে যোগাযোগ করুন",
    ctaHref: "mailto:support@shikhonary.com",
    secondaryText: "লগইন পৃষ্ঠায় ফিরে যান",
  },
};

export function TenantStatusScreen({
  type,
  tenantName,
}: TenantStatusScreenProps) {
  const config = STATUS_CONFIG[type];
  const Icon = config.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden font-body">
      {/* Sharp geometric background elements */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="absolute -top-32 -left-24 w-[480px] h-[480px] rotate-12 opacity-[0.03]"
          style={{ background: config.accent, borderRadius: "0" }}
        />
        <div
          className="absolute -bottom-40 -right-20 w-[520px] h-[520px] -rotate-12 opacity-[0.03]"
          style={{ background: config.accent, borderRadius: "0" }}
        />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 39px, hsl(var(--foreground)) 39px, hsl(var(--foreground)) 40px),
              repeating-linear-gradient(90deg, transparent, transparent 39px, hsl(var(--foreground)) 39px, hsl(var(--foreground)) 40px)`,
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-4 md:mx-auto">
        <div
          className="h-[3px] w-full mb-0"
          style={{ background: config.accent }}
        />

        <div
          className="border border-border bg-card p-8 md:p-12"
          style={{ borderTop: "none", borderRadius: "0 0 2px 2px" }}
        >
          <div className="flex items-start gap-5 mb-8">
            <div
              className="flex-shrink-0 w-14 h-14 flex items-center justify-center"
              style={{
                background: config.accentMuted,
                border: `1px solid ${config.accentBorder}`,
                borderRadius: "2px",
              }}
            >
              <Icon
                className="w-6 h-6"
                style={{ color: config.accent }}
                strokeWidth={1.5}
              />
            </div>

            <div className="flex-1 pt-1">
              <span
                className="inline-block text-xs font-semibold tracking-widest uppercase px-2 py-1 mb-3 font-display"
                style={{
                  background: config.badgeBg,
                  color: config.badgeColor,
                  border: `1px solid ${config.accentBorder}`,
                  borderRadius: "2px",
                  letterSpacing: "0.12em",
                }}
              >
                {config.badge}
              </span>

              {tenantName && (
                <p
                  className="text-xs font-mono text-muted-foreground"
                  style={{ letterSpacing: "0.05em" }}
                >
                  প্রতিষ্ঠান: {tenantName}
                </p>
              )}
            </div>
          </div>

          <h1
            className="text-3xl md:text-4xl font-bold leading-tight mb-4 tracking-tight font-display"
            style={{ color: "hsl(var(--foreground))" }}
          >
            {config.headline}
          </h1>

          <div
            className="w-12 h-[2px] mb-6"
            style={{ background: config.accent }}
          />

          <p className="text-muted-foreground leading-relaxed mb-10 max-w-prose text-[15px]">
            {config.subtext}
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-3 font-display">
            <a href={config.ctaHref} className="w-full sm:w-auto">
              <Button
                className="w-full sm:w-auto gap-2 font-semibold h-11 px-6"
                style={{
                  background: config.accent,
                  color: "#fff",
                  borderRadius: "2px",
                  border: "none",
                }}
              >
                <Mail className="w-4 h-4" />
                {config.cta}
              </Button>
            </a>

            <Link href="/auth/sign-in" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto gap-2 font-medium h-11 px-6"
                style={{ borderRadius: "2px" }}
              >
                <ArrowLeft className="w-4 h-4" />
                {config.secondaryText}
              </Button>
            </Link>
          </div>

          <div className="mt-12 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground font-body">
              যদি আপনার মনে হয় এটি ভুলবশত হয়েছে, তবে আপনার প্রতিষ্ঠানের নাম উল্লেখ করে সাপোর্ট টিমে ইমেইল করুন{" "}
              <a
                href="mailto:support@shikhonary.com"
                className="underline underline-offset-2 hover:text-foreground transition-colors"
                style={{ color: config.accent }}
              >
                support@shikhonary.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

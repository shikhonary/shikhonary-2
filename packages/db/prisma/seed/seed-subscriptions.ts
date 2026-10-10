import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../generated/main/client.js"

const connectionString = process.env.MAIN_DATABASE_URL || process.env.DATABASE_URL
if (!connectionString) {
  console.error("ERROR: MAIN_DATABASE_URL or DATABASE_URL is not set in environment variables.")
  process.exit(1)
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding Subscription Plans...")

  // 1. Deactivate old free plan
  await prisma.subscriptionPlan.updateMany({
    where: { name: "free" },
    data: { isActive: false },
  })

  // 2. Teacher Pack (শিক্ষক প্যাক) - ৳ 500 / month, ৳ 5,000 / year
  const teacherPlan = await prisma.subscriptionPlan.upsert({
    where: { name: "teacher" },
    update: {
      displayName: "শিক্ষক প্যাক",
      description: "ব্যক্তিগত শিক্ষক ও গৃহশিক্ষকদের জন্য আদর্শ প্রশ্নপত্র ও পরীক্ষা প্যাক",
      monthlyPriceBDT: 500,
      yearlyPriceBDT: 5000,
      isActive: true,
      isPopular: false,
      defaultStudentLimit: 200,
      defaultTeacherLimit: 3,
      defaultExamLimit: 600,
      defaultStorageLimit: 500,
      defaultCreditLimit: 500,
      canCreateExams: true,
      canCollectFees: false,
      canUseLms: false,
      canManageAttendance: false,
      canManageLibrary: false,
      canManageTransport: false,
      canSendSms: false,
      canUseCustomDomain: false,
      canUseAiFeatures: true,
      canExportReports: true,
      features: {
        questionPaperBuilder: {
          questionBankAccess: "FULL",
          creditsMonthly: 500,
          creditsYearly: 6000,
          paperLimitMonthly: 50,
          paperLimitYearly: 600,
          aiChatbotPaperLimitMonthly: 5,
          aiChatbotPaperLimitYearly: 60,
          omrSheetsMonthly: 100,
          omrSheetsYearly: 1200,
          onlineExamsMonthly: 5,
          onlineExamsYearly: 60,
          canRemoveFooterBranding: false,
          bulletPointsBn: [
            "সকল শ্রেণি ও বিষয়ের সম্পূর্ণ প্রশ্নভাণ্ডার অ্যাক্সেস",
            "মাসিক ৫০০ এআই ও প্রশ্ন ক্রেডিট অন্তর্ভুক্ত",
            "প্রশ্নপত্র তৈরি: ৫০টি / মাস (বা ৬০০টি / বছর)",
            "এআই চ্যাটবট অ্যাসিস্ট্যান্ট: ৫টি পেপার / মাস",
            "ওএমআর খাতা মূল্যায়ন: ১০০টি খাতা / মাস",
            "অনলাইন পরীক্ষা: ৫টি পরীক্ষা / মাস",
            "ফুটারে 'Powered by Shikhonary' ব্র্যান্ডিং"
          ]
        },
        coachingManagement: { enabled: false }
      },
    },
    create: {
      name: "teacher",
      displayName: "শিক্ষক প্যাক",
      description: "ব্যক্তিগত শিক্ষক ও গৃহশিক্ষকদের জন্য আদর্শ প্রশ্নপত্র ও পরীক্ষা প্যাক",
      monthlyPriceBDT: 500,
      yearlyPriceBDT: 5000,
      isActive: true,
      isPopular: false,
      defaultStudentLimit: 200,
      defaultTeacherLimit: 3,
      defaultExamLimit: 600,
      defaultStorageLimit: 500,
      defaultCreditLimit: 500,
      canCreateExams: true,
      canCollectFees: false,
      canUseLms: false,
      canManageAttendance: false,
      canManageLibrary: false,
      canManageTransport: false,
      canSendSms: false,
      canUseCustomDomain: false,
      canUseAiFeatures: true,
      canExportReports: true,
      features: {
        questionPaperBuilder: {
          questionBankAccess: "FULL",
          creditsMonthly: 500,
          creditsYearly: 6000,
          paperLimitMonthly: 50,
          paperLimitYearly: 600,
          aiChatbotPaperLimitMonthly: 5,
          aiChatbotPaperLimitYearly: 60,
          omrSheetsMonthly: 100,
          omrSheetsYearly: 1200,
          onlineExamsMonthly: 5,
          onlineExamsYearly: 60,
          canRemoveFooterBranding: false,
          bulletPointsBn: [
            "সকল শ্রেণি ও বিষয়ের সম্পূর্ণ প্রশ্নভাণ্ডার অ্যাক্সেস",
            "মাসিক ৫০০ এআই ও প্রশ্ন ক্রেডিট অন্তর্ভুক্ত",
            "প্রশ্নপত্র তৈরি: ৫০টি / মাস (বা ৬০০টি / বছর)",
            "এআই চ্যাটবট অ্যাসিস্ট্যান্ট: ৫টি পেপার / মাস",
            "ওএমআর খাতা মূল্যায়ন: ১০০টি খাতা / মাস",
            "অনলাইন পরীক্ষা: ৫টি পরীক্ষা / মাস",
            "ফুটারে 'Powered by Shikhonary' ব্র্যান্ডিং"
          ]
        },
        coachingManagement: { enabled: false }
      },
    },
  })

  // 3. Academy Pack (একাডেমি প্যাক) - ৳ 1,000 / month, ৳ 10,000 / year
  const academyPlan = await prisma.subscriptionPlan.upsert({
    where: { name: "academy" },
    update: {
      displayName: "একাডেমি প্যাক",
      description: "সক্রিয় কোচিং ও একাডেমির সাপ্তাহিক পরীক্ষা, ওএমআর ও অনলাইন মূল্যায়ন",
      monthlyPriceBDT: 1000,
      yearlyPriceBDT: 10000,
      isActive: true,
      isPopular: true,
      defaultStudentLimit: 1000,
      defaultTeacherLimit: 15,
      defaultExamLimit: 2400,
      defaultStorageLimit: 2000,
      defaultCreditLimit: 1200,
      canCreateExams: true,
      canCollectFees: false,
      canUseLms: false,
      canManageAttendance: false,
      canManageLibrary: false,
      canManageTransport: false,
      canSendSms: true,
      canUseCustomDomain: false,
      canUseAiFeatures: true,
      canExportReports: true,
      features: {
        questionPaperBuilder: {
          questionBankAccess: "FULL",
          creditsMonthly: 1200,
          creditsYearly: 14400,
          paperLimitMonthly: 200,
          paperLimitYearly: 2400,
          aiChatbotPaperLimitMonthly: 15,
          aiChatbotPaperLimitYearly: 180,
          omrSheetsMonthly: 300,
          omrSheetsYearly: 3600,
          onlineExamsMonthly: 20,
          onlineExamsYearly: 240,
          canRemoveFooterBranding: false,
          bulletPointsBn: [
            "সকল শ্রেণি ও বিষয়ের সম্পূর্ণ প্রশ্নভাণ্ডার অ্যাক্সেস",
            "মাসিক ১,২০০ এআই ও প্রশ্ন ক্রেডিট অন্তর্ভুক্ত (২০০ বোনাস)",
            "প্রশ্নপত্র তৈরি: ২০০টি / মাস (বা ২,৪০০টি / বছর)",
            "এআই চ্যাটবট অ্যাসিস্ট্যান্ট: ১৫টি পেপার / মাস",
            "ওএমআর খাতা মূল্যায়ন: ৩০০টি খাতা / মাস",
            "অনলাইন পরীক্ষা: ২০টি পরীক্ষা / মাস",
            "ফুটারে 'Powered by Shikhonary' ব্র্যান্ডিং"
          ]
        },
        coachingManagement: { enabled: false }
      },
    },
    create: {
      name: "academy",
      displayName: "একাডেমি প্যাক",
      description: "সক্রিয় কোচিং ও একাডেমির সাপ্তাহিক পরীক্ষা, ওএমআর ও অনলাইন মূল্যায়ন",
      monthlyPriceBDT: 1000,
      yearlyPriceBDT: 10000,
      isActive: true,
      isPopular: true,
      defaultStudentLimit: 1000,
      defaultTeacherLimit: 15,
      defaultExamLimit: 2400,
      defaultStorageLimit: 2000,
      defaultCreditLimit: 1200,
      canCreateExams: true,
      canCollectFees: false,
      canUseLms: false,
      canManageAttendance: false,
      canManageLibrary: false,
      canManageTransport: false,
      canSendSms: true,
      canUseCustomDomain: false,
      canUseAiFeatures: true,
      canExportReports: true,
      features: {
        questionPaperBuilder: {
          questionBankAccess: "FULL",
          creditsMonthly: 1200,
          creditsYearly: 14400,
          paperLimitMonthly: 200,
          paperLimitYearly: 2400,
          aiChatbotPaperLimitMonthly: 15,
          aiChatbotPaperLimitYearly: 180,
          omrSheetsMonthly: 300,
          omrSheetsYearly: 3600,
          onlineExamsMonthly: 20,
          onlineExamsYearly: 240,
          canRemoveFooterBranding: false,
          bulletPointsBn: [
            "সকল শ্রেণি ও বিষয়ের সম্পূর্ণ প্রশ্নভাণ্ডার অ্যাক্সেস",
            "মাসিক ১,২০০ এআই ও প্রশ্ন ক্রেডিট অন্তর্ভুক্ত (২০০ বোনাস)",
            "প্রশ্নপত্র তৈরি: ২০০টি / মাস (বা ২,৪০০টি / বছর)",
            "এআই চ্যাটবট অ্যাসিস্ট্যান্ট: ১৫টি পেপার / মাস",
            "ওএমআর খাতা মূল্যায়ন: ৩০০টি খাতা / মাস",
            "অনলাইন পরীক্ষা: ২০টি পরীক্ষা / মাস",
            "ফুটারে 'Powered by Shikhonary' ব্র্যান্ডিং"
          ]
        },
        coachingManagement: { enabled: false }
      },
    },
  })

  // 4. Campus Pack (ক্যাম্পাস প্যাক) - ৳ 2,500 / month, ৳ 25,000 / year
  const campusPlan = await prisma.subscriptionPlan.upsert({
    where: { name: "campus" },
    update: {
      displayName: "ক্যাম্পাস প্যাক",
      description: "স্কুল, কলেজ ও বৃহৎ প্রতিষ্ঠানের জন্য কাস্টমাইজড হোয়াইট-লেবেল সমাধান",
      monthlyPriceBDT: 2500,
      yearlyPriceBDT: 25000,
      isActive: true,
      isPopular: false,
      defaultStudentLimit: 50000,
      defaultTeacherLimit: 100,
      defaultExamLimit: 6000,
      defaultStorageLimit: 10000,
      defaultCreditLimit: 2800,
      canCreateExams: true,
      canCollectFees: false,
      canUseLms: false,
      canManageAttendance: false,
      canManageLibrary: false,
      canManageTransport: false,
      canSendSms: true,
      canUseCustomDomain: true,
      canUseAiFeatures: true,
      canExportReports: true,
      features: {
        questionPaperBuilder: {
          questionBankAccess: "FULL",
          creditsMonthly: 2800,
          creditsYearly: 33600,
          paperLimitMonthly: 500,
          paperLimitYearly: 6000,
          aiChatbotPaperLimitMonthly: 50,
          aiChatbotPaperLimitYearly: 600,
          omrSheetsMonthly: 1000,
          omrSheetsYearly: 12000,
          onlineExamsMonthly: 100,
          onlineExamsYearly: 1200,
          canRemoveFooterBranding: true,
          bulletPointsBn: [
            "সকল শ্রেণি ও বিষয়ের সম্পূর্ণ প্রশ্নভাণ্ডার অ্যাক্সেস",
            "মাসিক ২,৮০০ এআই ও প্রশ্ন ক্রেডিট অন্তর্ভুক্ত (৩০০ বোনাস)",
            "প্রশ্নপত্র তৈরি: ৫০০টি / মাস (বা ৬,০০০টি / বছর)",
            "এআই চ্যাটবট অ্যাসিস্ট্যান্ট: ৫০টি পেপার / মাস",
            "ওএমআর খাতা মূল্যায়ন: ১,০০০টি খাতা / মাস",
            "অনলাইন পরীক্ষা: ১০০টি পরীক্ষা / মাস",
            "ফুটারে ব্র্যান্ডিং রিমুভ করার সুবিধা (হোয়াইট-লেবেল)"
          ]
        },
        coachingManagement: { enabled: false }
      },
    },
    create: {
      name: "campus",
      displayName: "ক্যাম্পাস প্যাক",
      description: "স্কুল, কলেজ ও বৃহৎ প্রতিষ্ঠানের জন্য কাস্টমাইজড হোয়াইট-লেবেল সমাধান",
      monthlyPriceBDT: 2500,
      yearlyPriceBDT: 25000,
      isActive: true,
      isPopular: false,
      defaultStudentLimit: 50000,
      defaultTeacherLimit: 100,
      defaultExamLimit: 6000,
      defaultStorageLimit: 10000,
      defaultCreditLimit: 2800,
      canCreateExams: true,
      canCollectFees: false,
      canUseLms: false,
      canManageAttendance: false,
      canManageLibrary: false,
      canManageTransport: false,
      canSendSms: true,
      canUseCustomDomain: true,
      canUseAiFeatures: true,
      canExportReports: true,
      features: {
        questionPaperBuilder: {
          questionBankAccess: "FULL",
          creditsMonthly: 2800,
          creditsYearly: 33600,
          paperLimitMonthly: 500,
          paperLimitYearly: 6000,
          aiChatbotPaperLimitMonthly: 50,
          aiChatbotPaperLimitYearly: 600,
          omrSheetsMonthly: 1000,
          omrSheetsYearly: 12000,
          onlineExamsMonthly: 100,
          onlineExamsYearly: 1200,
          canRemoveFooterBranding: true,
          bulletPointsBn: [
            "সকল শ্রেণি ও বিষয়ের সম্পূর্ণ প্রশ্নভাণ্ডার অ্যাক্সেস",
            "মাসিক ২,৮০০ এআই ও প্রশ্ন ক্রেডিট অন্তর্ভুক্ত (৩০০ বোনাস)",
            "প্রশ্নপত্র তৈরি: ৫০০টি / মাস (বা ৬,০০০টি / বছর)",
            "এআই চ্যাটবট অ্যাসিস্ট্যান্ট: ৫০টি পেপার / মাস",
            "ওএমআর খাতা মূল্যায়ন: ১,০০০টি খাতা / মাস",
            "অনলাইন পরীক্ষা: ১০০টি পরীক্ষা / মাস",
            "ফুটারে ব্র্যান্ডিং রিমুভ করার সুবিধা (হোয়াইট-লেবেল)"
          ]
        },
        coachingManagement: { enabled: false }
      },
    },
  })

  console.log("Seeding Institutions (Tenants)...")

  const findGeoIds = async (geography: {
    division: string
    district: string
    upazila: string
    union: string
  }) => {
    const matched = await prisma.union.findFirst({
      where: {
        name: { equals: geography.union, mode: "insensitive" },
        upazila: {
          name: { equals: geography.upazila, mode: "insensitive" },
          district: {
            name: { equals: geography.district, mode: "insensitive" },
            division: {
              name: { equals: geography.division, mode: "insensitive" },
            },
          },
        },
      },
      select: {
        id: true,
        upazilaId: true,
        upazila: {
          select: {
            districtId: true,
            district: {
              select: {
                divisionId: true,
              },
            },
          },
        },
      },
    })
    return matched
      ? {
          unionId: matched.id,
          upazilaId: matched.upazilaId,
          districtId: matched.upazila.districtId,
          divisionId: matched.upazila.district.divisionId,
        }
      : {
          unionId: null,
          upazilaId: null,
          districtId: null,
          divisionId: null,
        }
  }

  const savarGeo = await findGeoIds({
    division: "Dhaka",
    district: "Dhaka",
    upazila: "Savar",
    union: "Savar Sadar",
  })

  const dhamraiGeo = await findGeoIds({
    division: "Dhaka",
    district: "Dhaka",
    upazila: "Dhamrai",
    union: "Dhamrai Sadar",
  })

  const gazipurGeo = await findGeoIds({
    division: "Dhaka",
    district: "Gazipur",
    upazila: "Gazipur Sadar",
    union: "Gazipur Sadar",
  })

  const savarTenant = await prisma.tenant.upsert({
    where: { slug: "savar-up" },
    update: {
      ...savarGeo,
      eiin: "107845",
      board: "Dhaka",
      address: "Savar, Dhaka",
    },
    create: {
      slug: "savar-up",
      name: "Savar High School",
      nameBn: "সাভার উচ্চ বিদ্যালয়",
      type: "SCHOOL",
      ...savarGeo,
      principalName: "Md. Rahim Uddin",
      principalSignature: "https://example.com/signatures/savar-sec.png",
      vicePrincipalName: "Vice Principal Savar",
      vicePrincipalSignature: "https://example.com/signatures/savar-chair.png",
      email: "info@savar.uphub.gov.bd",
      phone: "+880 1700-000001",
      isActive: true,
      eiin: "107845",
      board: "Dhaka",
      address: "Savar, Dhaka",
    },
  })

  const dhamraiTenant = await prisma.tenant.upsert({
    where: { slug: "dhamrai-up" },
    update: {
      ...dhamraiGeo,
      eiin: "107932",
      board: "Dhaka",
      address: "Dhamrai, Dhaka",
    },
    create: {
      slug: "dhamrai-up",
      name: "Dhamrai Model School",
      nameBn: "ধামরাই মডেল স্কুল",
      type: "SCHOOL",
      ...dhamraiGeo,
      principalName: "Abul Kalam",
      principalSignature: "https://example.com/signatures/dhamrai-sec.png",
      vicePrincipalName: "Vice Principal Dhamrai",
      vicePrincipalSignature: "https://example.com/signatures/dhamrai-chair.png",
      email: "info@dhamrai.uphub.gov.bd",
      phone: "+880 1700-000002",
      isActive: true,
      eiin: "107932",
      board: "Dhaka",
      address: "Dhamrai, Dhaka",
    },
  })

  const gazipurTenant = await prisma.tenant.upsert({
    where: { slug: "gazipur-up" },
    update: {
      ...gazipurGeo,
      eiin: "109012",
      board: "Dhaka",
      address: "Gazipur, Dhaka",
    },
    create: {
      slug: "gazipur-up",
      name: "Gazipur College & Academy",
      nameBn: "গাজীপুর কলেজ ও একাডেমি",
      type: "SCHOOL",
      ...gazipurGeo,
      principalName: "Fazlul Haque",
      principalSignature: "https://example.com/signatures/gazipur-sec.png",
      vicePrincipalName: "Vice Principal Gazipur",
      vicePrincipalSignature: "https://example.com/signatures/gazipur-chair.png",
      email: "info@gazipur.uphub.gov.bd",
      phone: "+880 1700-000003",
      isActive: true,
      eiin: "109012",
      board: "Dhaka",
      address: "Gazipur, Dhaka",
    },
  })

  console.log("Seeding Subscriptions linked to Tenants...")

  const tenantSubscriptions = [
    {
      tenantId: savarTenant.id,
      planId: teacherPlan.id,
      status: "ACTIVE",
      billingCycle: "YEARLY",
      pricePerMonth: 500,
      pricePerYear: 5000,
      currentPeriodStart: new Date("2026-01-01"),
      currentPeriodEnd: new Date("2026-12-31"),
    },
    {
      tenantId: dhamraiTenant.id,
      planId: academyPlan.id,
      status: "ACTIVE",
      billingCycle: "YEARLY",
      pricePerMonth: 1000,
      pricePerYear: 10000,
      currentPeriodStart: new Date("2026-01-01"),
      currentPeriodEnd: new Date("2026-12-31"),
    },
    {
      tenantId: gazipurTenant.id,
      planId: campusPlan.id,
      status: "ACTIVE",
      billingCycle: "YEARLY",
      pricePerMonth: 2500,
      pricePerYear: 25000,
      currentPeriodStart: new Date("2026-01-01"),
      currentPeriodEnd: new Date("2026-12-31"),
    },
  ]

  for (const sub of tenantSubscriptions) {
    await prisma.subscription.upsert({
      where: { tenantId: sub.tenantId },
      update: sub,
      create: sub,
    })
    console.log(`Seeded subscription for tenant ID ${sub.tenantId}`)
  }

  console.log("Successfully seeded plans, tenants and subscriptions into database.")
}

main()
  .catch((e) => {
    console.error("Error seeding subscriptions:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

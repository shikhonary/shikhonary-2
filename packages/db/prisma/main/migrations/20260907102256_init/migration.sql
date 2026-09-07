-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "phoneNumber" TEXT,
    "phoneNumberVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameBn" TEXT,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "type" TEXT NOT NULL DEFAULT 'SCHOOL',
    "email" TEXT,
    "phone" TEXT,
    "eiin" TEXT,
    "board" TEXT,
    "address" TEXT,
    "establishedYear" INTEGER,
    "curriculum" TEXT,
    "medium" TEXT,
    "shift" TEXT,
    "divisionId" TEXT,
    "districtId" TEXT,
    "upazilaId" TEXT,
    "unionId" TEXT,
    "postalCode" TEXT,
    "principalName" TEXT,
    "principalSignature" TEXT,
    "vicePrincipalName" TEXT,
    "vicePrincipalSignature" TEXT,
    "website" TEXT,
    "socialLinks" JSONB NOT NULL DEFAULT '{}',
    "subdomain" TEXT,
    "customDomain" TEXT,
    "customDomainVerified" BOOLEAN NOT NULL DEFAULT false,
    "databaseName" TEXT,
    "connectionString" TEXT,
    "databaseStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "studentCount" INTEGER NOT NULL DEFAULT 0,
    "teacherCount" INTEGER NOT NULL DEFAULT 0,
    "examCount" INTEGER NOT NULL DEFAULT 0,
    "storageUsedMB" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "suspendReason" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "currentFiscalYearId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "customStudentLimit" INTEGER,
    "customTeacherLimit" INTEGER,
    "customExamLimit" INTEGER,
    "customStorageLimit" INTEGER,
    "creditBalance" INTEGER NOT NULL DEFAULT 0,
    "totalCreditsUsed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_member" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_invitation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STAFF',
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "acceptedBy" TEXT,
    "message" TEXT,
    "name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "monthlyPriceBDT" INTEGER NOT NULL DEFAULT 0,
    "yearlyPriceBDT" INTEGER NOT NULL DEFAULT 0,
    "features" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "defaultStudentLimit" INTEGER NOT NULL DEFAULT 1000,
    "defaultTeacherLimit" INTEGER NOT NULL DEFAULT 10,
    "defaultExamLimit" INTEGER NOT NULL DEFAULT 500,
    "defaultStorageLimit" INTEGER NOT NULL DEFAULT 500,
    "defaultCreditLimit" INTEGER NOT NULL DEFAULT 30,
    "canCreateExams" BOOLEAN NOT NULL DEFAULT true,
    "canCollectFees" BOOLEAN NOT NULL DEFAULT false,
    "canUseLms" BOOLEAN NOT NULL DEFAULT false,
    "canManageAttendance" BOOLEAN NOT NULL DEFAULT false,
    "canManageLibrary" BOOLEAN NOT NULL DEFAULT false,
    "canManageTransport" BOOLEAN NOT NULL DEFAULT false,
    "canSendSms" BOOLEAN NOT NULL DEFAULT false,
    "canUseCustomDomain" BOOLEAN NOT NULL DEFAULT false,
    "canUseAiFeatures" BOOLEAN NOT NULL DEFAULT false,
    "canExportReports" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "trialEndsAt" TIMESTAMP(3),
    "billingCycle" TEXT NOT NULL DEFAULT 'YEARLY',
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "pricePerMonth" INTEGER NOT NULL DEFAULT 0,
    "pricePerYear" INTEGER,
    "paymentProvider" TEXT,
    "externalId" TEXT,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "canceledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "customStudentLimit" INTEGER,
    "customTeacherLimit" INTEGER,
    "customExamLimit" INTEGER,
    "customStorageLimit" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_transaction" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_history" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "fromPlanId" TEXT,
    "toPlanId" TEXT,
    "fromStatus" TEXT,
    "toStatus" TEXT,
    "reason" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "paymentMethod" TEXT,
    "paymentProvider" TEXT,
    "paymentReference" TEXT,
    "invoicePdfUrl" TEXT,
    "lineItems" JSONB NOT NULL DEFAULT '[]',
    "description" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fiscal_year" (
    "id" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fiscal_year_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "division" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "url" TEXT,

    CONSTRAINT "division_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "district" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "url" TEXT,
    "divisionId" TEXT NOT NULL,

    CONSTRAINT "district_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upazila" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "url" TEXT,
    "districtId" TEXT NOT NULL,

    CONSTRAINT "upazila_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "union" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "url" TEXT,
    "upazilaId" TEXT NOT NULL,

    CONSTRAINT "union_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post" (
    "id" TEXT NOT NULL,
    "postOffice" TEXT NOT NULL,
    "postOfficeBn" TEXT,
    "postCode" TEXT NOT NULL,
    "upazilaId" TEXT NOT NULL,

    CONSTRAINT "post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_year" (
    "id" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_year_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_class" (
    "id" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_subject" (
    "id" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "code" TEXT,
    "group" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "academicYearId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_class_subject" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academic_class_subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_chapter" (
    "id" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "subjectId" TEXT NOT NULL,
    "academicYearId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_chapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_type" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "label" TEXT,
    "mark" DOUBLE PRECISION NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "descriptionEn" TEXT,
    "descriptionBn" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_question_type" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "questionTypeId" TEXT NOT NULL,
    "sectionId" TEXT,
    "subSectionId" TEXT,
    "mark" DOUBLE PRECISION NOT NULL,
    "markDistribution" JSONB,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "requiredCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subject_question_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_question_section" (
    "id" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "instructions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subject_question_section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_question_sub_section" (
    "id" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "sectionId" TEXT NOT NULL,
    "instructions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subject_question_sub_section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mcq" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "options" TEXT[],
    "statements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "type" TEXT NOT NULL,
    "isMath" BOOLEAN NOT NULL DEFAULT false,
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "explanation" TEXT,
    "questionUrl" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "popularityCount" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "questionTypeId" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,
    "tenantId" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "mcq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cq" (
    "id" TEXT NOT NULL,
    "questionA" TEXT NOT NULL,
    "questionB" TEXT NOT NULL,
    "questionC" TEXT NOT NULL,
    "questionD" TEXT,
    "context" TEXT,
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "marks" JSONB,
    "popularityCount" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "questionTypeId" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,
    "tenantId" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "cq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_attachment" (
    "id" TEXT NOT NULL,
    "mcqId" TEXT,
    "cqId" TEXT,
    "shortAnswerId" TEXT,
    "type" TEXT NOT NULL,
    "caption" TEXT,
    "content" TEXT,
    "url" TEXT,
    "table" JSONB,
    "bottomContent" TEXT,
    "tableBorder" BOOLEAN DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cq_answer" (
    "id" TEXT NOT NULL,
    "cqId" TEXT NOT NULL,
    "answerA" TEXT,
    "answerB" TEXT,
    "answerC" TEXT,
    "answerD" TEXT,
    "explanation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cq_answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "short_answer" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "popularityCount" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "questionTypeId" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,
    "tenantId" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "short_answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paragraph" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "popularityCount" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "questionTypeId" TEXT NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,
    "tenantId" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "academicChapterId" TEXT,

    CONSTRAINT "paragraph_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "amplification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "popularityCount" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "questionTypeId" TEXT NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,
    "tenantId" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "academicChapterId" TEXT,

    CONSTRAINT "amplification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cs" (
    "id" TEXT NOT NULL,
    "questionA" TEXT NOT NULL,
    "questionB" TEXT NOT NULL,
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "popularityCount" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "questionTypeId" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,
    "tenantId" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "cs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "letter" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "popularityCount" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "questionTypeId" TEXT NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,
    "tenantId" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "letter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "popularityCount" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "questionTypeId" TEXT NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,
    "tenantId" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "summary" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "popularityCount" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "questionTypeId" TEXT NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,
    "tenantId" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "summary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "essence" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "popularityCount" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "questionTypeId" TEXT NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,
    "tenantId" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "essence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thought_expansion" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "popularityCount" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "questionTypeId" TEXT NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,
    "tenantId" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "thought_expansion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_report" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "popularityCount" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "questionTypeId" TEXT NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,
    "tenantId" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "news_report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "essay" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "popularityCount" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "questionTypeId" TEXT NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,
    "tenantId" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "essay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_report" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "resolvedNote" TEXT,
    "reportedById" TEXT,
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RoleToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RoleToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_phoneNumber_key" ON "user"("phoneNumber");

-- CreateIndex
CREATE INDEX "user_deletedAt_idx" ON "user"("deletedAt");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "session_expiresAt_idx" ON "session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "account_providerId_accountId_key" ON "account"("providerId", "accountId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE INDEX "verification_expiresAt_idx" ON "verification"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "role_name_key" ON "role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_slug_key" ON "tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_subdomain_key" ON "tenant"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_customDomain_key" ON "tenant"("customDomain");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_databaseName_key" ON "tenant"("databaseName");

-- CreateIndex
CREATE INDEX "tenant_isActive_idx" ON "tenant"("isActive");

-- CreateIndex
CREATE INDEX "tenant_deletedAt_isActive_idx" ON "tenant"("deletedAt", "isActive");

-- CreateIndex
CREATE INDEX "tenant_createdById_idx" ON "tenant"("createdById");

-- CreateIndex
CREATE INDEX "tenant_currentFiscalYearId_idx" ON "tenant"("currentFiscalYearId");

-- CreateIndex
CREATE INDEX "tenant_divisionId_idx" ON "tenant"("divisionId");

-- CreateIndex
CREATE INDEX "tenant_districtId_idx" ON "tenant"("districtId");

-- CreateIndex
CREATE INDEX "tenant_upazilaId_idx" ON "tenant"("upazilaId");

-- CreateIndex
CREATE INDEX "tenant_unionId_idx" ON "tenant"("unionId");

-- CreateIndex
CREATE INDEX "tenant_member_tenantId_idx" ON "tenant_member"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_member_userId_tenantId_key" ON "tenant_member"("userId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_invitation_token_key" ON "tenant_invitation"("token");

-- CreateIndex
CREATE INDEX "tenant_invitation_status_idx" ON "tenant_invitation"("status");

-- CreateIndex
CREATE INDEX "tenant_invitation_tenantId_idx" ON "tenant_invitation"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_invitation_email_tenantId_key" ON "tenant_invitation"("email", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plan_name_key" ON "subscription_plan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_tenantId_key" ON "subscription"("tenantId");

-- CreateIndex
CREATE INDEX "subscription_currentPeriodEnd_idx" ON "subscription"("currentPeriodEnd");

-- CreateIndex
CREATE INDEX "subscription_planId_idx" ON "subscription"("planId");

-- CreateIndex
CREATE INDEX "subscription_status_idx" ON "subscription"("status");

-- CreateIndex
CREATE INDEX "credit_transaction_tenantId_idx" ON "credit_transaction"("tenantId");

-- CreateIndex
CREATE INDEX "credit_transaction_tenantId_createdAt_idx" ON "credit_transaction"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "credit_transaction_type_idx" ON "credit_transaction"("type");

-- CreateIndex
CREATE INDEX "credit_transaction_createdAt_idx" ON "credit_transaction"("createdAt");

-- CreateIndex
CREATE INDEX "subscription_history_createdAt_idx" ON "subscription_history"("createdAt");

-- CreateIndex
CREATE INDEX "subscription_history_subscriptionId_idx" ON "subscription_history"("subscriptionId");

-- CreateIndex
CREATE INDEX "subscription_history_subscriptionId_createdAt_idx" ON "subscription_history"("subscriptionId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_invoiceNumber_key" ON "invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "invoice_dueDate_idx" ON "invoice"("dueDate");

-- CreateIndex
CREATE INDEX "invoice_status_idx" ON "invoice"("status");

-- CreateIndex
CREATE INDEX "invoice_tenantId_idx" ON "invoice"("tenantId");

-- CreateIndex
CREATE INDEX "invoice_deletedAt_idx" ON "invoice"("deletedAt");

-- CreateIndex
CREATE INDEX "fiscal_year_tenantId_idx" ON "fiscal_year"("tenantId");

-- CreateIndex
CREATE INDEX "fiscal_year_isCurrent_idx" ON "fiscal_year"("isCurrent");

-- CreateIndex
CREATE UNIQUE INDEX "fiscal_year_tenantId_year_key" ON "fiscal_year"("tenantId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "division_name_key" ON "division"("name");

-- CreateIndex
CREATE UNIQUE INDEX "district_name_key" ON "district"("name");

-- CreateIndex
CREATE INDEX "district_divisionId_idx" ON "district"("divisionId");

-- CreateIndex
CREATE INDEX "upazila_districtId_idx" ON "upazila"("districtId");

-- CreateIndex
CREATE INDEX "union_upazilaId_idx" ON "union"("upazilaId");

-- CreateIndex
CREATE INDEX "post_upazilaId_idx" ON "post"("upazilaId");

-- CreateIndex
CREATE INDEX "post_postCode_idx" ON "post"("postCode");

-- CreateIndex
CREATE INDEX "academic_year_isCurrent_idx" ON "academic_year"("isCurrent");

-- CreateIndex
CREATE INDEX "academic_year_isActive_idx" ON "academic_year"("isActive");

-- CreateIndex
CREATE INDEX "academic_class_isActive_idx" ON "academic_class"("isActive");

-- CreateIndex
CREATE INDEX "academic_class_nameEn_idx" ON "academic_class"("nameEn");

-- CreateIndex
CREATE INDEX "academic_subject_isActive_idx" ON "academic_subject"("isActive");

-- CreateIndex
CREATE INDEX "academic_subject_academicYearId_idx" ON "academic_subject"("academicYearId");

-- CreateIndex
CREATE INDEX "academic_subject_code_idx" ON "academic_subject"("code");

-- CreateIndex
CREATE INDEX "academic_class_subject_subjectId_idx" ON "academic_class_subject"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "academic_class_subject_classId_subjectId_key" ON "academic_class_subject"("classId", "subjectId");

-- CreateIndex
CREATE INDEX "academic_chapter_isActive_idx" ON "academic_chapter"("isActive");

-- CreateIndex
CREATE INDEX "academic_chapter_subjectId_idx" ON "academic_chapter"("subjectId");

-- CreateIndex
CREATE INDEX "academic_chapter_academicYearId_idx" ON "academic_chapter"("academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "academic_chapter_subjectId_position_key" ON "academic_chapter"("subjectId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "question_type_nameEn_key" ON "question_type"("nameEn");

-- CreateIndex
CREATE INDEX "question_type_label_idx" ON "question_type"("label");

-- CreateIndex
CREATE INDEX "question_type_isActive_idx" ON "question_type"("isActive");

-- CreateIndex
CREATE INDEX "subject_question_type_subjectId_idx" ON "subject_question_type"("subjectId");

-- CreateIndex
CREATE INDEX "subject_question_type_questionTypeId_idx" ON "subject_question_type"("questionTypeId");

-- CreateIndex
CREATE INDEX "subject_question_type_sectionId_idx" ON "subject_question_type"("sectionId");

-- CreateIndex
CREATE INDEX "subject_question_type_subSectionId_idx" ON "subject_question_type"("subSectionId");

-- CreateIndex
CREATE INDEX "subject_question_section_subjectId_idx" ON "subject_question_section"("subjectId");

-- CreateIndex
CREATE INDEX "subject_question_sub_section_sectionId_idx" ON "subject_question_sub_section"("sectionId");

-- CreateIndex
CREATE INDEX "mcq_createdById_idx" ON "mcq"("createdById");

-- CreateIndex
CREATE INDEX "mcq_tenantId_isGlobal_idx" ON "mcq"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "mcq_questionTypeId_idx" ON "mcq"("questionTypeId");

-- CreateIndex
CREATE INDEX "mcq_deletedAt_idx" ON "mcq"("deletedAt");

-- CreateIndex
CREATE INDEX "mcq_chapterId_type_idx" ON "mcq"("chapterId", "type");

-- CreateIndex
CREATE INDEX "mcq_isMath_idx" ON "mcq"("isMath");

-- CreateIndex
CREATE INDEX "mcq_subjectId_chapterId_idx" ON "mcq"("subjectId", "chapterId");

-- CreateIndex
CREATE INDEX "mcq_subjectId_type_idx" ON "mcq"("subjectId", "type");

-- CreateIndex
CREATE INDEX "mcq_type_idx" ON "mcq"("type");

-- CreateIndex
CREATE INDEX "mcq_difficulty_idx" ON "mcq"("difficulty");

-- CreateIndex
CREATE INDEX "cq_createdById_idx" ON "cq"("createdById");

-- CreateIndex
CREATE INDEX "cq_tenantId_isGlobal_idx" ON "cq"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "cq_questionTypeId_idx" ON "cq"("questionTypeId");

-- CreateIndex
CREATE INDEX "cq_deletedAt_idx" ON "cq"("deletedAt");

-- CreateIndex
CREATE INDEX "cq_subjectId_chapterId_idx" ON "cq"("subjectId", "chapterId");

-- CreateIndex
CREATE INDEX "cq_chapterId_idx" ON "cq"("chapterId");

-- CreateIndex
CREATE INDEX "cq_subjectId_idx" ON "cq"("subjectId");

-- CreateIndex
CREATE INDEX "cq_difficulty_idx" ON "cq"("difficulty");

-- CreateIndex
CREATE INDEX "question_attachment_mcqId_idx" ON "question_attachment"("mcqId");

-- CreateIndex
CREATE INDEX "question_attachment_cqId_idx" ON "question_attachment"("cqId");

-- CreateIndex
CREATE INDEX "question_attachment_shortAnswerId_idx" ON "question_attachment"("shortAnswerId");

-- CreateIndex
CREATE UNIQUE INDEX "cq_answer_cqId_key" ON "cq_answer"("cqId");

-- CreateIndex
CREATE INDEX "short_answer_createdById_idx" ON "short_answer"("createdById");

-- CreateIndex
CREATE INDEX "short_answer_tenantId_isGlobal_idx" ON "short_answer"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "short_answer_questionTypeId_idx" ON "short_answer"("questionTypeId");

-- CreateIndex
CREATE INDEX "short_answer_deletedAt_idx" ON "short_answer"("deletedAt");

-- CreateIndex
CREATE INDEX "short_answer_subjectId_chapterId_idx" ON "short_answer"("subjectId", "chapterId");

-- CreateIndex
CREATE INDEX "short_answer_chapterId_idx" ON "short_answer"("chapterId");

-- CreateIndex
CREATE INDEX "short_answer_subjectId_idx" ON "short_answer"("subjectId");

-- CreateIndex
CREATE INDEX "short_answer_difficulty_idx" ON "short_answer"("difficulty");

-- CreateIndex
CREATE INDEX "paragraph_createdById_idx" ON "paragraph"("createdById");

-- CreateIndex
CREATE INDEX "paragraph_tenantId_isGlobal_idx" ON "paragraph"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "paragraph_questionTypeId_idx" ON "paragraph"("questionTypeId");

-- CreateIndex
CREATE INDEX "paragraph_deletedAt_idx" ON "paragraph"("deletedAt");

-- CreateIndex
CREATE INDEX "paragraph_academicChapterId_idx" ON "paragraph"("academicChapterId");

-- CreateIndex
CREATE INDEX "paragraph_subjectId_idx" ON "paragraph"("subjectId");

-- CreateIndex
CREATE INDEX "paragraph_difficulty_idx" ON "paragraph"("difficulty");

-- CreateIndex
CREATE INDEX "amplification_createdById_idx" ON "amplification"("createdById");

-- CreateIndex
CREATE INDEX "amplification_tenantId_isGlobal_idx" ON "amplification"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "amplification_questionTypeId_idx" ON "amplification"("questionTypeId");

-- CreateIndex
CREATE INDEX "amplification_deletedAt_idx" ON "amplification"("deletedAt");

-- CreateIndex
CREATE INDEX "amplification_academicChapterId_idx" ON "amplification"("academicChapterId");

-- CreateIndex
CREATE INDEX "amplification_subjectId_idx" ON "amplification"("subjectId");

-- CreateIndex
CREATE INDEX "amplification_difficulty_idx" ON "amplification"("difficulty");

-- CreateIndex
CREATE INDEX "cs_createdById_idx" ON "cs"("createdById");

-- CreateIndex
CREATE INDEX "cs_tenantId_isGlobal_idx" ON "cs"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "cs_questionTypeId_idx" ON "cs"("questionTypeId");

-- CreateIndex
CREATE INDEX "cs_deletedAt_idx" ON "cs"("deletedAt");

-- CreateIndex
CREATE INDEX "cs_subjectId_chapterId_idx" ON "cs"("subjectId", "chapterId");

-- CreateIndex
CREATE INDEX "cs_chapterId_idx" ON "cs"("chapterId");

-- CreateIndex
CREATE INDEX "cs_subjectId_idx" ON "cs"("subjectId");

-- CreateIndex
CREATE INDEX "cs_difficulty_idx" ON "cs"("difficulty");

-- CreateIndex
CREATE INDEX "letter_createdById_idx" ON "letter"("createdById");

-- CreateIndex
CREATE INDEX "letter_tenantId_isGlobal_idx" ON "letter"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "letter_questionTypeId_idx" ON "letter"("questionTypeId");

-- CreateIndex
CREATE INDEX "letter_deletedAt_idx" ON "letter"("deletedAt");

-- CreateIndex
CREATE INDEX "letter_subjectId_idx" ON "letter"("subjectId");

-- CreateIndex
CREATE INDEX "letter_difficulty_idx" ON "letter"("difficulty");

-- CreateIndex
CREATE INDEX "application_createdById_idx" ON "application"("createdById");

-- CreateIndex
CREATE INDEX "application_tenantId_isGlobal_idx" ON "application"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "application_questionTypeId_idx" ON "application"("questionTypeId");

-- CreateIndex
CREATE INDEX "application_deletedAt_idx" ON "application"("deletedAt");

-- CreateIndex
CREATE INDEX "application_subjectId_idx" ON "application"("subjectId");

-- CreateIndex
CREATE INDEX "application_difficulty_idx" ON "application"("difficulty");

-- CreateIndex
CREATE INDEX "summary_createdById_idx" ON "summary"("createdById");

-- CreateIndex
CREATE INDEX "summary_tenantId_isGlobal_idx" ON "summary"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "summary_questionTypeId_idx" ON "summary"("questionTypeId");

-- CreateIndex
CREATE INDEX "summary_deletedAt_idx" ON "summary"("deletedAt");

-- CreateIndex
CREATE INDEX "summary_subjectId_idx" ON "summary"("subjectId");

-- CreateIndex
CREATE INDEX "summary_difficulty_idx" ON "summary"("difficulty");

-- CreateIndex
CREATE INDEX "essence_createdById_idx" ON "essence"("createdById");

-- CreateIndex
CREATE INDEX "essence_tenantId_isGlobal_idx" ON "essence"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "essence_questionTypeId_idx" ON "essence"("questionTypeId");

-- CreateIndex
CREATE INDEX "essence_deletedAt_idx" ON "essence"("deletedAt");

-- CreateIndex
CREATE INDEX "essence_subjectId_idx" ON "essence"("subjectId");

-- CreateIndex
CREATE INDEX "essence_difficulty_idx" ON "essence"("difficulty");

-- CreateIndex
CREATE INDEX "thought_expansion_createdById_idx" ON "thought_expansion"("createdById");

-- CreateIndex
CREATE INDEX "thought_expansion_tenantId_isGlobal_idx" ON "thought_expansion"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "thought_expansion_questionTypeId_idx" ON "thought_expansion"("questionTypeId");

-- CreateIndex
CREATE INDEX "thought_expansion_deletedAt_idx" ON "thought_expansion"("deletedAt");

-- CreateIndex
CREATE INDEX "thought_expansion_subjectId_idx" ON "thought_expansion"("subjectId");

-- CreateIndex
CREATE INDEX "thought_expansion_difficulty_idx" ON "thought_expansion"("difficulty");

-- CreateIndex
CREATE INDEX "news_report_createdById_idx" ON "news_report"("createdById");

-- CreateIndex
CREATE INDEX "news_report_tenantId_isGlobal_idx" ON "news_report"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "news_report_questionTypeId_idx" ON "news_report"("questionTypeId");

-- CreateIndex
CREATE INDEX "news_report_deletedAt_idx" ON "news_report"("deletedAt");

-- CreateIndex
CREATE INDEX "news_report_subjectId_idx" ON "news_report"("subjectId");

-- CreateIndex
CREATE INDEX "news_report_difficulty_idx" ON "news_report"("difficulty");

-- CreateIndex
CREATE INDEX "essay_createdById_idx" ON "essay"("createdById");

-- CreateIndex
CREATE INDEX "essay_tenantId_isGlobal_idx" ON "essay"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "essay_questionTypeId_idx" ON "essay"("questionTypeId");

-- CreateIndex
CREATE INDEX "essay_deletedAt_idx" ON "essay"("deletedAt");

-- CreateIndex
CREATE INDEX "essay_subjectId_idx" ON "essay"("subjectId");

-- CreateIndex
CREATE INDEX "essay_difficulty_idx" ON "essay"("difficulty");

-- CreateIndex
CREATE INDEX "question_report_entityType_entityId_idx" ON "question_report"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "question_report_status_idx" ON "question_report"("status");

-- CreateIndex
CREATE INDEX "question_report_reportedById_idx" ON "question_report"("reportedById");

-- CreateIndex
CREATE INDEX "question_report_resolvedById_idx" ON "question_report"("resolvedById");

-- CreateIndex
CREATE INDEX "_RoleToUser_B_index" ON "_RoleToUser"("B");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant" ADD CONSTRAINT "tenant_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "division"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant" ADD CONSTRAINT "tenant_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "district"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant" ADD CONSTRAINT "tenant_upazilaId_fkey" FOREIGN KEY ("upazilaId") REFERENCES "upazila"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant" ADD CONSTRAINT "tenant_unionId_fkey" FOREIGN KEY ("unionId") REFERENCES "union"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant" ADD CONSTRAINT "tenant_currentFiscalYearId_fkey" FOREIGN KEY ("currentFiscalYearId") REFERENCES "fiscal_year"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant" ADD CONSTRAINT "tenant_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_member" ADD CONSTRAINT "tenant_member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_member" ADD CONSTRAINT "tenant_member_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_invitation" ADD CONSTRAINT "tenant_invitation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_transaction" ADD CONSTRAINT "credit_transaction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_history" ADD CONSTRAINT "subscription_history_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiscal_year" ADD CONSTRAINT "fiscal_year_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "district" ADD CONSTRAINT "district_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "division"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upazila" ADD CONSTRAINT "upazila_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "district"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "union" ADD CONSTRAINT "union_upazilaId_fkey" FOREIGN KEY ("upazilaId") REFERENCES "upazila"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_upazilaId_fkey" FOREIGN KEY ("upazilaId") REFERENCES "upazila"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_subject" ADD CONSTRAINT "academic_subject_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_year"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_class_subject" ADD CONSTRAINT "academic_class_subject_classId_fkey" FOREIGN KEY ("classId") REFERENCES "academic_class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_class_subject" ADD CONSTRAINT "academic_class_subject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_chapter" ADD CONSTRAINT "academic_chapter_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_chapter" ADD CONSTRAINT "academic_chapter_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_year"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_question_type" ADD CONSTRAINT "subject_question_type_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_question_type" ADD CONSTRAINT "subject_question_type_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_question_type" ADD CONSTRAINT "subject_question_type_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "subject_question_section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_question_type" ADD CONSTRAINT "subject_question_type_subSectionId_fkey" FOREIGN KEY ("subSectionId") REFERENCES "subject_question_sub_section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_question_section" ADD CONSTRAINT "subject_question_section_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_question_sub_section" ADD CONSTRAINT "subject_question_sub_section_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "subject_question_section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mcq" ADD CONSTRAINT "mcq_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mcq" ADD CONSTRAINT "mcq_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "academic_chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mcq" ADD CONSTRAINT "mcq_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mcq" ADD CONSTRAINT "mcq_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mcq" ADD CONSTRAINT "mcq_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mcq" ADD CONSTRAINT "mcq_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cq" ADD CONSTRAINT "cq_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cq" ADD CONSTRAINT "cq_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "academic_chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cq" ADD CONSTRAINT "cq_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cq" ADD CONSTRAINT "cq_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cq" ADD CONSTRAINT "cq_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cq" ADD CONSTRAINT "cq_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_attachment" ADD CONSTRAINT "question_attachment_mcqId_fkey" FOREIGN KEY ("mcqId") REFERENCES "mcq"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_attachment" ADD CONSTRAINT "question_attachment_cqId_fkey" FOREIGN KEY ("cqId") REFERENCES "cq"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_attachment" ADD CONSTRAINT "question_attachment_shortAnswerId_fkey" FOREIGN KEY ("shortAnswerId") REFERENCES "short_answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cq_answer" ADD CONSTRAINT "cq_answer_cqId_fkey" FOREIGN KEY ("cqId") REFERENCES "cq"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "short_answer" ADD CONSTRAINT "short_answer_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "short_answer" ADD CONSTRAINT "short_answer_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "academic_chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "short_answer" ADD CONSTRAINT "short_answer_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "short_answer" ADD CONSTRAINT "short_answer_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "short_answer" ADD CONSTRAINT "short_answer_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "short_answer" ADD CONSTRAINT "short_answer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paragraph" ADD CONSTRAINT "paragraph_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paragraph" ADD CONSTRAINT "paragraph_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paragraph" ADD CONSTRAINT "paragraph_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paragraph" ADD CONSTRAINT "paragraph_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paragraph" ADD CONSTRAINT "paragraph_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paragraph" ADD CONSTRAINT "paragraph_academicChapterId_fkey" FOREIGN KEY ("academicChapterId") REFERENCES "academic_chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "amplification" ADD CONSTRAINT "amplification_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "amplification" ADD CONSTRAINT "amplification_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "amplification" ADD CONSTRAINT "amplification_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "amplification" ADD CONSTRAINT "amplification_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "amplification" ADD CONSTRAINT "amplification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "amplification" ADD CONSTRAINT "amplification_academicChapterId_fkey" FOREIGN KEY ("academicChapterId") REFERENCES "academic_chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cs" ADD CONSTRAINT "cs_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cs" ADD CONSTRAINT "cs_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "academic_chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cs" ADD CONSTRAINT "cs_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cs" ADD CONSTRAINT "cs_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cs" ADD CONSTRAINT "cs_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cs" ADD CONSTRAINT "cs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "letter" ADD CONSTRAINT "letter_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "letter" ADD CONSTRAINT "letter_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "letter" ADD CONSTRAINT "letter_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "letter" ADD CONSTRAINT "letter_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "letter" ADD CONSTRAINT "letter_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summary" ADD CONSTRAINT "summary_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summary" ADD CONSTRAINT "summary_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summary" ADD CONSTRAINT "summary_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summary" ADD CONSTRAINT "summary_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summary" ADD CONSTRAINT "summary_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "essence" ADD CONSTRAINT "essence_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "essence" ADD CONSTRAINT "essence_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "essence" ADD CONSTRAINT "essence_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "essence" ADD CONSTRAINT "essence_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "essence" ADD CONSTRAINT "essence_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thought_expansion" ADD CONSTRAINT "thought_expansion_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thought_expansion" ADD CONSTRAINT "thought_expansion_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thought_expansion" ADD CONSTRAINT "thought_expansion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thought_expansion" ADD CONSTRAINT "thought_expansion_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thought_expansion" ADD CONSTRAINT "thought_expansion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_report" ADD CONSTRAINT "news_report_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_report" ADD CONSTRAINT "news_report_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_report" ADD CONSTRAINT "news_report_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_report" ADD CONSTRAINT "news_report_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_report" ADD CONSTRAINT "news_report_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "essay" ADD CONSTRAINT "essay_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "essay" ADD CONSTRAINT "essay_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "essay" ADD CONSTRAINT "essay_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "essay" ADD CONSTRAINT "essay_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "essay" ADD CONSTRAINT "essay_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_report" ADD CONSTRAINT "question_report_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_report" ADD CONSTRAINT "question_report_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

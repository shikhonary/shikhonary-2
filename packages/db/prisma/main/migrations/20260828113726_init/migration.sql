-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
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
    "mark" DOUBLE PRECISION NOT NULL,
    "markDistribution" JSONB,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "requiredCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subject_question_type_pkey" PRIMARY KEY ("id")
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
    "contextId" TEXT,
    "difficulty" TEXT,
    "year" INTEGER,
    "source" TEXT,
    "popularityCount" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "questionTypeId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

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
    "year" INTEGER,
    "source" TEXT,
    "marks" JSONB,
    "popularityCount" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "questionTypeId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_attachment" (
    "id" TEXT NOT NULL,
    "mcqId" TEXT,
    "cqId" TEXT,
    "shortAnswerId" TEXT,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'image',
    "caption" TEXT,
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
    "year" INTEGER,
    "source" TEXT,
    "popularityCount" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "questionTypeId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "short_answer_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "user_email_idx" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_phoneNumber_idx" ON "user"("phoneNumber");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

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
CREATE INDEX "tenant_slug_idx" ON "tenant"("slug");

-- CreateIndex
CREATE INDEX "tenant_isActive_idx" ON "tenant"("isActive");

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
CREATE INDEX "tenant_member_userId_idx" ON "tenant_member"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_member_userId_tenantId_key" ON "tenant_member"("userId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_invitation_token_key" ON "tenant_invitation"("token");

-- CreateIndex
CREATE INDEX "tenant_invitation_email_idx" ON "tenant_invitation"("email");

-- CreateIndex
CREATE INDEX "tenant_invitation_status_idx" ON "tenant_invitation"("status");

-- CreateIndex
CREATE INDEX "tenant_invitation_tenantId_idx" ON "tenant_invitation"("tenantId");

-- CreateIndex
CREATE INDEX "tenant_invitation_token_idx" ON "tenant_invitation"("token");

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
CREATE INDEX "subscription_tenantId_idx" ON "subscription"("tenantId");

-- CreateIndex
CREATE INDEX "credit_transaction_tenantId_idx" ON "credit_transaction"("tenantId");

-- CreateIndex
CREATE INDEX "credit_transaction_type_idx" ON "credit_transaction"("type");

-- CreateIndex
CREATE INDEX "credit_transaction_createdAt_idx" ON "credit_transaction"("createdAt");

-- CreateIndex
CREATE INDEX "subscription_history_createdAt_idx" ON "subscription_history"("createdAt");

-- CreateIndex
CREATE INDEX "subscription_history_subscriptionId_idx" ON "subscription_history"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_invoiceNumber_key" ON "invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "invoice_dueDate_idx" ON "invoice"("dueDate");

-- CreateIndex
CREATE INDEX "invoice_invoiceNumber_idx" ON "invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "invoice_status_idx" ON "invoice"("status");

-- CreateIndex
CREATE INDEX "invoice_tenantId_idx" ON "invoice"("tenantId");

-- CreateIndex
CREATE INDEX "fiscal_year_tenantId_idx" ON "fiscal_year"("tenantId");

-- CreateIndex
CREATE INDEX "fiscal_year_isCurrent_idx" ON "fiscal_year"("isCurrent");

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
CREATE INDEX "academic_class_subject_classId_idx" ON "academic_class_subject"("classId");

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
CREATE INDEX "question_type_label_idx" ON "question_type"("label");

-- CreateIndex
CREATE INDEX "question_type_isActive_idx" ON "question_type"("isActive");

-- CreateIndex
CREATE INDEX "subject_question_type_subjectId_idx" ON "subject_question_type"("subjectId");

-- CreateIndex
CREATE INDEX "subject_question_type_questionTypeId_idx" ON "subject_question_type"("questionTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "subject_question_type_subjectId_questionTypeId_key" ON "subject_question_type"("subjectId", "questionTypeId");

-- CreateIndex
CREATE INDEX "mcq_chapterId_idx" ON "mcq"("chapterId");

-- CreateIndex
CREATE INDEX "mcq_chapterId_type_idx" ON "mcq"("chapterId", "type");

-- CreateIndex
CREATE INDEX "mcq_isMath_idx" ON "mcq"("isMath");

-- CreateIndex
CREATE INDEX "mcq_subjectId_chapterId_idx" ON "mcq"("subjectId", "chapterId");

-- CreateIndex
CREATE INDEX "mcq_subjectId_idx" ON "mcq"("subjectId");

-- CreateIndex
CREATE INDEX "mcq_subjectId_type_idx" ON "mcq"("subjectId", "type");

-- CreateIndex
CREATE INDEX "mcq_type_idx" ON "mcq"("type");

-- CreateIndex
CREATE INDEX "mcq_difficulty_idx" ON "mcq"("difficulty");

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
CREATE INDEX "short_answer_chapterId_idx" ON "short_answer"("chapterId");

-- CreateIndex
CREATE INDEX "short_answer_subjectId_idx" ON "short_answer"("subjectId");

-- CreateIndex
CREATE INDEX "short_answer_difficulty_idx" ON "short_answer"("difficulty");

-- CreateIndex
CREATE INDEX "question_report_entityType_entityId_idx" ON "question_report"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "question_report_status_idx" ON "question_report"("status");

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
ALTER TABLE "credit_transaction" ADD CONSTRAINT "credit_transaction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_history" ADD CONSTRAINT "subscription_history_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiscal_year" ADD CONSTRAINT "fiscal_year_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "district" ADD CONSTRAINT "district_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "division"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upazila" ADD CONSTRAINT "upazila_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "district"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "union" ADD CONSTRAINT "union_upazilaId_fkey" FOREIGN KEY ("upazilaId") REFERENCES "upazila"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_upazilaId_fkey" FOREIGN KEY ("upazilaId") REFERENCES "upazila"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_subject" ADD CONSTRAINT "academic_subject_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_year"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_class_subject" ADD CONSTRAINT "academic_class_subject_classId_fkey" FOREIGN KEY ("classId") REFERENCES "academic_class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_class_subject" ADD CONSTRAINT "academic_class_subject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_chapter" ADD CONSTRAINT "academic_chapter_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_chapter" ADD CONSTRAINT "academic_chapter_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_year"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_question_type" ADD CONSTRAINT "subject_question_type_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_question_type" ADD CONSTRAINT "subject_question_type_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mcq" ADD CONSTRAINT "mcq_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mcq" ADD CONSTRAINT "mcq_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "academic_chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mcq" ADD CONSTRAINT "mcq_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cq" ADD CONSTRAINT "cq_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cq" ADD CONSTRAINT "cq_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "academic_chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cq" ADD CONSTRAINT "cq_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

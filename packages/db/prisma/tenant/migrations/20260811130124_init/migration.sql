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
CREATE TABLE "ward" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_payer" (
    "id" TEXT NOT NULL,
    "holding" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fatherName" TEXT,
    "phone" TEXT,
    "nid" TEXT,
    "wardId" TEXT NOT NULL,
    "village" TEXT NOT NULL,
    "tax" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_payer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_payment" (
    "id" TEXT NOT NULL,
    "taxPayerId" TEXT NOT NULL,
    "fiscalYearId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "receiptNo" TEXT,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethod" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "citizen_address" (
    "id" TEXT NOT NULL,
    "villageEn" TEXT,
    "villageBn" TEXT NOT NULL,
    "roadEn" TEXT,
    "roadBn" TEXT,
    "holdingNo" TEXT,
    "wardId" TEXT NOT NULL,
    "divisionId" TEXT NOT NULL,
    "divisionNameBn" TEXT NOT NULL,
    "divisionNameEn" TEXT,
    "districtId" TEXT NOT NULL,
    "districtNameBn" TEXT NOT NULL,
    "districtNameEn" TEXT,
    "upazilaId" TEXT NOT NULL,
    "upazilaNameBn" TEXT NOT NULL,
    "upazilaNameEn" TEXT,
    "unionId" TEXT NOT NULL,
    "unionNameBn" TEXT NOT NULL,
    "unionNameEn" TEXT,
    "postId" TEXT NOT NULL,
    "postOfficeBn" TEXT NOT NULL,
    "postOfficeEn" TEXT,
    "postCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "citizen_address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "citizen" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "nid" TEXT,
    "birthRegNo" TEXT,
    "passportNo" TEXT,
    "nameEn" TEXT,
    "nameBn" TEXT NOT NULL,
    "dob" TIMESTAMP(3),
    "fatherNameEn" TEXT,
    "fatherNameBn" TEXT NOT NULL,
    "motherNameEn" TEXT,
    "motherNameBn" TEXT NOT NULL,
    "occupation" TEXT,
    "residentType" TEXT NOT NULL,
    "education" TEXT,
    "religion" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "maritalStatus" TEXT NOT NULL,
    "presentAddressId" TEXT NOT NULL,
    "sameAsPresent" BOOLEAN NOT NULL DEFAULT false,
    "permanentAddressId" TEXT,
    "mobile" TEXT NOT NULL,
    "email" TEXT,
    "commentsEn" TEXT,
    "commentsBn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "citizen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "citizen_application_address" (
    "id" TEXT NOT NULL,
    "villageEn" TEXT,
    "villageBn" TEXT NOT NULL,
    "roadEn" TEXT,
    "roadBn" TEXT,
    "holdingNo" TEXT,
    "wardId" TEXT NOT NULL,
    "divisionId" TEXT NOT NULL,
    "divisionNameBn" TEXT NOT NULL,
    "divisionNameEn" TEXT,
    "districtId" TEXT NOT NULL,
    "districtNameBn" TEXT NOT NULL,
    "districtNameEn" TEXT,
    "upazilaId" TEXT NOT NULL,
    "upazilaNameBn" TEXT NOT NULL,
    "upazilaNameEn" TEXT,
    "unionId" TEXT NOT NULL,
    "unionNameBn" TEXT NOT NULL,
    "unionNameEn" TEXT,
    "postId" TEXT NOT NULL,
    "postOfficeBn" TEXT NOT NULL,
    "postOfficeEn" TEXT,
    "postCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "citizen_application_address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "citizen_application" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "nid" TEXT,
    "birthRegNo" TEXT,
    "passportNo" TEXT,
    "nameEn" TEXT,
    "nameBn" TEXT NOT NULL,
    "dob" TIMESTAMP(3),
    "fatherNameEn" TEXT,
    "fatherNameBn" TEXT NOT NULL,
    "motherNameEn" TEXT,
    "motherNameBn" TEXT NOT NULL,
    "occupation" TEXT,
    "residentType" TEXT NOT NULL,
    "education" TEXT,
    "religion" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "maritalStatus" TEXT NOT NULL,
    "presentAddressId" TEXT NOT NULL,
    "sameAsPresent" BOOLEAN NOT NULL DEFAULT false,
    "permanentAddressId" TEXT,
    "mobile" TEXT NOT NULL,
    "email" TEXT,
    "commentsEn" TEXT,
    "commentsBn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "citizen_application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fiscal_year_tenantId_idx" ON "fiscal_year"("tenantId");

-- CreateIndex
CREATE INDEX "fiscal_year_isCurrent_idx" ON "fiscal_year"("isCurrent");

-- CreateIndex
CREATE INDEX "tax_payer_wardId_idx" ON "tax_payer"("wardId");

-- CreateIndex
CREATE INDEX "tax_payer_nid_idx" ON "tax_payer"("nid");

-- CreateIndex
CREATE INDEX "tax_payer_phone_idx" ON "tax_payer"("phone");

-- CreateIndex
CREATE INDEX "tax_payer_holding_idx" ON "tax_payer"("holding");

-- CreateIndex
CREATE INDEX "tax_payment_taxPayerId_idx" ON "tax_payment"("taxPayerId");

-- CreateIndex
CREATE INDEX "tax_payment_fiscalYearId_idx" ON "tax_payment"("fiscalYearId");

-- CreateIndex
CREATE INDEX "citizen_address_wardId_idx" ON "citizen_address"("wardId");

-- CreateIndex
CREATE UNIQUE INDEX "citizen_nid_key" ON "citizen"("nid");

-- CreateIndex
CREATE UNIQUE INDEX "citizen_birthRegNo_key" ON "citizen"("birthRegNo");

-- CreateIndex
CREATE UNIQUE INDEX "citizen_passportNo_key" ON "citizen"("passportNo");

-- CreateIndex
CREATE UNIQUE INDEX "citizen_presentAddressId_key" ON "citizen"("presentAddressId");

-- CreateIndex
CREATE UNIQUE INDEX "citizen_permanentAddressId_key" ON "citizen"("permanentAddressId");

-- CreateIndex
CREATE INDEX "citizen_mobile_idx" ON "citizen"("mobile");

-- CreateIndex
CREATE INDEX "citizen_application_address_wardId_idx" ON "citizen_application_address"("wardId");

-- CreateIndex
CREATE UNIQUE INDEX "citizen_application_presentAddressId_key" ON "citizen_application"("presentAddressId");

-- CreateIndex
CREATE UNIQUE INDEX "citizen_application_permanentAddressId_key" ON "citizen_application"("permanentAddressId");

-- CreateIndex
CREATE INDEX "citizen_application_nid_idx" ON "citizen_application"("nid");

-- CreateIndex
CREATE INDEX "citizen_application_birthRegNo_idx" ON "citizen_application"("birthRegNo");

-- CreateIndex
CREATE INDEX "citizen_application_passportNo_idx" ON "citizen_application"("passportNo");

-- CreateIndex
CREATE INDEX "citizen_application_mobile_idx" ON "citizen_application"("mobile");

-- CreateIndex
CREATE INDEX "citizen_application_status_createdAt_idx" ON "citizen_application"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "tax_payer" ADD CONSTRAINT "tax_payer_wardId_fkey" FOREIGN KEY ("wardId") REFERENCES "ward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_payment" ADD CONSTRAINT "tax_payment_taxPayerId_fkey" FOREIGN KEY ("taxPayerId") REFERENCES "tax_payer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_payment" ADD CONSTRAINT "tax_payment_fiscalYearId_fkey" FOREIGN KEY ("fiscalYearId") REFERENCES "fiscal_year"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citizen_address" ADD CONSTRAINT "citizen_address_wardId_fkey" FOREIGN KEY ("wardId") REFERENCES "ward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citizen" ADD CONSTRAINT "citizen_presentAddressId_fkey" FOREIGN KEY ("presentAddressId") REFERENCES "citizen_address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citizen" ADD CONSTRAINT "citizen_permanentAddressId_fkey" FOREIGN KEY ("permanentAddressId") REFERENCES "citizen_address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citizen_application_address" ADD CONSTRAINT "citizen_application_address_wardId_fkey" FOREIGN KEY ("wardId") REFERENCES "ward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citizen_application" ADD CONSTRAINT "citizen_application_presentAddressId_fkey" FOREIGN KEY ("presentAddressId") REFERENCES "citizen_application_address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citizen_application" ADD CONSTRAINT "citizen_application_permanentAddressId_fkey" FOREIGN KEY ("permanentAddressId") REFERENCES "citizen_application_address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "tax_payer" ADD CONSTRAINT "tax_payer_wardId_fkey" FOREIGN KEY ("wardId") REFERENCES "Ward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_payment" ADD CONSTRAINT "tax_payment_taxPayerId_fkey" FOREIGN KEY ("taxPayerId") REFERENCES "tax_payer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_payment" ADD CONSTRAINT "tax_payment_fiscalYearId_fkey" FOREIGN KEY ("fiscalYearId") REFERENCES "fiscal_year"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

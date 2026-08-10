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

-- CreateIndex
CREATE INDEX "fiscal_year_tenantId_idx" ON "fiscal_year"("tenantId");

-- CreateIndex
CREATE INDEX "fiscal_year_isCurrent_idx" ON "fiscal_year"("isCurrent");

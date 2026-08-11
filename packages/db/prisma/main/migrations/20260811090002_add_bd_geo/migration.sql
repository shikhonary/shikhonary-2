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
    "postCode" TEXT NOT NULL,
    "upazilaId" TEXT NOT NULL,

    CONSTRAINT "post_pkey" PRIMARY KEY ("id")
);

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

-- AddForeignKey
ALTER TABLE "district" ADD CONSTRAINT "district_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "division"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upazila" ADD CONSTRAINT "upazila_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "district"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "union" ADD CONSTRAINT "union_upazilaId_fkey" FOREIGN KEY ("upazilaId") REFERENCES "upazila"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_upazilaId_fkey" FOREIGN KEY ("upazilaId") REFERENCES "upazila"("id") ON DELETE CASCADE ON UPDATE CASCADE;

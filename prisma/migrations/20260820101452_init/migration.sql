-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'ACCOUNTANT', 'REVIEWER', 'CLIENT');

-- CreateEnum
CREATE TYPE "SourceKind" AS ENUM ('ONEC_EXCEL', 'BANK_STATEMENT', 'EQAIME', 'VAT_RETURN', 'PAYROLL_DSMF', 'FIXED_ASSETS', 'PRIOR_PROFIT', 'MANUAL');

-- CreateEnum
CREATE TYPE "ParseStatus" AS ENUM ('OK', 'REVIEW', 'FAILED');

-- CreateEnum
CREATE TYPE "Deductibility" AS ENUM ('DEDUCT', 'NONDEDUCT', 'LIMIT', 'ADJUST');

-- CreateEnum
CREATE TYPE "DeclarationStatus" AS ENUM ('DRAFT', 'REVIEW', 'APPROVED', 'READY', 'SUBMITTED');

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" "Role" NOT NULL DEFAULT 'ACCOUNTANT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "voen" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "CompanyAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxPeriod" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "taxYear" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceFile" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "kind" "SourceKind" NOT NULL,
    "fileName" TEXT NOT NULL,
    "status" "ParseStatus" NOT NULL DEFAULT 'REVIEW',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "meta" JSONB,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SourceFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerLine" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "sourceId" TEXT,
    "account" TEXT,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "direction" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3),

    CONSTRAINT "LedgerLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Classification" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "ledgerLineId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "suggested" "Deductibility" NOT NULL,
    "confirmed" "Deductibility",
    "normFlag" BOOLEAN NOT NULL DEFAULT false,
    "confirmedById" TEXT,
    "confirmedAt" TIMESTAMP(3),

    CONSTRAINT "Classification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BridgeRun" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "bridgeKey" TEXT NOT NULL,
    "startValue" DECIMAL(18,2) NOT NULL,
    "expected" DECIMAL(18,2) NOT NULL,
    "actual" DECIMAL(18,2) NOT NULL,
    "residual" DECIMAL(18,2) NOT NULL,
    "flagged" BOOLEAN NOT NULL,
    "lines" JSONB NOT NULL,
    "ranAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BridgeRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Declaration" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'PROFIT',
    "status" "DeclarationStatus" NOT NULL DEFAULT 'DRAFT',
    "cells" JSONB NOT NULL,
    "rulesetYear" INTEGER NOT NULL,
    "snapshot" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),

    CONSTRAINT "Declaration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "detail" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");

-- CreateIndex
CREATE INDEX "Company_tenantId_idx" ON "Company"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_tenantId_voen_key" ON "Company"("tenantId", "voen");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyAssignment_userId_companyId_key" ON "CompanyAssignment"("userId", "companyId");

-- CreateIndex
CREATE INDEX "TaxPeriod_companyId_idx" ON "TaxPeriod"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxPeriod_companyId_taxYear_label_key" ON "TaxPeriod"("companyId", "taxYear", "label");

-- CreateIndex
CREATE INDEX "SourceFile_periodId_idx" ON "SourceFile"("periodId");

-- CreateIndex
CREATE INDEX "LedgerLine_periodId_idx" ON "LedgerLine"("periodId");

-- CreateIndex
CREATE UNIQUE INDEX "Classification_ledgerLineId_key" ON "Classification"("ledgerLineId");

-- CreateIndex
CREATE INDEX "Classification_periodId_idx" ON "Classification"("periodId");

-- CreateIndex
CREATE INDEX "BridgeRun_periodId_bridgeKey_idx" ON "BridgeRun"("periodId", "bridgeKey");

-- CreateIndex
CREATE INDEX "Declaration_periodId_idx" ON "Declaration"("periodId");

-- CreateIndex
CREATE INDEX "AuditEvent_userId_idx" ON "AuditEvent"("userId");

-- CreateIndex
CREATE INDEX "AuditEvent_entityType_entityId_idx" ON "AuditEvent"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyAssignment" ADD CONSTRAINT "CompanyAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyAssignment" ADD CONSTRAINT "CompanyAssignment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxPeriod" ADD CONSTRAINT "TaxPeriod_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceFile" ADD CONSTRAINT "SourceFile_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "TaxPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerLine" ADD CONSTRAINT "LedgerLine_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "TaxPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerLine" ADD CONSTRAINT "LedgerLine_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "SourceFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classification" ADD CONSTRAINT "Classification_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "TaxPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classification" ADD CONSTRAINT "Classification_ledgerLineId_fkey" FOREIGN KEY ("ledgerLineId") REFERENCES "LedgerLine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BridgeRun" ADD CONSTRAINT "BridgeRun_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "TaxPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Declaration" ADD CONSTRAINT "Declaration_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "TaxPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

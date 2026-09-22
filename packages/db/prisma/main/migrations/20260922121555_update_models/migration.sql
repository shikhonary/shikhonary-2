-- AlterTable
ALTER TABLE "credit_transaction" ADD COLUMN     "metadata" JSONB NOT NULL DEFAULT '{}';

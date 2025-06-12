/*
  Warnings:

  - A unique constraint covering the columns `[concepto]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "tipo" TEXT NOT NULL DEFAULT 'ingreso';

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_concepto_key" ON "Transaction"("concepto");

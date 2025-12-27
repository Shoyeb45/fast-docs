/*
  Warnings:

  - A unique constraint covering the columns `[github_username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `github_username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "github_username" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "keystores" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "primary_key" TEXT NOT NULL,
    "secondary_key" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "keystores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "keystores_client_id_idx" ON "keystores"("client_id");

-- CreateIndex
CREATE INDEX "keystores_client_id_primary_key_status_idx" ON "keystores"("client_id", "primary_key", "status");

-- CreateIndex
CREATE INDEX "keystores_client_id_primary_key_secondary_key_idx" ON "keystores"("client_id", "primary_key", "secondary_key");

-- CreateIndex
CREATE UNIQUE INDEX "User_github_username_key" ON "User"("github_username");

-- CreateIndex
CREATE INDEX "User_github_username_idx" ON "User"("github_username");

-- AddForeignKey
ALTER TABLE "keystores" ADD CONSTRAINT "keystores_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

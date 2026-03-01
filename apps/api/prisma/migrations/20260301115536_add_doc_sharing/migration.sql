/*
  Warnings:

  - A unique constraint covering the columns `[share_token]` on the table `Doc` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Doc" ADD COLUMN     "share_for_all" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "share_token" TEXT;

-- CreateTable
CREATE TABLE "doc_shares" (
    "id" SERIAL NOT NULL,
    "doc_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doc_shares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "doc_shares_doc_id_idx" ON "doc_shares"("doc_id");

-- CreateIndex
CREATE INDEX "doc_shares_user_id_idx" ON "doc_shares"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "doc_shares_doc_id_user_id_key" ON "doc_shares"("doc_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Doc_share_token_key" ON "Doc"("share_token");

-- CreateIndex
CREATE INDEX "Doc_share_token_idx" ON "Doc"("share_token");

-- AddForeignKey
ALTER TABLE "doc_shares" ADD CONSTRAINT "doc_shares_doc_id_fkey" FOREIGN KEY ("doc_id") REFERENCES "Doc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doc_shares" ADD CONSTRAINT "doc_shares_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

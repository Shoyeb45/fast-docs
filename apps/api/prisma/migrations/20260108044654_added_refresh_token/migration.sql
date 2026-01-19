-- AlterTable
ALTER TABLE "keystores" ADD COLUMN     "device_fingerprint" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "refresh_token" TEXT NOT NULL DEFAULT '';

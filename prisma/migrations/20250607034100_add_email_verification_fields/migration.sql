-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reset_expires_at" TIMESTAMP(3),
ADD COLUMN     "reset_token" VARCHAR(64),
ADD COLUMN     "verification_expires_at" TIMESTAMP(3),
ADD COLUMN     "verification_token" VARCHAR(64);

-- CreateIndex
CREATE INDEX "Users_verification_token_idx" ON "Users"("verification_token");

-- CreateIndex
CREATE INDEX "Users_reset_token_idx" ON "Users"("reset_token");

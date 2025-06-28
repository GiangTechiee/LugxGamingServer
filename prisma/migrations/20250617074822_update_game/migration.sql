-- AlterTable
ALTER TABLE "Games" ADD COLUMN     "is_hot" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Games_is_hot_idx" ON "Games"("is_hot");

-- CreateIndex
CREATE INDEX "Games_updated_at_idx" ON "Games"("updated_at");

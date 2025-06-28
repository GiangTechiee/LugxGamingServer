/*
  Warnings:

  - You are about to drop the column `discount_applied` on the `Order_Items` table. All the data in the column will be lost.
  - You are about to drop the column `unit_price` on the `Order_Items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order_Items" DROP COLUMN "discount_applied",
DROP COLUMN "unit_price";

-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "discounted_amount" DECIMAL(12,2);

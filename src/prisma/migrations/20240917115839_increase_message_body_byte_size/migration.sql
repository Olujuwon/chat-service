/*
  Warnings:

  - Changed the type of `body` on the `messages` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "messages" DROP COLUMN "body";
ALTER TABLE "messages" ADD COLUMN     "body" STRING(5000) NOT NULL;

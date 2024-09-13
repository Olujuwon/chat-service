/*
  Warnings:

  - A unique constraint covering the columns `[userId,contactId]` on the table `user-contacts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "user-contacts_userId_contactId_key" ON "user-contacts"("userId", "contactId");

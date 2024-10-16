-- DropForeignKey
ALTER TABLE "user-contacts" DROP CONSTRAINT "user-contacts_contactId_fkey";

-- DropForeignKey
ALTER TABLE "user-contacts" DROP CONSTRAINT "user-contacts_userId_fkey";

-- AddForeignKey
ALTER TABLE "user-contacts" ADD CONSTRAINT "user-contacts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user-contacts" ADD CONSTRAINT "user-contacts_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "chat_threads" DROP CONSTRAINT "chat_threads_proposal_id_fkey";

-- DropForeignKey
ALTER TABLE "proposal_selections" DROP CONSTRAINT "proposal_selections_proposal_id_fkey";

-- DropForeignKey
ALTER TABLE "teams" DROP CONSTRAINT "teams_proposal_id_fkey";

-- AlterTable
ALTER TABLE "chat_threads" ALTER COLUMN "proposal_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "proposal_selections" ALTER COLUMN "proposal_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "proposals" ADD COLUMN     "attachment_url" TEXT;

-- AlterTable
ALTER TABLE "team_members" ADD COLUMN     "is_leader" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "teams" ALTER COLUMN "proposal_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "proposal_selections" ADD CONSTRAINT "proposal_selections_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_threads" ADD CONSTRAINT "chat_threads_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

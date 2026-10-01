/*
  Warnings:

  - You are about to drop the column `options` on the `fill_in_the_blanks_without_clues` table. All the data in the column will be lost.
  - Added the required column `clue` to the `fill_in_the_blanks_without_clues` table without a default value. This is not possible if the table is not empty.
  - Made the column `content` on table `fill_in_the_blanks_without_clues` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "fill_in_the_blanks_without_clues" DROP COLUMN "options",
ADD COLUMN     "clue" TEXT NOT NULL,
ALTER COLUMN "content" SET NOT NULL;

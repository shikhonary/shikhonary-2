import { config } from "dotenv"
import { resolve } from "node:path"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/main/client.js"

// Load env from workspace root .env or package .env
config({ path: resolve(import.meta.dirname, "../../../.env") })
config({ path: resolve(import.meta.dirname, "../.env") })
config()

const connectionString = process.env.MAIN_DATABASE_URL || process.env.DATABASE_URL
if (!connectionString) {
  console.error("\x1b[31m✖ MAIN_DATABASE_URL or DATABASE_URL is not set in environment.\x1b[0m")
  process.exit(1)
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function cleanAttachmentCaptions() {
  const isDryRun = process.argv.includes("--dry-run")

  console.log("\n\x1b[36m━━━ Question Attachment Caption Cleanup ━━━\x1b[0m")
  console.log(`Mode: ${isDryRun ? "\x1b[33mDRY RUN (no database changes)\x1b[0m" : "\x1b[32mLIVE RUN (updating database)\x1b[0m"}`)
  console.log('Target caption to set to null: "উদ্দীপক"\n')

  try {
    // Find all QuestionAttachments where caption is "উদ্দীপক" or contains "উদ্দীপক"
    const allMatching = await prisma.questionAttachment.findMany({
      where: {
        caption: {
          contains: "উদ্দীপক",
        },
      },
      select: {
        id: true,
        type: true,
        caption: true,
        mcqId: true,
        cqId: true,
        content: true,
        mcq: {
          select: {
            id: true,
            question: true,
          },
        },
      },
    })

    console.log(`Total attachments with caption containing "উদ্দীপক": ${allMatching.length}`)
    for (const a of allMatching) {
      console.log(`- ID: ${a.id} | Caption: "${a.caption?.slice(0, 30)}" | Content: "${a.content?.slice(0, 30)}" | MCQ: ${a.mcqId} | CQ: ${a.cqId}`)
    }

    const targetAttachments = allMatching.filter((a) => a.caption?.trim() === "উদ্দীপক")
    console.log(`\nFiltered exact match caption === "উদ্দীপক": ${targetAttachments.length} attachment(s).`)

    if (targetAttachments.length === 0) {
      console.log("\x1b[32m✔ No attachments found with caption 'উদ্দীপক'. Already clean!\x1b[0m\n")
      return
    }

    console.log("\nDetails of matching attachments:")
    for (const [idx, att] of targetAttachments.entries()) {
      const parent = att.mcqId ? `MCQ (${att.mcqId})` : att.cqId ? `CQ (${att.cqId})` : "Other"
      const questionSnippet = att.mcq?.question ? att.mcq.question.slice(0, 50) + "..." : "N/A"
      console.log(`  ${idx + 1}. ID: ${att.id} | Caption: "${att.caption}" | Parent: ${parent} | Q: ${questionSnippet}`)
    }

    if (!isDryRun) {
      const updateResult = await prisma.questionAttachment.updateMany({
        where: {
          id: {
            in: targetAttachments.map((a) => a.id),
          },
        },
        data: {
          caption: null,
        },
      })

      console.log(`\n\x1b[32m✔ Successfully updated ${updateResult.count} attachment(s). Captions set to null.\x1b[0m\n`)
    } else {
      console.log(`\n\x1b[33m[DRY RUN] Would set caption to null for ${targetAttachments.length} attachment(s).\x1b[0m\n`)
    }
  } catch (error) {
    console.error("\x1b[31m✖ Error during cleanup:\x1b[0m", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

cleanAttachmentCaptions()

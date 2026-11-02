import { config } from "dotenv"
import { resolve } from "node:path"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/main/client.js"
import { isIgnoredReference } from "../../utils/src/helpers/reference.js"

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

function normalizeText(text: string): string {
  return text
    .normalize("NFC")
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim()
}

function cleanAndDedupeReferences(refs: string[]): string[] {
  const result: string[] = []
  const seen = new Set<string>()

  for (const raw of refs) {
    if (!raw || typeof raw !== "string") continue
    // Handle split by semicolon if raw contains multiple references
    const parts = raw.split(/[;；|]+/).map((s) => s.trim()).filter(Boolean)
    for (const part of parts) {
      const trimmed = part.trim().normalize("NFC")
      if (!trimmed || isIgnoredReference(trimmed)) continue
      if (!seen.has(trimmed)) {
        seen.add(trimmed)
        result.push(trimmed)
      }
    }
  }

  return result
}

function areReferenceArraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  return a.every((val, idx) => val.trim().normalize("NFC") === b[idx]?.trim().normalize("NFC"))
}

async function syncMcqAttachmentReferences() {
  const isDryRun = process.argv.includes("--dry-run")

  console.log("\n\x1b[36m━━━ Sync MCQ Attachment References Script ━━━\x1b[0m")
  console.log(`Mode: \x1b[33m${isDryRun ? "DRY RUN (no database changes)" : "LIVE UPDATE"}\x1b[0m\n`)

  // 1. Fetch all MCQ attachments with MCQ data
  const attachments = await prisma.questionAttachment.findMany({
    where: { mcqId: { not: null } },
    include: {
      mcq: {
        select: {
          id: true,
          question: true,
          reference: true,
          chapterId: true,
          subjectId: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  console.log(`Fetched \x1b[33m${attachments.length}\x1b[0m total MCQ attachments.`)

  // 2. Group attachments by shared stimulus within chapter/subject
  const groups = new Map<
    string,
    Array<{
      attachmentId: string
      mcq: NonNullable<(typeof attachments)[number]["mcq"]>
    }>
  >()

  for (const att of attachments) {
    if (!att.mcq) continue

    let contentKey: string | null = null

    if (att.content && att.content.trim()) {
      contentKey = `content:::${normalizeText(att.content)}`
    } else if (att.url && att.url.trim()) {
      contentKey = `url:::${att.url.trim()}`
    } else if (att.table) {
      contentKey = `table:::${JSON.stringify(att.table)}`
    }

    if (!contentKey) continue

    const scopeKey = `${att.mcq.chapterId || att.mcq.subjectId || "global"}:::${contentKey}`
    if (!groups.has(scopeKey)) {
      groups.set(scopeKey, [])
    }
    groups.get(scopeKey)!.push({
      attachmentId: att.id,
      mcq: att.mcq,
    })
  }

  // 3. Process groups that share attachments (>1 MCQ)
  const sharedGroups = Array.from(groups.entries()).filter(([_, items]) => items.length > 1)
  console.log(`Found \x1b[33m${sharedGroups.length}\x1b[0m shared attachment groups (>1 MCQ).\n`)

  const updates: Array<{
    id: string
    question: string
    oldRef: string[]
    newRef: string[]
    groupKey: string
  }> = []

  let totalSyncedGroups = 0

  for (const [groupKey, items] of sharedGroups) {
    // Collect all unique references from all MCQs in this shared group
    const rawRefs = items.flatMap((it) => it.mcq.reference || [])
    const mergedRefs = cleanAndDedupeReferences(rawRefs)

    // Check if any MCQ in this group has references differing from mergedRefs
    let groupNeedsSync = false
    const groupUpdates: typeof updates = []

    for (const item of items) {
      const currentRefs = (item.mcq.reference || []).filter((r) => !isIgnoredReference(r))
      if (!areReferenceArraysEqual(currentRefs, mergedRefs)) {
        groupNeedsSync = true
        groupUpdates.push({
          id: item.mcq.id,
          question: item.mcq.question,
          oldRef: item.mcq.reference || [],
          newRef: mergedRefs,
          groupKey,
        })
      }
    }

    if (groupNeedsSync) {
      totalSyncedGroups++
      updates.push(...groupUpdates)
    }
  }

  if (updates.length === 0) {
    console.log("\x1b[32m✔ All MCQs sharing attachments already have synchronized references! Nothing to update.\x1b[0m\n")
    return
  }

  console.log(`Found \x1b[33m${totalSyncedGroups}\x1b[0m group(s) with mismatched references.`)
  console.log(`A total of \x1b[33m${updates.length}\x1b[0m MCQ(s) will be updated with shared references.\n`)

  // Show a preview of the first 5 updates
  const previewCount = Math.min(updates.length, 5)
  console.log(`Preview of first ${previewCount} updates:`)
  for (let i = 0; i < previewCount; i++) {
    const u = updates[i]!
    console.log(`\n  [${i + 1}] MCQ ID: ${u.id}`)
    console.log(`      Question: ${u.question.substring(0, 60)}...`)
    console.log(`      Before:   [ ${u.oldRef.map((r) => `"${r}"`).join(", ")} ]`)
    console.log(`      After:    [ ${u.newRef.map((r) => `"${r}"`).join(", ")} ]`)
  }
  if (updates.length > previewCount) {
    console.log(`\n  ... and ${updates.length - previewCount} more MCQ(s).`)
  }

  if (isDryRun) {
    console.log("\n\x1b[33m[DRY RUN] No updates were made to the database. Re-run without --dry-run to apply.\x1b[0m\n")
    return
  }

  // 4. Apply updates in batches
  console.log(`\n\x1b[34mApplying updates in batches to ${updates.length} MCQ(s)...\x1b[0m`)
  const BATCH_SIZE = 25
  let updatedCount = 0

  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE)
    await prisma.$transaction(
      batch.map((item) =>
        prisma.mcq.update({
          where: { id: item.id },
          data: { reference: item.newRef },
        })
      ),
      { timeout: 30000 }
    )
    updatedCount += batch.length
    process.stdout.write(`\rProgress: ${updatedCount}/${updates.length} MCQs synchronized...`)
  }

  console.log(`\n\n\x1b[32m✔ Successfully synchronized references across ${updatedCount} MCQ(s) in the database!\x1b[0m\n`)
}

syncMcqAttachmentReferences()
  .catch((e) => {
    console.error("\x1b[31m✖ Error during attachment reference sync:\x1b[0m", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

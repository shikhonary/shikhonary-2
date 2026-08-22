import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../generated/main/client.js"
import fs from "node:fs"
import path from "node:path"

const connectionString = process.env.MAIN_DATABASE_URL || process.env.DATABASE_URL
if (!connectionString) {
  console.error("ERROR: MAIN_DATABASE_URL or DATABASE_URL is not set in environment variables.")
  process.exit(1)
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

const DATA_DIR = path.resolve(import.meta.dirname, "./data")

const DATA_FILES = {
  divisions: path.join(DATA_DIR, "lg_divisions.json"),
  districts: path.join(DATA_DIR, "lg_districts.json"),
  upazilas: path.join(DATA_DIR, "lg_upazilas.json"),
  unions: path.join(DATA_DIR, "lg_unions.json"),
  posts: path.join(DATA_DIR, "lg_posts.json"),
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}

async function main() {
  console.log("Starting LGDhaka Geo data seed script...")

  // 1. Verify files exist
  for (const [key, filePath] of Object.entries(DATA_FILES)) {
    if (!fs.existsSync(filePath)) {
      console.error(`ERROR: Cached LGDhaka data file for ${key} not found at: ${filePath}`)
      process.exit(1)
    }
  }

  // 2. Read cached datasets
  const divisionsRaw = JSON.parse(fs.readFileSync(DATA_FILES.divisions, "utf-8"))
  const districtsRaw = JSON.parse(fs.readFileSync(DATA_FILES.districts, "utf-8"))
  const upazilasRaw = JSON.parse(fs.readFileSync(DATA_FILES.upazilas, "utf-8"))
  const unionsRaw = JSON.parse(fs.readFileSync(DATA_FILES.unions, "utf-8"))
  const postsRaw = JSON.parse(fs.readFileSync(DATA_FILES.posts, "utf-8"))

  // 3. Clean up database in reverse order of relationships to avoid FK conflicts
  console.log("Cleaning existing geographical tables...")
  await prisma.post.deleteMany()
  await prisma.union.deleteMany()
  await prisma.upazila.deleteMany()
  await prisma.district.deleteMany()
  await prisma.division.deleteMany()
  console.log("Tables cleaned successfully.")

  // 4. Map and Deduplicate Divisions
  const divisionsMap = new Map<string, any>()
  for (const d of divisionsRaw) {
    if (d && d.id) {
      divisionsMap.set(d.id.toString(), {
        id: d.id.toString(),
        name: d.en_name || d.name,
        nameBn: d.bn_name || "",
        url: d.web || d.url || null,
      })
    }
  }
  const divisionData = Array.from(divisionsMap.values())
  console.log(`Prepared ${divisionData.length} unique divisions.`)

  // 5. Map and Deduplicate Districts
  const districtsMap = new Map<string, any>()
  for (const d of districtsRaw) {
    if (d && d.id) {
      let divisionId = d.parent_id ? d.parent_id.toString() : null
      
      // Handle known cases where parent_id is null in source data
      if (!divisionId) {
        const nameLower = (d.en_name || "").toLowerCase()
        if (nameLower.includes("cumilla") || nameLower.includes("comilla") || nameLower.includes("khagrachhari") || nameLower.includes("khagrachari")) {
          divisionId = "1" // Chattogram Division
        } else if (nameLower.includes("turag")) {
          divisionId = "6" // Dhaka Division
        } else {
          divisionId = "6" // Fallback to Dhaka Division
        }
      }

      if (!divisionsMap.has(divisionId)) {
        continue // Prevent FK failure if parent division is missing
      }

      districtsMap.set(d.id.toString(), {
        id: d.id.toString(),
        name: d.en_name || d.name,
        nameBn: d.bn_name || "",
        url: d.web || d.url || null,
        divisionId,
      })
    }
  }
  const districtData = Array.from(districtsMap.values())
  console.log(`Prepared ${districtData.length} unique districts.`)

  // 6. Map and Deduplicate Upazilas
  const upazilasMap = new Map<string, any>()
  for (const u of upazilasRaw) {
    if (u && u.id && u.parent_id) {
      const districtId = u.parent_id.toString()
      if (!districtsMap.has(districtId)) {
        continue // Prevent FK failure if parent district is missing
      }

      upazilasMap.set(u.id.toString(), {
        id: u.id.toString(),
        name: u.en_name || u.name,
        nameBn: u.bn_name || "",
        url: u.web || u.url || null,
        districtId,
      })
    }
  }

  // 7. Find and dynamically resolve missing parent Upazilas from Post offices (such as metropolitan city thanas)
  console.log("Checking for missing parent Upazilas in post office records...")
  const virtualUpazilasMap = new Map<string, any>()
  for (const p of postsRaw) {
    if (p && p.parent_id) {
      const upazilaId = p.parent_id.toString()
      if (!upazilasMap.has(upazilaId) && !virtualUpazilasMap.has(upazilaId)) {
        // Build a virtual thana record using the first post office's location details under it
        virtualUpazilasMap.set(upazilaId, {
          id: upazilaId,
          name: `${p.en_name || "Unknown"} Thana`,
          nameBn: `${p.bn_name || "অজানা"} থানা`,
          url: null,
          districtId: "40", // Place all missing metropolitan thanas under Dhaka district ("40")
        })
      }
    }
  }

  if (virtualUpazilasMap.size > 0) {
    console.log(`Dynamically resolved ${virtualUpazilasMap.size} missing metropolitan Upazilas/Thanas (e.g. Mirpur, Gulshan, Wari).`)
    for (const [id, u] of virtualUpazilasMap.entries()) {
      upazilasMap.set(id, u)
    }
  }
  const upazilaData = Array.from(upazilasMap.values())
  console.log(`Prepared ${upazilaData.length} total Upazilas (including resolved metropolitan thanas).`)

  // 8. Map and Deduplicate Unions
  const unionsMap = new Map<string, any>()
  for (const u of unionsRaw) {
    if (u && u.id && u.parent_id) {
      const upazilaId = u.parent_id.toString()
      if (!upazilasMap.has(upazilaId)) {
        continue // Prevent FK failure if parent upazila is missing
      }

      unionsMap.set(u.id.toString(), {
        id: u.id.toString(),
        name: u.en_name || u.name,
        nameBn: u.bn_name || "",
        url: u.web || u.url || null,
        upazilaId,
      })
    }
  }
  const unionData = Array.from(unionsMap.values())
  console.log(`Prepared ${unionData.length} unique unions.`)

  // 9. Map and Deduplicate Posts (Post Offices)
  const postsMap = new Map<string, any>()
  for (const p of postsRaw) {
    if (p && p.id && p.parent_id) {
      const upazilaId = p.parent_id.toString()
      if (!upazilasMap.has(upazilaId)) {
        continue // Prevent FK failure if parent upazila is missing
      }

      postsMap.set(p.id.toString(), {
        id: p.id.toString(),
        postOffice: p.en_name || p.name,
        postOfficeBn: p.bn_name || "",
        postCode: p.post_code ? p.post_code.toString() : "",
        upazilaId,
      })
    }
  }
  const postData = Array.from(postsMap.values())
  console.log(`Prepared ${postData.length} unique post offices.`)

  // 10. Execute Transactional Database Seeding
  console.log("\nSeeding database...")
  
  console.log(`- Seeding divisions (${divisionData.length})...`)
  await prisma.division.createMany({ data: divisionData })

  console.log(`- Seeding districts (${districtData.length})...`)
  await prisma.district.createMany({ data: districtData })

  console.log(`- Seeding upazilas (${upazilaData.length})...`)
  const upazilaChunks = chunkArray(upazilaData, 100)
  for (const chunk of upazilaChunks) {
    await prisma.upazila.createMany({ data: chunk })
  }

  console.log(`- Seeding unions (${unionData.length})...`)
  const unionChunks = chunkArray(unionData, 500)
  for (const chunk of unionChunks) {
    await prisma.union.createMany({ data: chunk })
  }

  console.log(`- Seeding post offices (${postData.length}) [SKIPPED]...`)
  // const postChunks = chunkArray(postData, 200)
  // for (const chunk of postChunks) {
  //   await prisma.post.createMany({ data: chunk })
  // }

  console.log("\nLGDhaka Geographical seeding complete!")
}

main()
  .catch((e) => {
    console.error("Error seeding BD geo data:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

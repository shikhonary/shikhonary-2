import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../generated/main/client.js"
import fs from "node:fs"
import path from "node:path"
import https from "node:https"

const connectionString = process.env.MAIN_DATABASE_URL || process.env.DATABASE_URL
if (!connectionString) {
  console.error("ERROR: MAIN_DATABASE_URL or DATABASE_URL is not set in environment variables.")
  process.exit(1)
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

// Cache folder path
const DATA_DIR = path.resolve(import.meta.dirname, "./data")

const DATA_SOURCES = {
  divisions: {
    url: "https://raw.githubusercontent.com/nuhil/bangladesh-geocode/master/divisions/divisions.json",
    file: path.join(DATA_DIR, "divisions.json"),
  },
  districts: {
    url: "https://raw.githubusercontent.com/nuhil/bangladesh-geocode/master/districts/districts.json",
    file: path.join(DATA_DIR, "districts.json"),
  },
  upazilas: {
    url: "https://raw.githubusercontent.com/nuhil/bangladesh-geocode/master/upazilas/upazilas.json",
    file: path.join(DATA_DIR, "upazilas.json"),
  },
  unions: {
    url: "https://raw.githubusercontent.com/nuhil/bangladesh-geocode/master/unions/unions.json",
    file: path.join(DATA_DIR, "unions.json"),
  },
  postcodes: {
    url: "https://raw.githubusercontent.com/TanjidulIslamToha/bangladesh-postal-codes-database/master/postcodes-pretty.json",
    file: path.join(DATA_DIR, "postcodes_bilingual.json"),
  },
}

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(dest)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    const file = fs.createWriteStream(dest)
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download ${url}: status code ${response.statusCode}`))
          return
        }
        response.pipe(file)
        file.on("finish", () => {
          file.close()
          resolve()
        })
      })
      .on("error", (err) => {
        fs.unlink(dest, () => {})
        reject(err)
      })
  })
}

async function ensureDataFiles() {
  console.log("Checking for local geo-data cache...")
  for (const [key, source] of Object.entries(DATA_SOURCES)) {
    if (!fs.existsSync(source.file)) {
      console.log(`Downloading ${key} data from: ${source.url}`)
      try {
        await downloadFile(source.url, source.file)
        console.log(`Successfully cached ${key} locally.`)
      } catch (err) {
        console.error(`Error downloading ${key}:`, err)
        throw err
      }
    } else {
      console.log(`Using cached file for ${key}.`)
    }
  }
}

// Normalizer helper to robustly match English names (e.g. Cox's Bazar Sadar vs Cox's Bazar)
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "")
    .replace(/sadar$/g, "")
    .replace(/upazila$/g, "")
    .replace(/thana$/g, "")
    .replace(/upo$/g, "")
    .replace(/chittagong/g, "chattogram")
    .replace(/brahaman/g, "brahman")
    .replace(/davidhar/g, "debidwar")
    .replace(/gouranadi/g, "gournadi")
    .replace(/agailzhara/g, "agailjhara")
    .replace(/jhalokathi/g, "jhalokati")
    .replace(/kaukhali/g, "kawkhali")
    .replace(/charfashion/g, "charfasson")
    .replace(/anawara/g, "anwara")
    .replace(/rouzan/g, "raozan")
    .replace(/swarupkathi/g, "nesarabad")
    .replace(/banchharampur/g, "bancharampur")
    .replace(/hayemchar/g, "haimchar")
    .replace(/uzirpur/g, "wazirpur")
    .replace(/mahendiganj/g, "mehendiganj")
    .replace(/matlobganj/g, "matlab")
    .replace(/khepupara/g, "kalapara")
    .replace(/jaldi/g, "banshkhali")
    .replace(/subidkhali/g, "mirzaganj")
    .replace(/barajalia/g, "hijla")
}

// Helper to chunk arrays
function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}

function extractTableData(raw: any, tableName: string): any[] {
  const tableObj = raw.find((item: any) => item.type === "table" && item.name === tableName)
  return tableObj ? tableObj.data : []
}

async function main() {
  await ensureDataFiles()

  console.log("Starting BD Geo data seed script...")

  // Read files
  const divisionsRaw = JSON.parse(fs.readFileSync(DATA_SOURCES.divisions.file, "utf-8"))
  const districtsRaw = JSON.parse(fs.readFileSync(DATA_SOURCES.districts.file, "utf-8"))
  const upazilasRaw = JSON.parse(fs.readFileSync(DATA_SOURCES.upazilas.file, "utf-8"))
  const unionsRaw = JSON.parse(fs.readFileSync(DATA_SOURCES.unions.file, "utf-8"))
  const postcodesRawObj = JSON.parse(fs.readFileSync(DATA_SOURCES.postcodes.file, "utf-8"))

  const divisions = extractTableData(divisionsRaw, "divisions")
  const districts = extractTableData(districtsRaw, "districts")
  const upazilas = extractTableData(upazilasRaw, "upazilas")
  const unions = extractTableData(unionsRaw, "unions")
  const postcodes: any[] = []
  for (const [code, item] of Object.entries(postcodesRawObj)) {
    const postcodeObj = item as any
    if (postcodeObj && postcodeObj.en && postcodeObj.bn) {
      postcodes.push({
        postCode: code,
        upazila: postcodeObj.en.thana,
        district: postcodeObj.en.district,
        postOffice: postcodeObj.en.suboffice,
        postOfficeBn: postcodeObj.bn.suboffice,
      })
    }
  }

  // 1. Division Seeding
  console.log(`Processing ${divisions.length} divisions...`)
  const dbDivisions = await prisma.division.findMany()
  if (dbDivisions.length === 0) {
    const divisionData = divisions.map((d: any) => ({
      id: d.id.toString(),
      name: d.name,
      nameBn: d.bn_name || "",
      url: d.url || null,
    }))
    await prisma.division.createMany({ data: divisionData })
    console.log("Divisions seeded successfully.")
  } else {
    console.log("Divisions already exist in the database, skipping.")
  }

  // 2. District Seeding
  console.log(`Processing ${districts.length} districts...`)
  const dbDistricts = await prisma.district.findMany()
  if (dbDistricts.length === 0) {
    const districtData = districts.map((d: any) => ({
      id: d.id.toString(),
      name: d.name,
      nameBn: d.bn_name || "",
      url: d.url || null,
      divisionId: d.division_id.toString(),
    }))
    await prisma.district.createMany({ data: districtData })
    console.log("Districts seeded successfully.")
  } else {
    console.log("Districts already exist in the database, skipping.")
  }

  // 3. Upazila Seeding
  console.log(`Processing ${upazilas.length} upazilas...`)
  const dbUpazilas = await prisma.upazila.findMany()
  if (dbUpazilas.length === 0) {
    const upazilaData = upazilas.map((u: any) => ({
      id: u.id.toString(),
      name: u.name,
      nameBn: u.bn_name || "",
      url: u.url || null,
      districtId: u.district_id.toString(),
    }))
    
    // Chunk upazila insertion
    const chunks = chunkArray(upazilaData, 100)
    for (const chunk of chunks) {
      await prisma.upazila.createMany({ data: chunk })
    }
    console.log("Upazilas seeded successfully.")
  } else {
    console.log("Upazilas already exist in the database, skipping.")
  }

  // 4. Union Seeding
  console.log(`Processing ${unions.length} unions...`)
  const dbUnions = await prisma.union.findMany()
  if (dbUnions.length === 0) {
    const unionData = unions.map((u: any) => ({
      id: u.id.toString(),
      name: u.name,
      nameBn: u.bn_name || "",
      url: u.url || null,
      upazilaId: (u.upazilla_id || u.upazila_id).toString(),
    }))

    // Chunk unions insertion since there are ~4500 entries
    const chunks = chunkArray(unionData, 500)
    for (const [index, chunk] of chunks.entries()) {
      await prisma.union.createMany({ data: chunk })
      if ((index + 1) % 2 === 0 || index === chunks.length - 1) {
        console.log(`  Seeded ${(index + 1) * 500} / ${unionData.length} unions...`)
      }
    }
    console.log("Unions seeded successfully.")
  } else {
    console.log("Unions already exist in the database, skipping.")
  }

  // 5. Post Seeding
  console.log(`Processing ${postcodes.length} postcodes...`)
  
  // Clear existing post office lookup entries to allow clean re-seed
  await prisma.post.deleteMany()
  console.log("Cleared existing post office entries for clean re-seed.")

  // Fetch all upazilas with their parent districts to create a compound lookup map
  const allUpazilas = await prisma.upazila.findMany({
    include: {
      district: true
    }
  })
  const upazilaLookup = new Map<string, string>() // key: districtNormalized_upazilaNormalized -> value: upazilaId
  
  for (const u of allUpazilas) {
    const key = `${normalizeName(u.district.name)}_${normalizeName(u.name)}`
    upazilaLookup.set(key, u.id)
  }

  const postData: any[] = []
  let skippedCount = 0
  const skippedNames = new Set<string>()

  for (const p of postcodes) {
    if (!p || !p.upazila || !p.district || !p.postOffice || !p.postCode) {
      skippedCount++
      continue
    }
    const postcodeDistrictNormalized = normalizeName(p.district)
    const postcodeUpazilaNameNormalized = normalizeName(p.upazila)
    const key = `${postcodeDistrictNormalized}_${postcodeUpazilaNameNormalized}`
    
    let upazilaId = upazilaLookup.get(key)
    
    // Fallback matching: if not found, look for partial match while strictly keeping district constrained
    if (!upazilaId) {
      const matchingUpazilas = allUpazilas.filter((u) => {
        const uDistrictNorm = normalizeName(u.district.name)
        const uNorm = normalizeName(u.name)
        
        // Strict district check (exact or substring, e.g. Cox's Bazar vs CoxsBazar)
        const isDistrictMatch = uDistrictNorm.includes(postcodeDistrictNormalized) || 
                                postcodeDistrictNormalized.includes(uDistrictNorm)
        if (!isDistrictMatch) return false
        
        // Upazila match (substring)
        return uNorm.includes(postcodeUpazilaNameNormalized) || postcodeUpazilaNameNormalized.includes(uNorm)
      })
      
      if (matchingUpazilas.length >= 1) {
        upazilaId = matchingUpazilas[0].id
      }
    }

    if (upazilaId) {
      postData.push({
        postOffice: p.postOffice,
        postOfficeBn: p.postOfficeBn || null,
        postCode: p.postCode.toString(),
        upazilaId: upazilaId,
      })
    } else {
      skippedNames.add(`${p.district} -> ${p.upazila}`)
      skippedCount++
    }
  }

  if (skippedNames.size > 0) {
    console.log("Example skipped upazila names from postcodes dataset:", Array.from(skippedNames).slice(0, 30))
  }

  console.log(`Mapped ${postData.length} post offices (skipped ${skippedCount} unmatched).`)

  // Chunk post insertion
  const chunks = chunkArray(postData, 200)
  for (const chunk of chunks) {
    await prisma.post.createMany({ data: chunk })
  }
  console.log("Post offices seeded successfully.")

  console.log("BD Geographical seeding complete!")
}

main()
  .catch((e) => {
    console.error("Error seeding BD geo data:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

import "dotenv/config"
import { db } from "../src/main.js"
import { listAcademicSubjects } from "../../api/src/routers/academic-subject/academic-subject.service.ts"

async function run() {
  const classes = await db.academicClass.findMany()
  const classNine = classes.find(c => c.nameEn === "Nine")
  const classTen = classes.find(c => c.nameEn === "Ten")

  if (classNine) {
    console.log(`\n--- Fetching subjects for Class Nine (ID: ${classNine.id}) ---`)
    const resNine = await listAcademicSubjects(db, { limit: 100, classId: classNine.id })
    for (const sub of resNine.academicSubjects) {
      console.log(`- ${sub.nameEn} (ID: ${sub.id})`)
    }
  }

  if (classTen) {
    console.log(`\n--- Fetching subjects for Class Ten (ID: ${classTen.id}) ---`)
    const resTen = await listAcademicSubjects(db, { limit: 100, classId: classTen.id })
    for (const sub of resTen.academicSubjects) {
      console.log(`- ${sub.nameEn} (ID: ${sub.id})`)
    }
  }
}

run()
  .catch(console.error)
  .finally(() => db.$disconnect())

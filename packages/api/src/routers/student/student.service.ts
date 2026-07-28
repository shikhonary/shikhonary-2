/**
 * Student domain — business logic service.
 *
 * All database queries for student onboarding and profile live here.
 */
import type { PrismaClient } from "@workspace/db/main"
import { Prisma } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CompleteStudentOnboardingInput,
  CreateStudentInput,
  DeleteStudentInput,
  GetStudentInput,
  ListStudentsInput,
  UpdateStudentAdminInput,
} from "./student.schema"
import { safeStudentSelect } from "./student.schema"

export type MappedStudent = Omit<
  Prisma.StudentGetPayload<{ select: typeof safeStudentSelect }>,
  "user" | "academicClass"
> & {
  studentId: string | number
  nameBn: string
  mPhone: string
  fPhone: string
  session: string
  section: string
  shift: string
  group: string
  fName: string
  mName: string
  gender: string
  dob: null
  nationality: string
  religion: string
  presentAddress: string
  permanentAddress: string
  imageUrl: string | null
  academicClass: {
    id: string
    name: string
    isActive: boolean
    nameEn: string
    nameBn: string
  } | null
}

/**
 * Helper to extract fields that exist on the Prisma Student model.
 */
function extractStudentFields(input: Partial<CompleteStudentOnboardingInput>, isCreate = false) {
  const fields: any = {}
  if (input.name !== undefined) fields.name = input.name
  
  if (input.phone !== undefined) {
    fields.phone = input.phone
  } else if (input.mPhone !== undefined) {
    fields.phone = input.mPhone
  } else if (isCreate) {
    fields.phone = ""
  }

  if (input.institute !== undefined) {
    fields.institute = input.institute
  } else if (isCreate) {
    fields.institute = "Not specified"
  }

  if (input.roll !== undefined) fields.roll = input.roll
  if (input.isOfflineStudent !== undefined) fields.isOfflineStudent = input.isOfflineStudent
  if (input.academicClassId !== undefined) fields.academicClassId = input.academicClassId
  return fields
}

/**
 * Helper to map database Student record to the legacy shape expected by client applications.
 */
export function mapStudentResponse(
  student: Prisma.StudentGetPayload<{ select: typeof safeStudentSelect }>
): MappedStudent {
  const { user, academicClass, ...rest } = student

  // Generate a consistent numeric studentId from the UUID if roll is not set
  const generatedId = rest.roll || (parseInt(rest.id.replace(/\D/g, '').slice(0, 6)) || 100000)

  return {
    id: rest.id,
    name: rest.name,
    phone: rest.phone,
    institute: rest.institute,
    roll: rest.roll,
    isOfflineStudent: rest.isOfflineStudent,
    academicClassId: rest.academicClassId,
    userId: rest.userId,
    createdAt: rest.createdAt,
    updatedAt: rest.updatedAt,
    studentId: generatedId,
    nameBn: rest.name,
    mPhone: rest.phone,
    fPhone: rest.phone,
    session: "",
    section: "",
    shift: "",
    group: "",
    fName: "",
    mName: "",
    gender: "",
    dob: null,
    nationality: "",
    religion: "",
    presentAddress: "",
    permanentAddress: "",
    imageUrl: user?.image || null,
    academicClass: academicClass ? {
      id: academicClass.id,
      name: academicClass.name,
      isActive: academicClass.isActive,
      nameEn: academicClass.name,
      nameBn: academicClass.name,
    } : null,
  }
}

export function mapStudentResponseNullable(
  student: Prisma.StudentGetPayload<{ select: typeof safeStudentSelect }> | null
): MappedStudent | null {
  if (!student) return null
  return mapStudentResponse(student)
}

/**
 * Get student profile associated with the authenticated user ID.
 */
export async function getStudentByUserId(db: PrismaClient, userId: string): Promise<MappedStudent | null> {
  const student = await db.student.findUnique({
    where: { userId },
    select: safeStudentSelect,
  })
  return mapStudentResponseNullable(student)
}

/**
 * Complete or update student onboarding profile.
 */
export async function completeStudentOnboarding(
  db: PrismaClient,
  userId: string,
  input: CompleteStudentOnboardingInput,
) {
  try {
    // Check if class exists
    const classExists = await db.academicClass.findUnique({
      where: { id: input.academicClassId },
    })

    if (!classExists) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Selected academic class does not exist",
      })
    }

    // Sync user name/image if provided
    if (input.name || input.imageUrl) {
      const userDataToUpdate: any = {}
      if (input.name) userDataToUpdate.name = input.name
      if (input.imageUrl) userDataToUpdate.image = input.imageUrl
      await db.user.update({
        where: { id: userId },
        data: userDataToUpdate,
      })
    }

    // Check if student profile already exists for this user
    const existingStudent = await db.student.findUnique({
      where: { userId },
    })

    let studentProfile
    const studentData = {
      ...extractStudentFields(input, !existingStudent),
      userId,
    }

    if (existingStudent) {
      // Update existing student profile
      studentProfile = await db.student.update({
        where: { id: existingStudent.id },
        data: studentData,
        select: safeStudentSelect,
      })
    } else {
      // Create new student profile linked to userId
      studentProfile = await db.student.create({
        data: studentData,
        select: safeStudentSelect,
      })
    }

    // Ensure both "STUDENT" and "Student" roles exist and are associated with the user
    const [roleUpper, roleCapital] = await Promise.all([
      db.role.upsert({
        where: { name: "STUDENT" },
        update: {},
        create: {
          name: "STUDENT",
          description: "Enrolled student role",
        },
      }),
      db.role.upsert({
        where: { name: "Student" },
        update: {},
        create: {
          name: "Student",
          description: "Enrolled student role",
        },
      }),
    ])

    // Assign student roles to the user
    await db.user.update({
      where: { id: userId },
      data: {
        roles: {
          set: [{ id: roleUpper.id }, { id: roleCapital.id }],
        },
      },
    })

    return mapStudentResponse(studentProfile)
  } catch (err: any) {
    if (err instanceof TRPCError) throw err
    console.error("[completeStudentOnboarding] Error:", err)
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: err?.message || "Failed to complete student onboarding",
    })
  }
}

/**
 * Update existing student profile and sync user fields.
 */
export async function updateStudentProfile(
  db: PrismaClient,
  userId: string,
  input: Partial<CompleteStudentOnboardingInput>
) {
  const existingStudent = await db.student.findUnique({
    where: { userId },
  })

  if (!existingStudent) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Student profile not found for this user",
    })
  }

  if (input.academicClassId) {
    const classExists = await db.academicClass.findUnique({
      where: { id: input.academicClassId },
    })
    if (!classExists) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Selected academic class does not exist",
      })
    }
  }

  // Sync user name/image if updated
  if (input.name || input.imageUrl) {
    const userDataToUpdate: any = {}
    if (input.name) userDataToUpdate.name = input.name
    if (input.imageUrl) userDataToUpdate.image = input.imageUrl
    await db.user.update({
      where: { id: userId },
      data: userDataToUpdate,
    })
  }

  const studentData = extractStudentFields(input)
  const updatedStudent = await db.student.update({
    where: { id: existingStudent.id },
    data: studentData,
    select: safeStudentSelect,
  })

  return mapStudentResponse(updatedStudent)
}

// ---------------------------------------------------------------------------
// Admin Queries & Mutations
// ---------------------------------------------------------------------------

export async function listStudents(db: PrismaClient, input: ListStudentsInput) {
  const where: any = {}
  if (input.academicClassId) {
    where.academicClassId = input.academicClassId
  }
  if (input.isOfflineStudent !== undefined) {
    where.isOfflineStudent = input.isOfflineStudent
  }
  if (input.isLinkedToUser !== undefined) {
    if (input.isLinkedToUser) {
      where.userId = { not: null }
    } else {
      where.userId = null
    }
  }
  if (input.query) {
    where.OR = [
      { name: { contains: input.query, mode: "insensitive" } },
      { phone: { contains: input.query, mode: "insensitive" } },
      { institute: { contains: input.query, mode: "insensitive" } },
    ]
  }

  let orderBy: any = [{ createdAt: "desc" }]
  switch (input.sort) {
    case "name_asc":
      orderBy = [{ name: "asc" }]
      break
    case "name_desc":
      orderBy = [{ name: "desc" }]
      break
    case "roll_asc":
      orderBy = [{ roll: "asc" }]
      break
    case "roll_desc":
      orderBy = [{ roll: "desc" }]
      break
    case "oldest":
      orderBy = [{ createdAt: "asc" }]
      break
    case "newest":
    case "All":
    default:
      orderBy = [{ createdAt: "desc" }]
      break
  }

  const page = input.page ?? 1
  const limit = input.limit ?? 20
  const skip = (page - 1) * limit

  const [items, totalItems] = await Promise.all([
    db.student.findMany({
      take: limit,
      skip,
      where,
      select: safeStudentSelect,
      orderBy,
    }),
    db.student.count({ where }),
  ])

  return {
    items: items.map(mapStudentResponse),
    totalItems,
    totalPages: Math.ceil(totalItems / limit) || 1,
    page,
    limit,
  }
}

export async function getStudentStats(db: PrismaClient) {
  const [totalCount, offlineCount, linkedCount] = await Promise.all([
    db.student.count(),
    db.student.count({ where: { isOfflineStudent: true } }),
    db.student.count({ where: { userId: { not: null } } }),
  ])
  return {
    totalStudentsCount: totalCount,
    offlineStudentsCount: offlineCount,
    onlineStudentsCount: totalCount - offlineCount,
    linkedStudentsCount: linkedCount,
  }
}

export async function getStudentByIdAdmin(db: PrismaClient, input: GetStudentInput): Promise<MappedStudent> {
  const item = await db.student.findUnique({
    where: { id: input.id },
    select: safeStudentSelect,
  })
  if (!item) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Student not found",
    })
  }
  return mapStudentResponse(item)
}

export async function createStudent(db: PrismaClient, input: CreateStudentInput) {
  // Validate academic class exists
  const classExists = await db.academicClass.findUnique({
    where: { id: input.academicClassId },
  })
  if (!classExists) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Academic class does not exist",
    })
  }

  // If userId is provided, validate unique link
  if (input.userId) {
    const existingLink = await db.student.findUnique({
      where: { userId: input.userId },
    })
    if (existingLink) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "This user is already linked to another student profile",
      })
    }
  }

  const created = await db.student.create({
    data: {
      name: input.name,
      phone: input.phone,
      institute: input.institute,
      roll: input.roll,
      isOfflineStudent: input.isOfflineStudent ?? false,
      academicClassId: input.academicClassId,
      userId: input.userId || null,
    },
    select: safeStudentSelect,
  })

  // Sync role if user is linked
  if (input.userId) {
    const [roleUpper, roleCapital] = await Promise.all([
      db.role.upsert({
        where: { name: "STUDENT" },
        update: {},
        create: { name: "STUDENT", description: "Enrolled student role" },
      }),
      db.role.upsert({
        where: { name: "Student" },
        update: {},
        create: { name: "Student", description: "Enrolled student role" },
      }),
    ])

    await db.user.update({
      where: { id: input.userId },
      data: {
        roles: {
          connect: [{ id: roleUpper.id }, { id: roleCapital.id }],
        },
      },
    })
  }

  return mapStudentResponse(created)
}

export async function updateStudentAdmin(db: PrismaClient, input: UpdateStudentAdminInput) {
  const existing = await db.student.findUnique({
    where: { id: input.id },
  })
  if (!existing) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Student not found",
    })
  }

  if (input.academicClassId) {
    const classExists = await db.academicClass.findUnique({
      where: { id: input.academicClassId },
    })
    if (!classExists) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Academic class does not exist",
      })
    }
  }

  // If userId is changing/updating, validate uniqueness
  if (input.userId && input.userId !== existing.userId) {
    const existingLink = await db.student.findUnique({
      where: { userId: input.userId },
    })
    if (existingLink) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "This user is already linked to another student profile",
      })
    }
  }

  const updated = await db.student.update({
    where: { id: input.id },
    data: {
      name: input.name,
      phone: input.phone,
      institute: input.institute,
      roll: input.roll !== undefined ? input.roll : undefined,
      isOfflineStudent: input.isOfflineStudent,
      academicClassId: input.academicClassId,
      userId: input.userId !== undefined ? input.userId : undefined,
    },
    select: safeStudentSelect,
  })

  // Sync role if user is linked
  if (input.userId && input.userId !== existing.userId) {
    const [roleUpper, roleCapital] = await Promise.all([
      db.role.upsert({
        where: { name: "STUDENT" },
        update: {},
        create: { name: "STUDENT", description: "Enrolled student role" },
      }),
      db.role.upsert({
        where: { name: "Student" },
        update: {},
        create: { name: "Student", description: "Enrolled student role" },
      }),
    ])

    await db.user.update({
      where: { id: input.userId },
      data: {
        roles: {
          connect: [{ id: roleUpper.id }, { id: roleCapital.id }],
        },
      },
    })
  }

  return mapStudentResponse(updated)
}

export async function deleteStudentAdmin(db: PrismaClient, input: DeleteStudentInput) {
  const existing = await db.student.findUnique({
    where: { id: input.id },
  })
  if (!existing) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Student not found",
    })
  }

  await db.student.delete({
    where: { id: input.id },
  })

  return { success: true }
}

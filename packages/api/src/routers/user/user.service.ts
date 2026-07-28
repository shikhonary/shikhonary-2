/**
 * User domain — business logic service.
 *
 * All database queries live here, decoupled from tRPC plumbing.
 * Functions accept a typed Prisma client + validated input and return
 * typed results — no tRPC dependencies, making them unit-testable.
 */
import type { PrismaClient } from "@workspace/db/main"
import { auth } from "@workspace/auth/server"
import { badRequest, conflict, notFound } from "../../utils/errors"
import type {
  CreateUserInput,
  DeleteUserInput,
  GetUserInput,
  ListUsersInput,
  UpdateUserInput,
  UpdateUserRolesInput,
  UsersForSelectionInput,
} from "./user.schema"
import { safeUserSelect } from "./user.schema"

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function listUsers(db: PrismaClient, input: ListUsersInput) {
  const where: any = {}

  if (input.query) {
    where.OR = [
      { id: { contains: input.query, mode: "insensitive" } },
      { name: { contains: input.query, mode: "insensitive" } },
      { email: { contains: input.query, mode: "insensitive" } },
      { phoneNumber: { contains: input.query, mode: "insensitive" } },
    ]
  }

  if (input.roleId) {
    where.roles = {
      some: { id: input.roleId },
    }
  } else if (input.roleName) {
    where.roles = {
      some: { name: input.roleName },
    }
  }

  if (input.status) {
    if (input.status === "Verified") {
      where.OR = [
        { emailVerified: true },
        { phoneNumberVerified: true },
      ]
    } else if (input.status === "Pending") {
      where.emailVerified = false
      where.phoneNumberVerified = false
    }
  }

  let orderBy: any = { createdAt: "desc" }
  if (input.sort) {
    switch (input.sort) {
      case "asc":
      case "oldest":
        orderBy = { createdAt: "asc" }
        break
      case "name_asc":
        orderBy = { name: "asc" }
        break
      case "name_desc":
        orderBy = { name: "desc" }
        break
      case "desc":
      case "newest":
      default:
        orderBy = { createdAt: "desc" }
        break
    }
  }

  const page = input.page ?? 1
  const limit = input.limit ?? 20
  const skip = input.cursor ? 1 : (page - 1) * limit

  const [users, totalItems] = await Promise.all([
    db.user.findMany({
      where,
      take: limit,
      skip,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      select: {
        ...safeUserSelect,
        roles: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy,
    }),
    db.user.count({ where }),
  ])

  const nextCursor =
    users.length === limit ? users[users.length - 1]?.id : undefined

  return {
    items: users,
    totalItems,
    totalPages: Math.ceil(totalItems / limit) || 1,
    page,
    limit,
    nextCursor,
  }
}

export async function getUserById(db: PrismaClient, input: GetUserInput) {
  const user = await db.user.findUnique({
    where: { id: input.id },
    select: {
      ...safeUserSelect,
      roles: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
    },
  })

  if (!user) throw notFound("User")
  return user
}

export async function getUsersForSelection(
  db: PrismaClient,
  input: UsersForSelectionInput,
) {
  const where: any = {}

  if (input.query) {
    where.OR = [
      { name: { contains: input.query, mode: "insensitive" } },
      { email: { contains: input.query, mode: "insensitive" } },
      { phoneNumber: { contains: input.query, mode: "insensitive" } },
    ]
  }

  if (input.roleName) {
    where.roles = {
      some: { name: input.roleName },
    }
  }

  return db.user.findMany({
    where,
    take: input.limit ?? 50,
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
    },
    orderBy: { name: "asc" },
  })
}

export async function getUserStats(db: PrismaClient) {
  const totalUsers = await db.user.count()

  // Calculate percentage change in user signups over the last 30 days
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

  const current30Days = await db.user.count({
    where: {
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
  })

  const previous30Days = await db.user.count({
    where: {
      createdAt: {
        gte: sixtyDaysAgo,
        lt: thirtyDaysAgo,
      },
    },
  })

  let totalUsersChange = "+0%"
  if (previous30Days > 0) {
    const change = ((current30Days - previous30Days) / previous30Days) * 100
    const sign = change >= 0 ? "+" : ""
    totalUsersChange = `${sign}${change.toFixed(0)}%`
  } else if (current30Days > 0) {
    totalUsersChange = `+100%`
  }

  // Count verified teachers (role TEACHER / Teacher / Super Admin? Wait, just TEACHER)
  const verifiedTeachers = await db.user.count({
    where: {
      roles: {
        some: {
          name: {
            in: ["TEACHER", "Teacher"],
          },
        },
      },
      OR: [
        { emailVerified: true },
        { phoneNumberVerified: true },
      ],
    },
  })

  // Count pending verification requests
  const pendingRequests = await db.user.count({
    where: {
      emailVerified: false,
      phoneNumberVerified: false,
    },
  })

  // System Health - defined as percentage of verified users
  const verifiedCount = await db.user.count({
    where: {
      OR: [
        { emailVerified: true },
        { phoneNumberVerified: true },
      ],
    },
  })

  const systemHealth = totalUsers > 0
    ? Math.round((verifiedCount / totalUsers) * 100)
    : 100

  return {
    totalUsers,
    totalUsersChange,
    verifiedTeachers,
    pendingRequests,
    systemHealth,
  }
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createUser(db: PrismaClient, input: CreateUserInput) {
  const { email, password, phoneNumber, name, roleIds } = input

  if (!email) {
    throw badRequest("Email is required.")
  }
  if (!password) {
    throw badRequest("Password is required.")
  }

  // Check if user already exists in DB
  const existingEmail = await db.user.findUnique({ where: { email } })
  if (existingEmail) throw conflict("A user with this email already exists.")

  if (phoneNumber) {
    const existingPhone = await db.user.findUnique({ where: { phoneNumber } })
    if (existingPhone) throw conflict("A user with this phone number already exists.")
  }

  // Create user using Better Auth server-side API (creates user + credential account)
  const signUpResult = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name: name || email.split("@")[0] || "User",
      phoneNumber: phoneNumber || "",
      phoneNumberVerified: false,
    },
    headers: new Headers(),
  })

  if (!signUpResult || !signUpResult.user) {
    throw badRequest("Failed to register user credentials.")
  }

  const userId = signUpResult.user.id
  const dataToUpdate: any = {
    emailVerified: true,
  }

  if (phoneNumber) {
    dataToUpdate.phoneNumber = phoneNumber
    dataToUpdate.phoneNumberVerified = true
  }

  let rolesToConnect = roleIds
  if (!rolesToConnect || rolesToConnect.length === 0) {
    const defaultRole = await db.role.findUnique({ where: { name: "USER" } })
    if (defaultRole) {
      rolesToConnect = [defaultRole.id]
    }
  }

  if (rolesToConnect && rolesToConnect.length > 0) {
    dataToUpdate.roles = {
      connect: rolesToConnect.map((id) => ({ id })),
    }
  }

  // Update user record with phone number & assigned roles
  return db.user.update({
    where: { id: userId },
    data: dataToUpdate,
    select: {
      ...safeUserSelect,
      roles: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
    },
  })
}

export async function updateUser(db: PrismaClient, input: UpdateUserInput) {
  const { id, ...data } = input

  const existing = await db.user.findUnique({ where: { id }, select: { id: true } })
  if (!existing) throw notFound("User")

  return db.user.update({
    where: { id },
    data,
    select: {
      ...safeUserSelect,
      roles: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
    },
  })
}

export async function updateUserContact(
  db: PrismaClient,
  userId: string,
  input: { phoneNumber?: string; email?: string }
) {
  const existing = await db.user.findUnique({ where: { id: userId }, select: { id: true } })
  if (!existing) throw notFound("User")

  const dataToUpdate: any = {}
  if (input.phoneNumber !== undefined) {
    dataToUpdate.phoneNumber = input.phoneNumber
    dataToUpdate.phoneNumberVerified = false
    // Clear any existing verification OTPs for this phone number
    await db.verification.deleteMany({
      where: { identifier: input.phoneNumber },
    })
  }
  if (input.email !== undefined) {
    dataToUpdate.email = input.email
    dataToUpdate.emailVerified = false
    // Clear any existing verification links for this email
    await db.verification.deleteMany({
      where: { identifier: input.email },
    })
  }

  return db.user.update({
    where: { id: userId },
    data: dataToUpdate,
    select: {
      ...safeUserSelect,
      roles: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
    },
  })
}

export async function deleteUser(db: PrismaClient, input: DeleteUserInput) {
  const existing = await db.user.findUnique({
    where: { id: input.id },
    select: { id: true },
  })
  if (!existing) throw notFound("User")

  await db.user.delete({ where: { id: input.id } })
  return { success: true }
}

export async function updateUserRoles(
  db: PrismaClient,
  input: UpdateUserRolesInput,
) {
  const existingUser = await db.user.findUnique({
    where: { id: input.userId },
    select: { id: true },
  })
  if (!existingUser) throw notFound("User")

  const existingRoles = await db.role.findMany({
    where: { id: { in: input.roleIds } },
    select: { id: true, name: true },
  })

  if (existingRoles.length !== input.roleIds.length) {
    const missing = input.roleIds.filter(
      (id) => !existingRoles.some((r) => r.id === id),
    )
    throw badRequest(`Role IDs not found: ${missing.join(", ")}`)
  }

  return db.user.update({
    where: { id: input.userId },
    data: {
      roles: {
        set: input.roleIds.map((id) => ({ id })),
      },
    },
    select: {
      ...safeUserSelect,
      roles: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
    },
  })
}

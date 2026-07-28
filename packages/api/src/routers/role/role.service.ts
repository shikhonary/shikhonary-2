/**
 * Role domain — business logic service.
 *
 * All database queries live here, decoupled from tRPC plumbing.
 * Functions accept a typed Prisma client and return typed results.
 */
import type { PrismaClient } from "@workspace/db/main"
import { badRequest, conflict, notFound } from "../../utils/errors"
import type {
  CreateRoleInput,
  DeleteRoleInput,
  GetRoleInput,
  ListRolesInput,
  RoleForSelectionInput,
  UpdateRoleInput,
} from "./role.schema"

export async function getRolesForSelection(
  db: PrismaClient,
  input?: RoleForSelectionInput,
) {
  return db.role.findMany({
    where: input?.name
      ? {
          name: {
            contains: input.name,
            mode: "insensitive",
          },
        }
      : undefined,
    select: {
      id: true,
      name: true,
      description: true,
    },
    orderBy: {
      name: "asc",
    },
  })
}

export async function listRoles(db: PrismaClient, input: ListRolesInput) {
  const roles = await db.role.findMany({
    take: input.limit,
    skip: input.cursor ? 1 : 0,
    cursor: input.cursor ? { id: input.cursor } : undefined,
    where: input.query
      ? {
          OR: [
            { name: { contains: input.query, mode: "insensitive" } },
            { description: { contains: input.query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  })

  const nextCursor =
    roles.length === input.limit ? roles[roles.length - 1]?.id : undefined

  return { roles, nextCursor }
}

export async function getRoleById(db: PrismaClient, input: GetRoleInput) {
  const role = await db.role.findUnique({
    where: { id: input.id },
  })
  if (!role) throw notFound("Role")
  return role
}

export async function createRole(db: PrismaClient, input: CreateRoleInput) {
  const existing = await db.role.findUnique({
    where: { name: input.name },
  })
  if (existing) {
    throw conflict(`Role with name "${input.name}" already exists.`)
  }

  return db.role.create({
    data: {
      name: input.name,
      description: input.description,
    },
  })
}

export async function updateRole(db: PrismaClient, input: UpdateRoleInput) {
  const { id, ...data } = input

  const existing = await db.role.findUnique({
    where: { id },
  })
  if (!existing) throw notFound("Role")

  if (data.name && data.name !== existing.name) {
    const nameConflict = await db.role.findUnique({
      where: { name: data.name },
    })
    if (nameConflict) {
      throw conflict(`Role with name "${data.name}" already exists.`)
    }
  }

  return db.role.update({
    where: { id },
    data,
  })
}

export async function deleteRole(db: PrismaClient, input: DeleteRoleInput) {
  const existing = await db.role.findUnique({
    where: { id: input.id },
    include: {
      _count: {
        select: { users: true },
      },
    },
  })
  if (!existing) throw notFound("Role")

  if (existing._count.users > 0) {
    throw badRequest(
      `Cannot delete role "${existing.name}" because it is currently assigned to ${existing._count.users} user(s).`,
    )
  }

  await db.role.delete({
    where: { id: input.id },
  })
  return { success: true }
}

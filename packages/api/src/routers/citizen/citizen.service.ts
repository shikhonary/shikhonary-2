import type { TenantPrismaClient } from "@workspace/db/tenant"
import { TenantPrisma } from "@workspace/db/tenant"
import { notFound } from "../../utils/errors"
import type {
  DeleteCitizenInput,
  GetCitizenInput,
  ListCitizensInput,
  UpdateCitizenInput,
} from "./citizen.schema"

export async function listCitizens(
  tenantDb: TenantPrismaClient,
  input: ListCitizensInput,
) {
  const where: TenantPrisma.CitizenWhereInput = {}

  if (input.search && input.search.trim() !== "") {
    const query = input.search.trim()
    where.OR = [
      { nameBn: { contains: query, mode: "insensitive" } },
      { nameEn: { contains: query, mode: "insensitive" } },
      { nid: { contains: query, mode: "insensitive" } },
      { birthRegNo: { contains: query, mode: "insensitive" } },
      { passportNo: { contains: query, mode: "insensitive" } },
      { mobile: { contains: query, mode: "insensitive" } },
      { fatherNameBn: { contains: query, mode: "insensitive" } },
      { motherNameBn: { contains: query, mode: "insensitive" } },
    ]
  }

  if (input.wardId) {
    where.presentAddress = { wardId: input.wardId }
  }

  if (input.residentType) {
    where.residentType = input.residentType
  }

  let orderBy: TenantPrisma.CitizenOrderByWithRelationInput = { createdAt: "desc" }
  if (input.sort) {
    switch (input.sort) {
      case "name_asc":
        orderBy = { nameBn: "asc" }
        break
      case "name_desc":
        orderBy = { nameBn: "desc" }
        break
      case "newest":
        orderBy = { createdAt: "desc" }
        break
      case "oldest":
        orderBy = { createdAt: "asc" }
        break
    }
  }

  const citizens = await tenantDb.citizen.findMany({
    where,
    include: {
      presentAddress: {
        include: { ward: true },
      },
      permanentAddress: {
        include: { ward: true },
      },
    },
    take: input.limit,
    skip: input.cursor ? 1 : 0,
    cursor: input.cursor ? { id: input.cursor } : undefined,
    orderBy,
  })

  const nextCursor =
    citizens.length === input.limit
      ? citizens[citizens.length - 1]?.id
      : undefined

  return { citizens, nextCursor }
}

export async function getCitizenById(
  tenantDb: TenantPrismaClient,
  input: GetCitizenInput,
) {
  const citizen = await tenantDb.citizen.findUnique({
    where: { id: input.id },
    include: {
      presentAddress: {
        include: { ward: true },
      },
      permanentAddress: {
        include: { ward: true },
      },
    },
  })

  if (!citizen) throw notFound("Citizen")

  return citizen
}

export async function updateCitizen(
  tenantDb: TenantPrismaClient,
  input: UpdateCitizenInput,
) {
  const citizen = await tenantDb.citizen.findUnique({
    where: { id: input.id },
  })

  if (!citizen) throw notFound("Citizen")

  return await tenantDb.$transaction(async (tx) => {
    let permanentAddressId = citizen.permanentAddressId
    const sameAsPresent = input.sameAsPresent ?? citizen.sameAsPresent

    // Handle sameAsPresent state transition
    if (sameAsPresent && !citizen.sameAsPresent) {
      // If converting to sameAsPresent, delete the old permanent address record if it was separate
      if (citizen.permanentAddressId && citizen.permanentAddressId !== citizen.presentAddressId) {
        await tx.citizenAddress.delete({ where: { id: citizen.permanentAddressId } })
      }
      permanentAddressId = citizen.presentAddressId
    } else if (!sameAsPresent && citizen.sameAsPresent && input.permanentAddress) {
      // If splitting from sameAsPresent, create a new separate permanent address record
      const permAddr = await tx.citizenAddress.create({
        data: {
          villageEn: input.permanentAddress.villageEn,
          villageBn: input.permanentAddress.villageBn ?? "",
          roadEn: input.permanentAddress.roadEn,
          roadBn: input.permanentAddress.roadBn,
          holdingNo: input.permanentAddress.holdingNo,
          wardId: input.permanentAddress.wardId ?? "",
          divisionId: input.permanentAddress.divisionId ?? "",
          divisionNameBn: input.permanentAddress.divisionNameBn ?? "",
          divisionNameEn: input.permanentAddress.divisionNameEn,
          districtId: input.permanentAddress.districtId ?? "",
          districtNameBn: input.permanentAddress.districtNameBn ?? "",
          districtNameEn: input.permanentAddress.districtNameEn,
          upazilaId: input.permanentAddress.upazilaId ?? "",
          upazilaNameBn: input.permanentAddress.upazilaNameBn ?? "",
          upazilaNameEn: input.permanentAddress.upazilaNameEn,
          unionId: input.permanentAddress.unionId ?? "",
          unionNameBn: input.permanentAddress.unionNameBn ?? "",
          unionNameEn: input.permanentAddress.unionNameEn,
          postId: input.permanentAddress.postId ?? "",
          postOfficeBn: input.permanentAddress.postOfficeBn ?? "",
          postOfficeEn: input.permanentAddress.postOfficeEn,
        },
      })
      permanentAddressId = permAddr.id
    }

    // Update address values if inputs are provided
    if (input.presentAddress) {
      await tx.citizenAddress.update({
        where: { id: citizen.presentAddressId },
        data: input.presentAddress,
      })
    }

    if (input.permanentAddress && permanentAddressId && permanentAddressId !== citizen.presentAddressId) {
      await tx.citizenAddress.update({
        where: { id: permanentAddressId },
        data: input.permanentAddress,
      })
    }

    // Update the citizen profile
    return await tx.citizen.update({
      where: { id: input.id },
      data: {
        nameEn: input.nameEn,
        nameBn: input.nameBn,
        dob: input.dob,
        fatherNameEn: input.fatherNameEn,
        fatherNameBn: input.fatherNameBn,
        motherNameEn: input.motherNameEn,
        motherNameBn: input.motherNameBn,
        occupation: input.occupation,
        residentType: input.residentType,
        education: input.education,
        religion: input.religion,
        gender: input.gender,
        maritalStatus: input.maritalStatus,
        mobile: input.mobile,
        email: input.email,
        commentsEn: input.commentsEn,
        commentsBn: input.commentsBn,
        sameAsPresent,
        permanentAddressId,
      },
      include: {
        presentAddress: true,
        permanentAddress: true,
      },
    })
  })
}

export async function deleteCitizen(
  tenantDb: TenantPrismaClient,
  input: DeleteCitizenInput,
) {
  const citizen = await tenantDb.citizen.findUnique({
    where: { id: input.id },
  })

  if (!citizen) throw notFound("Citizen")

  return await tenantDb.$transaction(async (tx) => {
    // Delete citizen first
    await tx.citizen.delete({
      where: { id: input.id },
    })

    // Delete associated addresses
    await tx.citizenAddress.delete({
      where: { id: citizen.presentAddressId },
    })

    if (citizen.permanentAddressId && citizen.permanentAddressId !== citizen.presentAddressId) {
      await tx.citizenAddress.delete({
        where: { id: citizen.permanentAddressId },
      })
    }

    return { success: true }
  })
}

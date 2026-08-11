import type { TenantPrismaClient } from "@workspace/db/tenant"
import { TenantPrisma } from "@workspace/db/tenant"
import { notFound } from "../../utils/errors"
import type {
  ApproveCitizenApplicationInput,
  CreateCitizenApplicationInput,
  DeleteCitizenApplicationInput,
  GetCitizenApplicationInput,
  ListCitizenApplicationsInput,
  RejectCitizenApplicationInput,
} from "./citizen-application.schema"

export async function createApplication(
  tenantDb: TenantPrismaClient,
  input: CreateCitizenApplicationInput,
) {
  return await tenantDb.$transaction(async (tx) => {
    // 1. Create present address
    const presentAddr = await tx.citizenApplicationAddress.create({
      data: {
        villageEn: input.presentAddress.villageEn,
        villageBn: input.presentAddress.villageBn,
        roadEn: input.presentAddress.roadEn,
        roadBn: input.presentAddress.roadBn,
        holdingNo: input.presentAddress.holdingNo,
        wardId: input.presentAddress.wardId,
        divisionId: input.presentAddress.divisionId,
        divisionNameBn: input.presentAddress.divisionNameBn,
        divisionNameEn: input.presentAddress.divisionNameEn,
        districtId: input.presentAddress.districtId,
        districtNameBn: input.presentAddress.districtNameBn,
        districtNameEn: input.presentAddress.districtNameEn,
        upazilaId: input.presentAddress.upazilaId,
        upazilaNameBn: input.presentAddress.upazilaNameBn,
        upazilaNameEn: input.presentAddress.upazilaNameEn,
        unionId: input.presentAddress.unionId,
        unionNameBn: input.presentAddress.unionNameBn,
        unionNameEn: input.presentAddress.unionNameEn,
        postId: input.presentAddress.postId,
        postOfficeBn: input.presentAddress.postOfficeBn,
        postOfficeEn: input.presentAddress.postOfficeEn,
        postCode: input.presentAddress.postCode,
      },
    })

    // 2. Create permanent address if needed
    let permanentAddrId: string | null = null
    if (input.sameAsPresent) {
      permanentAddrId = presentAddr.id
    } else if (input.permanentAddress) {
      const permAddr = await tx.citizenApplicationAddress.create({
        data: {
          villageEn: input.permanentAddress.villageEn,
          villageBn: input.permanentAddress.villageBn,
          roadEn: input.permanentAddress.roadEn,
          roadBn: input.permanentAddress.roadBn,
          holdingNo: input.permanentAddress.holdingNo,
          wardId: input.permanentAddress.wardId,
          divisionId: input.permanentAddress.divisionId,
          divisionNameBn: input.permanentAddress.divisionNameBn,
          divisionNameEn: input.permanentAddress.divisionNameEn,
          districtId: input.permanentAddress.districtId,
          districtNameBn: input.permanentAddress.districtNameBn,
          districtNameEn: input.permanentAddress.districtNameEn,
          upazilaId: input.permanentAddress.upazilaId,
          upazilaNameBn: input.permanentAddress.upazilaNameBn,
          upazilaNameEn: input.permanentAddress.upazilaNameEn,
          unionId: input.permanentAddress.unionId,
          unionNameBn: input.permanentAddress.unionNameBn,
          unionNameEn: input.permanentAddress.unionNameEn,
          postId: input.permanentAddress.postId,
          postOfficeBn: input.permanentAddress.postOfficeBn,
          postOfficeEn: input.permanentAddress.postOfficeEn,
          postCode: input.permanentAddress.postCode,
        },
      })
      permanentAddrId = permAddr.id
    }

    // 3. Create the application profile (Defaults to status: "PENDING")
    return await tx.citizenApplication.create({
      data: {
        status: "PENDING",
        nid: input.nid,
        birthRegNo: input.birthRegNo,
        passportNo: input.passportNo,
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
        presentAddressId: presentAddr.id,
        sameAsPresent: input.sameAsPresent,
        permanentAddressId: permanentAddrId,
        mobile: input.mobile,
        email: input.email,
        commentsEn: input.commentsEn,
        commentsBn: input.commentsBn,
      },
    })
  })
}

export async function listApplications(
  tenantDb: TenantPrismaClient,
  input: ListCitizenApplicationsInput,
) {
  const where: TenantPrisma.CitizenApplicationWhereInput = {}

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

  if (input.status) {
    where.status = input.status
  }

  let orderBy: TenantPrisma.CitizenApplicationOrderByWithRelationInput = { createdAt: "desc" }
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

  const applications = await tenantDb.citizenApplication.findMany({
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
    applications.length === input.limit
      ? applications[applications.length - 1]?.id
      : undefined

  return { applications, nextCursor }
}

export async function getApplicationById(
  tenantDb: TenantPrismaClient,
  input: GetCitizenApplicationInput,
) {
  const application = await tenantDb.citizenApplication.findUnique({
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

  if (!application) throw notFound("CitizenApplication")

  return application
}

export async function rejectApplication(
  tenantDb: TenantPrismaClient,
  input: RejectCitizenApplicationInput,
) {
  const application = await tenantDb.citizenApplication.findUnique({
    where: { id: input.id },
  })

  if (!application) throw notFound("CitizenApplication")

  if (application.status === "APPROVED") {
    throw new Error("Cannot reject an application that is already approved.")
  }

  return await tenantDb.citizenApplication.update({
    where: { id: input.id },
    data: {
      status: "REJECTED",
      rejectionReason: input.rejectionReason || null,
    },
  })
}

export async function approveApplication(
  tenantDb: TenantPrismaClient,
  input: ApproveCitizenApplicationInput,
) {
  // 1. Fetch the application including addresses
  const application = await tenantDb.citizenApplication.findUnique({
    where: { id: input.id },
    include: {
      presentAddress: true,
      permanentAddress: true,
    },
  })

  if (!application) throw notFound("CitizenApplication")

  if (application.status === "APPROVED") {
    throw new Error("Application is already approved.")
  }

  // 2. Verify uniqueness constraints in the Citizen registry before transferring data
  if (application.nid) {
    const existing = await tenantDb.citizen.findUnique({
      where: { nid: application.nid },
    })
    if (existing) {
      throw new Error("A citizen with this National ID already exists in the registry.")
    }
  }

  if (application.birthRegNo) {
    const existing = await tenantDb.citizen.findUnique({
      where: { birthRegNo: application.birthRegNo },
    })
    if (existing) {
      throw new Error("A citizen with this Birth Registration number already exists in the registry.")
    }
  }

  if (application.passportNo) {
    const existing = await tenantDb.citizen.findUnique({
      where: { passportNo: application.passportNo },
    })
    if (existing) {
      throw new Error("A citizen with this Passport number already exists in the registry.")
    }
  }

  // 3. Atomically transfer records to the active Citizen registry in a transaction
  return await tenantDb.$transaction(async (tx) => {
    // 3a. Create present address record
    const presentAddr = await tx.citizenAddress.create({
      data: {
        villageEn: application.presentAddress.villageEn,
        villageBn: application.presentAddress.villageBn,
        roadEn: application.presentAddress.roadEn,
        roadBn: application.presentAddress.roadBn,
        holdingNo: application.presentAddress.holdingNo,
        wardId: application.presentAddress.wardId,
        divisionId: application.presentAddress.divisionId,
        divisionNameBn: application.presentAddress.divisionNameBn,
        divisionNameEn: application.presentAddress.divisionNameEn,
        districtId: application.presentAddress.districtId,
        districtNameBn: application.presentAddress.districtNameBn,
        districtNameEn: application.presentAddress.districtNameEn,
        upazilaId: application.presentAddress.upazilaId,
        upazilaNameBn: application.presentAddress.upazilaNameBn,
        upazilaNameEn: application.presentAddress.upazilaNameEn,
        unionId: application.presentAddress.unionId,
        unionNameBn: application.presentAddress.unionNameBn,
        unionNameEn: application.presentAddress.unionNameEn,
        postId: application.presentAddress.postId,
        postOfficeBn: application.presentAddress.postOfficeBn,
        postOfficeEn: application.presentAddress.postOfficeEn,
        postCode: application.presentAddress.postCode,
      },
    })

    // 3b. Create permanent address record (or share present address ID)
    let permanentAddrId = presentAddr.id
    if (!application.sameAsPresent && application.permanentAddress) {
      const permAddr = await tx.citizenAddress.create({
        data: {
          villageEn: application.permanentAddress.villageEn,
          villageBn: application.permanentAddress.villageBn,
          roadEn: application.permanentAddress.roadEn,
          roadBn: application.permanentAddress.roadBn,
          holdingNo: application.permanentAddress.holdingNo,
          wardId: application.permanentAddress.wardId,
          divisionId: application.permanentAddress.divisionId,
          divisionNameBn: application.permanentAddress.divisionNameBn,
          divisionNameEn: application.permanentAddress.divisionNameEn,
          districtId: application.permanentAddress.districtId,
          districtNameBn: application.permanentAddress.districtNameBn,
          districtNameEn: application.permanentAddress.districtNameEn,
          upazilaId: application.permanentAddress.upazilaId,
          upazilaNameBn: application.permanentAddress.upazilaNameBn,
          upazilaNameEn: application.permanentAddress.upazilaNameEn,
          unionId: application.permanentAddress.unionId,
          unionNameBn: application.permanentAddress.unionNameBn,
          unionNameEn: application.permanentAddress.unionNameEn,
          postId: application.permanentAddress.postId,
          postOfficeBn: application.permanentAddress.postOfficeBn,
          postOfficeEn: application.permanentAddress.postOfficeEn,
          postCode: application.permanentAddress.postCode,
        },
      })
      permanentAddrId = permAddr.id
    }

    // 3c. Create the final Citizen profile
    const citizen = await tx.citizen.create({
      data: {
        nid: application.nid,
        birthRegNo: application.birthRegNo,
        passportNo: application.passportNo,
        nameEn: application.nameEn,
        nameBn: application.nameBn,
        dob: application.dob,
        fatherNameEn: application.fatherNameEn,
        fatherNameBn: application.fatherNameBn,
        motherNameEn: application.motherNameEn,
        motherNameBn: application.motherNameBn,
        occupation: application.occupation,
        residentType: application.residentType,
        education: application.education,
        religion: application.religion,
        gender: application.gender,
        maritalStatus: application.maritalStatus,
        presentAddressId: presentAddr.id,
        sameAsPresent: application.sameAsPresent,
        permanentAddressId: permanentAddrId,
        mobile: application.mobile,
        email: application.email,
        commentsEn: application.commentsEn,
        commentsBn: application.commentsBn,
      },
    })

    // 3d. Update the application status to APPROVED
    await tx.citizenApplication.update({
      where: { id: application.id },
      data: {
        status: "APPROVED",
        rejectionReason: null, // Clear any past rejection reason
      },
    })

    return citizen
  })
}

export async function deleteApplication(
  tenantDb: TenantPrismaClient,
  input: DeleteCitizenApplicationInput,
) {
  const application = await tenantDb.citizenApplication.findUnique({
    where: { id: input.id },
  })

  if (!application) throw notFound("CitizenApplication")

  return await tenantDb.$transaction(async (tx) => {
    // Delete application first
    await tx.citizenApplication.delete({
      where: { id: input.id },
    })

    // Delete associated addresses
    await tx.citizenApplicationAddress.delete({
      where: { id: application.presentAddressId },
    })

    if (application.permanentAddressId && application.permanentAddressId !== application.presentAddressId) {
      await tx.citizenApplicationAddress.delete({
        where: { id: application.permanentAddressId },
      })
    }

    return { success: true }
  })
}

import { createTRPCRouter, tenantMemberProcedure, publicTenantProcedure } from "../../trpc"
import {
  approveCitizenApplicationSchema,
  createCitizenApplicationSchema,
  deleteCitizenApplicationSchema,
  getCitizenApplicationSchema,
  listCitizenApplicationsSchema,
  rejectCitizenApplicationSchema,
} from "./citizen-application.schema"
import {
  approveApplication,
  createApplication,
  deleteApplication,
  getApplicationById,
  listApplications,
  rejectApplication,
} from "./citizen-application.service"

export const citizenApplicationRouter = createTRPCRouter({
  create: publicTenantProcedure
    .input(createCitizenApplicationSchema)
    .mutation(({ ctx, input }) => createApplication(ctx.tenantDb, input)),

  list: tenantMemberProcedure
    .input(listCitizenApplicationsSchema)
    .query(({ ctx, input }) => listApplications(ctx.tenantDb, input)),

  byId: tenantMemberProcedure
    .input(getCitizenApplicationSchema)
    .query(({ ctx, input }) => getApplicationById(ctx.tenantDb, input)),

  approve: tenantMemberProcedure
    .input(approveCitizenApplicationSchema)
    .mutation(({ ctx, input }) => approveApplication(ctx.tenantDb, input)),

  reject: tenantMemberProcedure
    .input(rejectCitizenApplicationSchema)
    .mutation(({ ctx, input }) => rejectApplication(ctx.tenantDb, input)),

  delete: tenantMemberProcedure
    .input(deleteCitizenApplicationSchema)
    .mutation(({ ctx, input }) => deleteApplication(ctx.tenantDb, input)),
})

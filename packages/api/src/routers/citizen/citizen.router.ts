import { createTRPCRouter, tenantMemberProcedure } from "../../trpc"
import {
  deleteCitizenSchema,
  getCitizenSchema,
  listCitizensSchema,
  updateCitizenSchema,
} from "./citizen.schema"
import {
  deleteCitizen,
  getCitizenById,
  listCitizens,
  updateCitizen,
} from "./citizen.service"

export const citizenRouter = createTRPCRouter({
  list: tenantMemberProcedure
    .input(listCitizensSchema)
    .query(({ ctx, input }) => listCitizens(ctx.tenantDb, input)),

  byId: tenantMemberProcedure
    .input(getCitizenSchema)
    .query(({ ctx, input }) => getCitizenById(ctx.tenantDb, input)),

  update: tenantMemberProcedure
    .input(updateCitizenSchema)
    .mutation(({ ctx, input }) => updateCitizen(ctx.tenantDb, input)),

  delete: tenantMemberProcedure
    .input(deleteCitizenSchema)
    .mutation(({ ctx, input }) => deleteCitizen(ctx.tenantDb, input)),
})

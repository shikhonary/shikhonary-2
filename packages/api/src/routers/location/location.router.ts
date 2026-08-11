import { createTRPCRouter, protectedProcedure } from "../../trpc"
import { z } from "zod"
import { db } from "@workspace/db/main"

export const locationRouter = createTRPCRouter({
  divisions: protectedProcedure.query(async () => {
    return db.division.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        nameBn: true,
      },
    })
  }),

  districts: protectedProcedure
    .input(
      z.object({
        divisionId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      return db.district.findMany({
        where: { divisionId: input.divisionId },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          nameBn: true,
        },
      })
    }),

  upazilas: protectedProcedure
    .input(
      z.object({
        districtId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      return db.upazila.findMany({
        where: { districtId: input.districtId },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          nameBn: true,
        },
      })
    }),

  unions: protectedProcedure
    .input(
      z.object({
        upazilaId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      return db.union.findMany({
        where: { upazilaId: input.upazilaId },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          nameBn: true,
        },
      })
    }),

  posts: protectedProcedure
    .input(
      z.object({
        upazilaId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      return db.post.findMany({
        where: { upazilaId: input.upazilaId },
        orderBy: { postOffice: "asc" },
        select: {
          id: true,
          postOffice: true,
          postOfficeBn: true,
          postCode: true,
        },
      })
    }),
})

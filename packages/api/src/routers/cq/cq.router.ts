/**
 * CQ sub-router.
 *
 * Thin tRPC layer — validates input with Zod schemas, then delegates
 * business logic to `cq.service.ts`. No raw DB calls here.
 *
 * All procedures are protected (require an authenticated session).
 */
import { db } from "@workspace/db/main"
import { createTRPCRouter, protectedProcedure } from "../../trpc"
import {
  bulkDeleteCqsSchema,
  createCqSchema,
  deleteCqSchema,
  getCqSchema,
  listCqsSchema,
  updateCqSchema,
  importCqsSchema,
  cqBoardYearsSchema,
} from "./cq.schema"
import {
  bulkDeleteCqs,
  createCq,
  deleteCq,
  getCqById,
  listCqs,
  updateCq,
  importCqs,
  getCqBoardYears,
} from "./cq.service"

export const cqRouter = createTRPCRouter({
  /**
   * List CQs with pagination, subject/chapter filtering, and search query.
   */
  list: protectedProcedure
    .input(listCqsSchema)
    .query(({ input }) => listCqs(db, input)),

  /**
   * Fetch a single CQ by ID (including subject, chapter, attachments, and answer relations).
   */
  byId: protectedProcedure
    .input(getCqSchema)
    .query(({ input }) => getCqById(db, input)),

  /**
   * Create a new CQ record (includes optional attachments and answer).
   */
  create: protectedProcedure
    .input(createCqSchema)
    .mutation(({ input }) => createCq(db, input)),

  /**
   * Update an existing CQ record.
   */
  update: protectedProcedure
    .input(updateCqSchema)
    .mutation(({ input }) => updateCq(db, input)),

  /**
   * Permanently delete a single CQ record.
   */
  delete: protectedProcedure
    .input(deleteCqSchema)
    .mutation(({ input }) => deleteCq(db, input)),

  /**
   * Bulk import CQ records from JSON array.
   */
  import: protectedProcedure
    .input(importCqsSchema)
    .mutation(({ input }) => importCqs(db, input)),

  /**
   * Permanently delete multiple CQ records by IDs.
   */
  bulkDelete: protectedProcedure
    .input(bulkDeleteCqsSchema)
    .mutation(({ input }) => bulkDeleteCqs(db, input)),

  /**
   * Fetch board + year combinations for CQs by subject and optional chapter.
   */
  boardYears: protectedProcedure
    .input(cqBoardYearsSchema)
    .query(({ input }) => getCqBoardYears(db, input)),
})

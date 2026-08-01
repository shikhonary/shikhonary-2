import { db } from "@workspace/db/main"
import { createTRPCRouter, teacherProcedure } from "../../trpc"
import {
  getAdminStats,
  getSubjectPerformance,
  getAttemptStatus,
  getCohortDistribution,
  getProctoringFlags,
  getMeritList,
  getRecentAttempts,
} from "./dashboard.service"

export const dashboardRouter = createTRPCRouter({
  getStats: teacherProcedure.query(() => getAdminStats(db)),
  getSubjectPerformance: teacherProcedure.query(() => getSubjectPerformance(db)),
  getAttemptStatus: teacherProcedure.query(() => getAttemptStatus(db)),
  getCohortDistribution: teacherProcedure.query(() => getCohortDistribution(db)),
  getProctoringFlags: teacherProcedure.query(() => getProctoringFlags(db)),
  getMeritList: teacherProcedure.query(() => getMeritList(db)),
  getRecentAttempts: teacherProcedure.query(() => getRecentAttempts(db)),
})

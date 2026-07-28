/**
 * Public barrel for @workspace/api.
 *
 * Only server-safe exports live here. Never import this in a Client Component.
 *
 * IMPORTANT: Procedure builders (publicProcedure, protectedProcedure, etc.)
 * are intentionally NOT exported from this barrel. They are internal to the
 * package and should only be imported within `packages/api/src/routers/`.
 * Consumers should only depend on `AppRouter`, `createTRPCContext`, and types.
 */
export { createTRPCContext } from "./trpc"
export type {
  TRPCContext,
  AuthedTRPCContext,
  SuperAdminTRPCContext,
  TenantTRPCContext,
} from "./trpc"
export { appRouter, createCaller } from "./root"
export type { AppRouter } from "./root"
export type {
  ListUsersInput,
  GetUserInput,
  UpdateUserInput,
  UpdateUserRolesInput,
  DeleteUserInput,
} from "./routers/user/user.schema"
export type {
  RoleForSelectionInput,
  ListRolesInput,
  GetRoleInput,
  CreateRoleInput,
  UpdateRoleInput,
  DeleteRoleInput,
} from "./routers/role/role.schema"
export type {
  ListAcademicClassesInput,
  GetAcademicClassInput,
  AcademicClassForSelectionInput,
  CreateAcademicClassInput,
  UpdateAcademicClassInput,
  DeleteAcademicClassInput,
} from "./routers/academic-class/academic-class.schema"
export type {
  ListSubjectsInput,
  GetSubjectInput,
  SubjectForSelectionInput,
  CreateSubjectInput,
  UpdateSubjectInput,
  DeleteSubjectInput,
  AssignAcademicClassesInput,
} from "./routers/subject/subject.schema"
export type {
  ListChaptersInput,
  GetChapterInput,
  ChapterForSelectionInput,
  CreateChapterInput,
  UpdateChapterInput,
  DeleteChapterInput,
  ReorderChaptersInput,
  ChapterStatsInput,
} from "./routers/chapter/chapter.schema"
export type {
  ListMcqsInput,
  GetMcqInput,
  McqStatsInput,
  CreateMcqInput,
  ImportMcqsInput,
  UpdateMcqInput,
  DeleteMcqInput,
  BulkDeleteMcqsInput,
  ToggleMcqActiveInput,
  McqSortOption,
} from "./routers/mcq/mcq.schema"
export type {
  ListExamsInput,
  GetExamInput,
  ExamStatsInput,
  CreateExamInput,
  UpdateExamInput,
  DeleteExamInput,
  BulkDeleteExamsInput,
  ToggleExamStatusInput,
  AddExamSubjectsInput,
  RemoveExamSubjectInput,
  ExamSortOption,
} from "./routers/exam/exam.schema"
export type {
  ListExamGroupsInput,
  GetExamGroupInput,
  ExamGroupStatsInput,
  CreateExamGroupInput,
  UpdateExamGroupInput,
  DeleteExamGroupInput,
  BulkDeleteExamGroupsInput,
  TogglePublishExamGroupInput,
  AddExamGroupItemInput,
  UpdateExamGroupItemInput,
  RemoveExamGroupItemInput,
  ReorderExamGroupItemsInput,
  CalculateExamGroupResultsInput,
  ListExamGroupResultsInput,
  GetStudentExamGroupResultInput,
  ExamGroupSortOption,
  CalculationType,
  ExamGroupType,
} from "./routers/exam-group/exam-group.schema"
export type {
  ListQuestionBankInput,
  QuestionBankStatsInput,
  GetQuestionBankMcqInput,
  QuestionBankByChapterInput,
  QuestionBankSortOption,
} from "./routers/question-bank/question-bank.schema"


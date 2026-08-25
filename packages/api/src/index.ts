/**
 * Public barrel for @workspace/api.
 */
export { createTRPCContext } from "./trpc"
export type {
  TRPCContext,
  AuthedTRPCContext,
  SuperAdminTRPCContext,
  TenantTRPCContext,
  TenantMemberTRPCContext,
} from "./trpc"
export { appRouter, createCaller } from "./root"
export type { AppRouter } from "./root"

export type {
  ListUsersInput,
  GetUserInput,
  UpdateUserInput,
  UpdateUserRolesInput,
  DeleteUserInput,
  CreateUserInput,
  UsersForSelectionInput,
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
  ListTenantsInput,
  GetTenantInput,
  GetTenantBySlugInput,
  CreateTenantInput,
  UpdateTenantInput,
  DeleteTenantInput,
  ToggleTenantStatusInput,
  BulkTenantActionInput,
} from "./routers/tenant/tenant.schema"

export type {
  ListSubscriptionsInput,
  GetSubscriptionInput,
  GetSubscriptionByTenantInput,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  ChangeSubscriptionPlanInput,
  CancelSubscriptionInput,
  DeleteSubscriptionInput,
} from "./routers/subscription/subscription.schema"

export type {
  ListSubscriptionPlansInput,
  GetSubscriptionPlanInput,
  CreateSubscriptionPlanInput,
  UpdateSubscriptionPlanInput,
  DeleteSubscriptionPlanInput,
} from "./routers/subscription-plan/subscription-plan.schema"

export type {
  ListFiscalYearsInput,
  GetFiscalYearInput,
  CreateFiscalYearInput,
  UpdateFiscalYearInput,
  DeleteFiscalYearInput,
} from "./routers/fiscal-year/fiscal-year.schema"

export type {
  ListTenantFiscalYearsInput,
  GetTenantFiscalYearInput,
  CreateTenantFiscalYearInput,
  UpdateTenantFiscalYearInput,
  DeleteTenantFiscalYearInput,
} from "./routers/tenant-fiscal-year/tenant-fiscal-year.schema"

// ── Academic Setup Exports ───────────────────────────────────
export type {
  ListAcademicSubjectsInput,
  GetAcademicSubjectInput,
  CreateAcademicSubjectInput,
  UpdateAcademicSubjectInput,
  DeleteAcademicSubjectInput,
} from "./routers/academic-subject/academic-subject.schema"

export type {
  ListAcademicChaptersInput,
  GetAcademicChapterInput,
  CreateAcademicChapterInput,
  UpdateAcademicChapterInput,
  DeleteAcademicChapterInput,
} from "./routers/academic-chapter/academic-chapter.schema"

export type {
  ListAcademicYearsInput,
  GetAcademicYearInput,
  CreateAcademicYearInput,
  UpdateAcademicYearInput,
  DeleteAcademicYearInput,
} from "./routers/academic-year/academic-year.schema"

export type {
  ListAcademicClassesInput,
  GetAcademicClassInput,
  CreateAcademicClassInput,
  UpdateAcademicClassInput,
  DeleteAcademicClassInput,
} from "./routers/academic-class/academic-class.schema"

export type {
  ListQuestionTypesInput,
  GetQuestionTypeInput,
  CreateQuestionTypeInput,
  UpdateQuestionTypeInput,
  DeleteQuestionTypeInput,
} from "./routers/question-type/question-type.schema"

export type {
  ListMcqsInput,
  McqStatsInput,
  CreateMcqInput,
  UpdateMcqInput,
  DeleteMcqInput,
  BulkDeleteMcqsInput,
  ToggleMcqActiveInput,
  ImportMcqsInput,
} from "./routers/mcq/mcq.schema"





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
  ListQuestionPapersInput,
  GetQuestionPaperInput,
  CreateQuestionPaperInput,
  CreateQuestionPaperFullInput,
  UpdateQuestionPaperInput,
  DeleteQuestionPaperInput,
  DuplicateQuestionPaperInput,
  AddQuestionPaperQuestionInput,
  RemoveQuestionPaperQuestionInput,
  ReorderQuestionPaperQuestionsInput,
  UpsertQuestionPaperSectionInput,
  DeleteQuestionPaperSectionInput,
  UpsertQuestionPaperSubjectInput,
  DeleteQuestionPaperSubjectInput,
  UpsertQuestionPaperDistributionInput,
  DeleteQuestionPaperDistributionInput,
  GetDistributionStatusesInput,
  GetAvailableQuestionsInput,
  BulkAssignQuestionsInput,
  BulkRemoveQuestionsInput,
  UpdateQuestionPaperSettingsInput,
  GeneratePaperSetsInput,
} from "./routers/question-paper/question-paper.schema"

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

export type {
  ListCqsInput,
  CqStatsInput,
  CreateCqInput,
  UpdateCqInput,
  DeleteCqInput,
  BulkDeleteCqsInput,
  ToggleCqActiveInput,
  ImportCqsInput,
} from "./routers/cq/cq.schema"

export type {
  ListCsInput,
  CsStatsInput,
  CreateCsInput,
  UpdateCsInput,
  DeleteCsInput,
  BulkDeleteCsInput,
  ToggleCsActiveInput,
  ImportCsInput,
} from "./routers/cs/cs.schema"

export type {
  ListShortAnswersInput,
  ShortAnswerStatsInput,
  CreateShortAnswerInput,
  UpdateShortAnswerInput,
  DeleteShortAnswerInput,
  BulkDeleteShortAnswersInput,
  ToggleShortAnswerActiveInput,
  ImportShortAnswersInput,
} from "./routers/short-answer/short-answer.schema"
export type {
  ListParagraphsInput,
  ParagraphStatsInput,
  CreateParagraphInput,
  UpdateParagraphInput,
  DeleteParagraphInput,
  BulkDeleteParagraphsInput,
  ImportParagraphsInput,
} from "./routers/paragraph/paragraph.schema"

export type {
  ListAmplificationsInput,
  AmplificationStatsInput,
  CreateAmplificationInput,
  UpdateAmplificationInput,
  DeleteAmplificationInput,
  BulkDeleteAmplificationsInput,
  ImportAmplificationsInput,
} from "./routers/amplification/amplification.schema"

export type {
  ListLettersInput,
  LetterStatsInput,
  CreateLetterInput,
  UpdateLetterInput,
  DeleteLetterInput,
  BulkDeleteLettersInput,
  ImportLettersInput,
} from "./routers/letter/letter.schema"

export type {
  ListApplicationsInput,
  ApplicationStatsInput,
  CreateApplicationInput,
  UpdateApplicationInput,
  DeleteApplicationInput,
  BulkDeleteApplicationsInput,
  ImportApplicationsInput,
} from "./routers/application/application.schema"

export type {
  ListSummariesInput,
  SummaryStatsInput,
  CreateSummaryInput,
  UpdateSummaryInput,
  DeleteSummaryInput,
  BulkDeleteSummariesInput,
  ImportSummariesInput,
} from "./routers/summary/summary.schema"

export type {
  ListEssencesInput,
  EssenceStatsInput,
  CreateEssenceInput,
  UpdateEssenceInput,
  DeleteEssenceInput,
  BulkDeleteEssencesInput,
  ImportEssencesInput,
} from "./routers/essence/essence.schema"

export type {
  ListThoughtExpansionsInput,
  ThoughtExpansionStatsInput,
  GetThoughtExpansionInput,
  CreateThoughtExpansionInput,
  UpdateThoughtExpansionInput,
  DeleteThoughtExpansionInput,
  BulkDeleteThoughtExpansionsInput,
  ImportThoughtExpansionsInput,
} from "./routers/thought-expansion/thought-expansion.schema"

export type {
  ListNewsReportsInput,
  NewsReportStatsInput,
  GetNewsReportInput,
  CreateNewsReportInput,
  UpdateNewsReportInput,
  DeleteNewsReportInput,
  BulkDeleteNewsReportsInput,
  ImportNewsReportsInput,
} from "./routers/news-report/news-report.schema"

export type {
  ListEssaysInput,
  EssayStatsInput,
  GetEssayInput,
  CreateEssayInput,
  UpdateEssayInput,
  DeleteEssayInput,
  BulkDeleteEssaysInput,
  ImportEssaysInput,
} from "./routers/essay/essay.schema"


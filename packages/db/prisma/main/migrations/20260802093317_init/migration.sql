-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "phoneNumber" TEXT,
    "phoneNumberVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_class" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicClassSubject" (
    "id" TEXT NOT NULL,
    "academicClassId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicClassSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "institute" TEXT NOT NULL,
    "roll" INTEGER,
    "isOfflineStudent" BOOLEAN NOT NULL DEFAULT false,
    "academicClassId" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mcq" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "options" TEXT[],
    "statements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "type" TEXT NOT NULL,
    "isMath" BOOLEAN NOT NULL DEFAULT false,
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "explanation" TEXT,
    "questionUrl" TEXT,
    "context" TEXT,
    "contextUrl" TEXT,
    "subjectId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mcq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "totalMcq" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "hasSuffle" BOOLEAN NOT NULL DEFAULT false,
    "hasRandom" BOOLEAN NOT NULL DEFAULT false,
    "hasNegativeMark" BOOLEAN NOT NULL DEFAULT false,
    "negativeMark" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isOffline" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "academicClassId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamAttempt" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "answers" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "wrongAnswers" INTEGER NOT NULL DEFAULT 0,
    "skippedQuestions" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "bestStreak" INTEGER NOT NULL DEFAULT 0,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "duration" INTEGER DEFAULT 0,
    "lastActivityAt" TIMESTAMP(3),
    "totalQuestions" INTEGER NOT NULL,
    "answeredCount" INTEGER NOT NULL DEFAULT 0,
    "flaggedQuestions" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "status" TEXT NOT NULL DEFAULT 'Not Started',
    "submissionType" TEXT,
    "enableAiFeature" BOOLEAN NOT NULL DEFAULT false,
    "hasNegativeMark" BOOLEAN NOT NULL DEFAULT false,
    "negativeMark" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hasShuffle" BOOLEAN NOT NULL DEFAULT false,
    "hasRandom" BOOLEAN NOT NULL DEFAULT false,
    "tabSwitches" INTEGER NOT NULL DEFAULT 0,
    "tabSwitchTimes" TIMESTAMP(3)[] DEFAULT ARRAY[]::TIMESTAMP(3)[],
    "warnings" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "feedbackStatus" TEXT NOT NULL DEFAULT 'Pending',
    "reviewNotes" TEXT,
    "examId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnswerHistory" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "mcqId" TEXT NOT NULL,
    "questionNumber" INTEGER NOT NULL,
    "selectedOption" TEXT NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeSpent" INTEGER,
    "previousAnswer" TEXT,
    "isChanged" BOOLEAN NOT NULL DEFAULT false,
    "changeCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnswerHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_subject" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "mcqIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_group" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'MODEL_TEST',
    "calculationType" TEXT NOT NULL DEFAULT 'SUM',
    "bestOfNCount" INTEGER,
    "totalMarks" DOUBLE PRECISION,
    "passMarks" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "academicClassId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_group_item" (
    "id" TEXT NOT NULL,
    "examGroupId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "weightage" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_group_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_group_result" (
    "id" TEXT NOT NULL,
    "examGroupId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "totalObtainedMarks" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalMaxMarks" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gpa" DOUBLE PRECISION,
    "grade" TEXT,
    "meritPosition" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PASSED',
    "examsAttempted" INTEGER NOT NULL DEFAULT 0,
    "totalExamsInGroup" INTEGER NOT NULL DEFAULT 0,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_group_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RoleToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RoleToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_phoneNumber_key" ON "user"("phoneNumber");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_phoneNumber_idx" ON "user"("phoneNumber");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "role_name_key" ON "role"("name");

-- CreateIndex
CREATE INDEX "academic_class_name_idx" ON "academic_class"("name");

-- CreateIndex
CREATE INDEX "academic_class_isActive_idx" ON "academic_class"("isActive");

-- CreateIndex
CREATE INDEX "Subject_position_idx" ON "Subject"("position");

-- CreateIndex
CREATE INDEX "AcademicClassSubject_academicClassId_idx" ON "AcademicClassSubject"("academicClassId");

-- CreateIndex
CREATE INDEX "AcademicClassSubject_subjectId_idx" ON "AcademicClassSubject"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicClassSubject_academicClassId_subjectId_key" ON "AcademicClassSubject"("academicClassId", "subjectId");

-- CreateIndex
CREATE INDEX "Chapter_subjectId_idx" ON "Chapter"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "Student"("userId");

-- CreateIndex
CREATE INDEX "Student_userId_idx" ON "Student"("userId");

-- CreateIndex
CREATE INDEX "Mcq_chapterId_idx" ON "Mcq"("chapterId");

-- CreateIndex
CREATE INDEX "Mcq_chapterId_type_idx" ON "Mcq"("chapterId", "type");

-- CreateIndex
CREATE INDEX "Mcq_isMath_idx" ON "Mcq"("isMath");

-- CreateIndex
CREATE INDEX "Mcq_subjectId_chapterId_idx" ON "Mcq"("subjectId", "chapterId");

-- CreateIndex
CREATE INDEX "Mcq_subjectId_idx" ON "Mcq"("subjectId");

-- CreateIndex
CREATE INDEX "Mcq_subjectId_type_idx" ON "Mcq"("subjectId", "type");

-- CreateIndex
CREATE INDEX "Mcq_type_idx" ON "Mcq"("type");

-- CreateIndex
CREATE INDEX "Exam_title_idx" ON "Exam"("title");

-- CreateIndex
CREATE INDEX "Exam_status_idx" ON "Exam"("status");

-- CreateIndex
CREATE INDEX "Exam_academicClassId_idx" ON "Exam"("academicClassId");

-- CreateIndex
CREATE INDEX "Exam_createdAt_idx" ON "Exam"("createdAt");

-- CreateIndex
CREATE INDEX "Exam_status_createdAt_idx" ON "Exam"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ExamAttempt_studentId_idx" ON "ExamAttempt"("studentId");

-- CreateIndex
CREATE INDEX "ExamAttempt_examId_idx" ON "ExamAttempt"("examId");

-- CreateIndex
CREATE INDEX "ExamAttempt_status_idx" ON "ExamAttempt"("status");

-- CreateIndex
CREATE INDEX "ExamAttempt_score_idx" ON "ExamAttempt"("score");

-- CreateIndex
CREATE INDEX "ExamAttempt_createdAt_idx" ON "ExamAttempt"("createdAt");

-- CreateIndex
CREATE INDEX "ExamAttempt_studentId_examId_idx" ON "ExamAttempt"("studentId", "examId");

-- CreateIndex
CREATE INDEX "ExamAttempt_studentId_status_idx" ON "ExamAttempt"("studentId", "status");

-- CreateIndex
CREATE INDEX "ExamAttempt_studentId_createdAt_idx" ON "ExamAttempt"("studentId", "createdAt");

-- CreateIndex
CREATE INDEX "ExamAttempt_examId_status_idx" ON "ExamAttempt"("examId", "status");

-- CreateIndex
CREATE INDEX "ExamAttempt_status_createdAt_idx" ON "ExamAttempt"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ExamAttempt_studentId_score_idx" ON "ExamAttempt"("studentId", "score");

-- CreateIndex
CREATE INDEX "ExamAttempt_lastActivityAt_idx" ON "ExamAttempt"("lastActivityAt");

-- CreateIndex
CREATE INDEX "ExamAttempt_submissionType_idx" ON "ExamAttempt"("submissionType");

-- CreateIndex
CREATE INDEX "ExamAttempt_bestStreak_idx" ON "ExamAttempt"("bestStreak");

-- CreateIndex
CREATE INDEX "AnswerHistory_attemptId_idx" ON "AnswerHistory"("attemptId");

-- CreateIndex
CREATE INDEX "AnswerHistory_mcqId_idx" ON "AnswerHistory"("mcqId");

-- CreateIndex
CREATE INDEX "AnswerHistory_attemptId_questionNumber_idx" ON "AnswerHistory"("attemptId", "questionNumber");

-- CreateIndex
CREATE INDEX "AnswerHistory_answeredAt_idx" ON "AnswerHistory"("answeredAt");

-- CreateIndex
CREATE INDEX "AnswerHistory_isCorrect_idx" ON "AnswerHistory"("isCorrect");

-- CreateIndex
CREATE INDEX "exam_subject_examId_idx" ON "exam_subject"("examId");

-- CreateIndex
CREATE INDEX "exam_subject_subjectId_idx" ON "exam_subject"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_subject_examId_subjectId_key" ON "exam_subject"("examId", "subjectId");

-- CreateIndex
CREATE INDEX "exam_group_title_idx" ON "exam_group"("title");

-- CreateIndex
CREATE INDEX "exam_group_type_idx" ON "exam_group"("type");

-- CreateIndex
CREATE INDEX "exam_group_academicClassId_idx" ON "exam_group"("academicClassId");

-- CreateIndex
CREATE INDEX "exam_group_isPublished_idx" ON "exam_group"("isPublished");

-- CreateIndex
CREATE INDEX "exam_group_item_examGroupId_idx" ON "exam_group_item"("examGroupId");

-- CreateIndex
CREATE INDEX "exam_group_item_examId_idx" ON "exam_group_item"("examId");

-- CreateIndex
CREATE INDEX "exam_group_item_examGroupId_position_idx" ON "exam_group_item"("examGroupId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "exam_group_item_examGroupId_examId_key" ON "exam_group_item"("examGroupId", "examId");

-- CreateIndex
CREATE INDEX "exam_group_result_examGroupId_idx" ON "exam_group_result"("examGroupId");

-- CreateIndex
CREATE INDEX "exam_group_result_studentId_idx" ON "exam_group_result"("studentId");

-- CreateIndex
CREATE INDEX "exam_group_result_examGroupId_meritPosition_idx" ON "exam_group_result"("examGroupId", "meritPosition");

-- CreateIndex
CREATE INDEX "exam_group_result_examGroupId_percentage_idx" ON "exam_group_result"("examGroupId", "percentage");

-- CreateIndex
CREATE UNIQUE INDEX "exam_group_result_examGroupId_studentId_key" ON "exam_group_result"("examGroupId", "studentId");

-- CreateIndex
CREATE INDEX "_RoleToUser_B_index" ON "_RoleToUser"("B");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicClassSubject" ADD CONSTRAINT "AcademicClassSubject_academicClassId_fkey" FOREIGN KEY ("academicClassId") REFERENCES "academic_class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicClassSubject" ADD CONSTRAINT "AcademicClassSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_academicClassId_fkey" FOREIGN KEY ("academicClassId") REFERENCES "academic_class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mcq" ADD CONSTRAINT "Mcq_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mcq" ADD CONSTRAINT "Mcq_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_academicClassId_fkey" FOREIGN KEY ("academicClassId") REFERENCES "academic_class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAttempt" ADD CONSTRAINT "ExamAttempt_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAttempt" ADD CONSTRAINT "ExamAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerHistory" ADD CONSTRAINT "AnswerHistory_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "ExamAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerHistory" ADD CONSTRAINT "AnswerHistory_mcqId_fkey" FOREIGN KEY ("mcqId") REFERENCES "Mcq"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_subject" ADD CONSTRAINT "exam_subject_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_subject" ADD CONSTRAINT "exam_subject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_group" ADD CONSTRAINT "exam_group_academicClassId_fkey" FOREIGN KEY ("academicClassId") REFERENCES "academic_class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_group_item" ADD CONSTRAINT "exam_group_item_examGroupId_fkey" FOREIGN KEY ("examGroupId") REFERENCES "exam_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_group_item" ADD CONSTRAINT "exam_group_item_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_group_result" ADD CONSTRAINT "exam_group_result_examGroupId_fkey" FOREIGN KEY ("examGroupId") REFERENCES "exam_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_group_result" ADD CONSTRAINT "exam_group_result_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

# Refactor MCQ Practice Service - Direct MCQ Fetching

## Problem Statement

Currently, the MCQ practice service creates a demo exam session before displaying questions. This approach:
- Requires multiple database writes (creating demo exam, demo exam MCQs, and attempt records)
- Adds unnecessary complexity with session management
- Doesn't match the simpler pattern used in `question-bank.tsx`

The `question-bank.tsx` file demonstrates a cleaner approach: fetch MCQs directly from the server based on selected filters (subjects, chapters, topics) without creating exam records.

## User Review Required

> [!IMPORTANT]
> **Breaking Change**: This refactor will change the flow from:
> 1. Select filters → Create exam session → Navigate to exam page
> 
> To:
> 1. Select filters → Navigate directly to practice page with filters as query params → Fetch MCQs on practice page
>
> This means the practice session won't be saved in the database unless the user completes it.

> [!WARNING]
> **Data Structure Change**: The practice page will receive filter parameters (subjects, chapters, topics) instead of a pre-created `demoExamId` and `attemptId`.

## Proposed Changes

### 1. Update tRPC Router

#### [MODIFY] [exam.ts](file:///c:/Users/User/Documents/monorepo-new/packages/api/src/routers/home/exam.ts)

Add a new procedure to fetch MCQs based on filters without creating a demo exam:

```typescript
// New procedure: Get MCQs for practice based on filters
getPracticeMcqs: publicProcedure
  .input(
    z.object({
      selectedSubjects: z.array(z.string()).min(1),
      selectedChapters: z.array(z.string()).optional().default([]),
      selectedTopics: z.array(z.string()).optional().default([]),
      questionCount: z.number().min(10).max(100),
      shuffleQuestions: z.boolean().default(true),
    })
  )
  .query(async ({ ctx, input }) => {
    // Build filter query
    // Fetch MCQs from database
    // Shuffle if requested
    // Return questions
  })
```

---

### 2. Refactor MCQ Practice Service Page

#### [MODIFY] [mcq-practice-service.tsx](file:///c:/Users/User/Documents/monorepo-new/apps/home/modules/services/ui/views/mcq-practice-service.tsx)

Remove the `createPracticeSession` mutation and replace with direct navigation:

- Remove `createSessionMutation`
- Remove `sessionId` state management
- Update `handleStartPractice` to navigate with filter query params:
  ```typescript
  router.push(
    `/services/mcq-practice?subjects=${selectedSubjects.join(',')}&chapters=${selectedChapters.join(',')}&topics=${selectedTopics.join(',')}&count=${questionCount}&time=${timeLimit}&shuffle=${shuffleQuestions}&negative=${negativeMarking}`
  );
  ```

---

### 3. Update Practice Page Route

#### [MODIFY] [page.tsx](file:///c:/Users/User/Documents/monorepo-new/apps/home/app/(root)/services/mcq-practice/[id]/page.tsx)

Change from dynamic `[id]` route to a regular route that reads query params:

- Move file from `mcq-practice/[id]/page.tsx` to `mcq-practice/page.tsx`
- Read filter params from `searchParams` instead of `params.id`
- Pass filters to the view component

---

### 4. Refactor Practice View Component

#### [MODIFY] [take-mcq-practice-view.tsx](file:///c:/Users/User/Documents/monorepo-new/apps/home/modules/services/ui/views/take-mcq-practice-view.tsx)

Update to fetch MCQs directly based on filters:

- Change props from `{ demoExamId, attemptId, sessionId }` to `{ filters: PracticeFilters }`
- Use `trpc.home.demoExam.getPracticeMcqs.queryOptions(filters)` instead of `getPracticeQuestions`
- Remove dependency on `demoExamId` and `attemptId`
- Keep client-side state for answers and scoring
- Only save to database when user completes the practice (optional feature)

---

### 5. Update Demo Exam Attempt Hook

#### [MODIFY] [use-demo-exam-attempt.ts](file:///c:/Users/User/Documents/monorepo-new/apps/home/modules/services/hooks/use-demo-exam-attempt.ts)

Simplify to work without server-side attempt tracking:

- Remove `submitAnswerMutation` (keep answers client-side only)
- Remove `submitExamMutation` (or make it optional for saving results)
- Keep all state management local
- Add optional mutation for saving final results if user wants to track history

---

### 6. Clean Up Unused Files

#### [DELETE] Dynamic route folder

Remove `apps/home/app/(root)/services/mcq-practice/[id]/` directory since we're using query params instead.

## Verification Plan

### Manual Testing

1. **Navigate to MCQ Practice Service**:
   - Open browser to `http://localhost:3000/services/mcq-practice` (or appropriate port)
   - Verify the subject selection UI loads correctly
   - Select one or more subjects
   - Verify chapter and topic options appear based on subject selection

2. **Start Practice Session**:
   - Select subjects, chapters, and configure settings (question count, time limit)
   - Click "Start Practice" button
   - Verify navigation to practice page with correct query parameters in URL
   - Verify questions load and display correctly

3. **Take Practice Exam**:
   - Answer several questions
   - Verify immediate feedback (correct/incorrect)
   - Verify statistics update in real-time (score, streak, etc.)
   - Verify timer counts down correctly
   - Test quick jump navigation (both desktop sidebar and mobile drawer)

4. **Submit Practice**:
   - Click submit button
   - Verify confirmation dialog shows correct statistics
   - Confirm submission
   - Verify appropriate action (redirect to results or show summary)

5. **Edge Cases**:
   - Test with minimum question count (10)
   - Test with maximum question count (100)
   - Test with single subject vs multiple subjects
   - Test with no chapters selected (should use all chapters from selected subjects)
   - Test timer expiration (auto-submit)

### Database Verification

- Verify that no `DemoExam` or `DemoExamAttempt` records are created during practice session
- If implementing optional result saving, verify records are only created on explicit save action

### Code Review Checklist

- [ ] All TypeScript errors resolved
- [ ] No unused imports or variables
- [ ] Proper error handling for failed API calls
- [ ] Loading states implemented for all async operations
- [ ] Mobile responsive design maintained
- [ ] Accessibility features preserved (keyboard navigation, screen reader support)

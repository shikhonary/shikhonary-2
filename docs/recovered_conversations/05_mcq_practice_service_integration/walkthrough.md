# MCQ Practice Service Refactoring - Walkthrough

## Overview

Successfully refactored the MCQ practice service to fetch MCQs directly from the server based on filters, eliminating the need for creating demo exam sessions. This approach follows the cleaner pattern used in `question-bank.tsx`.

## Changes Made

### 1. Backend - New tRPC Procedure

#### [exam.ts](file:///c:/Users/User/Documents/monorepo-new/packages/api/src/routers/home/exam.ts)

Added `getPracticeMcqs` procedure that:
- Accepts filter parameters (subjects, chapters, topics, question count, shuffle option)
- Queries MCQs directly from database based on filters
- Returns selected MCQs without creating any database records
- Validates that enough questions are available

```typescript
getPracticeMcqs: publicProcedure
  .input(z.object({
    selectedSubjects: z.array(z.string()).min(1),
    selectedChapters: z.array(z.string()).optional(),
    selectedTopics: z.array(z.string()).optional(),
    questionCount: z.number().min(10).max(100),
    shuffleQuestions: z.boolean().default(true),
  }))
  .query(async ({ ctx, input }) => {
    // Filters MCQs by topics > chapters > subjects
    // Returns { questions, totalAvailable }
  })
```

---

### 2. Frontend - MCQ Practice Service Page

#### [mcq-practice-service.tsx](file:///c:/Users/User/Documents/monorepo-new/apps/home/modules/services/ui/views/mcq-practice-service.tsx)

**Removed:**
- ❌ `sessionId` state management
- ❌ `getSessionId()` function
- ❌ `createSessionMutation` for creating demo exams
- ❌ Session creation logic

**Updated:**
- ✅ `handleStartPractice()` now builds query params and navigates directly
- ✅ Button simplified (no loading state for session creation)

**New Flow:**
```typescript
handleStartPractice() {
  const params = new URLSearchParams({
    subjects: selectedSubjects.join(','),
    chapters: selectedChapters.join(','),
    topics: selectedTopics.join(','),
    count: questionCount,
    time: timeLimit,
    shuffle: shuffleQuestions.toString(),
    negative: negativeMarking.toString(),
  });
  
  router.push(`/services/mcq-practice?${params.toString()}`);
}
```

---

### 3. Frontend - Practice Page Route

#### [page.tsx](file:///c:/Users/User/Documents/monorepo-new/apps/home/app/(root)/services/mcq-practice/page.tsx)

**Changed from:** `mcq-practice/[id]/page.tsx` (dynamic route)  
**Changed to:** `mcq-practice/page.tsx` (static route with query params)

**Key Features:**
- Reads filters from `searchParams` instead of route params
- Validates required parameters (redirects if subjects missing)
- Parses comma-separated values into arrays
- Passes structured filters object to view component

```typescript
const filters = {
  selectedSubjects: subjects,
  selectedChapters: chapters,
  selectedTopics: topics,
  questionCount,
  timeLimit,
  shuffleQuestions,
  hasNegativeMark,
};
```

---

### 4. Frontend - Practice View Component

#### [take-mcq-practice-view.tsx](file:///c:/Users/User/Documents/monorepo-new/apps/home/modules/services/ui/views/take-mcq-practice-view.tsx)

**Complete Rewrite:**

**Old Approach:**
- Props: `{ demoExamId, attemptId, sessionId }`
- Fetched questions using `getPracticeQuestions` with exam ID
- Used `useDemoExamAttempt` hook for server-side state
- Submitted answers to server in real-time

**New Approach:**
- Props: `{ filters: PracticeFilters }`
- Fetches questions using `getPracticeMcqs` with filters
- Uses local React state for all answer tracking
- No server communication during practice (client-side only)

**State Management:**
```typescript
interface ExamState {
  answers: Map<string, string>;
  correctAnswers: number;
  wrongAnswers: number;
  skippedQuestions: number;
  currentStreak: number;
  bestStreak: number;
  score: number;
  answeredCount: number;
  status: string;
}
```

**Benefits:**
- ✅ No database writes during practice
- ✅ Instant feedback (no network latency)
- ✅ Works offline after initial load
- ✅ Simpler state management
- ✅ No session tracking overhead

---

### 5. Cleanup

**Removed Files:**
- 🗑️ `apps/home/app/(root)/services/mcq-practice/[id]/` (entire directory)
- 🗑️ `apps/home/modules/services/hooks/use-demo-exam-attempt.ts`

**Removed Code:**
- Session ID generation and localStorage management
- Demo exam creation mutation
- Server-side answer submission during practice
- Attempt tracking logic

---

## New User Flow

### Before (Session-Based):
1. User selects subjects/chapters/topics
2. Click "Start Practice"
3. **Server creates DemoExam record**
4. **Server creates DemoExamMcq records**
5. **Server creates DemoExamAttempt record**
6. Navigate to `/services/mcq-practice/[demoExamId]?attemptId=...&sessionId=...`
7. Fetch questions from server
8. **Each answer submitted to server in real-time**
9. Submit exam → update attempt record

### After (Direct Fetching):
1. User selects subjects/chapters/topics
2. Click "Start Practice"
3. Navigate to `/services/mcq-practice?subjects=...&chapters=...&count=...`
4. Fetch MCQs directly based on filters
5. All answers tracked client-side
6. Submit practice → show summary (optional: save to server)

---

## Benefits of New Approach

### Performance
- ⚡ Faster navigation (no session creation delay)
- ⚡ Instant answer feedback (no network requests)
- ⚡ Reduced server load (no real-time answer tracking)

### Simplicity
- 🎯 Cleaner code (no session management)
- 🎯 Fewer database tables involved
- 🎯 Easier to understand and maintain

### User Experience
- 👍 Immediate start (no waiting for session creation)
- 👍 Works offline after initial load
- 👍 No accidental session loss
- 👍 Can refresh page without losing progress (if we add localStorage)

### Database
- 💾 No unnecessary records created
- 💾 Only save results if user explicitly wants to track history
- 💾 Reduced database growth

---

## Testing Checklist

### Manual Testing Required

- [ ] Navigate to MCQ Practice Service page
- [ ] Select subjects and verify chapters appear
- [ ] Configure settings (question count, time limit, etc.)
- [ ] Click "Start Practice" and verify navigation
- [ ] Verify URL contains correct query parameters
- [ ] Verify questions load correctly
- [ ] Answer questions and verify immediate feedback
- [ ] Verify statistics update in real-time
- [ ] Test timer countdown
- [ ] Test quick jump navigation (desktop & mobile)
- [ ] Submit practice and verify completion
- [ ] Test edge cases (minimum/maximum questions, single/multiple subjects)

### Known Limitations

> [!NOTE]
> **No Result Persistence**: Currently, practice results are not saved to the database. This can be added as an optional feature later if needed.

> [!NOTE]
> **No Resume Capability**: If the user refreshes the page, they'll lose their progress. This can be fixed by adding localStorage persistence.

---

## Next Steps (Optional Enhancements)

1. **Add Result Saving** (optional):
   - Add a mutation to save final results to database
   - Create a results history page
   - Allow users to review past practice sessions

2. **Add Progress Persistence**:
   - Save answers to localStorage during practice
   - Restore state on page refresh
   - Clear localStorage on submission

3. **Add Analytics**:
   - Track which topics users struggle with
   - Show performance trends over time
   - Provide personalized recommendations

4. **Add Social Features**:
   - Share results with friends
   - Leaderboards for practice sessions
   - Challenge friends to beat your score

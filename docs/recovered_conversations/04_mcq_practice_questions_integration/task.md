# Task: MCQ Practice Service Data Integration

- [x] Phase 1: Real Data Integration <!-- id: 6 -->
    - [x] Update API: Include Topics in `getSubjectsWithChapters` <!-- id: 0 -->
    - [x] Update Frontend: Use real data in `McqPracticeService` <!-- id: 1 -->
- [x] Phase 2: Exam Taking Logic <!-- id: 7 -->
    - [x] Create `use-practice-exam-attempt` hook (synced with DB) <!-- id: 8 -->
    - [x] Update `McqPracticeService` to use `createPracticeSession` mutation <!-- id: 9 -->
    - [x] Implement/Update `TakeMcqPracticeView` with persistent logic <!-- id: 10 -->
    - [x] Add audio feedback and confetti effects <!-- id: 11 -->
- [x] Phase 3: Result Logic <!-- id: 12 -->
    - [x] Create `PracticeResultView` (inspired by Public Result) <!-- id: 13 -->
    - [x] Update `use-practice-exam-attempt` to navigate to result on completion <!-- id: 14 -->
    - [x] Integrate `ReviewAnswersSection` or similar for practice results <!-- id: 15 -->
- [x] Bug Fix: Answer Logic <!-- id: 16 -->
    - [x] Resolve marking mismatch between client and server (Label Normalization) <!-- id: 17 -->
    - [x] Handle literal answer strings from database via mapping utility <!-- id: 18 -->
- [x] Verify functionality <!-- id: 5 -->

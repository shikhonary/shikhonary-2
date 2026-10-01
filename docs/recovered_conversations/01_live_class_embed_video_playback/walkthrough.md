# Walkthrough - Inline Video Playback in Subject Grid

I have refactored the Live Class Service to move the video player from a global top section directly into the subject grid.

## Changes Made

### 1. Removed Global Video Section
The "Recent Live Class" hero section at the top has been removed to reduce clutter and focus on direct subject interaction.

### 2. Implemented Inline Subject Players
Each subject section in the grid now has a hidden video player slot. 
- **Action:** Added `activeSubject` state to track which subject's player is visible.
- **Action:** Embedded `LiveClassVideo` inside the `subjects.map` iteration.
- **Action:** The player appears with a smooth `FadeUp` animation above the video list when triggered.

### 3. Card-Triggered Playback
Clicking any video card within a subject's horizontal scroll will now trigger the inline player for that specific subject.

- **Action:** Added `onClick` to `Card` components to set the `activeSubject`.
- **Action:** Enhanced subject section styling to provide visual focus when a video is playing (highlighted background and border).

## Verification Results

### Code Review
- [live-class-service.tsx](file:///c:/Users/User/Documents/monorepo-new/apps/home/modules/services/ui/views/live-class-service.tsx) now handles `activeSubject` state.
- The `LiveClassVideo` component is correctly passed the `subject.nameEn` prop within the map.
- The UI layout remains clean and responsive, with the player expanding the subject section vertically when active.

### Manual Verification Required
1. Open the Live Class Service page.
2. Scroll to any subject (e.g., Biology or Chemistry).
3. Click the play button (or anywhere on the card) of a video.
4. Verify that the video player opens directly above the video list for that subject.
5. Click a video in a different subject and verify the first one closes and the new one opens.

# Theme and Walkthrough Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the completion modal hierarchy, add complete binary light/dark theme support, and replace the walkthrough media with fast, channel-specific light/dark videos that demonstrate the real destination action.

**Architecture:** Keep the existing 38/62 completion layout and shared campaign components. Add one global theme-toggle component backed by the existing Zustand theme store, fix theme gaps at the shared-token/primitive layer, and let the shared walkthrough component select media by resolved theme and reduced-motion preference. Extend the deterministic Pillow/ffmpeg generator to consume real in-app browser captures for tab selection plus each approved channel destination.

**Tech Stack:** React 19, TypeScript, Zustand, Tailwind CSS 4 theme tokens, Radix Dialog, Lucide icons, Playwright, Python/Pillow, VP8 WebM.

## Global Constraints

- Do not create a commit until the user explicitly approves one.
- Reuse existing design-system tokens and components; do not add screen-specific palettes or a second theme system.
- Preserve the white light-theme surface, 960px dialog width, 38/62 split, footer, close behavior, and `Next` routing.
- The theme control is a binary Light/Dark toggle, 44 × 44px, fixed 24px from the bottom-right, and below modal overlays.
- Every walkthrough is 1920 × 1080, silent, 16:9, muted, inline, and looped; reduced-motion mode shows a poster/paused state.
- Approved destinations: Web payout settings; PING Field Requirements; Phone Add → IVR Number Details; Chat Add → Web Chat Dialog.

---

### Task 1: Global theme toggle and shared dark-theme coverage

**Files:**
- Create: `src/components/theme-toggle.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/ui/switch.tsx`
- Modify: `src/components/ui/toast.tsx`
- Modify: `src/components/code-editor/code-editor.tsx`
- Modify: `src/index.css`
- Test: `e2e/theme.spec.ts`

**Interfaces:**
- Consumes: `useThemeStore(): { resolvedTheme: 'light' | 'dark'; setTheme(theme: 'light' | 'dark' | 'system'): void }`.
- Produces: `ThemeToggle(): JSX.Element`, rendered once by `App` and labeled `Switch to dark theme` or `Switch to light theme`.

- [x] **Step 1: Write failing theme behavior tests**

  Add Playwright coverage that asserts the floating button exists, measures at least 44 × 44px, toggles `document.documentElement.classList`, updates its accessible name, survives reload through localStorage, and is underneath a modal overlay.

- [x] **Step 2: Run the focused theme test and verify RED**

  Run: `npx playwright test e2e/theme.spec.ts --project=chromium --reporter=line`

  Expected: FAIL because no global theme toggle is rendered.

- [x] **Step 3: Implement the minimal shared theme control**

  Build `ThemeToggle` from the shared `Button`, `Moon`, and `Sun`; use `fixed bottom-6 right-6 z-40 size-11 rounded-full border border-border bg-background text-foreground shadow-md`; set the opposite theme through the existing store; render it once after routed content in `App`.

- [x] **Step 4: Remove shared light-only primitive colors**

  Change unchecked Switch surfaces to `bg-background`, derive success Toast colors from semantic tokens with dark overrides, make CodeMirror choose a theme from `resolvedTheme`, and add only missing semantic token values to `.dark` in `index.css`.

- [x] **Step 5: Run the focused theme test and verify GREEN**

  Run the Step 2 command. Expected: PASS.

---

### Task 2: Completion hierarchy, focus behavior, and reduced motion

**Files:**
- Create: `src/hooks/use-reduced-motion.ts`
- Modify: `src/features/campaign/components/campaign-walkthrough-video.tsx`
- Modify: `src/features/campaign/components/lead-source-next-steps-dialog.tsx`
- Modify: `e2e/campaign-next-steps.spec.ts`

**Interfaces:**
- Produces: `useReducedMotion(): boolean` backed by `matchMedia('(prefers-reduced-motion: reduce)')`.
- `CampaignWalkthroughVideo` consumes `resolvedTheme` and `useReducedMotion`, selects `campaign-walkthrough-{channel}-{theme}.webm`, and disables autoplay when reduced motion is requested.

- [x] **Step 1: Add failing modal and media behavior assertions**

  Assert that initial focus is on the dialog rather than Close, Close measures at least 44 × 44px, the video source includes the resolved theme, and reduced-motion emulation produces `autoplay === false`.

- [x] **Step 2: Run the channel handoff suite and verify RED**

  Run: `npx playwright test e2e/campaign-next-steps.spec.ts --project=chromium --reporter=line`

  Expected: FAIL on current Close focus/size, theme-neutral video source, and unconditional autoplay.

- [x] **Step 3: Implement hierarchy and focus refinements**

  Keep the current layout. Use `bg-primary-light text-primary` for the confirmation icon, reduce top/section spacing one design-system step, keep the tip quiet, reduce the eyebrow opacity/weight, make Close `size-11`, and focus the dialog container on open without removing keyboard-visible focus from controls.

- [x] **Step 4: Implement theme-aware reduced-motion media**

  Add the hook, render a light/dark poster and WebM source from the resolved theme, pass `autoPlay={!reducedMotion}`, and preserve muted/loop/playsInline/preload behavior.

- [x] **Step 5: Run the channel handoff suite and verify GREEN**

  Run the Step 2 command. Expected: PASS once the media files exist and decode.

---

### Task 3: Capture and generate the approved light/dark walkthroughs

**Files:**
- Modify: `scripts/generate-campaign-walkthroughs.py`
- Create: `design-qa-assets/walkthrough-sources-v2/{light,dark}/...png`
- Create: `public/assets/campaign-preview-{channel}-{theme}.png`
- Create: `public/assets/campaign-walkthrough-{channel}-{theme}.webm`

**Interfaces:**
- Generator input: real 1920 × 1080 browser captures organized by theme/channel/state.
- Generator output: eight 1920 × 1080, 30fps WebM assets and eight theme/channel poster PNGs.

- [x] **Step 1: Add a failing generator contract test**

  Add `scripts/test_generate_campaign_walkthroughs.py` with hand-derived timeline assertions: pointer arrival ≤ 0.7s, first click at 0.9–1.1s, required per-channel scene order, output duration 5–7s, and light/dark output naming.

- [x] **Step 2: Run the generator test and verify RED**

  Run: `python3 -m unittest scripts/test_generate_campaign_walkthroughs.py -v`

  Expected: FAIL because the current generator has one theme, a 2.58s click, and no destination sequence.

- [x] **Step 3: Capture real states in the selected Codex in-app browser**

  Capture both themes at 1920 × 1080: General top and payout destination; PING top plus a short sequence of actual scroll positions ending at Field Requirements; Phone Numbers plus Add and IVR dialog; Web Chats plus Add and Web Chat Dialog. Save only accepted, visually inspected captures.

- [x] **Step 4: Implement the v2 deterministic timeline**

  Start at a navigation close-up, move the system cursor from a nearby origin to the target in 0.6–0.7s, click around 1.0s, animate through captured scroll frames or the Add click, hold the final destination, then reset to the opening scene before the loop boundary. Preserve 1920 × 1080, 30fps, VP8, and silent output.

- [x] **Step 5: Run the generator test and generate all assets**

  Run the Step 2 command, then run the generator against `walkthrough-sources-v2`. Expected: tests pass and all sixteen output files exist.

- [x] **Step 6: Verify browser media decoding**

  In the selected Codex browser, inspect each theme/channel source for `readyState >= 1`, `videoWidth === 1920`, `videoHeight === 1080`, duration 5–7s, correct tab click, and correct final destination.

---

### Task 4: Regression, theme QA, and handoff

**Files:**
- Modify: `design-qa.md`
- Create: `design-qa-assets/theme-walkthrough-pass/...png`

**Interfaces:**
- Consumes all prior components/assets.
- Produces browser evidence for light/dark launcher, wizard, each editor, nested dialogs, and completion modal at 1012 × 1391.

- [x] **Step 1: Run relevant regressions**

  Run the theme, campaign creation, next-step, and channel-editor suites. Expected: all pass.

- [x] **Step 2: Run static verification**

  Run ESLint on changed/new files, `python3 -m py_compile scripts/generate-campaign-walkthroughs.py`, `npm run build`, and `git diff --check`.

- [x] **Step 3: Perform browser design QA**

  Capture the final completion modal in light and dark at 1012 × 1391, plus focused walkthrough frames. Compare the current audit reference and the final captures together. Verify typography, spacing, tokens, media sharpness, copy, focus, theme toggle placement, responsive behavior, and reduced-motion state.

- [x] **Step 4: Update `design-qa.md` and leave preview open**

  Record source/implementation paths, viewport/density, iteration history, all fidelity surfaces, interaction checks, and `final result: passed` only if no actionable P0/P1/P2 issue remains. Keep the verified tab open in the Codex browser.

- [x] **Step 5: Report without committing**

  Summarize changes, evidence, tests, and any pre-existing unrelated warning. Explicitly confirm no commit was created.

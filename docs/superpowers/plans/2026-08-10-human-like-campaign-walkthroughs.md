# Human-Like Campaign Walkthroughs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce eight theme-aware campaign walkthrough videos in which every visible value change is caused by a real, correctly positioned UI interaction and the camera keeps the active label and value readable.

**Architecture:** A Playwright capture script drives the existing campaign editor through semantic locators, captures 4K states, and writes a theme-independent action trace with live DOM rectangles. A trace-driven Pillow/ffmpeg renderer uses those rectangles for both cursor placement and directed camera framing. Pure trace invariants and renderer behavior are developed test-first; browser QA validates the final assets at their real modal size.

**Tech Stack:** React prototype, Playwright, Node.js ESM, Python 3, Pillow, ffmpeg/WebM, `node:test`, `unittest`.

## Global Constraints

- The completion dialog layout and playback component remain unchanged.
- Light and dark versions use the same semantic action order and values.
- Every click point must be inside the target's live DOM rectangle.
- The complete cursor bitmap must remain inside the video frame with an 18 px minimum inset on every rendered frame.
- Dropdown values must be selected by opening the real control and clicking the real option.
- Exactly one semantic control changes per action.
- Chat remains on the Properties tab.
- Delivered media is 1920 × 1080, 30 fps, silent WebM at no less than 8 Mbps.
- Do not commit, push, or deploy without explicit user approval after preview review.

---

### Task 1: Trace contract and invariant validation

**Files:**
- Create: `scripts/campaign-walkthrough-trace.mjs`
- Create: `scripts/test_campaign_walkthrough_trace.mjs`

**Interfaces:**
- Produces: `containsPoint(rect, point)`, `validateAction(action)`, `validateTrace(trace)`, and `buildTimeline(actions)`.
- Trace actions expose `id`, `kind`, `beforeScene`, `afterScene` or `typingScenes`, `targetRect`, `clickPoint`, `frameRect`, `stateDelta`, and `holdMs`.

- [ ] **Step 1: Write failing trace-invariant tests**

```js
test('rejects a click outside its live target rectangle', () => {
  assert.throws(() => validateAction({
    id: 'select-required', kind: 'click',
    targetRect: { x: 100, y: 100, width: 200, height: 40 },
    clickPoint: { x: 90, y: 120 }, stateDelta: ['ping.type'],
  }), /outside target rectangle/)
})

test('rejects more than one semantic state delta', () => {
  assert.throws(() => validateAction({
    id: 'chat-profile', kind: 'click',
    targetRect: { x: 100, y: 100, width: 200, height: 40 },
    clickPoint: { x: 150, y: 120 },
    stateDelta: ['chat.companyName', 'chat.agentName'],
  }), /exactly one semantic state delta/)
})

test('rejects a cursor bitmap that leaves the video frame', () => {
  assert.throws(() => validateCursorFrame(
    { x: 1900, y: 400, width: 54, height: 72 },
    { width: 1920, height: 1080, inset: 18 },
  ), /cursor leaves output frame/)
})
```

- [ ] **Step 2: Run `node --test scripts/test_campaign_walkthrough_trace.mjs` and confirm both tests fail because the validation module is absent.**

- [ ] **Step 3: Implement minimal validation and deterministic timing rules.**

`buildTimeline` assigns 300–550 ms cursor travel, 150 ms hover, 120 ms click feedback, action-specific state time, 500–700 ms readable hold, and 1,100 ms final hold.

- [ ] **Step 4: Run the trace tests and confirm they pass.**

### Task 2: DOM-driven state capture

**Files:**
- Create: `scripts/capture-campaign-walkthroughs.mjs`
- Create: `scripts/test_campaign_walkthrough_scenarios.mjs`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: trace validators from Task 1.
- Produces: `output/campaign-walkthrough-captures/{theme}/{channel}/trace.json` plus numbered 3840 × 2160 PNG scenes.
- Exports: `SCENARIOS` and `scenarioActionIds(channel)` for structural tests.

- [ ] **Step 1: Write failing scenario tests** asserting exact action order for Web, Ping/Post, Phone, and Chat, including separate `open-*` and `select-*` actions and separate state deltas for every field or switch.

```js
assert.deepEqual(scenarioActionIds('phone').slice(-5), [
  'open-call-flow', 'select-main-call-flow',
  'open-message-flow', 'select-main-message-flow', 'save-ivr-number',
])
```

- [ ] **Step 2: Run the scenario tests and confirm they fail because `SCENARIOS` does not exist.**

- [ ] **Step 3: Implement the semantic scenario manifests and a `TraceRecorder`.**

`TraceRecorder.click` resolves the locator bounding box, moves the visible cursor overlay to its center, performs `locator.click()`, captures the resulting real UI state, and records the before/after scenes. `TraceRecorder.type` focuses the real field and uses sequential key presses while capturing character states. `TraceRecorder.select` records trigger click, open popover, option click, and selected value as separate actions.

- [ ] **Step 4: Implement the four channel scenarios through existing accessible roles and labels.**

Use the campaign shortcut cards for setup, return each channel editor to General before recording, then execute the approved storyboard. Prepare initial Web Status as Inactive before the first accepted frame so the recorded Active selection has a visible result.

- [ ] **Step 5: Run scenario unit tests and a light-theme dry capture for all four channels.**

Expected: every trace passes `validateTrace`; every PNG is 3840 × 2160; Ping field selection visibly opens the searchable selector; Phone and Chat flows open their dropdowns before selecting values.

### Task 3: Trace-driven camera and media renderer

**Files:**
- Modify: `scripts/generate-campaign-walkthroughs.py`
- Modify: `scripts/test_generate_campaign_walkthroughs.py`

**Interfaces:**
- Consumes: capture root containing per-theme traces and scenes.
- Produces: `public/assets/campaign-walkthrough-{channel}-{theme}.webm` and matching posters.

- [ ] **Step 1: Replace stale-coordinate tests with failing trace-driven tests.**

Tests require variable channel durations, safe-frame containment for target and label frame rectangles, camera settlement during every click/type/select action, identical light/dark action IDs, and rejection of a trace with a click outside its target.

- [ ] **Step 2: Run `python3 scripts/test_generate_campaign_walkthroughs.py` and confirm the new tests fail against the hard-coded `WALKTHROUGHS`.**

- [ ] **Step 3: Implement trace loading, timeline generation, and semantic camera cues.**

The renderer uses `frameRect` as the camera subject, computes the closest 2.15–2.30× crop that contains it with 15% breathing room, settles before cursor travel, and holds scale during interaction. Cursor coordinates are derived only from each action's `clickPoint` and target rectangles. Camera focus is adjusted before travel whenever the rendered 54 × 72 cursor would violate the 18 px output inset.

- [ ] **Step 4: Render typing scenes without whole-screen dissolves.**

Character snapshots advance on 40–75 ms boundaries; click/select state changes use an 80–100 ms transition; camera and cursor remain stationary while characters appear.

- [ ] **Step 5: Run generator tests and confirm they pass.**

### Task 4: Capture and render both themes

**Files:**
- Modify: `public/assets/campaign-walkthrough-*-light.webm`
- Modify: `public/assets/campaign-walkthrough-*-dark.webm`
- Modify: `public/assets/campaign-preview-*-light.png`
- Modify: `public/assets/campaign-preview-*-dark.png`

**Interfaces:**
- Consumes: Tasks 2–3.
- Produces: eight final walkthrough videos and eight final posters.

- [ ] **Step 1: Capture all four scenarios in light mode and validate every trace.**
- [ ] **Step 2: Capture the same scenarios in dark mode and validate structural parity against light.**
- [ ] **Step 3: Render all eight videos into a temporary output directory.**
- [ ] **Step 4: Validate dimensions, frame rate, duration range, bitrate floor, and poster dimensions before atomically replacing public assets.**
- [ ] **Step 5: Decode action frames and generate per-channel light/dark contact sheets for visual inspection.**

### Task 5: Browser and regression QA

**Files:**
- Modify: `e2e/campaign-next-steps.spec.ts`
- Create: `e2e/campaign-walkthrough-quality.spec.ts`

**Interfaces:**
- Consumes: final media assets.
- Produces: automated playback checks plus accepted screenshots at the real completion-dialog size.

- [ ] **Step 1: Write failing E2E assertions for channel-specific duration ranges and theme parity.**
- [ ] **Step 2: Add metadata-backed assertions that every trace action has a valid target/click relationship and one state delta.**
- [ ] **Step 3: Run the scoped E2E tests and confirm they pass after the new assets are installed.**
- [ ] **Step 4: Open each next-step preview in the Codex in-app browser in both themes and capture tab, dropdown-open, value-selected, nested-modal, and final frames.**
- [ ] **Step 5: Run generator unit tests, Node trace tests, scoped lint, production build, and the campaign Next Steps E2E suite.**

Expected final result: cursor and click feedback stay inside the affected control, the complete cursor remains inside the video frame, dropdown selection is visibly human-like, no independent controls update together, labels and values remain readable, both themes share the same sequence, and all four videos play correctly in the existing modal.

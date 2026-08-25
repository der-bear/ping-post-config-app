# Realistic Campaign Walkthroughs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing six-second walkthroughs with deterministic, realistic 10-second 1080p configuration demonstrations for Web, Ping/Post, Phone, and Chat in light and dark themes.

**Architecture:** Keep the existing offline Pillow/FFmpeg pipeline, but separate camera cues from action cues so the camera settles before every interaction. Drive the renderer from real high-density browser captures, validate that every crop is at least 1920 × 1080 source pixels, render to a temporary directory, and replace production media only after all sixteen outputs pass validation.

**Tech Stack:** Python 3, Pillow, bundled FFmpeg, React/Vite prototype, in-app Browser capture, `unittest`, existing Playwright specifications for media playback.

## Global Constraints

- Produce exactly eight WebM files and eight PNG posters using the existing production filenames.
- Every video is exactly 10.0 seconds, 300 frames, 30 FPS, 1920 × 1080, 16:9, and `yuv420p`.
- Source captures are 3840 × 2160 pixels representing the 1920 × 1080 CSS application layout at 2× density.
- No rendered camera crop may be smaller than 1920 × 1080 source pixels.
- Camera motion stops before clicks, selections, toggles, or typing checkpoints.
- Chat configures only the Properties tab.
- Existing Next Steps dialog layout and media URLs remain unchanged.
- Do not commit, push, or deploy until the user explicitly authorizes it.

---

### Task 1: Lock the timeline and quality contract with failing tests

**Files:**
- Modify: `scripts/test_generate_campaign_walkthroughs.py`
- Modify: `e2e/campaign-next-steps.spec.ts`

**Interfaces:**
- Consumes: current `WALKTHROUGHS`, `camera_state()`, and media metadata exposed by `<video>`.
- Produces: executable expectations for `DURATION_SECONDS`, action ordering, camera holds, crop safety, final holds, and ten-second browser media.

- [ ] **Step 1: Replace the six-second assertions with the ten-second contract**

Add assertions equivalent to:

```python
self.assertEqual(walkthroughs.DURATION_SECONDS, 10)
self.assertEqual(walkthroughs.FRAME_COUNT, 300)
for item in walkthroughs.WALKTHROUGHS:
    self.assertGreaterEqual(item.final_hold_seconds, 1.2)
```

- [ ] **Step 2: Add failing camera/action separation tests**

For every `ActionCue`, assert that `camera_state(walkthrough, action.at_seconds)` equals the state 0.10 seconds before and after the action. For every camera cue, assert its end precedes the next action by at least 0.12 seconds.

- [ ] **Step 3: Add failing crop-quality tests**

Test a public helper with the exact interface:

```python
width, height = walkthroughs.crop_size((3840, 2160), scale=2.0)
self.assertGreaterEqual(width, 1920)
self.assertGreaterEqual(height, 1080)
with self.assertRaisesRegex(ValueError, 'would upscale'):
    walkthroughs.validate_crop((3840, 2160), scale=2.1)
```

- [ ] **Step 4: Assert approved channel actions**

Use stable action names:

```python
expected = {
    'web': {'select-general', 'select-status', 'select-revenue-share', 'type-payout'},
    'ping-post': {'select-ping-options', 'enable-profit', 'type-profit', 'open-field-dialog', 'save-field'},
    'phone': {'select-phone-numbers', 'open-ivr', 'type-ivr-name', 'open-purchase', 'select-number', 'select-call-flow', 'select-message-flow', 'save-ivr'},
    'chat': {'select-web-chats', 'open-chat', 'type-chat-name', 'select-message-flow', 'type-company', 'type-agent', 'type-initial-message', 'enable-chat-button', 'enable-auto-show', 'type-delay', 'save-chat'},
}
```

- [ ] **Step 5: Tighten browser media duration assertions**

Change the current 4.5–6.5 second range to 9.75–10.25 seconds while retaining 1920 × 1080 and theme-specific URL checks.

- [ ] **Step 6: Run tests and verify the new contract fails**

Run:

```bash
python3 scripts/test_generate_campaign_walkthroughs.py
```

Expected: failures for six-second duration, missing action/camera structures, and missing crop helpers.

- [ ] **Step 7: Record a no-commit checkpoint**

Run `git diff --check` and leave the tests uncommitted per the global constraint.

### Task 2: Refactor the generator into independent camera and action tracks

**Files:**
- Modify: `scripts/generate-campaign-walkthroughs.py`
- Test: `scripts/test_generate_campaign_walkthroughs.py`

**Interfaces:**
- Consumes: real scene PNGs and the test contract from Task 1.
- Produces:
  - `SceneState(name: str)`
  - `ActionCue(name: str, scene: str, at_seconds: float, pointer_target: tuple[float, float], dwell_seconds: float)`
  - `CameraCue(start_seconds: float, end_seconds: float, start_focus: tuple[float, float], end_focus: tuple[float, float], start_scale: float, end_scale: float)`
  - `Walkthrough(channel: str, actions: tuple[ActionCue, ...], camera_cues: tuple[CameraCue, ...], final_hold_seconds: float)`
  - `crop_size(source_size, scale) -> tuple[float, float]`
  - `validate_crop(source_size, scale) -> None`

- [ ] **Step 1: Introduce the cue dataclasses and ten-second constants**

Set `DURATION_SECONDS = 10`, keep `FPS = 30`, and derive `FRAME_COUNT`.

- [ ] **Step 2: Implement camera interpolation from camera cues only**

`camera_state()` returns the first cue's start state before its start, interpolates with `smootherstep` only inside a cue, holds the cue's end state until the next cue, and never reads an action timestamp.

- [ ] **Step 3: Implement crop safety**

Compute `source_width / scale` and `source_height / scale`; reject values below `OUTPUT_SIZE` with a message containing the source size and scale.

- [ ] **Step 4: Replace long scene crossfades with action-boundary state changes**

Use the previous scene before `action.at_seconds`; switch to the action scene at the timestamp. Permit a maximum two-frame blend only when `SCENE_BLEND_SECONDS` is non-zero and below `0.08`.

- [ ] **Step 5: Retain eased pointer travel and click feedback**

Drive pointer movement from successive `ActionCue.pointer_target` values. Arrive at least 0.12 seconds before the click, remain on the target through its dwell, and fade only during the final hold.

- [ ] **Step 6: Run the focused unit tests**

Run `python3 scripts/test_generate_campaign_walkthroughs.py`.

Expected: timeline, camera, and crop tests pass; storyboard-name tests may still fail until Task 3.

- [ ] **Step 7: Record a no-commit checkpoint**

Run `git diff --check` and leave changes uncommitted.

### Task 3: Define realistic channel storyboards

**Files:**
- Modify: `scripts/generate-campaign-walkthroughs.py`
- Test: `scripts/test_generate_campaign_walkthroughs.py`

**Interfaces:**
- Consumes: cue types and renderer from Task 2.
- Produces: four `Walkthrough` definitions with stable named actions and explicit camera moves.

- [ ] **Step 1: Define the Web action track**

Use `select-general`, `select-status`, `select-revenue-share`, `type-payout`, and `web-complete` scene states. Keep the camera still for each click/type dwell and hold the final payout state for at least 1.2 seconds.

- [ ] **Step 2: Define the Ping/Post action track**

Use `select-ping-options`, `enable-profit`, `type-profit`, `enable-delivery`, `type-delivery`, `open-field-dialog`, `search-field`, `select-field-type`, `save-field`, and `ping-complete` states. The final frame must show the populated Field Requirements grid.

- [ ] **Step 3: Define the Phone action track**

Use `select-phone-numbers`, `open-ivr`, `type-ivr-name`, `open-purchase`, `select-number`, `purchase-number`, `select-call-flow`, `select-message-flow`, `save-ivr`, and `phone-complete` states.

- [ ] **Step 4: Define the Chat Properties action track**

Use `select-web-chats`, `open-chat`, `type-chat-name`, `select-message-flow`, `type-company`, `type-agent`, `type-initial-message`, `enable-chat-button`, `enable-auto-show`, `type-delay`, `save-chat`, and `chat-complete` states. Do not click Integrations, Phone Settings, or Intake Form.

- [ ] **Step 5: Add camera cues with explicit settle gaps**

Each move ends at least 0.12 seconds before its associated action. Wider cues use a crop scale no greater than 1.65 and tight cues no greater than 2.0 against 3840 × 2160 sources.

- [ ] **Step 6: Run all generator tests**

Run `python3 scripts/test_generate_campaign_walkthroughs.py`.

Expected: all tests pass.

- [ ] **Step 7: Record a no-commit checkpoint**

Run `git diff --check` and leave changes uncommitted.

### Task 4: Capture authentic 2× application states

**Files:**
- Replace/Add: `design-qa-assets/walkthrough-sources-v3/light/*.png`
- Replace/Add: `design-qa-assets/walkthrough-sources-v3/dark/*.png`

**Interfaces:**
- Consumes: exact scene identifiers from Task 3 and the real local prototype.
- Produces: one 3840 × 2160 PNG per declared scene for both themes.

- [ ] **Step 1: Verify the local prototype and capture density**

Open the local campaign launcher in the in-app browser. Measure `innerWidth`, `innerHeight`, and `devicePixelRatio`; capture one test image and verify its pixel dimensions. Use a 1920 × 1080 CSS viewport at 2× density. If the browser exposes DPR 1, use browser page zoom or the viewport capability to obtain a 3840 × 2160 capture while preserving the 1920 × 1080 CSS layout.

- [ ] **Step 2: Capture Web states in both themes**

Capture the tab context, open dropdown, selected status, selected payout model, representative typing checkpoints, and completed configuration.

- [ ] **Step 3: Capture Ping/Post states in both themes**

Capture every named requirement, field-search, type-selection, save, and populated-grid state.

- [ ] **Step 4: Capture Phone states in both themes**

Capture Add, IVR name typing checkpoints, purchase grid, selected number, returned IVR dialog, flow selections, save, and completed state.

- [ ] **Step 5: Capture Chat Properties states in both themes**

Capture representative typing checkpoints, dropdown selection, toggles, delay, save, and final Properties state without visiting other tabs.

- [ ] **Step 6: Validate source dimensions and names**

Run a Python/Pillow validation that opens every expected path and requires exactly `(3840, 2160)`.

- [ ] **Step 7: Record a no-commit checkpoint**

Keep captures under `design-qa-assets/`; do not stage or commit them.

### Task 5: Add atomic generation and encode-quality validation

**Files:**
- Modify: `scripts/generate-campaign-walkthroughs.py`
- Modify: `scripts/test_generate_campaign_walkthroughs.py`

**Interfaces:**
- Consumes: validated v3 scene sources and storyboard definitions.
- Produces: `render_all(source_dir, output_dir, cursor, ffmpeg)` that renders into a temporary sibling directory and promotes sixteen outputs only after successful validation.

- [ ] **Step 1: Write failing atomic-replacement tests**

Mock the per-walkthrough renderer to fail on the second item and assert the existing output directory remains byte-for-byte unchanged.

- [ ] **Step 2: Implement temporary output rendering**

Use `tempfile.TemporaryDirectory(dir=output_dir.parent)` and produce all videos/posters there first.

- [ ] **Step 3: Validate all sixteen temporary outputs**

Require expected names, non-zero sizes, poster dimensions `(1920, 1080)`, and video metadata matching 1920 × 1080, 30 FPS, and 10.0 seconds. Use the bundled FFmpeg executable for metadata inspection when a system `ffprobe` is unavailable.

- [ ] **Step 4: Promote outputs atomically per file**

After all validation succeeds, use `Path.replace()` for each expected asset so a failed render never partially replaces production media.

- [ ] **Step 5: Increase encode quality**

Prefer VP9 (`libvpx-vp9`) when present; otherwise use `libvpx`. Set a target bitrate of at least `8M`, keep `yuv420p`, and use a quality-oriented deadline/cpu-used combination.

- [ ] **Step 6: Run unit tests and Python compilation**

Run:

```bash
python3 scripts/test_generate_campaign_walkthroughs.py
python3 -m py_compile scripts/generate-campaign-walkthroughs.py
```

Expected: all tests pass and compilation exits 0.

- [ ] **Step 7: Record a no-commit checkpoint**

Run `git diff --check` and leave changes uncommitted.

### Task 6: Render and replace the production media

**Files:**
- Modify: `public/assets/campaign-walkthrough-{web,ping-post,phone,chat}-{light,dark}.webm`
- Modify: `public/assets/campaign-preview-{web,ping-post,phone,chat}-{light,dark}.png`

**Interfaces:**
- Consumes: v3 source captures and atomic generator.
- Produces: existing stable production media URLs with the new content.

- [ ] **Step 1: Render to a temporary QA directory**

Run the generator with `--source-dir design-qa-assets/walkthrough-sources-v3` and an output directory under `output/realistic-walkthroughs`.

- [ ] **Step 2: Extract five checkpoints per video**

Extract frames at 0.8, 2.6, 5.0, 7.4, and 9.3 seconds into `design-qa-assets/realistic-walkthrough-qa/`.

- [ ] **Step 3: Inspect all light/dark checkpoint pairs**

Reject any pair with different geometry/timing, soft text, clipped controls, pointer drift, or camera movement during an action.

- [ ] **Step 4: Generate directly to production assets through atomic promotion**

Run the same command with `--output-dir public/assets` only after the QA output passes.

- [ ] **Step 5: Validate final files**

Check all sixteen files, dimensions, durations, frame rates, and file sizes. Confirm the tightest crop remains readable.

- [ ] **Step 6: Record a no-commit checkpoint**

Run `git diff --check`; do not commit or deploy.

### Task 7: Verify the real Next Steps experience

**Files:**
- Modify only if required: `src/features/campaign/components/campaign-walkthrough-video.tsx`
- Modify: `design-qa.md`

**Interfaces:**
- Consumes: final production media and existing Next Steps launcher shortcuts.
- Produces: browser evidence that all channels decode and play correctly in light and dark themes.

- [ ] **Step 1: Run focused verification**

Run:

```bash
python3 scripts/test_generate_campaign_walkthroughs.py
npx eslint scripts/test_generate_campaign_walkthroughs.py e2e/campaign-next-steps.spec.ts src/features/campaign/components/campaign-walkthrough-video.tsx
npm run build
git diff --check
```

The Python path is excluded from ESLint if the configured CLI rejects it; in that case lint only the TypeScript files.

- [ ] **Step 2: Open each Next Steps shortcut in the in-app browser**

Verify Web, Ping/Post, Phone, and Chat in light mode, then switch to dark and repeat. Confirm `readyState >= 3`, `videoWidth = 1920`, `videoHeight = 1080`, and duration between 9.75 and 10.25 seconds.

- [ ] **Step 3: Visually review motion and readability**

Watch at least one complete loop per channel/theme pair. Confirm camera settling, believable pointer/action order, correct channel-specific content, sharp labels, no clipping, and a final hold.

- [ ] **Step 4: Check browser console**

Read error/warning logs after all eight variants; new media decode or asset errors are blocking.

- [ ] **Step 5: Update Design QA**

Add the source paths, browser screenshots, checkpoint comparisons, media metadata, interaction checks, and final result to `design-qa.md`.

- [ ] **Step 6: Leave the verified local preview open**

Keep the campaign launcher or one representative Next Steps dialog available for user inspection.

- [ ] **Step 7: Stop before source-control publication**

Report the exact changed files and verification results. Wait for explicit permission before commit, push, or deploy.

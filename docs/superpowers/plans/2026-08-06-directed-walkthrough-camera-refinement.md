# Directed Walkthrough Camera Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the too-wide walkthrough camera track with a directed adaptive close-up that keeps every active tab, label, field, value, and save action legible.

**Architecture:** Keep the deterministic Pillow/ffmpeg pipeline and existing `CameraCue`/`ActionCue` data model. Change only camera keyframes and their tested scale contract, then rerender the existing authentic 4K source states into the stable light/dark asset names.

**Tech Stack:** Python 3, Pillow, bundled ffmpeg/libvpx, unittest, Vite/React, Playwright.

## Global Constraints

- Output remains exactly 10 seconds, 1920 × 1080, 30 fps, silent VP8/VP9 WebM.
- Source states remain exactly 3840 × 2160.
- Camera scale stays within `1.76–2.0×`; no crop may require upscaling.
- Camera movement settles before every click or field change.
- Light and dark versions use identical motion and timing.
- Stable asset filenames and reduced-motion posters remain unchanged.
- Do not commit, push, or deploy without explicit user approval.

---

### Task 1: Lock The Directed Camera Contract

**Files:**
- Modify: `scripts/test_generate_campaign_walkthroughs.py`
- Test: `scripts/test_generate_campaign_walkthroughs.py`

**Interfaces:**
- Consumes: `WALKTHROUGHS`, `camera_state()`, `CameraCue`
- Produces: deterministic scale and staging assertions for all four walkthroughs

- [ ] Add a test that samples all camera cue endpoints and fails when scale is below `1.76` or above `2.0`.
- [ ] Add assertions that initial scale is at least `1.92`, at least one reveal shot is between `1.76` and `1.86`, and later action framing returns to at least `1.9`.
- [ ] Add an ending-scale assertion of at least `1.82`.
- [ ] Run `python3 -m unittest scripts/test_generate_campaign_walkthroughs.py` and verify the new assertions fail against the current `1.32–1.62×` tracks.

### Task 2: Direct The Four Camera Tracks

**Files:**
- Modify: `scripts/generate-campaign-walkthroughs.py`
- Test: `scripts/test_generate_campaign_walkthroughs.py`

**Interfaces:**
- Consumes: `camera_move()`, `CameraCue`, existing action timing and source-space coordinates
- Produces: channel-specific 1.76–2.0× adaptive camera tracks

- [ ] Set the navigation scale to `1.98×` and preserve its existing focus point.
- [ ] Replace each Web cue with reveal, Status, Payout, and completion framing from the approved design.
- [ ] Replace each PING/POST cue with requirement, Field Requirements, field-dialog, and saved-row framing.
- [ ] Replace each Phone cue with toolbar, IVR, Purchase, selected-number, flows, and Save framing.
- [ ] Replace each Chat cue with toolbar, Properties groups, display options, and Save framing.
- [ ] Run the generator unit suite and verify all camera/action invariants pass.

### Task 3: Rerender And Inspect All Media

**Files:**
- Modify: `public/assets/campaign-walkthrough-{web,ping-post,phone,chat}-{light,dark}.webm`
- Modify: `public/assets/campaign-preview-{web,ping-post,phone,chat}-{light,dark}.png`
- Evidence: `output/directed-walkthrough-camera-qa/`

**Interfaces:**
- Consumes: `design-qa-assets/walkthrough-sources-v3/{light,dark}` and the revised camera track
- Produces: eight videos, eight posters, and decoded QA frames

- [ ] Run `scripts/generate-campaign-walkthroughs.py` against the 4K source-state directory and production asset directory.
- [ ] Verify every output reports 10.00 seconds, 1920 × 1080, and 30 fps.
- [ ] Decode navigation, representative field, nested-dialog, and final frames for each channel in light theme plus representative dark states.
- [ ] Compare the new frames with the previous too-wide action frames and confirm labels/values are materially larger without losing action context.
- [ ] Correct any camera focus or pointer target that misses its intended control, rerender the affected channel in both themes, and repeat the same-frame comparison.

### Task 4: Browser And Regression Verification

**Files:**
- Modify: `design-qa.md`
- Test: `e2e/campaign-next-steps.spec.ts`

**Interfaces:**
- Consumes: stable media URLs already used by `CampaignWalkthroughVideo`
- Produces: browser-rendered local preview and final QA evidence

- [ ] Reload the local in-app browser preview and open representative light and dark Next Steps dialogs.
- [ ] Verify video metadata, autoplay, looping, muted playback, and actual dialog-size legibility.
- [ ] Capture final light/dark browser screenshots and a combined previous/new camera comparison.
- [ ] Run `python3 -m unittest scripts/test_generate_campaign_walkthroughs.py`.
- [ ] Run scoped ESLint for changed TypeScript files.
- [ ] Run `npm run build`.
- [ ] Run `npx playwright test e2e/campaign-next-steps.spec.ts --reporter=line`.
- [ ] Run `git diff --check` and update `design-qa.md` with the camera-refinement pass and final result.

## Self-Review

- Spec coverage: all approved shot types, channel paths, scale limits, quality requirements, and verification steps map to Tasks 1–4.
- Placeholder scan: no TBD/TODO or deferred implementation steps remain.
- Type consistency: the plan preserves the existing `CameraCue`, `ActionCue`, `Walkthrough`, and `camera_state()` interfaces.
- Scope: only camera direction, generated media, tests, and QA evidence change; the product UI remains untouched.

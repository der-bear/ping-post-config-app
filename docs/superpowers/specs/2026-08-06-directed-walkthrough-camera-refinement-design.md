# Directed Walkthrough Camera Refinement Design

**Date:** 2026-08-06
**Status:** Approved by the user
**Selected approach:** Directed adaptive close-up

## Objective

Restore the legibility and visual intention of the earlier walkthroughs without returning to a mechanically fixed crop. Each 10-second video should feel directed: establish the channel tab, reveal just enough context after navigation, push into the current task, track the active controls, and finish on a readable completed state.

The completion dialog, channel UI states, copy, duration, output format, and light/dark parity remain unchanged.

## Verified Regression

The previous committed generator used a constant `2.04×` crop. The current adaptive generator drops as low as `1.32×` and never exceeds `1.62×`. At the completion dialog's 16:9 slot, those wide frames make labels and values visibly smaller than the earlier version.

The issue is not that the camera moves. The issue is that the current shot scale treats large portions of the editor as equally important instead of staging one action at a time.

## Camera Grammar

Every walkthrough uses the same five shot types:

1. **Navigation close-up — 1.92–2.0×.** Open tightly on the sidebar and relevant tab. The active tab and cursor are immediately legible.
2. **Context reveal — 1.76–1.84×.** After the tab click, briefly reveal the section heading and first group of controls. This is the widest permitted intentional shot.
3. **Task push-in — 1.9–2.0×.** Move to the active control group before cursor travel. Labels, values, and the selected state must remain in frame.
4. **Action tracking — 1.9–2.0×.** Pan between related controls with only subtle scale changes. Do not zoom out to solve positioning; reframe the focus point instead.
5. **Completion settle — 1.82–1.92×.** Hold the completed values plus enough local context to explain the outcome. Nested modal saves may remain at `2.0×` when the completed row appears after the click.

No cue may use a scale below `1.76×` or above `2.0×`. A `2.0×` crop from the 3840 × 2160 source is exactly 1920 × 1080, preserving native output resolution with no upscaling.

## Motion Direction

- Camera movement anticipates the next action and finishes before the pointer arrives.
- Establishing/reveal moves last 420–620 ms; short control-to-control reframes last 260–440 ms.
- Position and scale use fifth-order easing with zero-velocity joins.
- Pointer dwell remains at least 360 ms around clicks and typing.
- The pre-action UI remains visible for 140 ms after the click, then changes to the next captured state.
- Consecutive actions in one control group use a nearly constant scale to avoid breathing.
- Large cross-form moves use a two-stage path only when necessary: slight context reveal, then push-in. Never combine a large pan and a large zoom during the visible click.
- Final states hold for at least 1.0 second.

## Channel Direction

### Web

- Open at `1.98×` on **General**.
- Reveal Campaign Details at `1.82×`.
- Push to Status at `1.94×`.
- Track down to Payout Options at `1.94–1.98×`.
- Finish at `1.88×` with selected Revenue Share, `12.50`, and Save context visible.

### PING/POST

- Open at `1.98×` on **PING Options**.
- Reveal requirement rows at `1.80×`.
- Track Profit and Minimum Delivery Count at `1.94–1.98×`.
- Reframe Field Requirements at `1.88×`.
- Open the required-field dialog at `1.82×`, then push to the searchable field/type controls at `1.98×`.
- Finish on the saved required row at `1.88×`.

### Phone

- Open at `1.98×` on **Phone Numbers**.
- Reveal the toolbar at `1.84×`, then push to Add at `1.96×`.
- Frame IVR identity fields at `1.94×`.
- Reveal the Purchase dialog at `1.80×`; push into the selected number row and Purchase action at `1.94–1.98×`.
- Return to IVR Details at `1.86×`, then track Call Flow and Message Flow at `1.96×`.
- Finish tightly on the completed dialog and Save.

### Chat

- Open at `1.98×` on **Web Chats**.
- Reveal the toolbar at `1.84×`, then push to Add at `1.96×`.
- Frame the Properties identity/message-flow group at `1.9–1.96×`.
- Track company/agent, welcome message, and display options at `1.92–1.98×`.
- Remain on **Properties** only.
- Finish tightly on the completed Properties controls and Save.

## Quality And Tests

- Extend generator tests to require a `1.76×` minimum and `2.0×` maximum scale.
- Verify every walkthrough starts at `>=1.92×`, contains a context reveal, returns to `>=1.9×` for action staging, and ends at `>=1.82×`.
- Verify camera cues remain ordered, non-overlapping, and settled during every action dwell.
- Render all eight theme/channel combinations atomically.
- Decode tab, mid-action, nested-dialog, and final frames for visual review.
- Browser-check light and dark playback at the actual completion-dialog size.
- Run generator unit tests, scoped lint, production build, and campaign Next Steps E2E.

## Non-Goals

- No completion-dialog layout changes.
- No new captions, narration, controls, or explanatory overlays.
- No change to the realistic field values or channel-specific workflows.
- No commit, push, or deployment without explicit approval after preview review.

# Realistic Campaign Walkthrough Camera Design

**Date:** 2026-08-06
**Status:** Approved direction; implementation pending written-spec checkpoint
**Selected approach:** Guided task camera

## Objective

Replace the current six-second, fixed-zoom campaign walkthroughs with channel-specific demonstrations that look like a real person configuring the campaign. Preserve the existing completion dialog and media component while improving camera control, action pacing, visual sharpness, and the realism of the values entered.

The videos remain silent, looped, theme-aware, and 16:9. Duration is determined by the work shown rather than forced to be equal across channels.

## Current Problem

The current source captures and final videos are both 1920 × 1080. A constant 2.04× camera scale crops approximately 941 × 529 source pixels and stretches that crop back to 1920 × 1080. The file metadata is Full HD, but the effective source resolution is much lower, which softens UI text.

The shared six-second timeline also compresses all channels into the same pace. PING, Phone, and Chat must skip or rush meaningful configuration steps, so their cursor movement and state changes feel staged rather than instructional.

## Success Criteria

- Every light and dark source state is captured at 3840 × 2160 from a 1920 × 1080 CSS viewport at device scale factor 2.
- Every delivered video is exactly 1920 × 1080, 30 fps, silent WebM with no camera crop upscaled from less than 1920 × 1080 source pixels.
- Text in decoded frames remains crisp and readable at the completion dialog's 16:9 display size.
- Camera framing retains enough surrounding UI to explain location while making the active control the visual focus.
- Cursor travel, clicks, typing, dropdown selection, scrolling, and modal transitions occur in a believable order with readable holds.
- Light and dark versions use identical actions, values, timing, camera framing, and duration.
- The existing reduced-motion behavior continues to display a matching static poster.
- Existing prototype UI, routes, dialog layout, copy, and channel navigation remain unchanged.

## Source Capture And Resolution Pipeline

1. Open the real campaign editor in the Codex in-app browser at a 1920 × 1080 CSS viewport.
2. Capture accepted UI states at device scale factor 2, producing 3840 × 2160 PNG files.
3. Store camera and cursor coordinates in CSS-space coordinates. Convert them to physical source pixels during rendering.
4. Render a 1920 × 1080 camera crop from the 4K source. At the maximum 1.7× scale, the physical crop remains approximately 2259 × 1271, so the final frame is downsampled rather than enlarged.
5. Encode high-quality WebM at a target 10–12 Mbps using the best compatible encoder exposed by the bundled ffmpeg. Prefer VP9; use high-quality VP8 only when VP9 is unavailable.
6. Generate the poster from the final readable hold state at 1920 × 1080.
7. Render into a temporary batch directory. Replace the production assets only after all eight videos and eight posters pass validation.

## Camera Direction

### Framing

- Navigation and section changes: 1.25–1.35×.
- Standard field configuration: 1.45–1.60×.
- Compact nested dialogs: up to 1.70×.
- The active control should remain between the central 20% and 80% of the frame where possible.
- Camera framing must not settle on large empty regions or crop away the label associated with the active control.

### Motion

- Camera motion begins slightly before cursor travel and settles before the click or typing action.
- Position and scale use smooth acceleration and deceleration with zero-velocity joins.
- Cursor motion follows short curved paths rather than straight constant-speed interpolation.
- Typical pointer travel lasts 250–450 ms; long cross-screen moves may take up to 650 ms.
- A compact click ripple is synchronized with the state change.
- UI-state blends last 80–120 ms. They must not create a visible dissolve across the whole form.
- Each meaningful value is held for 700–1200 ms after entry.
- Final states remain visible for 1–1.5 seconds before a short, unobtrusive loop reset.

## Channel Storyboards

All values are realistic prototype data already represented by the campaign domain. The videos demonstrate representative setup, not every possible option.

### Web — 8–9 seconds

1. Start close enough to show the campaign navigation and click **General**.
2. Frame **Campaign Name** and show `Mortgage Web Form`.
3. Confirm **Status: Active**.
4. Move to **Payout Options**, keep **Price Per Lead** selected, and enter `$10.00`.
5. Briefly show the available revenue-share alternatives for context.
6. Hold on the completed General Settings state with the payout value readable.

### Ping/Post — 11–13 seconds

1. Start on the navigation and click **PING Options**.
2. Enable and populate representative revenue/profit requirements.
3. Scroll with the camera to **Field Requirements for PING**.
4. Click **Add** to open **PING Required Field**.
5. Search for and select `Phone`, set `Type: Required`, and save.
6. Hold on the shared grid showing realistic `Address / Optional` and `Phone / Required` rows.

### Phone — 13–15 seconds

1. Start on the navigation and click **Phone Numbers**.
2. Click **Add** to open **IVR Number Details**.
3. Enter `Mortgage Call Line`.
4. Open **Purchase New Number**, keep `United States / Toll Free`, select `(866) 689-0601`, and purchase it.
5. Return to IVR Details with the purchased number selected.
6. Select `Main Call Flow` and `Main Message Flow`.
7. Hold on the completed IVR setup with the footer actions visible.

### Chat — 11–13 seconds

1. Start on the navigation and click **Web Chats**.
2. Click **Add** and stay on the **Properties** tab only.
3. Fill `Website Chat Leads`, select `Mortgage Chat Flow`, and enter `Landing Page Chat Leads`.
4. Fill `CBA Mortgage` and agent name `Amy`.
5. Enter `Hello, my name is Amy. How can I help you?` as the initial chat message.
6. Enable **Show Chat Button** and **Auto Show Chat**, then enter `5 Seconds`.
7. Hold on the completed Properties configuration with **Save** visible.

## Generator Architecture

The existing Pillow/ffmpeg generator remains the single deterministic source of media. Extend its data model instead of creating channel-specific scripts.

- `CameraKeyframe`: time, focus point, scale, and optional hold duration.
- `ActionStep`: scene suffix, timestamp, pointer target, action kind, and camera framing.
- `Walkthrough`: channel, target duration, approved story steps, and theme-independent motion data.
- Camera interpolation controls position and scale independently so zoom and pan can settle naturally.
- Scene selection supports explicit UI states such as dropdown-open, typing-complete, modal-open, and saved-result.
- Source validation rejects missing states, wrong dimensions, mismatched light/dark scene sets, or an unsafe crop smaller than the final output.

No React component changes are expected unless final QA reveals a media-loading regression.

## Quality Verification

Add deterministic checks for both the generator contract and rendered assets:

- Source PNG dimensions: exactly 3840 × 2160.
- Output dimensions: exactly 1920 × 1080.
- Frame rate: 30 fps.
- Duration ranges: Web 8–9.5 s, PING 11–13.5 s, Phone 13–15.5 s, Chat 11–13.5 s.
- Effective crop size: never below 1920 × 1080 source pixels.
- Video bitrate: target range 8–14 Mbps, with no file accepted below the configured quality floor.
- Decoded first, middle, action, and final frames are captured for visual review.
- Encoded-frame quality is compared with the corresponding uncompressed rendered frames; target PSNR is at least 38 dB for sampled frames.
- Each walkthrough is browser-checked for successful decode, correct theme asset, readable values, correct final state, and smooth looping.

If VP9 is unavailable, high-quality VP8 is acceptable only when it passes the same bitrate and sampled-frame quality thresholds. Generation fails with a clear message when no compatible encoder is available or any required quality metric cannot be met.

## Testing And QA

- Extend generator unit tests before changing generator behavior.
- Test channel-specific durations, keyframe ordering, scale limits, hold durations, safe crop dimensions, and light/dark scene parity.
- Run the complete media generation into a temporary directory.
- Inspect contact sheets for every channel in both themes.
- Open the completion dialog in the Codex in-app browser and play all eight assets at their real display size.
- Verify no camera jump, blank-space framing, label cropping, unreadable text, missing cursor action, or abrupt loop boundary remains.
- Run the existing campaign next-step tests, scoped lint, generator tests, and production build.

## Non-Goals

- No narration, captions, audio, or explanatory overlays.
- No changes to the completion dialog layout or playback controls.
- No attempt to demonstrate every configuration option.
- No commit, push, or deployment without explicit user approval after preview review.

# Realistic Campaign Walkthrough Videos

**Date:** 2026-08-06
**Status:** Approved design, pending implementation

## Goal

Replace the current six-second, continuously moving walkthroughs with polished channel-specific demonstrations that read as real configuration work. Each video must show the relevant tab, a believable sequence of clicks and field updates, and a stable completed state without sacrificing text clarity.

The change covers the existing Web, Ping/Post, Phone, and Chat walkthroughs in both light and dark themes. The surrounding Next Steps dialog and its playback component stay unchanged unless a media compatibility issue requires a narrowly scoped fix.

## Selected Approach

Use deterministic state-driven cinematography built from real browser-rendered application captures.

This keeps the visual source authentic while allowing precise control over camera movement, cursor timing, pauses, and encoding. It is preferred over raw screen recording because the eight theme/channel variants must remain reproducible and visually consistent. Merely slowing the existing renderer is rejected because its fixed 2.04× camera and crossfaded states still read as a slideshow.

## Visual and Motion Direction

- Runtime: 10.0 seconds per video at 30 FPS, for 300 rendered frames.
- Delivery size: 1920 × 1080, 16:9, square pixels, `yuv420p` WebM.
- Source captures: 1920 × 1080 CSS layout at 2× pixel density, producing 3840 × 2160 source pixels. Camera crops are downsampled to the 1920 × 1080 output; no camera shot may require upscaling.
- The opening shot holds the channel navigation and relevant tab for 1.0 second.
- The pointer reaches the tab quickly, clicks, and then the camera pans to the first task.
- The camera moves only between actions. It settles before a click, selection, toggle, or typing sequence and remains still while that action is legible.
- Use adaptive framing instead of a constant zoom. Wider context shots preserve the tab and panel relationship; close shots frame the active control and nearby label/help text.
- Each meaningful action receives a 0.4–0.7 second reading pause.
- UI states change at the action boundary. Avoid long crossfades between empty and completed forms. A dissolve, if needed for antialiasing, must stay below 80 ms.
- Pointer motion uses short eased paths, with a restrained click ring. It must not cut across unrelated content or move while the camera is still settling.
- The completed configuration holds for at least 1.2 seconds before the loop restarts.

## Realistic Interaction States

All visible UI states come from the real prototype rendered in the in-app browser. The source set expands beyond `start`, `selected`, and three generic steps to include action-specific states:

- control before interaction;
- dropdown or searchable menu open where applicable;
- selected or typed result;
- nested dialog open/closed states;
- final saved configuration.

For typing, capture several authentic input states at meaningful prefixes rather than fading directly from empty to completed text. The generator advances through those captured states at natural typing intervals while the camera remains fixed.

## Channel Storyboards

### Web

1. Start close on the left navigation and click **General**.
2. Set a realistic campaign status.
3. Choose the revenue-share payout model.
4. Type a representative payout value.
5. Hold on the completed General Settings configuration.

### Ping/Post

1. Start close on the navigation and click **PING Options**.
2. Enable representative profit and delivery requirements.
3. Enter realistic values while preserving the visible labels.
4. Move to **Field Requirements for PING** and click **Add**.
5. Search for a lead field, choose its type, save, and hold on the populated grid.

### Phone

1. Start close on the navigation and click **Phone Numbers**.
2. Click **Add** to open **IVR Number Details**.
3. Enter a realistic name.
4. Open **Purchase New Number**, choose a number, and return to IVR details.
5. Select Call Flow and Message Flow, save, and hold on the configured result.

### Chat

1. Start close on the navigation and click **Web Chats**.
2. Click **Add** and remain on the **Properties** tab only.
3. Fill Name, Message Flow, Description, Company Name, Agent Name, and Initial Chat Message using representative mortgage content.
4. Enable Show Chat Button and Auto Show Chat, then enter a short delay.
5. Save and hold on the completed Properties configuration.

## Generator Architecture

Refactor the walkthrough definition into explicit action and camera tracks:

- `SceneState`: browser capture identifier and source dimensions.
- `ActionCue`: action type, timestamp, pointer target, resulting scene, and dwell duration.
- `CameraCue`: start/end time, focus point, crop size, and easing.
- `Walkthrough`: channel, duration, action track, camera track, and final hold.

Camera and action tracks remain independent. The camera renderer owns only crop interpolation; the action renderer owns scene changes, cursor travel, typing checkpoints, click feedback, and final-state timing. This prevents a scene change from implicitly forcing camera movement.

Existing output filenames remain stable so `CampaignWalkthroughVideo` continues selecting the correct light/dark assets without component changes.

## Capture and Data Flow

1. Open the real channel editor at the approved desktop viewport and theme.
2. Drive the representative flow through visible controls.
3. Capture each declared `SceneState` at 2× density with no browser chrome.
4. Validate every source dimension before rendering.
5. Render deterministic frames from the scene, action, pointer, and camera tracks.
6. Encode WebM and generate its final-state poster.
7. Validate media metadata and visually inspect checkpoints from every channel/theme pair.

## Quality and Encoding

- Reject source files below 3840 × 2160 or with mismatched aspect ratio.
- Reject any camera crop smaller than 1920 × 1080 source pixels.
- Encode VP9 when the bundled encoder supports it; otherwise retain VP8 with a target bitrate of at least 8 Mbps and high-quality deadline settings.
- Keep frame rate at 30 FPS and pixel format at `yuv420p` for browser compatibility.
- Validate output dimensions, duration, frame rate, codec, bitrate, and file presence.
- Inspect text edges and small labels at the tightest camera shot in both themes. Compression blocks, ringing, and soft text are blocking defects.

## Error Handling

- Missing scene: fail with the channel, theme, and scene identifier.
- Invalid source size/density: fail before any encode begins.
- Crop that would upscale: fail and report the cue and computed crop size.
- Timeline overlap or action outside duration: fail validation before rendering.
- Encoder failure or missing output: fail the command and keep existing production assets untouched.

Generation writes to a temporary output directory first. Production assets are replaced only after all eight videos and eight posters pass validation.

## Testing and QA

Automated tests must cover:

- stable filenames for all four channels and both themes;
- duration and frame count;
- ordered action and camera cues;
- camera stationary during interaction/dwell windows;
- no crop below 1920 × 1080 source pixels;
- correct channel-specific storyboard actions;
- final hold duration;
- source and output dimension validation;
- atomic replacement behavior.

Visual QA must extract checkpoints from every video at navigation, first action, midpoint, nested-dialog or field-grid state, and final configuration. Light/dark pairs are compared for identical geometry and action timing. The videos are then played inside the real Next Steps dialog to confirm 16:9 fit, decoding, autoplay, looping, theme switching, and readable text at the rendered modal size.

## Acceptance Criteria

- Eight new channel/theme walkthroughs and eight matching posters exist.
- Each walkthrough visibly demonstrates its approved channel-specific flow rather than only showing a destination screen.
- Camera motion is smooth, settles before each action, and never hides the active control or its label.
- Cursor, clicks, dropdowns, typing, nested dialogs, and saved states follow a believable order.
- Output metadata reports 1920 × 1080 at 30 FPS with a 10.0 second duration.
- No output frame is produced by upscaling a camera crop.
- Small UI text remains sharp in the tightest light and dark shots.
- Existing media URLs and `CampaignWalkthroughVideo` behavior remain compatible.

## Out of Scope

- Voice-over, audio, captions, or tutorial copy overlays.
- Changes to the surrounding Next Steps dialog layout.
- Additional channel tabs beyond Web, Ping/Post, Phone, and Chat.
- Exhaustive configuration of every available field; each video is a representative, realistic flow.

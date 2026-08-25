# Human-Like Campaign Walkthroughs Design

**Date:** 2026-08-10
**Status:** Approved by the user
**Selected approach:** DOM-driven interaction capture with directed post-production camera

## Objective

Replace the current screenshot-swap walkthroughs with deterministic recordings of real campaign-editor interactions. Every visible state change must be caused by the cursor action shown in the video, values must be selected or typed through the real control, labels and values must remain readable at the completion dialog's actual video size, and light/dark variants must follow the same action trace.

The completion dialog, explanatory copy, route structure, and video component remain unchanged.

## Interaction Contract

Each semantic action follows the same visible sequence:

1. The camera settles on a frame that contains the control label, current value, and next target.
2. The cursor travels to a point inside the target element's live DOM bounding box.
3. The cursor holds for 120–180 ms to establish intent.
4. A real click occurs at the cursor position.
5. The UI exposes the expected intermediate state: dropdown, popover, modal, focus ring, or caret.
6. For selections, the cursor travels to the real option and clicks it. For text, characters appear at 40–75 ms per character in the focused field.
7. Exactly one semantic control changes per action.
8. The completed label and value remain readable for 500–700 ms before camera or cursor travel resumes.

No value may appear before the corresponding click or typing action. No action may update multiple independent controls. A click is invalid when its recorded point falls outside the target element's bounding box.

The complete cursor bitmap must remain inside the 1920 × 1080 video frame throughout every travel, dwell, click, and typing segment. When a target is too close to an edge, the camera must reframe and settle before cursor travel begins; clipping or allowing the pointer to leave the video is invalid.

## Capture Architecture

The recorder drives the existing campaign editor through Playwright using semantic locators. It injects the existing real cursor bitmap as a non-interactive overlay and moves it to bounding boxes obtained from the live page. The same target rectangle becomes the camera anchor, eliminating separate hand-maintained cursor and camera coordinates.

The recorder produces a theme-independent action trace containing timestamps, target rectangles, click points, entered values, and camera anchors. Light and dark recordings replay the same trace against their respective themes. The browser capture remains at 1920 × 1080 CSS pixels with device scale factor 2 so the post-production source is 3840 × 2160.

The existing Pillow/ffmpeg renderer remains responsible for the final directed 1920 × 1080 output. It consumes real captured frames and trace metadata instead of manually authored `ActionCue.pointer_target` coordinates.

## Camera Grammar

- Start with a 2.0–2.1× close-up of the relevant campaign tab.
- Move to the next semantic block before cursor travel and settle at least 180 ms before the click.
- Keep the active label and resulting value inside the central 80% safe frame.
- Use 2.15–2.3× task close-ups at the current modal display size.
- Keep camera position and scale fixed during clicks, dropdown selection, and typing.
- Keep the complete cursor bitmap inside an 18 px minimum output-frame inset; reframe before travel when that inset cannot be preserved.
- Pan between controls with fifth-order easing over 300–550 ms.
- Do not zoom out until the final action has been read for at least 600 ms.
- Finish with the completed local block and Save action visible for 1.0–1.3 seconds.

## Channel Storyboards

### Web — approximately 13 seconds

1. Click **General**.
2. Open **Status**, click **Active**, and hold the selected value.
3. Move to **Payout Options**.
4. Click **Revenue Share – Percentage**.
5. Focus the payout field and type `12.50` visibly.
6. Click **Save** and hold the completed payout block.

### Ping/Post — approximately 18 seconds

1. Click **PING Options**.
2. Click **Profit Requirement**, focus its value, and type `35` as separate actions.
3. Click **Minimum Delivery Count**, focus its value, and type `3` as separate actions.
4. Click **Add** under **Field Requirements for PING**.
5. Open the searchable lead-field selector, type `credit`, and click **Credit Score Range**.
6. Open **Type** and click **Required**.
7. Click the inner **Save** and hold the resulting grid row.

### Phone — approximately 20 seconds

1. Click **Phone Numbers**, then click **Add**.
2. Focus **Name** and type `Mortgage Call Line`.
3. Click **Purchase New Number**.
4. Click the row `(866) 689-0601`, then click **Purchase**.
5. Open **Call Flow**, click **Main Call Flow**, and hold the value.
6. Open **Message Flow**, click **Main Message Flow**, and hold the value.
7. Click **Save** and hold the completed IVR details.

### Chat — approximately 19 seconds

1. Click **Web Chats**, then click **Add**.
2. Remain on **Properties** only.
3. Type `Website Chat Leads` into **Name**.
4. Type the description into **Description**.
5. Open **Message Flow** and click **Mortgage Chat Flow**.
6. Type `CBA Mortgage` into **Company Name**, then type `Amy` into **Agent Name**.
7. Type the welcome message into **Initial Chat Message**.
8. Click **Show Chat Button**.
9. Click **Auto Show Chat**, then focus the delay and type `5`.
10. Click **Save** and hold the completed Properties state.

## Validation

Automated tests must prove:

- every click point is inside its target rectangle;
- every rendered cursor bounding box remains inside the output frame with the required inset;
- every selection includes an opened control and a clicked option;
- text entry targets the currently focused field;
- no action produces more than one declared semantic state delta;
- camera motion is settled during interaction dwell;
- labels and values remain inside the safe frame at action time;
- light and dark action traces are structurally identical;
- every output is 1920 × 1080, 30 fps, and uses a quality bitrate of at least 8 Mbps;
- channel durations match the storyboard ranges;
- reduced-motion posters match the corresponding final state.

QA contact sheets must include the tab click, every dropdown-open state, every option click, each nested modal, the final filled state, and the final save action. Final browser review is performed at the completion dialog's real video size in both themes.

## Non-Goals

- No narration, captions, audio, or explanatory overlays.
- No completion-dialog layout changes.
- No configuration outside the channel-specific storyboard.
- Chat does not leave the **Properties** tab.
- No commit, push, or deployment without explicit user approval after preview review.

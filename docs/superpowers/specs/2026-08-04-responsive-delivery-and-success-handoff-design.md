# Responsive Delivery Options and Success Handoff

## Goal

Improve readability at the 1012px preview width and turn the lead-source success dialog into a minimal, channel-specific handoff from creation to campaign configuration.

## Delivery Options

- Reuse the existing `DeliveryOptionsContent` and `SelectableCard` components.
- Align the parent grid with the breakpoint already used inside `SelectableCard`:
  - below the Tailwind `lg` breakpoint: one full-width card per row;
  - at `lg` and above: three equal columns.
- Keep selection behavior, copy, icons, radio indicators, and delivery settings unchanged.
- The 1012x1391 viewport must show the three delivery choices as a single readable column with no horizontal overflow.

## Success Handoff Layout

Use the existing dialog primitives and a responsive two-column desktop layout.

### Desktop

- Dialog maximum width is 960px, capped by the existing 95vw constraint.
- Main content uses a 38/62 split:
  - left: creation confirmation;
  - right: the channel-specific next step.
- A single subtle divider separates the columns.
- The footer spans the full dialog width and keeps one primary `Next` action.

### Compact widths

- Below the `md` breakpoint, stack the confirmation above the next step.
- Replace the vertical divider with a horizontal divider.
- Preserve readable spacing and avoid horizontal scrolling.

### Left column: confirmation

- Use a compact success icon from the existing icon system instead of a large decorative hero image.
- Render the confirmation icon with the existing blue `primary` / `primary-light` tokens rather than the green success token.
- Keep the approved heading: `Your lead source has been created!`.
- Keep the campaign-name confirmation copy.
- Present the existing return-later tip as quiet supporting content, not a separate prominent card.
- Preserve the current 38/62 layout and white light-theme surface; improve hierarchy through tighter spacing and typography rather than changing the geometry.

### Right column: next step

- Add a small `Next step` eyebrow.
- Use a channel-specific heading:
  - Web: `Review General Settings`;
  - Ping/Post: `Configure PING Options`;
  - Phone: `Add a Phone Number`;
  - Chat: `Configure Web Chats`.
- Keep the approved channel-specific instructional paragraph.
- Show a 16:9 walkthrough directly below the copy.
- Use only a border and small radius around the media; avoid additional card layers or heavy shadows.

## Walkthrough Media

- Reuse one shared walkthrough component configured by channel.
- Provide light and dark WebM (VP8) walkthrough variants for each channel.
- Start from a close-up of the campaign navigation rather than a wide editor view.
- Move the pointer to the channel tab in 0.6–0.7 seconds and click at approximately 1 second.
- Continue from the tab selection to the actual channel-specific destination:
  - Web: `General` → scroll to payout settings;
  - Ping/Post: `PING Options` → scroll to `Field Requirements for PING`;
  - Phone: `Phone Numbers` → `Add` → `IVR Number Details`;
  - Chat: `Web Chats` → `Add` → `Web Chat Dialog`.
- Hold the relevant destination long enough to understand it, then reset cleanly for the loop.
- Encode at 16:9 with no audio.
- Playback behavior: `autoPlay`, `muted`, `loop`, and `playsInline`.
- Keep the existing channel preview PNG as the poster and fallback.
- The instructional paragraph communicates the same action, so the video is supplementary rather than the only source of meaning.
- When `prefers-reduced-motion: reduce` is active, do not autoplay; show the poster/paused state.

## Theme Support

- Reuse the existing `useThemeStore`, `.dark` class, and design tokens.
- Add one fixed 44 × 44px circular theme button at the bottom-right with a 24px inset.
- Show `Moon` in light mode and `Sun` in dark mode, using existing Lucide icons and the shared `Button` primitive.
- Expose an explicit accessible label for the action and persist the selected binary light/dark value in `localStorage`.
- Keep the theme button below modal overlays so it never covers or competes with modal footer actions.
- Audit shared primitives and token mappings for hard-coded light values. Fix shared components first; do not add screen-specific dark-mode patches when a token or primitive is the correct layer.
- Cover the launcher, creation wizard, campaign editors, dialogs, data grids, forms, toasts, and completion handoff.
- Select the walkthrough/poster variant that matches the resolved theme; do not recolor raster editor media with CSS filters.

## UX Constraints

- One clear primary action: `Next`.
- No timeline for a two-step transition.
- No new navigation model or channel state. Theme persistence is limited to the existing theme store.
- Reuse existing typography, colors, spacing tokens, buttons, dialog primitives, and channel mapping patterns.
- Keep close behavior and `Next` routing unchanged.
- Increase the close control hit area to 44 × 44px while preserving the existing 16px icon.
- Move initial modal focus to the dialog container/title region instead of visually emphasizing Close on open.

## Verification

- Add a failing responsive test before changing production code.
- At 1012x1391, assert that Delivery Options cards share the same horizontal position and are vertically ordered.
- For each channel, assert the correct heading, copy, poster, and video source.
- Assert the video is 16:9 and has muted, loop, autoplay, and inline playback enabled.
- Assert reduced-motion mode suppresses autoplay.
- Assert every light/dark video decodes at 1920 × 1080 and demonstrates the confirmed channel-specific destination.
- Assert `Next` still opens the correct campaign editor tab.
- Test theme toggle semantics, persistence, light/dark class application, and modal-overlay stacking.
- Visually verify the launcher, wizard, all campaign editor types, nested dialogs, and completion handoff in both themes.
- Run the relevant Playwright suites, ESLint, build, and browser QA at the target viewport.

## Out of Scope

- Backend persistence.
- Audio or narration.
- Additional onboarding steps.
- Changes to the campaign editor itself beyond the responsive Delivery Options layout.
- Three-state Light/Dark/System UI; the floating control is intentionally a binary toggle.

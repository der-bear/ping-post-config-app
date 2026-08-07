# Campaign channel configuration — design QA

## Evidence

- Source visual truth: `/Users/aderkach/Downloads/New Lead Source New Steps Popup Windows By Channel .docx`.
- Extracted DOCX references: `design-qa-assets/image1.png` (Web completion, 1375 × 1144 px) and `design-qa-assets/image2.png` (PING/POST completion, 1397 × 1126 px).
- Additional source truth: the Phone Numbers, IVR Number Details, PING Options, Web Chats, and Web Chat Dialog screenshots supplied in the task conversation.
- PING Required Field source truth: the 1360 × 918 px screenshot supplied in the task conversation.
- Rendered completion implementation: `design-qa-assets/implementation-chat-success-pass-2.png` (1280 × 900 px) and focused dialog crop `design-qa-assets/implementation-chat-success-dialog-pass-2.png` (960 × 759 px).
- Rendered Web Chat implementation: `design-qa-assets/implementation-web-chat-dialog.png` (1280 × 900 px).
- Rendered PING Required Field implementation: `audit-screenshot-fidelity/current/14-ping-required-field-dialog-final.png` (1512 × 300 px focused connected-browser capture).
- Combined side-by-side evidence: `design-qa-assets/comparison-pass-1.png` and `design-qa-assets/comparison-pass-2.png` (1512 × 300 px each).
- Responsive handoff source/implementation comparison: `design-qa-assets/comparison-success-two-column.png` (1440 × 800 px), combining the extracted DOCX Web reference with the browser-rendered two-column implementation.
- Responsive Delivery Options implementation: `design-qa-assets/delivery-options-1012x1391.png` (1012 × 1391 px).
- Responsive success handoff implementation: `design-qa-assets/success-handoff-1012x1391.png` (1012 × 1391 px).
- Walkthrough focus evidence: `design-qa-assets/walkthrough-web-click-frame.png` (1920 × 1080 px) plus the live browser-rendered video in the success handoff.
- Final theme and responsive evidence: `design-qa-assets/final-theme-walkthrough/completion-light.png`, `completion-dark.png`, and `delivery-compact.png` at 1012 × 1391 px.
- Final realistic walkthrough sources: `design-qa-assets/walkthrough-sources-v3/{light,dark}`; every source state is an authentic 3840 × 2160 browser-rendered capture for Web, PING/POST, Phone, and Chat.
- Final realistic walkthrough frame evidence: `output/walkthrough-storyboards-v2/`; decoded action and final-hold frames verify cursor targeting, progressive configuration, and settled camera framing.
- Final realistic browser evidence: `design-qa-assets/realistic-walkthrough-light-qa.png`, `design-qa-assets/realistic-walkthrough-dark-qa.png`, and `design-qa-assets/realistic-walkthrough-local-preview-v2.png` (1239 × 1484 px browser captures).
- Final realistic source/implementation comparison: `design-qa-assets/comparison-realistic-walkthrough-pass-10.png` (1992 × 1252 px). It places the DOCX Web and PING/POST editor references next to decoded 1.25-second dark-theme implementation frames in one comparison image.
- Directed-camera source/implementation comparison: `design-qa-assets/comparison-directed-camera-pass-11.png` (1920 × 2336 px). Each row places one authentic 3840 × 2160 source state next to its decoded 1920 × 1080 action frame after normalization to matched 960 × 540 cells.
- Directed-camera browser evidence: `design-qa-assets/directed-camera-web-1s-browser.png`, `design-qa-assets/directed-camera-web-4-6s-browser.png`, `design-qa-assets/directed-camera-web-8-8s-browser.png`, and `design-qa-assets/directed-camera-chat-dark-browser.png` (1280 × 720 px each).
- Final Next Steps evidence: `design-qa-assets/final-phone-next-steps-dark.png`.
- Final Purchase IVR evidence: `design-qa-assets/final-purchase-ivr-light.png` and `design-qa-assets/final-purchase-ivr-dark.png`.
- Final semantic success-icon evidence: `test-results/next-steps-success-icon-light.png` and `test-results/next-steps-success-icon-dark.png` (2695 × 1542 px browser captures).
- Preview shortcut copy comparison: `test-results/preview-row-before.png` and `test-results/preview-row-after.png` (2695 × 1542 px browser captures at the same dark-theme launcher state).
- Implementation viewport: 1280 × 900 CSS px at `deviceScaleFactor: 1`.
- Responsive implementation viewport: 1012 × 1391 CSS px at `deviceScaleFactor: 1`; screenshot pixels match CSS pixels 1:1. The success dialog measured 960 CSS px wide with 360/600 px confirmation and next-step tracks. The rendered video measured 16:9 and decoded at 1920 × 1080.
- Density normalization: the DOCX sources are document-export rasters rather than browser CSS captures. They were contain-fitted next to the implementation without upscaling; dialog crops and the 1280 × 900 full-view capture were used to judge readable details and proportions rather than treating source raster pixels as CSS pixels.
- States compared: post-create completion dialog; channel-specific campaign editor states; PING Required Field dialog; Chat campaign Web Chats empty state; Web Chat Dialog Properties tab.

## Full-view comparison

The final completion dialog keeps the source hierarchy while applying the approved minimalist handoff structure: the left column confirms creation and keeps the return-later tip; the right column names the channel-specific next step and presents a 16:9 walkthrough; the footer retains a single Next action. At 1012 × 1391 the 960 px dialog uses a 360/600 px split without clipping or compressed copy.

The Delivery Options state at 1012 × 1391 switches from the former condensed three-column card grid to a single 515 px-wide column. The three choices share one x-coordinate and maintain 12 px vertical spacing, while the shared left navigation and distribution form remain unchanged.

The Web Chat Dialog keeps the supplied structure: blue header, four tabs, two-column top row, description, company/avatar/agent row, initial message, display toggles, and fixed Cancel/Save actions. Its long form scrolls inside the dialog while the footer remains reachable.

## Focused-region comparison

- Success region: the final user-approved minimalist state uses the shared Lucide confirmation icon on the existing semantic `success` token with a 15% success-tinted circular surface. The 36 × 36 px green mark restores the source completion semantics without competing with the next-step heading.
- Campaign walkthrough region: every channel has separate light and dark 1920 × 1080 WebMs rendered in a 16:9 slot. Each 10-second clip opens close to the channel navigation, reaches the required tab in under 0.7 seconds, and uses independent camera and action tracks so the camera settles before every click or field update. Web remains on General and configures payout; PING/POST follows PING Options through Field Requirements; Phone follows Add → Purchase IVR Number → IVR flows; Chat stays within Properties and completes only the supplied Properties fields.
- Web Chat agent region: the generated 1254 × 1254 px portrait is rendered as a sharp 72 × 72 CSS px circular avatar in the same placement as the reference.
- Footer region: every campaign channel uses the same `Posting Instructions | Close | Save` footer through the shared panel footer.
- PING Required Field region: the final dialog preserves the supplied blue header, title and close placement, two stacked selects with `Country` and `Required` defaults, divider, and `Cancel | Save` footer. The current audit viewport is shorter than the source screenshot, so the comparison is limited to component proportions and visible-state structure rather than a pixel-coordinate overlay.

## Required fidelity surfaces

- Fonts and typography: existing application font stack, weights, and hierarchy are preserved. Heading, body copy, helper text, labels, and tab text follow the project's established type scale and do not truncate in the captured states.
- Spacing and layout rhythm: modal width, section spacing, static preview aspect ratio, grid rows, fixed footer, borders, radii, and internal scrolling match the supplied references closely enough that no P0/P1/P2 layout drift remains. The new PING dialog uses the same shared header, field spacing, select sizing, and footer rhythm as existing product dialogs.
- Colors and tokens: the implementation uses the existing project blue, semantic surfaces, borders, muted text, status colors, and overlay tokens. The existing Zustand theme store remains the single theme authority; missing dark values were added at the token/shared-primitive layer. Contrast remediation remains explicitly outside this task's scope.
- Image quality and asset fidelity: completion walkthroughs are generated from real 3840 × 2160 in-app browser captures and encoded as 1920 × 1080 VP8 WebM at 30 fps for exactly 10 seconds. The camera is capped at 2.30×, limiting the tightest crop to 1670 × 939 before the high-quality Lanczos resize; output remains true 1080p at an 8.5 Mbps target bitrate. Theme-specific captures are used directly rather than recoloring one raster. The 16:9 browser slot keeps tab labels, field labels, entered values, pointer, and channel-specific configuration sharp. The agent portrait remains a correctly cropped raster asset; there are no placeholder boxes, emoji, CSS drawings, or inline SVG approximations for visible reference imagery.
- Copy and content: Web, PING/POST, Phone, and Chat completion copy follows the document. Channel-specific navigation labels and empty states match the supplied screenshots, including `PING Options`, `Phone Numbers`, `Web Chats`, `No IVR Numbers`, and `No Web Chats`.
- Component consistency: PING requirement rows use the existing `SwitchField`; PING field headings use `SectionHeading`; all new grids use the existing `DataGrid` stack; and the PING field modal uses the existing dialog, footer, field, select, and button primitives.
- Search and data consistency: PING field selection reuses the existing searchable `SelectBox` and the shared mortgage lead-field catalog rather than introducing a one-off picker.

## Findings

No actionable P0, P1, or P2 visual mismatches remain in the compared states.

Accepted constraints:

- The original DOCX uses a centered completion composition; the two-column composition is an intentional, user-approved UX redesign rather than fidelity drift.
- Light mode preserves the approved white modal. Dark mode applies the same geometry and hierarchy using the existing product tokens and its own recorded walkthrough media.
- Contrast remediation is excluded from the current scope by explicit user direction.

## Comparison history

### Pass 1 — blocked

- P2: the completion dialog was too narrow and vertically compressed relative to the DOCX reference.
- P2: the success indicator approximated the check state and omitted the source confetti.
- Evidence: `design-qa-assets/comparison-pass-1.png` and `design-qa-assets/implementation-chat-success-dialog-pass-1.png`.

Fixes applied:

- Increased the completion dialog to a 960 px maximum width and adjusted the content/preview proportions to a 759 px captured height.
- Replaced the approximation with the extracted source success artwork.

### Pass 2 — passed

- Post-fix evidence: `design-qa-assets/comparison-pass-2.png`, `design-qa-assets/implementation-chat-success-pass-2.png`, and `design-qa-assets/implementation-chat-success-dialog-pass-2.png`.
- No actionable P0/P1/P2 issues were visible after the fixes.

### Pass 3 — passed

- Added the supplied PING Required Field state using existing dialog/form primitives.
- Replaced the hand-composed PING requirement rows with the shared `SwitchField`, reused `SectionHeading`, and kept Field Requirements on the shared `DataGrid` stack.
- Removed the extra PING grid wrapper border identified during the Custom Headers comparison.
- Post-fix evidence: `audit-screenshot-fidelity/current/14-ping-required-field-dialog-final.png`, `audit-screenshot-fidelity/current/08-ping-field-grid-saved.png`, and `audit-component-reuse/06-custom-headers-vs-ping-fixed.jpg`.
- No actionable P0/P1/P2 issue is visible in the new modal or reused components.

### Pass 4 — passed

- Source: `design-qa-assets/image1.png` plus the approved responsive/two-column design specification at `docs/superpowers/specs/2026-08-04-responsive-delivery-and-success-handoff-design.md`.
- Initial finding: P2 — at 1012 × 1391 the Delivery Options cards remained in three columns, forcing narrow text wrapping and a condensed interaction target.
- Fix: changed the shared selectable-card grid to one column below the existing `lg` breakpoint; post-fix browser evidence is `design-qa-assets/delivery-options-1012x1391.png`.
- Initial finding: P2 — the centered completion layout did not express a clear separation between completed creation and the next channel-specific action, and the static preview did not demonstrate the required tab interaction.
- Fix: replaced the centered composition with the approved 3/5 split and introduced the reusable `CampaignWalkthroughVideo`; post-fix browser evidence is `design-qa-assets/success-handoff-1012x1391.png`, with the source/implementation pair in `design-qa-assets/comparison-success-two-column.png`.
- Video evidence: live browser metadata reported `readyState: 4`, `paused: false`, `duration: 6`, `videoWidth: 1920`, and `videoHeight: 1080`; focused source-frame evidence is `design-qa-assets/walkthrough-web-click-frame.png`.
- Compact DOM measurement at 720 × 1000 confirmed the confirmation and next-step regions stack vertically at full width with internal dialog scrolling; the IAB screenshot surface did not preserve the synthetic 720 px capture width, so it was not used for pixel-level comparison.
- No actionable P0/P1/P2 issue remains after the responsive and handoff fixes.

### Pass 5 — passed

- Replaced the green completion mark with the approved blue token-based confirmation state and tightened only spacing/type hierarchy; the 960 px width and 360/600 split remain unchanged.
- Removed initial focus emphasis from Close, increased its hit target to 44 × 44 px, and focused the dialog container on open.
- Added a fixed 44 × 44 px binary theme control at the 24 px bottom/right inset, below modal overlays, with persisted light/dark state.
- Added dark coverage to shared Switch, success Toast, semantic tokens, and CodeMirror syntax tokens.
- Generated eight 5-second walkthroughs and eight posters: light/dark for Web, PING/POST, Phone, and Chat. Phone/Chat reach their Add dialogs; PING reaches Field Requirements; Web settles on payout settings.
- Added reduced-motion behavior that keeps the theme-specific poster paused instead of autoplaying.
- Compared `audit-modal-optimization/01-current-success-modal.png` and `design-qa-assets/final-theme-walkthrough/completion-light.png` together. The approved geometry is preserved, the close control no longer dominates, and the blue completion state/next-step hierarchy is visibly clearer.
- Final responsive light, dark, and one-column Delivery Options captures show no clipping, malformed spacing, wrong surface tokens, or media mismatch. No actionable P0/P1/P2 issue remains.

### Pass 6 — passed

- Added direct launcher shortcuts for all four post-create Next Steps dialogs, while retaining the full lead-source and campaign creation flows.
- Applied the shared blue `DialogPanelHeader` to the Next Steps dialog, increased the confirmation heading to 28 px, and tightened the split to a 1/2 confirmation-to-next-step ratio. The approved 960 px modal width and white/light or tokenized dark body surfaces remain unchanged.
- Added `Purchase IVR Number` as a nested Phone flow using the shared dialog, select, button, and `DataGrid` components. Country, number type, exact toll-free inventory, row selection, disabled/enabled Purchase state, and return to the selected IVR number are interactive.
- Expanded the PING lead-field catalog and kept it searchable through the existing campaign-selection dropdown pattern.
- Rebuilt all eight walkthroughs to six seconds from real 1920 × 1080 source states. The camera scale remains fixed at 2.04× while a fifth-order easing path follows each successive field or nested dialog; it never pulls back to a full-screen overview.
- Light and dark decoded checkpoints confirm progressive content and matched geometry for Web, PING/POST, Phone, and Chat. Phone visibly enters the purchase-number grid, selects `(866) 689-0601`, returns to IVR Details, and completes Call Flow and Message Flow.
- Browser QA at the active preview verified the standard blue Next Steps header, narrower confirmation column, 28 px heading, 16:9 playback, Purchase IVR dialog, theme parity, and instant theme switching. Evidence: `design-qa-assets/final-phone-next-steps-dark.png`, `design-qa-assets/final-purchase-ivr-light.png`, and `design-qa-assets/final-purchase-ivr-dark.png`.
- Targeted campaign/theme test suite passed 20/20. The production build, targeted ESLint checks, seven generator unit tests, and Python compilation passed. Full accessibility contrast remains outside the current scope by explicit user direction.
- No actionable P0/P1/P2 issue remains in the requested surfaces.

### Pass 7 — passed

- Restored the completion icon to green by explicit user direction, using the shared `success` color token rather than a raw utility color. Geometry, spacing, typography, modal tracks, and walkthrough media remain unchanged.
- Compared the DOCX Web source `design-qa-assets/image1.png` and the browser-rendered light implementation `test-results/next-steps-success-icon-light.png` together. The source and implementation now share the same green completion semantics; the smaller 36 × 36 px mark remains an intentional part of the approved minimalist two-column redesign.
- Browser computed-style evidence: light icon `rgb(46, 184, 92)` with a 15% success tint; dark icon `rgb(69, 200, 120)` with the same tint. Both rendered at 36 × 36 px.
- Dark implementation evidence: `test-results/next-steps-success-icon-dark.png`. No clipping, token mismatch, layout shift, or new P0/P1/P2 issue is visible in either theme.

### Pass 8 — passed

- Changed only the action copy in the `Preview next-step dialogs` row from `Start` to `Preview`, using a shared group-level `actionLabel` on `CenteredListGroup` with `Start` retained as the component default.
- Compared `test-results/preview-row-before.png` and `test-results/preview-row-after.png` together at the same 2695 × 1542 browser capture size and dark-theme launcher state. The four preview cards now use `Preview`; both creation cards and all four editor cards remain `Start`.
- Typography, wrapping, card heights, grid tracks, icons, colors, spacing, borders, and interaction affordances are unchanged. The new seven-character action label fits without clipping or layout shift.
- Browser interaction checks confirmed all four preview buttons remain present and retain their existing click targets. No actionable P0/P1/P2 issue remains.

### Pass 9 — passed

- Restored the completion icon to the shared blue `primary` state by the user's final explicit direction, superseding the green choice documented in Pass 7. No geometry, spacing, typography, modal tracks, or walkthrough media changed.
- Browser-rendered light evidence: `test-results/next-steps-success-icon-blue-light.png`; dark evidence: `test-results/next-steps-success-icon-blue-dark.png`.
- Computed-style evidence: both themes use `bg-primary-light text-primary`; the icon remains 36 × 36 px. Light resolves to `rgb(73, 139, 255)` on `rgb(232, 240, 255)`, and dark resolves to `rgb(46, 111, 217)` on `rgb(30, 42, 71)`.
- The confirmation heading remains 28 px and the two-column layout is unchanged. No actionable P0/P1/P2 issue remains.

### Pass 10 — passed

- Rebuilt all eight walkthroughs as 10-second, 1920 × 1080, 30 fps videos from authentic 3840 × 2160 browser-rendered light/dark source states. Output pixels are a downsample from equal-or-higher-resolution crops; no frame is raster-upscaled.
- Replaced the fixed-scale pan with a channel-specific camera track using smooth fifth-order easing. Camera motion ends before each interaction dwell, and the UI state changes 140 ms after the visible click so the click is legible on the correct pre-action state.
- Added realistic configuration stories: Web changes status and payout; PING/POST configures profit, delivery count, searchable Field Requirements, and saves the required field; Phone names the IVR line, buys a toll-free number, sets Call Flow and Message Flow, and saves; Chat fills only Properties, including identity, message flow, company/agent, welcome message, and display options.
- Full-view browser evidence at 1239 × 1484 px confirms the unchanged 960 px Next Steps dialog geometry, correct light/dark media selection, and a readable 16:9 viewport: `design-qa-assets/realistic-walkthrough-light-qa.png`, `design-qa-assets/realistic-walkthrough-dark-qa.png`, and `design-qa-assets/realistic-walkthrough-local-preview-v2.png`.
- Focused combined evidence: `design-qa-assets/comparison-realistic-walkthrough-pass-10.png` normalizes the source and implementation regions into 960 × 540 comparison cells without upscaling the implementation. The implementation preserves the original blue header, channel tab labels, form hierarchy, copy, control sizing, and dark-theme tokens while intentionally showing more complete editor content than the illustrative source crop.
- Initial P2 finding: at 8.78 seconds, the PING/POST final cursor/click accent landed to the right of the modal `Save` button.
- Fix: corrected the source-space action target, rerendered both PING/POST themes atomically, and decoded the same 8.78-second action frame. Post-fix evidence: `output/walkthrough-storyboards-v2/ping-post-action-fixed.png`; the pointer and click accent now land on `Save`.
- Runtime evidence from the local in-app browser: Web light and PING/POST dark both reported `duration: 10`, `videoWidth: 1920`, `videoHeight: 1080`, `readyState: 4`, autoplay running, muted, and looping. No actionable P0/P1/P2 finding remains.

### Pass 11 — passed

- Initial P2 finding: the Pass 10 camera scale range of 1.32–1.62 kept the authentic 4K editor readable as a composition but made the tab, active control, and typed values too small inside the 16:9 Next Steps slot. The final Web/Phone/Chat shots also chased the Save button far enough to lose the configuration context.
- Fix: introduced a directed five-shot grammar instead of a fixed close-up: navigation close-up, context reveal, task push-in, action tracking, and completion settle. Channel-specific paths now stay between 1.76× and 2.00×, settle before every action, and preserve the final edit plus Save within an 8% safe area.
- Post-fix combined evidence: `design-qa-assets/comparison-directed-camera-pass-11.png`. The left cells preserve the full authentic source state; the right cells show the decoded action frame. Tabs, field labels, values, modal content, and pointer targets remain sharp and readable without changing the source UI.
- Browser-rendered evidence: `design-qa-assets/directed-camera-web-1s-browser.png` starts on the General tab; `design-qa-assets/directed-camera-web-4-6s-browser.png` fills the 16:9 slot with the selected payout controls; `design-qa-assets/directed-camera-web-8-8s-browser.png` preserves the changed payout option and Save; and `design-qa-assets/directed-camera-chat-dark-browser.png` tracks the Properties form in the dark theme.
- Runtime evidence from the local in-app browser for the dark Chat clip: `duration: 10`, `videoWidth: 1920`, `videoHeight: 1080`, `readyState: 4`, autoplay running, muted, and looping.
- Required-surface review: existing typography, spacing, colors, icons, copy, and UI geometry are source-derived and unchanged. Camera crops never require raster upscaling; all output remains true 1920 × 1080 at 30 fps. No actionable P0/P1/P2 finding remains.

### Pass 12 — passed

- Initial P2 finding: the Pass 11 task frames kept the active control in view, but Web and Chat placed several complete field labels outside the left safe area; some value edits were therefore readable without enough semantic context.
- Fix: reframed every task shot around the complete `label + value` field group instead of the pointer hotspot. The working close-ups now use 2.20–2.30× camera scales, with an explicit 2.30× quality ceiling, while completion shots settle wider where both the final edit and Save must remain visible.
- Automated geometry coverage now checks representative label/value anchors for Web status and payout, PING profit/delivery/field selection, Phone number name and call flow, and Chat identity/message flow/company-agent/welcome/options.
- Combined before/after evidence: `design-qa-assets/comparison-label-value-visibility-pass-12.png`. Post-fix task-frame evidence: `output/label-visibility-qa/after/*-contact-sheet.png`; dark-theme spot checks: `output/label-visibility-qa/after-dark/dark-theme-contact-sheet.png`.
- Required-surface review: complete labels and entered/selected values are simultaneously legible in both themes; existing application typography, controls, tokens, copy, and geometry remain unchanged. Output remains 1920 × 1080, 30 fps, 10 seconds, with the renderer rejecting scales above the tested 2.30× quality limit. No actionable P0/P1/P2 finding remains.

## Interaction and runtime checks

- Tested channel-to-tab matrix for Web, PING/POST, Phone, and Chat.
- Tested Next navigation from each completion dialog to the correct channel-specific target tab.
- Tested all eight completion videos for theme-aware source selection, autoplay, muted looping, inline playback, browser decoding, 1920 × 1080 metadata, and 9.5–10.5 second duration.
- Browser-tested Delivery Options and the final Web success handoff at 1012 × 1391; the live walkthrough played without pausing and the two dialog regions remained side by side.
- Tested Phone Numbers and Web Chats Add actions opening their visual dialogs.
- Tested PING option toggles and values.
- Tested PING Add opening the Required Field dialog, verified `Country / Required` defaults, and confirmed Save adds the selected row to the shared grid.
- Tested searchable PING field selection against the shared mortgage catalog, including Current Mortgage Balance, Late Mortgage Payments, and Second Mortgage.
- Tested Purchase IVR Number opening from IVR Details, selecting `(866) 689-0601`, enabling Purchase, and returning the selected number to the parent dialog.
- Tested direct launcher shortcuts for all four Next Steps dialogs.
- Confirmed each completion walkthrough uses its channel-specific WebM with a channel-specific PNG poster fallback.
- Confirmed light/dark persistence, modal stacking, shared dark Switch/Toast surfaces, and poster-only reduced-motion behavior.
- Checked the browser console after adding dialog descriptions: no runtime console errors or warnings remained in the clean capture.

## Implementation checklist

- [x] Channel-specific editor navigation and panels.
- [x] Minimal two-column post-create handoff for all four channels.
- [x] Shared campaign footer: Posting Instructions, Close, Save.
- [x] Phone and Web Chat visual dialogs.
- [x] Purchase IVR Number dialog and return-to-IVR selection flow.
- [x] PING Required Field dialog and save-to-grid interaction.
- [x] Searchable shared mortgage field catalog in PING Required Field.
- [x] Existing shared grid, switch-field, section-heading, dialog, and form primitives reused.
- [x] Professional 1920 × 1080 channel-specific walkthrough videos with smooth camera motion and click guidance.
- [x] Responsive one-column Delivery Options cards at 1012 × 1391.
- [x] Browser-rendered comparison and post-fix capture.
- [x] Persisted binary light/dark theme control and shared primitive coverage.
- [x] Separate light/dark walkthrough media for all four channels.
- [x] Reduced-motion poster state and neutral initial dialog focus.
- [x] Smooth channel-specific close-up camera that starts at navigation, settles before every interaction, and follows progressive field configuration without a full-screen pullback.

final result: passed

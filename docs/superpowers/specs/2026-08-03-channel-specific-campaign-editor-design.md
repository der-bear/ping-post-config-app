# Channel-Specific Campaign Editor Design

## Objective

Make the campaign creation completion window and campaign editor adapt precisely to the selected campaign channel: Web, Ping Post, Phone, or Chat. Preserve the existing editor shell and shared panels while adding only the channel-specific navigation, panels, and visual dialogs shown in the supplied references.

## Source of Truth

The supplied screenshots control navigation order, labels, panel titles, empty states, and dialog composition. The Word document `New Lead Source New Steps Popup Windows By Channel .docx` controls the completion-window copy. Direct user clarifications override both:

- Preview media is static; do not use GIF, video, autoplay, or animation.
- Phone and Web Chat detail dialogs are visual prototypes. Saving closes the dialog but does not add a table row.
- Every campaign channel uses the same editor footer: `Posting Instructions` on the left and `Close` plus `Save` on the right.

## Channel Navigation Matrix

The navigation is generated from a single channel profile rather than inline conditionals or separate editor implementations.

| Channel | Header subtitle | Channel-specific tab | Quality Options children | Agent Forms |
| --- | --- | --- | --- | --- |
| Web | `Campaign - Web` | None | Duplicate Checks, Criteria, Quantity Limits, Lead Validation, Compliance | Visible |
| Ping Post | `Campaign - PING/POST` | `PING Options` | Duplicate Checks, Criteria, Quantity Limits, Lead Validation, Compliance | Hidden |
| Phone | `Campaign - Phone` | `Phone Numbers` | Compliance only | Hidden |
| Chat | `Campaign - Chat` | `Web Chats` | Compliance only | Hidden |

Rules shared by every channel:

1. `General` is first.
2. `Delivery Options` is second.
3. The channel-specific tab, when present, is immediately after `Delivery Options`.
4. The group label is `Quality Options`, not `Quality Control`.
5. `Integrations` contains `Manage` and `Integration Criteria`.
6. `Postback` contains `Configuration` and `History`.
7. `Advanced Options` is last.
8. The footer is always `Posting Instructions | Close | Save`.

The active panel is constrained to the selected channel profile. If the channel changes while a now-hidden panel is active, navigation returns to `General` instead of rendering an inaccessible panel.

## Architecture

### Channel profile

Add one pure channel-profile module that maps `Channel` to:

- exact header subtitle;
- optional channel-specific section and label;
- allowed Quality Options sections;
- Agent Forms visibility;
- target section opened by the completion window's `Next` action.

The campaign editor consumes this profile to render navigation and resolve panel titles. This keeps channel rules centralized and independently testable.

### Campaign state

Extend the existing campaign types and Zustand store only where interactive editor state is required:

- PING Options requirement toggles and values;
- the Field Requirements for PING row collection, initially empty;
- Phone Numbers and Web Chats collections, initially empty.

The Phone and Web Chat detail dialogs use component-local draft state. Their `Save` actions close the modal without mutating the empty collections, per the visual-prototype scope.

### Existing components

Retain the shared `PanelLayout`, sidebar primitives, header, footer, data grid, form fields, buttons, dialogs, toast handling, and unsaved-change behavior. Do not rewrite unrelated campaign panels or the campaign creation wizard.

## Lead Source Completion Window

Replace the current `Next Steps` window and its two autoplaying video cards with one channel-specific completion window.

### Shared layout

- No page/module title bar such as `Next Steps`.
- Close `X` in the upper-right corner.
- Success illustration centered above the heading.
- Heading: `Your lead source has been created!`
- Success sentence using the actual campaign name.
- Channel-specific next-step paragraph.
- Static campaign-editor preview image highlighting the target tab.
- Tip callout: `You can always return to the Campaign Settings later to make updates or adjustments.`
- One `Next` button in the lower-right footer.
- No GIF, MP4, autoplay, loop, or animated cursor.

### Channel-specific copy and destination

#### Web

- Copy: `Continue to the Campaign Settings screen to review your configuration and customize any additional campaign options.`
- Preview highlights `General`.
- `Next` opens `General`.

#### Ping Post

- Copy: `Next, open the PING Options tab to configure your ping requirements. Before your campaign can accept ping requests, you'll need to define the Field Requirements for PING by selecting the lead fields that will be included in the ping request. You can also configure optional revenue, profit, and delivery requirements as needed.`
- Preview highlights `PING Options`.
- `Next` opens `PING Options`.

#### Phone

- Copy: `Next, open the Phone Numbers tab to add your first phone number. Select an existing IVR number or purchase a new one, then assign a call flow to complete your phone campaign configuration.`
- Preview highlights `Phone Numbers`.
- `Next` opens `Phone Numbers`.

#### Chat

- Copy: `Next, open the Web Chats tab to configure your chat settings. From there, you can customize your chat experience, including the welcome message, appearance, integrations, and other available options.`
- Preview highlights `Web Chats`.
- `Next` opens `Web Chats`.

Closing with `X` returns to the campaign launcher. `Next` opens the editor with the newly created campaign configuration and selected channel intact.

## PING Options Panel

The panel title is `PING Options`. The visual order is:

1. Revenue Requirement toggle and numeric value, helper `Resulting revenue must be at least:`.
2. Profit Requirement toggle and numeric value, helper `Revenue minus lead cost must be at least:`.
3. Profit Percentage Requirement toggle and percentage value, helper `Profit percentage must be at least:`.
4. Minimum Delivery Count toggle and numeric value, helper `Estimated delivery count must be at least:`.
5. Qualify All Criteria toggle, helper `Qualify clients using all criteria.`, and note explaining that otherwise only PING request field values qualify clients.
6. `Field Requirements for PING` section with explanatory text.
7. Toolbar actions `Add` and `Remove`; `Remove` is disabled with no selection.
8. Empty table with columns `Field` and `Type`.

Toggles and inputs update store-backed draft configuration so unsaved-change handling remains consistent. Field-requirement creation is outside this scope because no dialog reference was supplied; the grid and controls must match the reference visually.

## Phone Numbers Panel

The panel title is `Phone Numbers`.

- Toolbar: `Add`, `Edit`, `Delete`, `Edit Script`.
- Only `Add` is enabled when the grid is empty.
- Columns: `Name`, `Number`, `Call Flow`.
- Empty state: `No IVR Numbers`.
- `Add` opens `IVR Number Details`.

### IVR Number Details dialog

- Blue header and close `X`.
- `Name` text field.
- `IVR Number` select showing `(877) 624-3580`.
- Divider.
- `Call Flow` select with `-- Select Call Flow --`.
- `Message Flow` select with `-- Select Message Flow --`.
- SMS company-verification note and `Messaging Requirements` link treatment.
- Footer: `Purchase New Number`, `Cancel`, `Save`.

The fields are focusable and selectable. `Cancel`, `Save`, and `X` close the dialog. `Save` does not add a number to the table.

## Web Chats Panel

The panel title is `Web Chats`.

- Toolbar: `Add`, `Edit`, `Delete`, `View Script`.
- Only `Add` is enabled when the grid is empty.
- Columns: `Name`, `Message Flow`.
- Empty state: `No Web Chats`.
- Footer note: `Note: Web chat changes save automatically`.
- `Add` opens `Web Chat Dialog`.

### Web Chat Dialog

- Blue header and close `X`.
- Tabs: `Properties`, `Integrations`, `Phone Settings`, `Intake Form`.
- `Properties` is selected initially and displays the supplied form.
- Top row: required `Name` and `Message Flow` select.
- `Description` textarea.
- Company row: required `Company Name`, a circular 72 px local raster headshot of a smiling female support agent in a red top on a light background, `Update Image`, and required `Agent Name`.
- `Initial Chat Message` helper and textarea.
- `Show Heading Text` off toggle and text area.
- `Show Chat Button` off toggle.
- `Auto Show Chat` off toggle and `0 Seconds` field.
- Footer: `Cancel`, `Save`.

The non-Properties tabs may change the selected tab styling without implementing additional forms, since only the Properties reference was supplied. Inputs and toggles provide normal visual interaction. `Cancel`, `Save`, and `X` close the dialog. `Save` does not add a chat to the table.

## Static Preview Assets

Create four local PNG assets from the completed editor itself at a consistent viewport and crop. Each asset shows the matching channel and active target section. Use these PNGs inside the completion window so its preview remains static, deterministic, and aligned with the actual implementation. Do not retain the current MP4 previews in the rendered flow.

## Error Handling and Accessibility

- Preserve the existing campaign-name validation and unsaved-changes dialog.
- New dialogs use semantic Radix dialog titles and descriptions.
- Icon-only close buttons have accessible names.
- Disabled toolbar actions use native disabled state.
- All form fields have visible labels.
- Static preview images have useful alt text unless intentionally marked decorative.
- No network request is required for preview or avatar assets.

## Testing Strategy

Follow test-driven development with Playwright tests written and observed failing before production changes.

Required coverage:

1. Each channel renders the exact subtitle and navigation matrix.
2. Special tabs appear in the correct position.
3. Hidden Quality Options and Agent Forms sections are absent, not merely disabled.
4. Every channel uses the common `Posting Instructions | Close | Save` footer.
5. Completion-window copy and static media vary by channel and contain no video element.
6. `Next` opens the correct editor panel.
7. Phone Numbers and Web Chats render their toolbar, columns, and empty states.
8. `Add` opens the correct detail dialog.
9. Closing or saving either visual dialog leaves its table empty.
10. PING Options renders all requirement controls and the Field Requirements grid.
11. TypeScript build and production build pass.
12. Product-design QA compares the supplied references with local captures and records a passing `design-qa.md` before handoff.

## Non-Goals

- Backend persistence or API integration.
- Purchasing a real phone number.
- Loading real IVR, call-flow, or message-flow data.
- Adding Phone Number or Web Chat rows after modal Save.
- Full content for the Web Chat dialog's Integrations, Phone Settings, or Intake Form tabs.
- PING field-requirement CRUD without a supplied dialog reference.
- Animated preview media.
- Refactoring unrelated campaign or delivery-method features.

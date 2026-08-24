# Client Configuration Design

## Summary

Add a new outbound-focused prototype at `/client-configuration`. It mirrors the composition and interaction model of the existing `/campaign-configuration` inbound prototype while using the captured LeadExec client, Delivery Account, Criteria, Order, and Item screens as the content reference.

The prototype is designed both for interactive product exploration and for recording repeatable demonstration videos. It does not reproduce the full legacy Client Detail page shell.

## Goals

- Provide an outbound counterpart to the existing company/campaign configuration prototype.
- Reuse the project's existing card launcher, wizard, panel, grid, form, dialog, toast, theme, and unsaved-change patterns.
- Reproduce the complete client-creation wizard shown in the LeadExec research screenshots.
- Provide full Delivery Account panels for every captured configuration tab.
- Provide an Order editor with functional Item management.
- Support functional Criteria and Item add/edit/remove flows with realistic demo data.
- Persist prototype state across navigation and browser reloads so the prototype is reliable for repeated demonstrations.
- Provide direct launcher shortcuts to important screens and post-create states for video recording.

## Non-goals

- Reproducing the complete legacy Client Detail page.
- Reproducing the global Payments page or payment-processing flows.
- Building a backend, authentication, real delivery, billing, or LeadExec API integration.
- Rebuilding the Ping/Post Delivery Method editor already represented by the existing delivery-method feature.
- Generalizing CampaignEditor and ClientConfigurationEditor into one universal editor framework.

## Visual references

The implementation uses these existing product references:

- Existing inbound template: `/campaign-configuration`.
- Captured LeadExec flow index: `output/client-onboarding-research-2026-08-24/README.md`.
- Client wizard screenshots: `01` through `05` in that output directory.
- Post-create Next Steps screenshot: `06-client-created-next-steps.png`.
- Order screenshots: `07`, `08`, `23` through `28`.
- Main outbound screens: `19`, `20`, and `22`.
- Delivery Account and Criteria screenshots: `29` through `38`.

The existing project's design tokens, spacing, typography, responsive behavior, and component styling take precedence over the legacy LeadExec chrome. Legacy screenshots define information architecture, labels, fields, tabs, and workflow behavior.

## Architecture

Create an isolated feature at `src/features/client-configuration/` with its own types, Zustand store, launcher, wizard, editors, dialogs, and realistic demo data.

Reuse shared components directly:

- `CenteredListGroup` for launcher groups and cards.
- `WizardDialog` for the Create Client flow.
- `PanelLayout`, `PanelSidebar`, `PanelHeader`, and `PanelFooter` for editors.
- `DataGrid`, `DataGridToolbar`, and `ToolbarAction` for Criteria and Items.
- Existing UI primitives for fields, selects, switches, dialogs, buttons, separators, confirmations, overlays, and toasts.
- `useUnsavedChanges` and `UnsavedChangesDialog` for panel-level save/close behavior.

Do not couple the new feature to `useCampaignStore`. The outbound flow has a separate data model and lifecycle. Do not duplicate shared UI primitives inside the feature.

## Route and entry point

Add a feature route:

- ID: `client-configuration`
- Slug: `client-configuration`
- Title: `Client Configuration`

`App.tsx` renders `ClientConfigurationEntry` for this route.

The entry component controls the visible prototype state:

- `launcher`
- `create-client`
- `next-steps`
- `delivery-account`
- `create-order`
- `order`

Direct cards open the corresponding state without requiring the preceding flow.

## Launcher

The launcher follows the exact card-group pattern of `CampaignEntry`.

### Creation flows

Two cards:

1. **Create client and delivery account** — opens the Create Client wizard.
2. **Create order** — opens the Order creation form using the current realistic client configuration.

### Edit outbound settings

Two cards:

1. **Delivery Account** — opens the Delivery Account editor on General.
2. **Order** — opens the Order editor on General with a realistic order and Item.

### Preview next-step dialogs

One card:

1. **Client next steps** — opens the post-create Next Steps dialog without resetting the current configuration.

Cards reuse the current project dimensions, hover states, action labels, typography, icon treatment, grid spacing, and responsive column behavior.

## Create Client wizard

The wizard title is `Create a Client` and uses `WizardDialog` with sidebar navigation.

### Step 1: Contact Information

Fields:

- Company Name, required.
- First Name, required.
- Last Name, required.
- Email, required with basic email-format validation.
- Status, default `New`.
- Client Group, default `No Group`.

Show the helper text: `Only active statuses can receive leads.`

### Step 2: Delivery Method

Fields:

- Automated Delivery switch, default off for the demo.
- Type of Delivery, default `HTTP Webhook`.
- Lead Type, default `Short Mortgage Lead`.

Type options reproduce the captured list at a representative level, including HTTP Webhook, ClickPoint Integration, FTP Drop, Email, CSV Attachment, Lead Portal, PING/POST, Batch Email Delivery, and SMS Notification.

### Conditional Step 3: Portal Login Information

This step is enabled only when Type of Delivery is `Lead Portal`.

Fields:

- Username, required when the step is enabled.
- Password, required when the step is enabled.
- Generate Password action.
- Visible password requirements matching the captured flow.

For every other Delivery Method type, the step is disabled and skipped by Next/Previous navigation.

### Final step: Delivery Account

Fields:

- Channel, default `Web and Chat Leads`.
- Delivery Account Name, required.
- Default Lead Price, default `$0.00`.
- Criteria Required, default on.
- Exclusive, default off.
- Require Order, default off.

### Completion

The final action label is `Create`. Submission:

1. Validates all enabled required fields.
2. Shows the existing saving overlay.
3. Replaces the persisted client, Delivery Account, Criteria, Order, and Item state with the submitted configuration plus safe defaults.
4. Opens Client Next Steps.

## Client Next Steps

The dialog follows the existing two-column `LeadSourceNextStepsDialog` treatment rather than copying the old three-card LeadExec layout pixel-for-pixel.

### Confirmation column

- Success icon.
- Heading: `Your client has been created!`
- Copy identifying the created Delivery Account.
- Reminder that configuration can be changed later.

### Action column

Display three stacked action cards/panels:

1. **Create a Lead Order** — opens Create Order.
2. **Set Up Delivery Criteria** — opens Delivery Account on Criteria.
3. **Edit Delivery Account** — opens Delivery Account on General.

The actions are functional. The dialog may be launched directly from the preview card.

## Delivery Account editor

Use `PanelLayout` with all captured tabs visible as individual `NavItem` entries:

1. General
2. Quantity Limits
3. Delivery
4. Revenue
5. Criteria
6. Offer
7. Advanced

### General

- Delivery Account Name.
- Lead Type.
- Channel.
- Status.
- Default Lead Price.

### Quantity Limits

- Total, hourly, daily, weekly, monthly, and yearly limit controls.
- Enabled/value behavior follows existing switch-field patterns.

### Delivery

- Automated Delivery.
- Primary Delivery Method.
- Additional Delivery Methods representative multi-select.
- Delivery Priority.
- Delivery Group.
- User Assigned.

### Revenue

- Revenue enabled.
- Revenue amount/type.
- Percentage and fixed-value controls where applicable.

### Criteria

Default state after a new client is empty and displays `No Criteria`.

Grid columns:

- Type
- Field
- Operator
- Value

Toolbar actions:

- New
- Edit
- Remove

New and Edit open a dialog with realistic field choices. The default demonstration entry is:

- Type: `Field Value`
- Field: `State`
- Operator: `Is Any Of`
- Value: `AZ`

Rules save automatically. Edit requires exactly one selected row; Remove requires one or more selected rows and uses the shared confirmation dialog.

### Offer

- Offer enabled.
- Offer amount.
- Minimum and maximum offer controls.

### Advanced

- Exclusive.
- Require Order.
- Require Criteria.
- Limit by Percentage of Qualified Leads.
- Notify when a delivered lead is removed.
- Removal contact name and email.

### Editor save behavior

Panel-level changes are marked unsaved until Save. Criteria CRUD is persisted immediately, matching the captured `Criteria changes save automatically` behavior.

## Create Order

Create Order is a dialog derived from the captured form and built from existing form primitives.

Fields:

- Name, required.
- Lead Type, default `Short Mortgage Lead`.
- Description.
- Start Date, default to the demo date/current date.
- Optional End Date.
- Initial Status, default `On Hold` for a safe demonstration.
- Renew Order, default off.
- Delivery Account selection, default all/current Delivery Account.
- Order Type, default `Lead Quantity`.
- Quantity, required and greater than zero.
- Per Lead Price, default to the Delivery Account price.
- Payment Discount as a display/configuration field only; no payment workflow is implemented.

Completing the dialog creates or replaces the prototype order, seeds its first Item, and opens the Order editor.

## Order editor

Use `PanelLayout` with these relevant tabs:

1. General
2. Items

The global Payments page and payment-processing flows remain out of scope.

### General

- Name.
- Description.
- Status.
- Start Date.
- Optional End Date.
- Renew Order.
- Auto Charge as a visual/configuration control only.
- Payment Discount as a visual/configuration control only.
- Max Return Percentage.

### Items

Grid columns:

- Delivery Account
- Qty
- Total $
- Sent
- Sent $

Toolbar actions:

- New
- Edit
- Remove

The direct demo state contains one realistic Item:

- Delivery Account: `All Delivery Accounts`
- Quantity: `2`
- Total: `$0.00`
- Sent: `0`
- Sent amount: `$0.00`

New and Edit open an Item dialog with Delivery Account, Order Type, Quantity, and Per Lead Price. Quantity must be greater than zero. Item changes save automatically and update totals immediately.

## State model and persistence

Use a dedicated Zustand store wrapped with `persist` and a versioned localStorage key such as `client-configuration-v1`.

State includes:

- Client contact and status data.
- Delivery Method summary.
- Delivery Account settings.
- Criteria array.
- Order general settings.
- Items array.
- Active Delivery Account and Order panels.
- Panel expansion state.

Actions include:

- Reset to realistic demo state.
- Create client configuration.
- Update Delivery Account sections.
- Add, update, and remove Criteria.
- Create and update Order.
- Add, update, and remove Items.
- Change active panels and panel width.

Starting Create Client resets wizard-local fields but does not erase persisted state until the final Create succeeds. Direct editor cards use persisted state or the realistic default state.

## Validation and error handling

- Required wizard fields validate on Next and Create.
- Invalid steps show the existing sidebar invalid indicator.
- Dialog fields display inline errors using existing destructive tokens.
- Quantity rejects zero and negative values.
- Edit actions remain disabled unless exactly one row is selected.
- Remove actions remain disabled with no selection.
- Save uses the existing saving overlay and success toast.
- Closing an editor with unsaved panel changes opens `UnsavedChangesDialog`.
- Criteria and Item CRUD operations are immediate and do not trigger the panel unsaved dialog.

## Accessibility and responsiveness

- All controls have accessible labels.
- Dialog focus follows existing Radix behavior.
- Keyboard navigation works for cards, tabs, tables, and dialogs.
- Selected rows have both visual state and semantic selection state where supported by the shared grid.
- The launcher follows existing responsive card columns.
- Editors use the established compact/expanded widths and retain the existing minimum width behavior.
- Light and dark themes use the current tokens without feature-specific color overrides.

## Testing strategy

Add focused Playwright coverage before production implementation for:

1. Route and launcher group/card presence.
2. Create Client required-field validation.
3. Dynamic Portal Login step behavior.
4. Successful Create Client transition to Next Steps.
5. Each Next Steps action opening the correct editor state.
6. Presence and navigation of all seven Delivery Account tabs.
7. Empty Criteria state and Criteria add/edit/remove behavior.
8. Criteria persistence after reload.
9. Create Order validation and successful creation.
10. Order General and Items navigation.
11. Item add/edit/remove and totals behavior.
12. Item persistence after reload.
13. Direct launcher shortcuts for video recording.
14. Light/dark rendering and the project's existing accessibility suite.

Run the full build, lint, targeted Playwright tests, and the existing regression suite before handoff.

## Visual verification

Use the in-app browser at the same desktop viewport as the current campaign prototype. Capture matching states for:

- Launcher.
- Each Create Client wizard step.
- Client Next Steps.
- Every Delivery Account tab.
- Empty, filled-dialog, and saved Criteria states.
- Create Order.
- Order General and Items.
- Item edit and saved states.

Compare prototype captures against both the existing campaign layout and the corresponding LeadExec research screenshots. Fix all P0, P1, and P2 visual discrepancies before handoff.

## Success criteria

- Client Configuration feels like the outbound sibling of Campaign Configuration.
- The launcher, wizard, dialogs, panels, grids, and controls visibly reuse the project's existing system.
- All required tabs are present and recordable.
- The end-to-end create client → next steps → criteria → order → item path works.
- Criteria and Items persist and remain editable.
- The prototype is safe, deterministic, and convenient for repeated video recording.

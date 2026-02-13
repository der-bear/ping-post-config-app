# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Vite dev server (default port 5173)
npm run build        # TypeScript check + Vite production build
npm run lint         # ESLint
npx playwright test  # Run all Playwright e2e tests (starts Vite on port 5173 automatically)
npx playwright test e2e/navigation.spec.ts  # Run a single test file
npx playwright test --grep "test name"      # Run tests matching a pattern
```

Dev server runs on port 5174 during manual development; Playwright auto-starts its own on port 5173.

## Architecture

This is a **Ping-Post delivery method configuration UI** — a flyout panel editor for configuring webhook-based lead delivery with separate PING and POST phases. Built with React 19, TypeScript, Vite 7, Tailwind CSS v4, and Zustand v5.

### State Management

All application state lives in a single Zustand store at `src/features/delivery-method/store.ts`. The store holds:
- `config: DeliveryMethodConfig` — the full configuration tree (general, ping, post, permissions, schedule, notifications)
- `activePanel: ActivePanel` — which sidebar panel is currently displayed
- Navigation expand/collapse state and flyout (add-mapping panel) state

The `DeliveryMethodConfig` type (in `src/features/delivery-method/types.ts`) mirrors the PING/POST duality: POST types extend PING types with `sameAsPing` flags (e.g., `PostAuthenticationConfig extends AuthenticationConfig` adds `sameAsPing: boolean`).

### "Same as PING" Pattern

POST settings can inherit from PING. This is implemented as a **dropdown select option** (not a checkbox). When a POST select shows "Same as PING", the underlying store flag (e.g., `sameAsPing`, `contentTypeSameAsPing`, `timeoutSameAsPing`) is set to `true` and the field controls are disabled. The select value uses a sentinel like `'same-as-ping'` or `'same'` that maps to the store flag.

### Layout System

The UI is a `PanelLayout` (sidebar + header + content + footer) in `src/components/panel-layout/`. The sidebar navigation uses `NavItem` and `NavGroup` components. PING and POST each have 6 sub-tabs (URL Endpoint, Authentication, Mappings, Request Body, Response Settings, Retry Settings). The main orchestrator is `src/features/delivery-method/components/index.tsx` (`DeliveryMethodEditor`).

### Component Hierarchy

- **UI primitives** (`src/components/ui/`) — standard shadcn/ui components built on Radix UI. Styled with `class-variance-authority`. Barrel-exported from `src/components/ui/index.ts`.
- **Composite components** — `FieldGroup` (label + input wrapper), `DataGrid` (sortable table with toolbar), `CodeEditor` (CodeMirror 6 wrapper), `FlyoutPanel` (slide-in side panel).
- **Feature components** (`src/features/delivery-method/components/`) — one component per settings panel, each consuming the Zustand store directly.

### Styling

Tailwind CSS v4 with the `@tailwindcss/vite` plugin. Design tokens are defined as CSS custom properties in `src/index.css` under `@theme { }`. Dark mode uses `.dark` class with `@custom-variant dark (&:is(.dark *))`.

**Critical**: All CSS resets must be inside `@layer base { }`. Unlayered CSS (e.g., `* { padding: 0 }`) overrides Tailwind v4's `@layer utilities` and breaks all spacing utilities.

**Theming shadcn components**: Standard shadcn components should NOT have their Tailwind classes modified. Instead, use **CSS variable scoping** in `src/index.css` via `data-slot` selectors to override design tokens. For example, the dropdown menu remaps `--color-accent` to `--color-primary` so that `focus:bg-accent` resolves to blue without touching the component file. This pattern keeps shadcn components upgradeable.

**Design tokens** (light theme):
- Primary: `#498bff`, Primary foreground: `#FFFFFF`
- Text/foreground: `#3c4b64`, Muted foreground: `#636f83`
- Border: `#ebedef`, Border strong: `#d8dbe0`
- Background: `#ffffff`, Muted/secondary: `#f5f6f7`
- Destructive: `#e55353`, Success: `#2eb85c`, Warning: `#f9b115`
- Font: Roboto

### Path Alias

`@/` maps to `./src/` (configured in `vite.config.ts`, `tsconfig.app.json`, and root `tsconfig.json`).

### Browser Tools

Two browser interaction options are available:

- **Claude Chrome Extension** (`@browser` / MCP tools like `computer`, `read_page`, `find`, `navigate`) — **preferred** for visual inspection, manual testing, and interacting with the running dev server. Best for checking real UI rendering, comparing against Figma, and exploratory testing.
- **Playwright** (`npx playwright test`) — headless e2e test suite in `e2e/`. Tests run against Chromium at 1280x900 viewport. The Playwright config auto-starts Vite on port 5173. Best for automated regression testing.

Prefer Chrome extension over Playwright for prototype previewing. Use Playwright for repeatable automated tests.

### Design Reference

Use the **Figma MCP plugin** (`mcp__plugin_figma_figma-desktop__get_design_context`, `get_screenshot`, `get_variable_defs`) to pull exact design specs from Figma. Do not open Figma in the browser.

### Data

- `src/data/lead-fields.ts` — canonical lead field definitions (IDs, labels, types, enum values) used by autocomplete and add-mapping flyout.
- `src/features/delivery-method/data/system-lead-fields.ts` — subset of fields available in the bulk-add dialog. Field `name` values here should match `lead-fields.ts` names.

### Key Conventions

- **Authentication types**: No Authentication, Basic, Digest, OAuth 2.0, Bearer Token, Custom (disabled). Auth settings include an "Authentication Request Format" field (Form Encoded / JSON).
- **Mapping types**: 9 types defined (Static Value, Lead Field, System Field, Calculated Expression, Split Text, Text Concatenation, Client Field, Lead Source Field, Function). Only Lead Field is currently enabled.
- **Content types**: Use full MIME type strings (`application/json`, `application/x-www-form-urlencoded`, etc.).
- **Lead Type**: Fixed to "Mortgage", disabled (not user-editable).
- **Process for Phone Calls**: Options are `default`, `do-not-send`, `send`.

### Tests

67 Playwright e2e tests across 8 spec files in `e2e/`. Test files:
- `layout.spec.ts` — panel layout, footer buttons, theme toggle
- `navigation.spec.ts` — sidebar navigation, collapse/expand
- `general-settings.spec.ts` — general settings fields
- `ping-config.spec.ts` — PING URL endpoint, auth, mappings, response, retry
- `post-config.spec.ts` — POST configuration with Same as PING options
- `shared-settings.spec.ts` — portal permissions, delivery schedule, notifications
- `add-mapping-dialog.spec.ts` — add/edit mapping dialog and New dropdown
- `bulk-add-dialog.spec.ts` — bulk add dialog

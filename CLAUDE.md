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

## Quick Reference

### Key Files
- `src/App.tsx` — Root component with theme toggle
- `src/features/delivery-method/store.ts` — Single Zustand store (900 lines)
- `src/features/delivery-method/types.ts` — TypeScript definitions (294 lines)
- `src/data/lead-fields.ts` — 96 canonical lead field definitions (961 lines)
- `src/features/delivery-method/components/index.tsx` — Main editor orchestrator
- `src/components/ui/` — 20+ shadcn/ui components (barrel exported)
- `docs/VALIDATION_STRATEGY.md` — Complete validation documentation (447 lines)

### File Organization
```
src/
├── components/
│   ├── ui/                    # shadcn/ui primitives (20+ components)
│   ├── code-editor/           # CodeMirror integration
│   ├── data-grid/             # Sortable table component
│   ├── field-group.tsx        # Label + input wrapper
│   ├── flyout-panel/          # Slide-in panel
│   └── panel-layout/          # Sidebar + header + content + footer
├── features/delivery-method/
│   ├── components/            # 21 feature-specific components
│   │   ├── index.tsx          # Main editor (DeliveryMethodEditor)
│   │   ├── delivery-method-entry.tsx  # Entry point
│   │   ├── *-settings.tsx     # 10 settings panels
│   │   ├── add-mapping-panel.tsx
│   │   └── create-*.tsx       # Creation flow modals
│   ├── data/
│   │   └── system-lead-fields.ts  # Mock buyer field names
│   ├── types.ts               # All TypeScript interfaces
│   └── store.ts               # Zustand store with 40+ actions
├── data/
│   └── lead-fields.ts         # Canonical lead field definitions
├── hooks/
│   └── use-theme.ts           # Dark mode toggle
├── lib/
│   └── utils.ts               # cn() Tailwind utility
└── index.css                  # Tailwind v4 + design tokens
```

---

## Project Purpose

This is a **prototype** for configuring ping-post lead delivery methods. The core problem it solves: different lead buyers have different field naming conventions and data requirements. This tool configures how to **map system lead fields to buyer-specific delivery field names** and handle the two-phase ping-post delivery flow.

**Real-world example:**
```
Your System          →  Buyer "Acme Corp" expects
─────────────────────────────────────────────────────
postal_code         →  zip
ip_address          →  ip
first_name          →  f_name
email_address       →  email
state_code          →  state
ping_request_id     →  ping_id  (system field)
```

**Ping-Post Flow:**
1. **PING** (lightweight check): Send partial lead data → Buyer responds "Yes, $X" or "No"
2. **POST** (full delivery): If accepted, send complete lead data with `ping_request_id` for correlation

Built with React 19, TypeScript, Vite 7, Tailwind CSS v4, and Zustand v5.

### State Management

All application state lives in a single Zustand store at `src/features/delivery-method/store.ts` (~900 lines).

**Store Structure**:
```typescript
{
  // Configuration data
  config: {
    general: GeneralSettings             // Description, lead type, environment
    ping: {
      urlEndpoint: UrlEndpointConfig     // URLs, content type, headers
      authentication: AuthenticationConfig
      mappings: { mappings: FieldMapping[] }
      requestBody: { body: string }      // JSON template
      responseSettings: ResponseSettingsConfig
      retrySettings: RetrySettingsConfig
    }
    post: {
      urlEndpoint: PostUrlEndpointConfig  // Extends PING with sameAsPing flags
      authentication: PostAuthenticationConfig
      mappings: PostMappingsConfig       // Includes includeMappingsFromPing
      requestBody: { body: string }
      responseSettings: PostResponseSettingsConfig
      retrySettings: PostRetrySettingsConfig
    }
    portalPermissions: PortalPermissions
    deliverySchedule: DeliveryScheduleConfig  // Monday-Sunday schedules
    notifications: NotificationsConfig
  }

  // UI state
  activePanel: ActivePanel               // Which panel is displayed
  isPingExpanded: boolean                // PING section collapsed?
  isPostExpanded: boolean                // POST section collapsed?
  isPanelExpanded: boolean               // Panel width (600px vs 800px)
  flyoutOpen: boolean                    // Add mapping panel visible?
  flyoutData: FieldMapping | null        // Mapping being edited
  flyoutContext: 'ping' | 'post'         // Which phase's mapping
}
```

**Type System** (`src/features/delivery-method/types.ts`, 294 lines):
- POST types extend PING types with `sameAsPing` flags
- Example: `PostAuthenticationConfig extends AuthenticationConfig` adds `sameAsPing: boolean`
- Union types for navigation: `ActivePanel = { section: 'general' } | { section: 'ping', tab: PingPostTab } | ...`

**Store Actions** (40+):
- `updateGeneral(partial)`, `updatePingUrlEndpoint(partial)`, etc.
- `addPingMapping(mapping)`, `removePingMapping(id)`, `updatePingMapping(id, partial)`
- `getPingMappedFields()`, `getPostMappedFields()` — computed getters
- `resetStore()` — reset to default state

### "Same as PING" Pattern

**Why it exists**: Most buyers use the same authentication, content type, timeout, and headers for both PING and POST endpoints. Rather than duplicate configuration, POST can inherit from PING.

**Implementation**: Implemented as a **dropdown select option** (not a checkbox). When a POST select shows "Same as PING", the underlying store flag (e.g., `sameAsPing`, `contentTypeSameAsPing`, `timeoutSameAsPing`) is set to `true` and the field controls are disabled.

**Example** (POST Authentication):
```typescript
// If sameAsPing: true, POST uses PING's auth config
// If sameAsPing: false, POST has its own auth config

post: {
  authentication: {
    type: 'basic',          // Ignored if sameAsPing: true
    sameAsPing: true,       // ← Use PING's auth
    basicAuth: { ... }      // Ignored if sameAsPing: true
  }
}
```

**UI Behavior**: Select dropdown shows "Same as PING" as first option. When selected, all auth fields become disabled. User must select different auth type to configure POST-specific auth.

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

### Data & Field Mapping System

**Lead Fields** (`src/data/lead-fields.ts`):
- 96 canonical lead field definitions — **your platform's standard field names**
- Categories: Contact Information, Loan Details, Property, Credit & Financial, etc.
- These are the source fields (e.g., `postal_code`, `ip_address`, `first_name`)
- Used by autocomplete in the "Maps To" field when creating mappings

**System Lead Fields** (`src/features/delivery-method/data/system-lead-fields.ts`):
- Subset of fields available in the bulk-add dialog
- **Note**: Field `name` values here represent **mock buyer field names** (e.g., `zip`, `ip`) and intentionally differ from canonical names in `lead-fields.ts`
- This demonstrates the core mapping functionality — bridging the gap between your field names and buyer-expected names

**Field Mapping Model**:
```typescript
interface FieldMapping {
  id: string
  type: MappingType        // 'Lead Field', 'System Field', 'Static Value', etc.
  name: string             // Buyer's expected field name (e.g., "zip")
  mappedTo: string         // Your system's canonical name (e.g., "postal_code")
  defaultValue: string     // Fallback if field is empty
  testValue: string        // Value for testing endpoint
  useInPost: boolean       // Include in POST phase (if PING mapping)
  hasValueMappings: boolean
  valueMappings: ValueMapping[]  // Transform values (e.g., "CA" → "California")
}
```

**Request Body Templates** (CodeMirror editor):
- JSON templates with `[field_tag]` placeholders
- Tags are replaced at runtime with actual lead data
- Example: `{"zip": "[postal_code]", "ip": "[ip_address]"}`
- Autocomplete suggests available mapped fields

### Validation (Not Yet Implemented)

The application is designed for a **progressive configuration** model where users can save incomplete configurations. See [docs/VALIDATION_STRATEGY.md](./docs/VALIDATION_STRATEGY.md) for the complete validation strategy.

**Status**: Validation is **documented but not yet implemented**. The strategy is ready for when you add validation.

**Key principles** (when implemented):
- ✅ Validate **format** (URLs, regex patterns), not **completeness**
- ✅ Validate **on blur**, clear errors **on change**
- ✅ Allow **partial/incomplete** configurations to be saved
- ✅ Use **informative, scannable** error messages with examples

**Error message format**: `"Enter valid URL (e.g., https://api.example.com)"` - specific, actionable, with example.

**Planned implementation pattern**:
```tsx
const [errors, setErrors] = useState<Record<string, string>>({})

<DebouncedInput
  onBlur={(e) => {
    const error = validateUrl(e.target.value) // Returns '' or error message
    setErrors(prev => ({ ...prev, field: error }))
  }}
  onChange={() => errors.field && setErrors(prev => ({ ...prev, field: '' }))}
  className={cn(errors.field && 'border-destructive')}
/>
{errors.field && <p className="text-xs text-destructive mt-1">{errors.field}</p>}
```

**What to validate** (when implemented): URL format, email format, regex pattern validity. **What NOT to validate**: required fields, completeness (auth can be incomplete, mappings can be empty, etc.).

### Implementation Status

**Prototype Stage** — Core UI and workflows complete, backend integration pending.

**Fully Implemented** ✅:
- Complete UI with 48+ components (shadcn/ui + custom)
- Single Zustand store with all CRUD operations
- Navigation system (sidebar, collapsible sections, 13 panels)
- Field mapping UI (add, edit, delete, bulk add)
- CodeMirror editor with field tag autocomplete
- "Same as PING" inheritance pattern
- Dark mode toggle
- 67 Playwright e2e tests
- Progressive configuration model (save incomplete configs)

**Defined but Not Implemented** 🔄:
- Format validation (URL, email, regex) — documented in VALIDATION_STRATEGY.md
- Backend API integration (save/load configs)
- Actual ping/post request generation
- Response parsing test tool
- Value mappings (transform enum values like "CA" → "California")
- 8 of 9 mapping types (only "Lead Field" enabled)
- Custom authentication type
- Generate Request / Export buttons
- Dirty state tracking
- Toast notifications

**Intentionally Disabled for Prototype**:
- Custom authentication (UI present, disabled)
- Static Value, System Field, Calculated Expression, etc. mapping types
- Lead Type selection (fixed to "Mortgage")

### Key Conventions

- **Authentication types**: No Authentication, Basic, Digest, OAuth 2.0, Bearer Token, Custom (disabled). Auth settings include an "Authentication Request Format" field (Form Encoded / JSON).
- **Mapping types**: 9 types defined (Static Value, Lead Field, System Field, Calculated Expression, Split Text, Text Concatenation, Client Field, Lead Source Field, Function). **Only "Lead Field" is currently enabled** for prototype focus.
- **Content types**: Use full MIME type strings (`application/json`, `application/x-www-form-urlencoded`, etc.).
- **Lead Type**: Fixed to "Mortgage", disabled (not user-editable in prototype).
- **Process for Phone Calls**: Options are `default`, `do-not-send`, `send`.

### Tests

67 Playwright e2e tests across 8 spec files in `e2e/` (901 lines). Test files:
- `layout.spec.ts` — panel layout, footer buttons, theme toggle
- `navigation.spec.ts` — sidebar navigation, collapse/expand
- `general-settings.spec.ts` — general settings fields
- `ping-config.spec.ts` — PING URL endpoint, auth, mappings, response, retry
- `post-config.spec.ts` — POST configuration with Same as PING options
- `shared-settings.spec.ts` — portal permissions, delivery schedule, notifications
- `add-mapping-dialog.spec.ts` — add/edit mapping dialog and New dropdown
- `bulk-add-dialog.spec.ts` — bulk add dialog

**Test Helper**: `e2e/helpers/bypass-creation-modal.ts` — bypasses the creation modal to access the editor directly for testing.

**Coverage**: All major UI workflows tested, but no unit tests for validation logic or store actions (validation not yet implemented).

---

## Development Workflow

### Adding New Features

1. **Types First** — Update `src/features/delivery-method/types.ts`
2. **Store Actions** — Add actions to `src/features/delivery-method/store.ts`
3. **UI Component** — Create component in `src/features/delivery-method/components/`
4. **Connect to Store** — Use Zustand hooks: `const config = useDeliveryMethodStore(s => s.config)`
5. **Add Tests** — Create Playwright spec in `e2e/`
6. **Update Navigation** — If new panel, update navigation config in `index.tsx`

### Common Patterns

**Reading from Store**:
```typescript
const { config, updatePingUrlEndpoint } = useDeliveryMethodStore()
const productionUrl = config.ping.urlEndpoint.productionUrl
```

**Updating Store**:
```typescript
const updateEndpoint = useDeliveryMethodStore(s => s.updatePingUrlEndpoint)
updateEndpoint({ productionUrl: 'https://api.example.com' })
```

**Adding to Arrays**:
```typescript
const addMapping = useDeliveryMethodStore(s => s.addPingMapping)
addMapping({ id: nanoid(), type: 'Lead Field', name: 'zip', mappedTo: 'postal_code', ... })
```

### Next Development Steps

**Phase 1: Backend Integration** (highest priority)
- [ ] Create API client layer (`src/api/`)
- [ ] Implement save/load configuration endpoints
- [ ] Add loading states and error handling
- [ ] Implement request preview (show what will be sent)
- [ ] Build test tool (send test ping/post with sample data)

**Phase 2: Validation** (see VALIDATION_STRATEGY.md)
- [ ] Implement URL format validation
- [ ] Add email format validation
- [ ] Add regex pattern validation
- [ ] Implement component-level error state
- [ ] Add global validation on save

**Phase 3: Enhanced Mapping**
- [ ] Implement value mappings (transform enum values)
- [ ] Enable "Static Value" mapping type
- [ ] Enable "System Field" mapping type
- [ ] Add calculated expressions and functions

**Phase 4: Production Hardening**
- [ ] Dirty state tracking (unsaved changes warning)
- [ ] Error boundaries
- [ ] Toast notifications for save success/failure
- [ ] Accessibility improvements (ARIA labels)
- [ ] Performance optimization (virtualize large lists)

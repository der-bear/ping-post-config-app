# Inheritance Logic - Authentication & Retry Settings

## Overview

POST settings can inherit from PING settings to reduce configuration duplication. This document describes the inheritance behavior for Authentication and Retry Settings.

## Core Principles

1. **"Same as PING" Option**: Always appears as the first option in POST dropdowns
2. **Visual Separator**: A horizontal line separates "Same as PING" from regular options
3. **Disabled Fields**: When inheriting, child fields are disabled and show PING's values
4. **Break on Edit**: Opening a dropdown or focusing a field breaks inheritance
5. **Copy on Break**: PING's config is copied to POST when inheritance is broken
6. **Independent States**: Authentication and Retry inheritance are independent

## Authentication Inheritance

### Implementation (`authentication-settings.tsx`)

```tsx
// State management
const isSameAsPing = !isPing && postAuth.sameAsPing
const selectValue = !isPing && postAuth.sameAsPing ? 'same-as-ping' : auth.type

// Break inheritance handler
const handleBreakInheritance = () => {
  if (isSameAsPing) {
    updatePostAuth({
      sameAsPing: false,
      type: pingAuth.type,
      requestFormat: pingAuth.requestFormat,
      basicAuth: pingAuth.basicAuth ? { ...pingAuth.basicAuth } : undefined,
      digestAuth: pingAuth.digestAuth ? { ...pingAuth.digestAuth } : undefined,
      bearerToken: pingAuth.bearerToken ? { ...pingAuth.bearerToken } : undefined,
      oauth2: pingAuth.oauth2 ? { ...pingAuth.oauth2 } : undefined,
    })
  }
}
```

### UI Behavior

**Dropdown Structure:**
```
┌─────────────────────────────────────┐
│ Basic                Same as PING ✓ │  ← "Same as PING" option
├─────────────────────────────────────┤  ← Separator
│ No Authentication                   │
│ Basic                               │
│ Digest                              │
│ OAuth 2.0                           │
│ Bearer Token                        │
│ Custom (disabled)                   │
└─────────────────────────────────────┘
```

**Field States:**

| Scenario | Auth Type Dropdown | Child Fields | Behavior |
|----------|-------------------|--------------|----------|
| POST inheriting | Shows PING's type with "Same as PING" meta | Disabled, shows PING values | Read-only |
| Change auth type | "Same as PING" deselected | Enabled, editable | Inheritance broken |
| Focus on field | No change | Enabled, PING values copied | Inheritance broken |
| Select "Same as PING" | Shows PING's type | Disabled, shows PING values | Inheritance restored |

### Breaking Inheritance Triggers

1. **Selecting different auth type** (`handleAuthTypeChange`)
2. **Focusing on any auth field** (`onFocus={handleBreakInheritance}`)
3. **Opening child dropdowns** (`onOpenChange={(open) => open && handleBreakInheritance()}`)

## Retry Inheritance

### Implementation (`retry-settings.tsx`)

```tsx
// State management
const isSameAsPing = !isPing && postRetry.sameAsPing
const retryValue = isSameAsPing ? 'same-as-ping' : (retry.retryAfterFailure ? 'yes' : 'no')

// CRITICAL: Show PING's actual values, not 'same-as-ping' string
const countValue = isSameAsPing ? String(pingRetry.maxRetryCount) : String(retry.maxRetryCount)
const timeValue = isSameAsPing ? String(pingRetry.timeBetweenRetries) : String(retry.timeBetweenRetries)

// Break inheritance handler
const handleBreakInheritance = () => {
  if (isSameAsPing) {
    updatePostRetrySettings({
      sameAsPing: false,
      retryAfterFailure: pingRetry.retryAfterFailure,
      maxRetryCount: pingRetry.maxRetryCount,
      timeBetweenRetries: pingRetry.timeBetweenRetries,
    })
  }
}
```

### UI Behavior

**Dropdown Structure (Retry After Failure):**
```
┌─────────────────────────────────────┐
│ Yes                  Same as PING ✓ │  ← "Same as PING" option
├─────────────────────────────────────┤  ← Separator
│ Yes                                 │
│ No                                  │
└─────────────────────────────────────┘
```

**Field States:**

| Scenario | Retry Dropdown | Max Retry Count | Time Between Retries | Behavior |
|----------|---------------|-----------------|---------------------|----------|
| POST inheriting | Shows PING's Yes/No with "Same as PING" | Disabled, shows "3" (PING's value) | Disabled, shows "10 seconds" (PING's value) | Read-only |
| Change to No | "No" selected | Hidden (retry disabled) | Hidden (retry disabled) | Inheritance broken |
| Open count dropdown | No change | Enabled, PING value copied | Still disabled | Inheritance broken |
| Select "Same as PING" | Shows PING's Yes/No | Disabled, shows PING value | Disabled, shows PING value | Inheritance restored |

### Critical Fix: Showing Actual Values

**Problem:**
When inheriting, Max Retry Count and Time Between Retries were showing blank because the code set their values to `'same-as-ping'` which doesn't exist in the option lists.

**Solution:**
```tsx
// WRONG - shows blank fields
const countValue = isSameAsPing ? 'same-as-ping' : String(retry.maxRetryCount)

// CORRECT - shows PING's actual value
const countValue = isSameAsPing ? String(pingRetry.maxRetryCount) : String(retry.maxRetryCount)
```

### Breaking Inheritance Triggers

1. **Selecting Yes/No** (`handleRetryChange`)
2. **Opening Max Retry Count dropdown** (`onOpenChange={(open) => open && handleBreakInheritance()}`)
3. **Opening Time Between Retries dropdown** (`onOpenChange={(open) => open && handleBreakInheritance()}`)

## Visual Design

### Separator Styling

The separator between "Same as PING" and regular options has horizontal gaps:

```tsx
// select.tsx
const SelectSeparator = React.forwardRef<...>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('mx-2 my-1 h-px bg-border', className)}  // mx-2 adds gaps
    {...props}
  />
))
```

### "Same as PING" Meta Label

The meta label appears in blue on the right side of the option:

```tsx
// select.tsx - SelectItem component
{meta ? (
  <span className="flex w-full items-center justify-between gap-2">
    <span className="truncate">{children}</span>
    <span className="shrink-0 text-xs text-primary font-normal">{meta}</span>
  </span>
) : (
  children
)}
```

## Store Integration

### Zustand Store Methods

**Authentication:**
- `updatePingAuth(partial)` - Update PING auth settings
- `updatePostAuth(partial)` - Update POST auth settings with optional `sameAsPing` flag

**Retry:**
- `updatePingRetrySettings(partial)` - Update PING retry settings
- `updatePostRetrySettings(partial)` - Update POST retry settings with optional `sameAsPing` flag

### State Structure

```tsx
type DeliveryMethodConfig = {
  ping: {
    authentication: {
      sameAsPing?: never  // PING never has this field
      type: AuthenticationType
      // ... other auth fields
    }
    retrySettings: {
      sameAsPing?: never  // PING never has this field
      retryAfterFailure: boolean
      maxRetryCount: number
      timeBetweenRetries: number
    }
  }
  post: {
    authentication: {
      sameAsPing: boolean  // POST has this field
      type: AuthenticationType
      // ... other auth fields
    }
    retrySettings: {
      sameAsPing: boolean  // POST has this field
      retryAfterFailure: boolean
      maxRetryCount: number
      timeBetweenRetries: number
    }
  }
}
```

## Testing

Comprehensive Playwright tests cover all inheritance scenarios:

- ✅ "Same as PING" option appearance
- ✅ Separator visibility
- ✅ Field inheritance and disabled states
- ✅ Breaking inheritance by changing values
- ✅ Breaking inheritance by focusing fields
- ✅ Copying PING config when breaking
- ✅ Restoring inheritance by selecting "Same as PING"
- ✅ Independent inheritance states between settings
- ✅ Showing actual PING values (not blank) when inheriting

**Run tests:**
```bash
npx playwright test inheritance-logic.spec.ts
```

## Common Pitfalls

### ❌ Blank Fields When Inheriting

**Problem:**
```tsx
const countValue = isSameAsPing ? 'same-as-ping' : String(retry.maxRetryCount)
```
This causes blank fields because `'same-as-ping'` doesn't exist in `RETRY_COUNTS`.

**Solution:**
```tsx
const countValue = isSameAsPing ? String(pingRetry.maxRetryCount) : String(retry.maxRetryCount)
```

### ❌ Not Breaking Inheritance on Field Focus

**Problem:**
User focuses on a disabled field but it stays disabled.

**Solution:**
```tsx
<DebouncedInput
  onFocus={handleBreakInheritance}
  disabled={isSameAsPing}
/>
```

### ❌ Forgetting to Copy PING Config

**Problem:**
When breaking inheritance, fields reset to empty/default values.

**Solution:**
Copy entire PING config when breaking:
```tsx
const handleBreakInheritance = () => {
  if (isSameAsPing) {
    updatePostAuth({
      sameAsPing: false,
      type: pingAuth.type,
      // ... copy all PING fields
    })
  }
}
```

## Future Enhancements

- [ ] Bulk inheritance toggle for all POST settings
- [ ] Visual indicator in sidebar when settings are inherited
- [ ] Inheritance inheritance history/undo
- [ ] Partial inheritance (inherit some fields but not others)

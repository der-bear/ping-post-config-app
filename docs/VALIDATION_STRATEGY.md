# Validation Strategy

## Overview

This application uses a **progressive configuration** approach where users can save incomplete configurations and return later to complete them. Validation focuses on **data format quality** rather than completeness.

## Core Principles

### 1. Format Validation Only
- ✅ **Validate format** of entered data (URLs, regex patterns, etc.)
- ❌ **Don't validate completeness** (users can leave sections incomplete)
- ✅ **Allow partial configurations** to be saved

### 2. When to Validate
- **On blur**: Validate format when user leaves a field
- **On change**: Clear error when user starts typing
- **On save**: Collect all format errors before saving

### 3. Progressive Configuration
- Users can configure sections in any order
- Incomplete sections don't block saving
- Users can return later to complete configuration

---

## Validation Types

### Format Validation (Errors)
**Red inline errors that indicate invalid data format**

- URL format validation
- Email format validation
- Regex pattern validity (when "use regex" is enabled)
- Numeric range validation
- Date format validation

**Example:**
```tsx
// ✅ GOOD: Validate format if value exists
onBlur={(e) => {
  const value = e.target.value.trim()
  if (value && !isValidUrl(value)) {
    setErrors(prev => ({ ...prev, url: 'Enter valid URL (e.g., https://api.example.com)' }))
  } else {
    setErrors(prev => ({ ...prev, url: '' }))
  }
}}

// ❌ BAD: Don't validate if field is required
onBlur={(e) => {
  if (!e.target.value.trim()) {
    setErrors(prev => ({ ...prev, url: 'URL is required' })) // NO!
  }
}}
```

### Completeness Warnings (Optional - Future)
**Yellow/orange warnings for incomplete sections (non-blocking)**

These are optional and can be implemented later:
- Authentication configured but missing credentials
- No field mappings defined
- Response parsing not configured

---

## Implementation Pattern

### Component-Level Validation State

```tsx
export function UrlEndpointSettings({ phase }: UrlEndpointSettingsProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Helper: URL format validation
  const validateUrl = (value: string): string => {
    if (!value) return '' // Empty is OK
    try {
      new URL(value)
      return ''
    } catch {
      return 'Enter valid URL (e.g., https://api.example.com)'
    }
  }

  return (
    <FieldGroup label="Production URL">
      <DebouncedInput
        value={endpoint.productionUrl}
        onValueCommit={(v) => updateEndpoint({ productionUrl: v })}
        onBlur={(e) => {
          const error = validateUrl(e.target.value)
          setErrors(prev => ({ ...prev, productionUrl: error }))
        }}
        onChange={() => {
          if (errors.productionUrl) {
            setErrors(prev => ({ ...prev, productionUrl: '' }))
          }
        }}
        className={cn(errors.productionUrl && 'border-destructive')}
      />
      {errors.productionUrl && (
        <p className="text-xs text-destructive mt-1">{errors.productionUrl}</p>
      )}
    </FieldGroup>
  )
}
```

---

## Validation Rules by Panel

### General Settings
- **No validation needed** (all fields optional or have defaults)

### URL Endpoint Settings
- **Production URL**: Valid URL format if entered (empty OK)
- **Testing/Sandbox URL**: Valid URL format if entered (empty OK)

### Authentication Settings
- **OAuth2 Token URL**: Valid URL format if entered
- **All other fields**: No validation (optional)

### Mappings Settings
- **No format validation needed** (field names are free-form)

### Request Body Settings
- **Template syntax**: Validate if template engine is used (future)

### Response Settings
- **Regex patterns**: Validate regex syntax when "use regex" is checked
- **Keys/values**: No validation (optional)

### Retry Settings
- **No validation needed** (all dropdowns with valid options)

### Portal Permissions
- **No validation needed**

### Delivery Schedule
- **No validation needed**

### Notifications
- **Email addresses**: Valid email format if entered (in dialog)

---

## Error Message Guidelines

### Writing Good Error Messages

**✅ DO:**
- Be specific and actionable
- Show example of correct format
- Use plain language
- Keep messages scannable (short)

**❌ DON'T:**
- Use technical jargon
- Be vague ("Invalid input")
- Use long explanations
- Blame the user

### Error Message Templates

| Validation Type | Error Message |
|----------------|---------------|
| **URL Format** | `Enter valid URL (e.g., https://api.example.com)` |
| **Email Format** | `Enter valid email (e.g., user@example.com)` |
| **Regex Pattern** | `Enter valid regex pattern` |
| **Numeric Range** | `Enter number between X and Y` |
| **Text Input (dialogs)** | `Enter [field name]` (e.g., "Enter name", "Enter field name") |
| **Select/Dropdown (dialogs)** | `Select [field name]` (e.g., "Select user", "Select lead field") |

### Examples

```tsx
// ✅ GOOD: Specific, actionable, with example
'Enter valid URL (e.g., https://api.example.com)'

// ❌ BAD: Vague, no guidance
'Invalid URL'

// ✅ GOOD: Clear action
'Enter number between 0 and 100'

// ❌ BAD: Technical
'Value must be in range [0, 100]'

// ✅ GOOD: Concise, scannable (no repetition)
'Enter name'
'Enter value'

// ❌ BAD: Repetitive prefix (hard to scan)
'Header name is required'
'Header value is required'

// ✅ GOOD: Use "Select" for dropdowns
'Select user'
'Select lead field'

// ❌ BAD: Inconsistent verb
'User is required'
'Lead field is required'
```

---

## Save Behavior

### Current Implementation (Prototype)
```typescript
const handleSave = () => {
  console.log('Save changes')
  // TODO: Implement save logic
  onClose?.()
}
```

### Future Implementation
```typescript
const handleSave = () => {
  // 1. Collect format errors from all panels
  const formatErrors = collectFormatErrors(config)

  if (formatErrors.length > 0) {
    // Show toast with list of panels containing errors
    showToast({
      type: 'error',
      title: 'Invalid data format',
      message: 'Fix errors in: URL Endpoint (PING), Authentication (POST)',
    })

    // Optionally: auto-navigate to first panel with errors
    navigateToFirstError(formatErrors)

    return // Don't save
  }

  // 2. Save configuration (even if incomplete)
  saveConfig()
  onClose?.()
}
```

---

## Dialog Validation (Current Pattern)

Dialogs use a different pattern - **validate on save**:

```tsx
// add-header-dialog.tsx, add-notification-dialog.tsx, etc.
const handleSave = () => {
  const newErrors: Record<string, string> = {}

  if (!name.trim()) newErrors.name = 'Header name is required'
  if (!value.trim()) newErrors.value = 'Header value is required'

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors)
    return
  }

  onSave({ name, value })
  onClose()
}
```

**This pattern is fine for dialogs** because:
- Small, focused forms
- Clear submit action
- User expects validation when clicking Save
- Not part of progressive configuration flow

---

## Validation Helpers

### URL Validation
```typescript
export function isValidUrl(value: string): boolean {
  if (!value) return true // Empty is OK
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

export function validateUrl(value: string): string {
  return isValidUrl(value) ? '' : 'Enter valid URL (e.g., https://api.example.com)'
}
```

### Email Validation
```typescript
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string): boolean {
  if (!value) return true // Empty is OK
  return EMAIL_REGEX.test(value)
}

export function validateEmail(value: string): string {
  return isValidEmail(value) ? '' : 'Enter valid email (e.g., user@example.com)'
}
```

### Regex Pattern Validation
```typescript
export function isValidRegex(pattern: string): boolean {
  try {
    new RegExp(pattern)
    return true
  } catch {
    return false
  }
}

export function validateRegex(pattern: string): string {
  return isValidRegex(pattern) ? '' : 'Invalid regex pattern'
}
```

---

## Future Enhancements

### Panel-Level Error Indicators
Add visual indicators to navigation sidebar:

```tsx
<NavItem
  label="Authentication"
  active={isActive}
  hasError={!!getAuthErrors()} // Red dot or icon
  onClick={() => handleNavClick({ section: 'ping', tab: 'authentication' })}
/>
```

### Completeness Warnings
Optional warning system for incomplete sections:

```tsx
const warnings = {
  authentication: !isAuthComplete(config.ping.authentication),
  mappings: config.ping.mappings.length === 0,
  // ... other warnings
}

// Show warning badge on nav items
<NavItem
  label="Authentication"
  warning={warnings.authentication} // Yellow dot
/>
```

### Global Validation on Save
Collect and display all errors:

```typescript
const formatErrors = {
  ping: {
    urlEndpoint: validateUrlEndpoint(config.ping.urlEndpoint),
    authentication: validateAuth(config.ping.authentication),
  },
  post: {
    urlEndpoint: validateUrlEndpoint(config.post.urlEndpoint),
    authentication: validateAuth(config.post.authentication),
  },
}

if (hasErrors(formatErrors)) {
  showToast({
    type: 'error',
    title: 'Validation errors found',
    message: 'Please fix errors in: Authentication (PING), URL Endpoint (POST)',
  })
}
```

---

## Testing Validation

### Unit Tests (Future)
```typescript
describe('validateUrl', () => {
  it('accepts empty values', () => {
    expect(validateUrl('')).toBe('')
  })

  it('accepts valid URLs', () => {
    expect(validateUrl('https://api.example.com')).toBe('')
  })

  it('rejects invalid URLs', () => {
    expect(validateUrl('not a url')).toBe('Enter valid URL (e.g., https://api.example.com)')
  })
})
```

### E2E Tests
```typescript
test('shows URL format error on blur', async ({ page }) => {
  await page.fill('[name="productionUrl"]', 'invalid url')
  await page.blur('[name="productionUrl"]')

  await expect(page.getByText('Enter valid URL')).toBeVisible()
})

test('clears error on change', async ({ page }) => {
  await page.fill('[name="productionUrl"]', 'invalid url')
  await page.blur('[name="productionUrl"]')

  await page.fill('[name="productionUrl"]', 'https://api.example.com')
  await expect(page.getByText('Enter valid URL')).not.toBeVisible()
})
```

---

## Summary

**Key Principles:**
1. ✅ Validate **format**, not **completeness**
2. ✅ Validate **on blur**, clear **on change**
3. ✅ Allow **partial configurations**
4. ✅ Use **informative, scannable** error messages
5. ✅ **Don't block** saving incomplete configs

**Implementation:**
- Component-level error state (`errors` object)
- Inline error messages below fields
- Border styling with `border-destructive`
- Clear, actionable error text with examples
- Validation helpers for common formats

**Future:**
- Global validation on Save
- Panel-level error indicators
- Optional completeness warnings
- Validation helper library

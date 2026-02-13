/**
 * Validation helpers for form inputs
 *
 * All validators return an empty string ('') if valid,
 * or an error message if invalid.
 *
 * Empty values are always considered valid (optional fields).
 */

/**
 * Validate URL format
 * @param value - URL string to validate
 * @returns Empty string if valid, error message if invalid
 */
export function validateUrl(value: string): string {
  if (!value || !value.trim()) return '' // Empty is OK

  try {
    new URL(value)
    return ''
  } catch {
    return 'Enter valid URL (e.g., https://api.example.com)'
  }
}

/**
 * Check if URL is valid (returns boolean)
 * @param value - URL string to validate
 * @returns true if valid or empty, false if invalid
 */
export function isValidUrl(value: string): boolean {
  return validateUrl(value) === ''
}

/**
 * Validate email format
 * @param value - Email string to validate
 * @returns Empty string if valid, error message if invalid
 */
export function validateEmail(value: string): string {
  if (!value || !value.trim()) return '' // Empty is OK

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (EMAIL_REGEX.test(value)) {
    return ''
  }
  return 'Enter valid email (e.g., user@example.com)'
}

/**
 * Check if email is valid (returns boolean)
 * @param value - Email string to validate
 * @returns true if valid or empty, false if invalid
 */
export function isValidEmail(value: string): boolean {
  return validateEmail(value) === ''
}

/**
 * Validate regex pattern
 * @param pattern - Regex pattern string to validate
 * @returns Empty string if valid, error message if invalid
 */
export function validateRegex(pattern: string): string {
  if (!pattern || !pattern.trim()) return '' // Empty is OK

  try {
    new RegExp(pattern)
    return ''
  } catch {
    return 'Enter valid regex pattern'
  }
}

/**
 * Check if regex pattern is valid (returns boolean)
 * @param pattern - Regex pattern string to validate
 * @returns true if valid or empty, false if invalid
 */
export function isValidRegex(pattern: string): boolean {
  return validateRegex(pattern) === ''
}

/**
 * Validate numeric range
 * @param value - Number to validate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Empty string if valid, error message if invalid
 */
export function validateRange(
  value: number | string,
  min: number,
  max: number,
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(num)) return '' // Empty/invalid is OK (let type validation handle it)
  if (num < min || num > max) {
    return `Enter number between ${min} and ${max}`
  }
  return ''
}

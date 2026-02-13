import { useMemo } from 'react'
import { LEAD_FIELDS, type LeadField } from '@/data/lead-fields'

/**
 * Hook to get lead fields - currently returns hardcoded data,
 * but can be easily swapped to API/JSON loading later.
 *
 * Future: Replace with API call or JSON import
 */
export function useLeadFields(leadType?: string) {
  return useMemo(() => {
    // TODO: Filter by leadType when we support multiple types
    // TODO: Replace with API call: fetch(`/api/lead-types/${leadType}/fields`)
    return LEAD_FIELDS
  }, [leadType])
}

/**
 * Hook to get lead fields by category
 */
export function useLeadFieldsByCategory(category: LeadField['category']) {
  const fields = useLeadFields()

  return useMemo(() => {
    return fields.filter(field => field.category === category)
  }, [fields, category])
}

/**
 * Hook to search/filter lead fields
 */
export function useSearchLeadFields(query: string) {
  const fields = useLeadFields()

  return useMemo(() => {
    if (!query.trim()) return fields

    const lowerQuery = query.toLowerCase()
    return fields.filter(field =>
      field.name.toLowerCase().includes(lowerQuery) ||
      field.label.toLowerCase().includes(lowerQuery) ||
      field.description.toLowerCase().includes(lowerQuery)
    )
  }, [fields, query])
}

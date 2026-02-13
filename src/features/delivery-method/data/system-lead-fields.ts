import type { SystemLeadField } from '@/features/delivery-method/types'

export const SYSTEM_LEAD_FIELDS: SystemLeadField[] = [
  // Consent & Tracking
  { name: 'tcpa_consent' },
  { name: 'consent_flag' },
  { name: 'consent_timestamp' },
  { name: 'ip_address' },

  // System Fields
  { name: 'product_category' },

  // Contact Information
  { name: 'first_name' },
  { name: 'last_name' },
  { name: 'email_address' },
  { name: 'phone_number' },
  { name: 'street_address' },
  { name: 'city' },
  { name: 'state_code' },
  { name: 'postal_code' },

  // Demographics
  { name: 'date_of_birth' },

  // Financial
  { name: 'annual_income' },
  { name: 'credit_score_range', enumCount: 5 },

  // Property/Loan
  { name: 'property_type', enumCount: 6 },
  { name: 'loan_amount' },
  { name: 'down_payment' },
]

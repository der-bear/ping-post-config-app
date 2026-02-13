import type { SystemLeadField } from '@/features/delivery-method/types'

export const SYSTEM_LEAD_FIELDS: SystemLeadField[] = [
  { name: 'tcpa_consent', suggestedDeliveryName: 'consent_flag', enumCount: 3 },
  { name: 'category', suggestedDeliveryName: 'category' },
  { name: 'zip', suggestedDeliveryName: 'postal_code' },
  { name: 'ip', suggestedDeliveryName: 'ip_address' },
  { name: 'consent_ts', suggestedDeliveryName: 'consent_timestamp' },
  { name: 'first_name', suggestedDeliveryName: 'f_name' },
  { name: 'last_name', suggestedDeliveryName: 'l_name' },
  { name: 'email', suggestedDeliveryName: 'email' },
  { name: 'phone', suggestedDeliveryName: 'phone_number' },
  { name: 'street_address', suggestedDeliveryName: 'address' },
  { name: 'city', suggestedDeliveryName: 'city' },
  { name: 'state_code', suggestedDeliveryName: 'state' },
  { name: 'date_of_birth', suggestedDeliveryName: 'dob' },
  { name: 'annual_income', suggestedDeliveryName: 'income' },
  { name: 'credit_score', suggestedDeliveryName: 'credit_score', enumCount: 5 },
  { name: 'property_type', suggestedDeliveryName: 'property_type', enumCount: 4 },
  { name: 'loan_amount', suggestedDeliveryName: 'loan_amount' },
  { name: 'down_payment', suggestedDeliveryName: 'down_payment' },
]

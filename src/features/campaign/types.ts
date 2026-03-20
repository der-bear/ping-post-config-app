// ---- Navigation ----

export type CampaignSection =
  | 'general'
  | 'delivery-options'
  | 'duplicate-checks'
  | 'criteria'
  | 'quantity-limits'
  | 'lead-validation'
  | 'compliance'
  | 'integrations-manage'
  | 'integration-criteria'
  | 'agent-forms'

export type ActivePanel = { section: CampaignSection }

// ---- General ----

export type PricingModel = 'per-lead' | 'per-sale' | 'revenue-share'
export type CampaignStatus = 'active' | 'paused' | 'disabled'
export type Channel = 'web-leads' | 'phone-calls' | 'live-transfer'

export interface GeneralSettings {
  name: string
  channel: Channel
  leadType: string
  pricingModel: PricingModel
  pricePerLead: string
  pricePerSale: string
  revenueSharePct: string
  status: CampaignStatus
}

// ---- Delivery Options ----

export type DeliveryMode = 'single' | 'multiple' | 'any-qualified'
export type TargetMode = 'specific-buyers' | 'delivery-group'

export interface Buyer {
  id: string
  name: string
  warning?: string
}

export interface DeliveryOptionsConfig {
  deliveryMode: DeliveryMode
  targetMode: TargetMode
  selectedBuyer: string
  selectedGroup: string
  buyers: Buyer[]
  automationMethod: string
  maxDeliveryCount: string
}

// ---- Quality Control / Duplicate Checks ----

export interface DuplicateChecksConfig {
  leadType: string
  checkRejectedLeads: boolean
  duplicateDays: string
  appendDuplicateData: boolean
  allowPingDuplicateCheck: boolean
  resendDeliveries: boolean
}

// ---- Criteria ----

export interface CriteriaRule {
  id: string
  type: string
  field: string
  operator: string
  value: string
}

// ---- Quantity Limits ----

export interface LimitSetting {
  enabled: boolean
  value: string
}

export interface QuantityLimitsConfig {
  hourLimit: LimitSetting
  dailyLimit: LimitSetting
  monthlyLimit: LimitSetting
}

// ---- Lead Validation ----

export interface LeadValidationConfig {
  useQualityControl: boolean
  defaultRejectAction: string
  scanCoverage: string
  standardizeAddress: boolean
  appendCityState: boolean
  mobileCheck: boolean
  geolocateIp: boolean
  enableLeadGrading: boolean
  gradingConfigMode: 'lead-source' | 'custom'
}

// ---- Compliance ----

export interface ComplianceConfig {
  enableTcpa: boolean
  returnClientOffers: boolean
  retentionPolicyDays: string
  rejectedRetentionDays: string
}

// ---- Integrations ----

export interface Integration {
  id: string
  name: string
  icon?: string
}

export interface IntegrationsConfig {
  added: Integration[]
  available: Integration[]
}

// ---- Full Config ----

export interface CampaignConfig {
  general: GeneralSettings
  deliveryOptions: DeliveryOptionsConfig
  duplicateChecks: DuplicateChecksConfig
  criteria: CriteriaRule[]
  quantityLimits: QuantityLimitsConfig
  leadValidation: LeadValidationConfig
  compliance: ComplianceConfig
  integrations: IntegrationsConfig
  integrationCriteria: CriteriaRule[]
  agentForms: CriteriaRule[]
}

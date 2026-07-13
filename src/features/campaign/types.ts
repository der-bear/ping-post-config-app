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
  | 'postback-configuration'
  | 'postback-history'

export type ActivePanel = { section: CampaignSection }

// ---- General ----

export type PricingModel = 'per-lead' | 'per-sale' | 'revenue-share'
export type CampaignStatus = 'active' | 'closed' | 'inactive' | 'on-hold' | 'late' | 'suspended'
export const CAMPAIGN_STATUS_OPTIONS: { value: CampaignStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'closed', label: 'Closed' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'on-hold', label: 'OnHold' },
  { value: 'late', label: 'Late' },
  { value: 'suspended', label: 'Suspended' },
]
export type Channel = 'web' | 'ping-post' | 'phone' | 'chat'
export const CAMPAIGN_CHANNEL_OPTIONS: { value: Channel; label: string }[] = [
  { value: 'web', label: 'Web' },
  { value: 'ping-post', label: 'Ping Post' },
  { value: 'phone', label: 'Phone' },
  { value: 'chat', label: 'Chat' },
]

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

export type DefaultRejectAction = 'reject-to-source' | 'quality-control' | 'forward-to-delivery'
export const DEFAULT_REJECT_ACTION_OPTIONS: { value: DefaultRejectAction; label: string }[] = [
  { value: 'reject-to-source', label: 'Reject back to Lead Source' },
  { value: 'quality-control', label: 'Move to Quality Control' },
  { value: 'forward-to-delivery', label: 'Forward to Delivery' },
]

export type ScanCoverageOption =
  | 'reject-no-sale'
  | 'return-no-sale'
  | 'reject-no-coverage'
  | 'return-no-coverage'
export const SCAN_COVERAGE_OPTIONS: { value: ScanCoverageOption; label: string }[] = [
  { value: 'reject-no-sale', label: 'Reject for No Sale' },
  { value: 'return-no-sale', label: 'Return for No Sale' },
  { value: 'reject-no-coverage', label: 'Reject for No Coverage' },
  { value: 'return-no-coverage', label: 'Return for No Coverage' },
]
export const DEFAULT_SCAN_COVERAGE: ScanCoverageOption = 'reject-no-sale'

/** Price Per Sale and Revenue Share only pay out on a sale, so the system must wait for
 *  delivery to finish before it can calculate the amount. Both models therefore force
 *  Sale & Coverage Verification on and lock the toggle.
 *
 *  Pricing owns the toggle only, never the rule: every rule is valid under Revenue Share,
 *  so the user's chosen rule survives locking, unlocking, and being switched off. */
export function pricingLocksVerification(model: PricingModel): boolean {
  return model === 'per-sale' || model === 'revenue-share'
}

export interface LeadValidationConfig {
  useQualityControl: boolean
  defaultRejectAction: DefaultRejectAction
  /** Whether Sale & Coverage Verification runs. Pricing can force this on. */
  scanCoverageEnabled: boolean
  /** Which rule applies when it runs. Always holds a valid option, and is remembered
   *  while switched off so re-enabling restores the user's last choice. */
  scanCoverage: ScanCoverageOption
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
  subtitle?: string
  icon?: string
  iconBg?: string
}

export interface IntegrationsConfig {
  added: Integration[]
  available: Integration[]
}

export interface ReorderIntegrationsArgs {
  activeId: string
  overId: string
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

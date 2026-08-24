export type ClientStatus = 'new' | 'pending' | 'working' | 'waiting' | 'inactive' | 'active'

export type DeliveryType =
  | 'http-webhook'
  | 'clickpoint'
  | 'ftp'
  | 'email'
  | 'csv'
  | 'lead-portal'
  | 'ping-post'
  | 'batch-email'
  | 'sms'

export type DeliveryAccountSection =
  | 'general'
  | 'quantity-limits'
  | 'delivery'
  | 'revenue'
  | 'criteria'
  | 'offer'
  | 'advanced'

export type OrderSection = 'general' | 'items'

export interface CriteriaRule {
  id: string
  type: 'Field Value' | 'Client Field' | 'Regular Expression' | 'Calculated Expression'
  field: string
  operator: string
  value: string
}

export interface OrderItem {
  id: string
  deliveryAccount: string
  orderType: 'Lead Quantity' | 'Reserved Dollar Bank'
  quantity: number
  perLeadPrice: number
  sent: number
}

export interface LimitSetting {
  enabled: boolean
  value: number
}

export interface ClientConfiguration {
  client: {
    companyName: string
    firstName: string
    lastName: string
    email: string
    status: ClientStatus
    group: string
  }
  deliveryMethod: {
    automatedDelivery: boolean
    type: DeliveryType
    leadType: string
    portalUsername: string
    portalPassword: string
  }
  deliveryAccount: {
    name: string
    leadType: string
    channel: string
    status: 'open' | 'closed' | 'inactive'
    defaultLeadPrice: number
    quantityLimits: {
      total: LimitSetting
      hourly: LimitSetting
      daily: LimitSetting
      weekly: LimitSetting
      monthly: LimitSetting
      yearly: LimitSetting
    }
    delivery: {
      automatedDelivery: boolean
      primaryDeliveryMethod: string
      additionalDeliveryMethods: string[]
      priority: number
      group: string
      assignedUser: string
    }
    revenue: {
      enabled: boolean
      type: 'fixed' | 'percentage'
      amount: number
      percentage: number
    }
    criteria: CriteriaRule[]
    offer: {
      enabled: boolean
      amount: number
      minimum: number
      maximum: number
    }
    advanced: {
      exclusive: boolean
      requireOrder: boolean
      criteriaRequired: boolean
      limitByQualifiedLeadPercentage: boolean
      qualifiedLeadPercentage: number
      notifyOnRemoval: boolean
      removalContactName: string
      removalContactEmail: string
    }
  }
  order: {
    name: string
    leadType: string
    description: string
    status: 'active' | 'on-hold' | 'closed'
    startDate: string
    endDate: string
    renewOrder: boolean
    autoCharge: boolean
    paymentDiscount: number
    maxReturnPercentage: number
    items: OrderItem[]
  }
}

export interface ClientWizardSubmission {
  companyName: string
  firstName: string
  lastName: string
  email: string
  status: ClientStatus
  clientGroup: string
  automatedDelivery: boolean
  deliveryType: DeliveryType
  leadType: string
  portalUsername: string
  portalPassword: string
  channel: string
  deliveryAccountName: string
  defaultLeadPrice: number
  criteriaRequired: boolean
  exclusive: boolean
  requireOrder: boolean
}

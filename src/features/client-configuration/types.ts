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

export type OrderSection = 'general' | 'items' | 'payments'

export interface CriteriaRule {
  id: string
  type:
    | 'Lead Field'
    | 'Field Value'
    | 'Client Field'
    | 'Regular Expression'
    | 'Calculated Expression'
    | 'Evaluate Function'
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

export interface OrderCreationSubmission {
  name: string
  leadType: string
  description: string
  status: 'open' | 'on-hold' | 'closed'
  startDate: string
  endDate: string
  renewOrder: boolean
  autoCharge: boolean
  paymentDiscount: number
  maxReturnPercentage: number
  deliveryAccount: string
  orderType: OrderItem['orderType']
  quantity: number
  perLeadPrice: number
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
    status: 'open' | 'closed' | 'suspended' | 'on-hold'
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
      additionalDeliveryMethod1Enabled: boolean
      additionalDeliveryMethod1: string
      additionalDeliveryMethod1Fallback: string
      additionalDeliveryMethod2Enabled: boolean
      additionalDeliveryMethod2: string
      additionalDeliveryMethod2Fallback: string
      priority: number
      exclusiveDelivery: boolean
      useOrderSystem: boolean
      orderForms: string[]
    }
    revenue: {
      revenueRequired: LimitSetting
      profitRequired: LimitSetting
      profitPercentageRequired: LimitSetting
      revenueShareDollar: LimitSetting
      revenueSharePercentage: LimitSetting
    }
    criteria: CriteriaRule[]
    offer: {
      enabled: boolean
      type: 'static' | 'dynamic'
      companyName: string
      companyPhoneNumber: string
      name: string
      description: string
      url: string
      imageUrl: string
      privacyUrl: string
      termsUrl: string
      duration: 'Monthly' | 'Yearly'
      amount: number
      customTcpaConsentEnabled: boolean
      customTcpaConsentText: string
      timeZone: string
      hasStartDate: boolean
      startDate: string
      hasEndDate: boolean
      endDate: string
    }
    advanced: {
      exclusive: boolean
      requireOrder: boolean
      criteriaRequired: boolean
      maximumReturnPercentageEnabled: boolean
      maximumReturnPercentage: number
      enforceQuantityConstraints: boolean
      limitByQualifiedLeadPercentage: boolean
      qualifiedLeadLimitMode: 'Total' | 'Hour' | 'Day' | 'Week' | 'Month' | 'Year'
      qualifiedLeadPercentage: number
      deliveryDelayEnabled: boolean
      deliveryDelaySeconds: number
      deliveryGroup: string
      confirmDelivery: boolean
    }
  }
  order: {
    name: string
    leadType: string
    description: string
    status: 'open' | 'on-hold' | 'closed'
    startDate: string
    endDate: string
    renewOrder: boolean
    autoCharge: boolean
    autoChargeTiming: 'Charge before order starts' | 'Charge when order is complete'
    paymentDiscount: number
    maxReturnPercentageEnabled: boolean
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

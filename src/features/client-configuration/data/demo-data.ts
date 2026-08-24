import type { ClientConfiguration, ClientWizardSubmission } from '../types'

const DEMO_DATE = '2026-08-24'

export function createDemoClientConfiguration(): ClientConfiguration {
  return {
    client: {
      companyName: 'Codex UX Research Client 2026-08-24',
      firstName: 'Codex',
      lastName: 'Research',
      email: '',
      status: 'new',
      group: 'No Group',
    },
    deliveryMethod: {
      automatedDelivery: false,
      type: 'http-webhook',
      leadType: 'Short Mortgage Lead',
      portalUsername: '',
      portalPassword: '',
    },
    deliveryAccount: {
      name: 'Codex UX Research DA',
      leadType: 'Short Mortgage Lead',
      channel: 'Web and Chat Leads',
      status: 'open',
      defaultLeadPrice: 0,
      quantityLimits: {
        total: { enabled: false, value: 0 },
        hourly: { enabled: false, value: 0 },
        daily: { enabled: false, value: 0 },
        weekly: { enabled: false, value: 0 },
        monthly: { enabled: false, value: 0 },
        yearly: { enabled: false, value: 0 },
      },
      delivery: {
        automatedDelivery: false,
        primaryDeliveryMethod: 'HTTP Webhook',
        additionalDeliveryMethod1Enabled: false,
        additionalDeliveryMethod1: 'No Delivery',
        additionalDeliveryMethod1Fallback: 'Do not send if primary fails',
        additionalDeliveryMethod2Enabled: false,
        additionalDeliveryMethod2: 'No Delivery',
        additionalDeliveryMethod2Fallback: 'Do not send if primary fails',
        priority: 0,
        exclusiveDelivery: false,
        useOrderSystem: false,
        orderForms: [],
      },
      revenue: {
        revenueRequired: { enabled: false, value: 0 },
        profitRequired: { enabled: false, value: 0 },
        profitPercentageRequired: { enabled: false, value: 0 },
        revenueShareDollar: { enabled: false, value: 0 },
        revenueSharePercentage: { enabled: false, value: 0 },
      },
      criteria: [],
      offer: {
        enabled: false,
        type: 'static',
        companyName: 'Summit Home Buyers',
        companyPhoneNumber: '(480) 555-0198',
        name: 'Free Home Value Review',
        description: 'Schedule a no-obligation review with a local mortgage specialist.',
        url: 'https://example.com/home-review',
        imageUrl: 'https://example.com/assets/home-review.jpg',
        privacyUrl: 'https://example.com/privacy',
        termsUrl: 'https://example.com/terms',
        duration: 'Monthly',
        amount: 0,
        customTcpaConsentEnabled: false,
        customTcpaConsentText: '',
      },
      advanced: {
        exclusive: false,
        requireOrder: false,
        criteriaRequired: true,
        maximumReturnPercentageEnabled: false,
        maximumReturnPercentage: 0,
        enforceQuantityConstraints: true,
        limitByQualifiedLeadPercentage: false,
        qualifiedLeadLimitMode: 'Total',
        qualifiedLeadPercentage: 100,
        deliveryDelayEnabled: false,
        deliveryDelaySeconds: 0,
        deliveryGroup: 'No Delivery Group',
        confirmDelivery: false,
      },
    },
    order: {
      name: 'Codex UX Research Order 2026-08-24',
      leadType: 'Short Mortgage Lead',
      description: 'Safe demonstration order for the outbound configuration prototype.',
      status: 'on-hold',
      startDate: DEMO_DATE,
      endDate: '',
      renewOrder: false,
      autoCharge: false,
      paymentDiscount: 0,
      maxReturnPercentage: 0,
      items: [
        {
          id: 'demo-order-item',
          deliveryAccount: 'All Delivery Accounts',
          orderType: 'Lead Quantity',
          quantity: 2,
          perLeadPrice: 0,
          sent: 0,
        },
      ],
    },
  }
}

export function configurationFromWizard(
  submission: ClientWizardSubmission,
): ClientConfiguration {
  const config = createDemoClientConfiguration()

  return {
    ...config,
    client: {
      companyName: submission.companyName,
      firstName: submission.firstName,
      lastName: submission.lastName,
      email: submission.email,
      status: submission.status,
      group: submission.clientGroup,
    },
    deliveryMethod: {
      automatedDelivery: submission.automatedDelivery,
      type: submission.deliveryType,
      leadType: submission.leadType,
      portalUsername: submission.portalUsername,
      portalPassword: submission.portalPassword,
    },
    deliveryAccount: {
      ...config.deliveryAccount,
      name: submission.deliveryAccountName,
      leadType: submission.leadType,
      channel: submission.channel,
      defaultLeadPrice: submission.defaultLeadPrice,
      delivery: {
        ...config.deliveryAccount.delivery,
        automatedDelivery: submission.automatedDelivery,
        exclusiveDelivery: submission.exclusive,
        useOrderSystem: submission.requireOrder,
      },
      advanced: {
        ...config.deliveryAccount.advanced,
        criteriaRequired: submission.criteriaRequired,
        exclusive: submission.exclusive,
        requireOrder: submission.requireOrder,
      },
    },
  }
}

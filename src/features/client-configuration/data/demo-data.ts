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
        additionalDeliveryMethods: [],
        priority: 0,
        group: 'No Delivery Group',
        assignedUser: 'ClickPoint.Sales',
      },
      revenue: {
        enabled: false,
        type: 'fixed',
        amount: 0,
        percentage: 0,
      },
      criteria: [],
      offer: {
        enabled: false,
        amount: 0,
        minimum: 0,
        maximum: 0,
      },
      advanced: {
        exclusive: false,
        requireOrder: false,
        criteriaRequired: true,
        limitByQualifiedLeadPercentage: false,
        qualifiedLeadPercentage: 100,
        notifyOnRemoval: false,
        removalContactName: '',
        removalContactEmail: '',
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

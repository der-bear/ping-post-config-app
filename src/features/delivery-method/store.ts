import { create } from 'zustand';

import type {
  ActivePanel,
  AuthenticationConfig,
  CustomHeader,
  DaySchedule,
  DeliveryMethodConfig,
  DeliveryScheduleConfig,
  FieldMapping,
  GeneralSettings,
  NotificationRecipient,
  NotificationsConfig,
  PostAuthenticationConfig,
  PostResponseSettingsConfig,
  PostRetrySettingsConfig,
  PostUrlEndpointConfig,
  PortalPermissions,
  ResponseSettingsConfig,
  RetrySettingsConfig,
  UrlEndpointConfig,
} from '@/features/delivery-method/types';

// ---------------------------------------------------------------------------
// Mapped field tag (for template insertion)
// ---------------------------------------------------------------------------

export interface MappedFieldTag {
  id: string;
  name: string;
  mappedTo: string;
  source: 'ping' | 'post';
}

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------

export interface DeliveryMethodStore {
  // State
  config: DeliveryMethodConfig;
  activePanel: ActivePanel;
  isPingExpanded: boolean;
  isPostExpanded: boolean;
  isPanelExpanded: boolean;
  flyoutOpen: boolean;
  flyoutData: FieldMapping | null;
  flyoutContext: 'ping' | 'post';

  // Navigation
  setActivePanel: (panel: ActivePanel) => void;
  togglePingExpanded: () => void;
  togglePostExpanded: () => void;
  togglePanelExpanded: () => void;

  // Flyout
  openFlyout: (context: 'ping' | 'post', data?: FieldMapping) => void;
  closeFlyout: () => void;

  // General
  updateGeneral: (partial: Partial<GeneralSettings>) => void;

  // PING — URL Endpoint
  updatePingUrlEndpoint: (partial: Partial<UrlEndpointConfig>) => void;
  addPingHeader: (header: CustomHeader) => void;
  removePingHeader: (id: string) => void;

  // PING — URL Endpoint Headers
  updatePingHeader: (id: string, partial: Partial<CustomHeader>) => void;

  // PING — Authentication
  updatePingAuth: (partial: Partial<AuthenticationConfig>) => void;

  // PING — Mappings
  addPingMapping: (mapping: FieldMapping) => void;
  addPingMappings: (mappings: FieldMapping[]) => void;
  replacePingMappings: (mappings: FieldMapping[]) => void;
  removePingMapping: (id: string) => void;
  removePingMappings: (ids: string[]) => void;
  updatePingMapping: (id: string, partial: Partial<FieldMapping>) => void;

  // PING — Request Body
  updatePingRequestBody: (body: string) => void;

  // PING — Response Settings
  updatePingResponseSettings: (partial: Partial<ResponseSettingsConfig>) => void;

  // PING — Retry Settings
  updatePingRetrySettings: (partial: Partial<RetrySettingsConfig>) => void;

  // POST — URL Endpoint
  updatePostUrlEndpoint: (partial: Partial<PostUrlEndpointConfig>) => void;
  addPostHeader: (header: CustomHeader) => void;
  removePostHeader: (id: string) => void;

  // POST — URL Endpoint Headers
  updatePostHeader: (id: string, partial: Partial<CustomHeader>) => void;

  // POST — Authentication
  updatePostAuth: (partial: Partial<PostAuthenticationConfig>) => void;

  // POST — Mappings
  addPostMapping: (mapping: FieldMapping) => void;
  addPostMappings: (mappings: FieldMapping[]) => void;
  replacePostMappings: (mappings: FieldMapping[]) => void;
  removePostMapping: (id: string) => void;
  removePostMappings: (ids: string[]) => void;
  updatePostMapping: (id: string, partial: Partial<FieldMapping>) => void;
  updatePostMappings: (partial: Partial<import('@/features/delivery-method/types').PostMappingsConfig>) => void;

  // POST — Request Body
  updatePostRequestBody: (body: string) => void;

  // POST — Response Settings
  updatePostResponseSettings: (partial: Partial<PostResponseSettingsConfig>) => void;

  // POST — Retry Settings
  updatePostRetrySettings: (partial: Partial<PostRetrySettingsConfig>) => void;

  // Portal Permissions
  updatePortalPermissions: (partial: Partial<PortalPermissions>) => void;

  // Delivery Schedule
  updateDeliverySchedule: (day: keyof DeliveryScheduleConfig, partial: Partial<DaySchedule>) => void;

  // Notifications
  updateNotifications: (partial: Partial<NotificationsConfig>) => void;
  addNotificationRecipient: (recipient: NotificationRecipient) => void;
  removeNotificationRecipient: (id: string) => void;

  // Computed getters
  getPingMappedFields: () => MappedFieldTag[];
  getPostMappedFields: () => MappedFieldTag[];

  // Reset store to default state
  resetStore: () => void;
}

// ---------------------------------------------------------------------------
// Default field-mapping helpers
// ---------------------------------------------------------------------------

function pingMapping(
  id: string,
  name: string,
  mappedTo: string,
  testValue = '',
): FieldMapping {
  return {
    id,
    type: 'Lead Field',
    name,
    mappedTo,
    defaultValue: '',
    testValue,
    useInPost: true,
    hasValueMappings: false,
    valueMappings: [],
  };
}

function postMapping(
  id: string,
  name: string,
  mappedTo: string,
  type: FieldMapping['type'] = 'Lead Field',
  testValue = '',
): FieldMapping {
  return {
    id,
    type,
    name,
    mappedTo,
    defaultValue: '',
    testValue,
    useInPost: false,
    hasValueMappings: false,
    valueMappings: [],
  };
}

// ---------------------------------------------------------------------------
// Default PING mappings (from Figma)
// ---------------------------------------------------------------------------

const defaultPingMappings: FieldMapping[] = [
  pingMapping('pm-1', 'category', 'product_category'),
  pingMapping('pm-2', 'zip', 'postal_code'),
  pingMapping('pm-3', 'ip', 'ip_address'),
  pingMapping('pm-4', 'tcpa_consent', 'consent_flag'),
  pingMapping('pm-5', 'consent_ts', 'consent_timestamp'),
];

// ---------------------------------------------------------------------------
// Default POST mappings (from Figma) — POST-only fields + system field
// ---------------------------------------------------------------------------

const defaultPostMappings: FieldMapping[] = [
  postMapping('postm-1', 'first_name', 'f_name'),
  postMapping('postm-2', 'last_name', 'l_name'),
  postMapping('postm-3', 'email_address', 'email'),
  postMapping('postm-4', 'phone_number', 'phone'),
  postMapping('postm-5', 'street_address', 'address'),
  postMapping('postm-6', 'city', 'srv_city'),
  postMapping('postm-7', 'state_code', 'state'),
  postMapping('postm-8', 'date_of_birth', 'dob'),
  postMapping('postm-9', 'annual_income', 'income'),
  postMapping('postm-10', 'ping_request_id', 'ping_id', 'System Field'),
];

// ---------------------------------------------------------------------------
// Default day schedule
// ---------------------------------------------------------------------------

function dayOn(): DaySchedule {
  return { enabled: true, from: '08:00', to: '20:00' };
}

function dayOff(): DaySchedule {
  return { enabled: false, from: '08:00', to: '20:00' };
}

// ---------------------------------------------------------------------------
// Default config
// ---------------------------------------------------------------------------

const defaultConfig: DeliveryMethodConfig = {
  general: {
    description: '',
    leadType: 'mortgage',
    environment: 'testing',
    processForPhoneCalls: 'default',
    whenToProcessPhoneCalls: 'start',
  },

  ping: {
    urlEndpoint: {
      productionUrl: '',
      testingUrl: '',
      contentType: 'default',
      timeout: 30,
      customHeaders: [],
    },
    authentication: {
      type: 'none',
      requestFormat: 'form-encoded',
    },
    mappings: {
      mappings: defaultPingMappings,
    },
    requestBody: {
      body: JSON.stringify({
        category: '[product_category]',
        zip: '[postal_code]',
        ip: '[ip_address]',
        tcpa_consent: '[consent_flag]',
        consent_ts: '[consent_timestamp]',
      }, null, 2),
    },
    responseSettings: {
      responseFormat: 'json',
      successKey: '',
      successValue: '',
      successSearchPattern: '',
      successUseRegex: false,
      referenceIdKey: '',
      referenceIdSearchPattern: '',
      referenceIdUseRegex: false,
      priceKey: '',
      priceSearchPattern: '',
      priceUseRegex: false,
      enablePingDuringSort: true,
    },
    retrySettings: {
      retryAfterFailure: false,
      maxRetryCount: 0,
      timeBetweenRetries: 0,
    },
  },

  post: {
    urlEndpoint: {
      productionUrl: '',
      testingUrl: '',
      contentType: 'default',
      timeout: 30,
      customHeaders: [],
      method: 'POST',
      contentTypeSameAsPing: true,
      timeoutSameAsPing: true,
      includeHeadersFromPing: true,
    },
    authentication: {
      type: 'none',
      requestFormat: 'form-encoded',
      sameAsPing: true,
    },
    mappings: {
      mappings: defaultPostMappings,
      includeMappingsFromPing: true,
      expressIdMapping: 'ping_id',
    },
    requestBody: {
      body: JSON.stringify({
        first_name: '[f_name]',
        last_name: '[l_name]',
        email: '[email]',
        phone: '[phone]',
        address: '[address]',
        city: '[srv_city]',
        state: '[state]',
        dob: '[dob]',
        income: '[income]',
        ping_id: '[ping_id]',
      }, null, 2),
    },
    responseSettings: {
      responseFormat: 'json',
      successKey: '',
      successValue: '',
      successSearchPattern: '',
      successUseRegex: false,
      referenceIdKey: '',
      referenceIdSearchPattern: '',
      referenceIdUseRegex: false,
      priceKey: '',
      priceSearchPattern: '',
      priceUseRegex: false,
      enablePingDuringSort: false,
      redirectUrlKey: '',
      redirectUrlSearchPattern: '',
      redirectUrlUseRegex: false,
    },
    retrySettings: {
      retryAfterFailure: false,
      maxRetryCount: 0,
      timeBetweenRetries: 0,
      sameAsPing: true,
    },
  },

  portalPermissions: {
    showIvrCallInformation: false,
    showFileAttachments: false,
    showWebsiteAnalyticsData: false,
  },

  deliverySchedule: {
    monday: dayOn(),
    tuesday: dayOn(),
    wednesday: dayOn(),
    thursday: dayOn(),
    friday: dayOn(),
    saturday: dayOff(),
    sunday: dayOff(),
  },

  notifications: {
    sendNotification: false,
    recipients: [],
  },
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useDeliveryMethodStore = create<DeliveryMethodStore>()((set, get) => ({
  // ---- State ----
  config: defaultConfig,
  activePanel: { section: 'general' } as ActivePanel,
  isPingExpanded: true,
  isPostExpanded: true,
  isPanelExpanded: false,
  flyoutOpen: false,
  flyoutData: null,
  flyoutContext: 'ping' as const,

  // ---- Navigation ----
  setActivePanel: (panel) => set({ activePanel: panel }),

  togglePingExpanded: () => set((s) => ({ isPingExpanded: !s.isPingExpanded })),
  togglePostExpanded: () => set((s) => ({ isPostExpanded: !s.isPostExpanded })),
  togglePanelExpanded: () => set((s) => ({ isPanelExpanded: !s.isPanelExpanded })),

  // ---- Flyout ----
  openFlyout: (context, data) => set({ flyoutOpen: true, flyoutContext: context, flyoutData: data ?? null }),
  closeFlyout: () => set({ flyoutOpen: false, flyoutData: null }),

  // ---- General ----
  updateGeneral: (partial) =>
    set((s) => ({
      config: {
        ...s.config,
        general: { ...s.config.general, ...partial },
      },
    })),

  // ---- PING — URL Endpoint ----
  updatePingUrlEndpoint: (partial) =>
    set((s) => ({
      config: {
        ...s.config,
        ping: {
          ...s.config.ping,
          urlEndpoint: { ...s.config.ping.urlEndpoint, ...partial },
        },
      },
    })),

  addPingHeader: (header) =>
    set((s) => ({
      config: {
        ...s.config,
        ping: {
          ...s.config.ping,
          urlEndpoint: {
            ...s.config.ping.urlEndpoint,
            customHeaders: [...s.config.ping.urlEndpoint.customHeaders, header],
          },
        },
      },
    })),

  removePingHeader: (id) =>
    set((s) => ({
      config: {
        ...s.config,
        ping: {
          ...s.config.ping,
          urlEndpoint: {
            ...s.config.ping.urlEndpoint,
            customHeaders: s.config.ping.urlEndpoint.customHeaders.filter((h) => h.id !== id),
          },
        },
      },
    })),

  updatePingHeader: (id, partial) =>
    set((s) => ({
      config: {
        ...s.config,
        ping: {
          ...s.config.ping,
          urlEndpoint: {
            ...s.config.ping.urlEndpoint,
            customHeaders: s.config.ping.urlEndpoint.customHeaders.map((h) =>
              h.id === id ? { ...h, ...partial } : h,
            ),
          },
        },
      },
    })),

  // ---- PING — Authentication ----
  updatePingAuth: (partial) =>
    set((s) => ({
      config: {
        ...s.config,
        ping: {
          ...s.config.ping,
          authentication: { ...s.config.ping.authentication, ...partial },
        },
      },
    })),

  // ---- PING — Mappings ----
  addPingMapping: (mapping) =>
    set((s) => ({
      config: {
        ...s.config,
        ping: {
          ...s.config.ping,
          mappings: {
            ...s.config.ping.mappings,
            mappings: [...s.config.ping.mappings.mappings, mapping],
          },
        },
      },
    })),

  addPingMappings: (mappings) =>
    set((s) => ({
      config: {
        ...s.config,
        ping: {
          ...s.config.ping,
          mappings: {
            ...s.config.ping.mappings,
            mappings: [...s.config.ping.mappings.mappings, ...mappings],
          },
        },
      },
    })),

  replacePingMappings: (mappings) =>
    set((s) => ({
      config: {
        ...s.config,
        ping: {
          ...s.config.ping,
          mappings: {
            ...s.config.ping.mappings,
            mappings,
          },
        },
      },
    })),

  removePingMapping: (id) =>
    set((s) => ({
      config: {
        ...s.config,
        ping: {
          ...s.config.ping,
          mappings: {
            ...s.config.ping.mappings,
            mappings: s.config.ping.mappings.mappings.filter((m) => m.id !== id),
          },
        },
      },
    })),

  removePingMappings: (ids) =>
    set((s) => ({
      config: {
        ...s.config,
        ping: {
          ...s.config.ping,
          mappings: {
            ...s.config.ping.mappings,
            mappings: s.config.ping.mappings.mappings.filter((m) => !ids.includes(m.id)),
          },
        },
      },
    })),

  updatePingMapping: (id, partial) =>
    set((s) => ({
      config: {
        ...s.config,
        ping: {
          ...s.config.ping,
          mappings: {
            ...s.config.ping.mappings,
            mappings: s.config.ping.mappings.mappings.map((m) =>
              m.id === id ? { ...m, ...partial } : m,
            ),
          },
        },
      },
    })),

  // ---- PING — Request Body ----
  updatePingRequestBody: (body) =>
    set((s) => ({
      config: {
        ...s.config,
        ping: {
          ...s.config.ping,
          requestBody: { ...s.config.ping.requestBody, body },
        },
      },
    })),

  // ---- PING — Response Settings ----
  updatePingResponseSettings: (partial) =>
    set((s) => ({
      config: {
        ...s.config,
        ping: {
          ...s.config.ping,
          responseSettings: { ...s.config.ping.responseSettings, ...partial },
        },
      },
    })),

  // ---- PING — Retry Settings ----
  updatePingRetrySettings: (partial) =>
    set((s) => ({
      config: {
        ...s.config,
        ping: {
          ...s.config.ping,
          retrySettings: { ...s.config.ping.retrySettings, ...partial },
        },
      },
    })),

  // ---- POST — URL Endpoint ----
  updatePostUrlEndpoint: (partial) =>
    set((s) => ({
      config: {
        ...s.config,
        post: {
          ...s.config.post,
          urlEndpoint: { ...s.config.post.urlEndpoint, ...partial },
        },
      },
    })),

  addPostHeader: (header) =>
    set((s) => ({
      config: {
        ...s.config,
        post: {
          ...s.config.post,
          urlEndpoint: {
            ...s.config.post.urlEndpoint,
            customHeaders: [...s.config.post.urlEndpoint.customHeaders, header],
          },
        },
      },
    })),

  removePostHeader: (id) =>
    set((s) => ({
      config: {
        ...s.config,
        post: {
          ...s.config.post,
          urlEndpoint: {
            ...s.config.post.urlEndpoint,
            customHeaders: s.config.post.urlEndpoint.customHeaders.filter((h) => h.id !== id),
          },
        },
      },
    })),

  updatePostHeader: (id, partial) =>
    set((s) => ({
      config: {
        ...s.config,
        post: {
          ...s.config.post,
          urlEndpoint: {
            ...s.config.post.urlEndpoint,
            customHeaders: s.config.post.urlEndpoint.customHeaders.map((h) =>
              h.id === id ? { ...h, ...partial } : h,
            ),
          },
        },
      },
    })),

  // ---- POST — Authentication ----
  updatePostAuth: (partial) =>
    set((s) => ({
      config: {
        ...s.config,
        post: {
          ...s.config.post,
          authentication: { ...s.config.post.authentication, ...partial },
        },
      },
    })),

  // ---- POST — Mappings ----
  addPostMapping: (mapping) =>
    set((s) => ({
      config: {
        ...s.config,
        post: {
          ...s.config.post,
          mappings: {
            ...s.config.post.mappings,
            mappings: [...s.config.post.mappings.mappings, mapping],
          },
        },
      },
    })),

  addPostMappings: (mappings) =>
    set((s) => ({
      config: {
        ...s.config,
        post: {
          ...s.config.post,
          mappings: {
            ...s.config.post.mappings,
            mappings: [...s.config.post.mappings.mappings, ...mappings],
          },
        },
      },
    })),

  replacePostMappings: (mappings) =>
    set((s) => ({
      config: {
        ...s.config,
        post: {
          ...s.config.post,
          mappings: {
            ...s.config.post.mappings,
            mappings,
          },
        },
      },
    })),

  removePostMapping: (id) =>
    set((s) => ({
      config: {
        ...s.config,
        post: {
          ...s.config.post,
          mappings: {
            ...s.config.post.mappings,
            mappings: s.config.post.mappings.mappings.filter((m) => m.id !== id),
          },
        },
      },
    })),

  removePostMappings: (ids) =>
    set((s) => ({
      config: {
        ...s.config,
        post: {
          ...s.config.post,
          mappings: {
            ...s.config.post.mappings,
            mappings: s.config.post.mappings.mappings.filter((m) => !ids.includes(m.id)),
          },
        },
      },
    })),

  updatePostMappings: (partial) =>
    set((s) => ({
      config: {
        ...s.config,
        post: {
          ...s.config.post,
          mappings: { ...s.config.post.mappings, ...partial },
        },
      },
    })),

  updatePostMapping: (id, partial) =>
    set((s) => ({
      config: {
        ...s.config,
        post: {
          ...s.config.post,
          mappings: {
            ...s.config.post.mappings,
            mappings: s.config.post.mappings.mappings.map((m) =>
              m.id === id ? { ...m, ...partial } : m,
            ),
          },
        },
      },
    })),

  // ---- POST — Request Body ----
  updatePostRequestBody: (body) =>
    set((s) => ({
      config: {
        ...s.config,
        post: {
          ...s.config.post,
          requestBody: { ...s.config.post.requestBody, body },
        },
      },
    })),

  // ---- POST — Response Settings ----
  updatePostResponseSettings: (partial) =>
    set((s) => ({
      config: {
        ...s.config,
        post: {
          ...s.config.post,
          responseSettings: { ...s.config.post.responseSettings, ...partial },
        },
      },
    })),

  // ---- POST — Retry Settings ----
  updatePostRetrySettings: (partial) =>
    set((s) => ({
      config: {
        ...s.config,
        post: {
          ...s.config.post,
          retrySettings: { ...s.config.post.retrySettings, ...partial },
        },
      },
    })),

  // ---- Portal Permissions ----
  updatePortalPermissions: (partial) =>
    set((s) => ({
      config: {
        ...s.config,
        portalPermissions: { ...s.config.portalPermissions, ...partial },
      },
    })),

  // ---- Delivery Schedule ----
  updateDeliverySchedule: (day, partial) =>
    set((s) => ({
      config: {
        ...s.config,
        deliverySchedule: {
          ...s.config.deliverySchedule,
          [day]: { ...s.config.deliverySchedule[day], ...partial },
        },
      },
    })),

  // ---- Notifications ----
  updateNotifications: (partial) =>
    set((s) => ({
      config: {
        ...s.config,
        notifications: { ...s.config.notifications, ...partial },
      },
    })),

  addNotificationRecipient: (recipient) =>
    set((s) => ({
      config: {
        ...s.config,
        notifications: {
          ...s.config.notifications,
          recipients: [...s.config.notifications.recipients, recipient],
        },
      },
    })),

  removeNotificationRecipient: (id) =>
    set((s) => ({
      config: {
        ...s.config,
        notifications: {
          ...s.config.notifications,
          recipients: s.config.notifications.recipients.filter((r) => r.id !== id),
        },
      },
    })),

  // ---- Computed: mapped field tags ----
  getPingMappedFields: () => {
    const { config } = get();
    return config.ping.mappings.mappings.map((m) => ({
      id: m.id,
      name: m.name,
      mappedTo: m.mappedTo,
      source: 'ping' as const,
    }));
  },

  getPostMappedFields: () => {
    const { config } = get();

    // Start with PING fields that have useInPost enabled (if includeMappingsFromPing is on)
    const inherited: MappedFieldTag[] = config.post.mappings.includeMappingsFromPing
      ? config.ping.mappings.mappings
          .filter((m) => m.useInPost)
          .map((m) => ({
            id: m.id,
            name: m.name,
            mappedTo: m.mappedTo,
            source: 'ping' as const,
          }))
      : [];

    // Then add POST-only mappings
    const postOnly: MappedFieldTag[] = config.post.mappings.mappings.map((m) => ({
      id: m.id,
      name: m.name,
      mappedTo: m.mappedTo,
      source: 'post' as const,
    }));

    return [...inherited, ...postOnly];
  },

  // ---- Reset Store ----
  resetStore: () =>
    set({
      config: defaultConfig,
      activePanel: { section: 'general' } as ActivePanel,
      isPingExpanded: true,
      isPostExpanded: true,
      isPanelExpanded: false,
      flyoutOpen: false,
      flyoutData: null,
      flyoutContext: 'ping' as const,
    }),
}));

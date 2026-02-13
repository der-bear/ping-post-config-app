// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

export type NavigationSection =
  | 'general'
  | 'ping'
  | 'post'
  | 'portal-permissions'
  | 'delivery-schedule'
  | 'notifications';

export type PingPostTab =
  | 'url-endpoint'
  | 'authentication'
  | 'mappings'
  | 'request-body'
  | 'response-settings'
  | 'retry-settings';

export type ActivePanel =
  | { section: 'general' }
  | { section: 'ping'; tab: PingPostTab }
  | { section: 'post'; tab: PingPostTab }
  | { section: 'portal-permissions' }
  | { section: 'delivery-schedule' }
  | { section: 'notifications' };

// ---------------------------------------------------------------------------
// Shared value types
// ---------------------------------------------------------------------------

export type ContentType =
  | 'default'
  | 'application/x-www-form-urlencoded'
  | 'application/json'
  | 'application/soap+xml'
  | 'application/xml'
  | 'application/octet-stream'
  | 'text/xml'
  | 'text/plain';
export type AuthenticationType = 'none' | 'basic' | 'digest' | 'oauth2' | 'bearer' | 'custom';
export type AuthRequestFormat = 'form-encoded' | 'json';
export type OAuthGrantType = 'password' | 'client-credentials';
export type ResponseFormat = 'json' | 'xml' | 'custom';
export type HttpMethod = 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE';

// ---------------------------------------------------------------------------
// URL Endpoint
// ---------------------------------------------------------------------------

export interface CustomHeader {
  id: string;
  name: string;
  value: string;
}

export interface UrlEndpointConfig {
  productionUrl: string;
  testingUrl: string;
  contentType: ContentType;
  timeout: number;
  customHeaders: CustomHeader[];
}

export interface PostUrlEndpointConfig extends UrlEndpointConfig {
  method: HttpMethod;
  contentTypeSameAsPing: boolean;
  timeoutSameAsPing: boolean;
  includeHeadersFromPing: boolean;
}

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

export interface AuthenticationConfig {
  type: AuthenticationType;
  requestFormat: AuthRequestFormat;
  basicAuth?: { username: string; password: string };
  digestAuth?: { username: string; password: string };
  bearerToken?: { prefix: string; token: string };
  oauth2?: { tokenUrl: string; grantType: OAuthGrantType; username: string; password: string; scope: string };
}

export interface PostAuthenticationConfig extends AuthenticationConfig {
  sameAsPing: boolean;
}

// ---------------------------------------------------------------------------
// System Lead Fields (available for mapping)
// ---------------------------------------------------------------------------

export interface SystemLeadField {
  name: string;
  enumCount?: number;
}

// ---------------------------------------------------------------------------
// Field Mapping
// ---------------------------------------------------------------------------

export type MappingType =
  | 'Static Value'
  | 'Lead Field'
  | 'System Field'
  | 'Calculated Expression'
  | 'Split Text'
  | 'Text Concatenation'
  | 'Client Field'
  | 'Lead Source Field'
  | 'Function';

export interface ValueMapping {
  id: string;
  sourceValue: string;
  targetValue: string;
}

export interface FieldMapping {
  id: string;
  type: MappingType;
  name: string;
  mappedTo: string;
  defaultValue: string;
  testValue: string;
  useInPost: boolean;
  hasValueMappings: boolean;
  valueMappings: ValueMapping[];
}

// ---------------------------------------------------------------------------
// Mappings config
// ---------------------------------------------------------------------------

export interface MappingsConfig {
  mappings: FieldMapping[];
}

export interface PostMappingsConfig extends MappingsConfig {
  includeMappingsFromPing: boolean;
  expressIdMapping: string;
}

// ---------------------------------------------------------------------------
// Request Body
// ---------------------------------------------------------------------------

export interface RequestBodyConfig {
  body: string;
}

// ---------------------------------------------------------------------------
// Response Settings
// ---------------------------------------------------------------------------

export interface ResponseSettingsConfig {
  responseFormat: ResponseFormat;
  // JSON/XML mode
  successKey: string;
  successValue: string;
  // Custom/Text mode
  successSearchPattern: string;
  successUseRegex: boolean;
  // PING Reference ID
  referenceIdKey: string;
  referenceIdSearchPattern: string;
  referenceIdUseRegex: boolean;
  // Bid Price (PING) / Price (POST)
  priceKey: string;
  priceSearchPattern: string;
  priceUseRegex: boolean;
  // PING only
  enablePingDuringSort: boolean;
}

export interface PostResponseSettingsConfig extends ResponseSettingsConfig {
  // POST has Redirect URL instead of Ping Reference ID
  redirectUrlKey: string;
  redirectUrlSearchPattern: string;
  redirectUrlUseRegex: boolean;
}

// ---------------------------------------------------------------------------
// Retry Settings
// ---------------------------------------------------------------------------

export interface RetrySettingsConfig {
  retryAfterFailure: boolean;
  maxRetryCount: number;
  timeBetweenRetries: number;
}

export interface PostRetrySettingsConfig extends RetrySettingsConfig {
  sameAsPing: boolean;
}

// ---------------------------------------------------------------------------
// PING Configuration
// ---------------------------------------------------------------------------

export interface PingConfiguration {
  urlEndpoint: UrlEndpointConfig;
  authentication: AuthenticationConfig;
  mappings: MappingsConfig;
  requestBody: RequestBodyConfig;
  responseSettings: ResponseSettingsConfig;
  retrySettings: RetrySettingsConfig;
}

// ---------------------------------------------------------------------------
// POST Configuration
// ---------------------------------------------------------------------------

export interface PostConfiguration {
  urlEndpoint: PostUrlEndpointConfig;
  authentication: PostAuthenticationConfig;
  mappings: PostMappingsConfig;
  requestBody: RequestBodyConfig;
  responseSettings: PostResponseSettingsConfig;
  retrySettings: PostRetrySettingsConfig;
}

// ---------------------------------------------------------------------------
// General Settings
// ---------------------------------------------------------------------------

export interface GeneralSettings {
  description: string;
  leadType: string;
  environment: 'testing' | 'production';
  processForPhoneCalls: 'default' | 'do-not-send' | 'send';
  whenToProcessPhoneCalls: 'start' | 'end';
}

// ---------------------------------------------------------------------------
// Portal Permissions
// ---------------------------------------------------------------------------

export interface PortalPermissions {
  showIvrCallInformation: boolean;
  showFileAttachments: boolean;
  showWebsiteAnalyticsData: boolean;
}

// ---------------------------------------------------------------------------
// Delivery Schedule
// ---------------------------------------------------------------------------

export interface DaySchedule {
  enabled: boolean;
  from: string;
  to: string;
}

export interface DeliveryScheduleConfig {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export interface NotificationRecipient {
  id: string;
  user: string;
  type: 'email' | 'sms';
}

export interface NotificationsConfig {
  sendNotification: boolean;
  recipients: NotificationRecipient[];
}

// ---------------------------------------------------------------------------
// Full Delivery Method Configuration
// ---------------------------------------------------------------------------

export interface DeliveryMethodConfig {
  general: GeneralSettings;
  ping: PingConfiguration;
  post: PostConfiguration;
  portalPermissions: PortalPermissions;
  deliverySchedule: DeliveryScheduleConfig;
  notifications: NotificationsConfig;
}

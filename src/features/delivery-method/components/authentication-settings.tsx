import { useDeliveryMethodStore } from '@/features/delivery-method/store'
import { FieldGroup } from '@/components/field-group'
import { DebouncedInput } from '@/components/ui/debounced-input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  AuthenticationType,
  AuthRequestFormat,
  OAuthGrantType,
} from '@/features/delivery-method/types'

interface AuthenticationSettingsProps {
  phase: 'ping' | 'post'
}

const AUTH_TYPES: { value: AuthenticationType; label: string; disabled?: boolean }[] = [
  { value: 'none', label: 'No Authentication' },
  { value: 'basic', label: 'Basic' },
  { value: 'digest', label: 'Digest' },
  { value: 'oauth2', label: 'OAuth 2.0' },
  { value: 'bearer', label: 'Bearer Token' },
  { value: 'custom', label: 'Custom', disabled: true },
]

const AUTH_REQUEST_FORMATS: { value: AuthRequestFormat; label: string }[] = [
  { value: 'form-encoded', label: 'Form Encoded' },
  { value: 'json', label: 'JSON' },
]

const GRANT_TYPES: { value: OAuthGrantType; label: string }[] = [
  { value: 'password', label: 'Password' },
  { value: 'client-credentials', label: 'Client Credentials' },
]

function getAuthLabel(type: AuthenticationType): string {
  return AUTH_TYPES.find((t) => t.value === type)?.label ?? type
}

export function AuthenticationSettings({ phase }: AuthenticationSettingsProps) {
  const isPing = phase === 'ping'

  const pingAuth = useDeliveryMethodStore((s) => s.config.ping.authentication)
  const postAuth = useDeliveryMethodStore((s) => s.config.post.authentication)
  const updatePingAuth = useDeliveryMethodStore((s) => s.updatePingAuth)
  const updatePostAuth = useDeliveryMethodStore((s) => s.updatePostAuth)

  const auth = isPing ? pingAuth : postAuth
  const updateAuth = isPing ? updatePingAuth : updatePostAuth
  const isSameAsPing = !isPing && postAuth.sameAsPing

  const selectValue = !isPing && postAuth.sameAsPing ? 'same-as-ping' : auth.type
  const sameAsPingMeta = 'Same as PING'

  const handleAuthTypeChange = (value: string) => {
    if (!isPing && value === 'same-as-ping') {
      updatePostAuth({ sameAsPing: true })
    } else if (!isPing) {
      updatePostAuth({ sameAsPing: false, type: value as AuthenticationType })
    } else {
      updatePingAuth({ type: value as AuthenticationType })
    }
  }

  const showRequestFormat = auth.type !== 'none' && auth.type !== 'custom' && !isSameAsPing
  const showBasicFields = auth.type === 'basic' && !isSameAsPing
  const showDigestFields = auth.type === 'digest' && !isSameAsPing
  const showBearerFields = auth.type === 'bearer' && !isSameAsPing
  const showOAuth2Fields = auth.type === 'oauth2' && !isSameAsPing

  return (
    <div className="space-y-4">
      <FieldGroup label="Authentication Type">
        <Select value={selectValue} onValueChange={handleAuthTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select authentication type" />
          </SelectTrigger>
          <SelectContent>
            {AUTH_TYPES.map((at) => {
              if (!isPing && at.value === pingAuth.type) {
                return (
                  <SelectItem key="same-as-ping" value="same-as-ping" meta={sameAsPingMeta}>
                    {getAuthLabel(pingAuth.type)}
                  </SelectItem>
                )
              }
              return (
                <SelectItem key={at.value} value={at.value} disabled={at.disabled}>
                  {at.label}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </FieldGroup>

      {showRequestFormat && (
        <FieldGroup label="Authentication Request Format">
          <Select
            value={auth.requestFormat}
            onValueChange={(value: AuthRequestFormat) =>
              updateAuth({ requestFormat: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AUTH_REQUEST_FORMATS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldGroup>
      )}

      {showBasicFields && (
        <>
          <FieldGroup label="Username">
            <DebouncedInput
              value={auth.basicAuth?.username ?? ''}
              onValueCommit={(v: string) =>
                updateAuth({
                  basicAuth: { username: v, password: auth.basicAuth?.password ?? '' },
                })
              }
            />
          </FieldGroup>
          <FieldGroup label="Password">
            <DebouncedInput
              type="password"
              value={auth.basicAuth?.password ?? ''}
              onValueCommit={(v: string) =>
                updateAuth({
                  basicAuth: { username: auth.basicAuth?.username ?? '', password: v },
                })
              }
            />
          </FieldGroup>
        </>
      )}

      {showDigestFields && (
        <>
          <FieldGroup label="Username">
            <DebouncedInput
              value={auth.digestAuth?.username ?? ''}
              onValueCommit={(v: string) =>
                updateAuth({
                  digestAuth: { username: v, password: auth.digestAuth?.password ?? '' },
                })
              }
            />
          </FieldGroup>
          <FieldGroup label="Password">
            <DebouncedInput
              type="password"
              value={auth.digestAuth?.password ?? ''}
              onValueCommit={(v: string) =>
                updateAuth({
                  digestAuth: { username: auth.digestAuth?.username ?? '', password: v },
                })
              }
            />
          </FieldGroup>
        </>
      )}

      {showBearerFields && (
        <>
          <FieldGroup label="Prefix">
            <DebouncedInput
              value={auth.bearerToken?.prefix ?? ''}
              onValueCommit={(v: string) =>
                updateAuth({
                  bearerToken: { prefix: v, token: auth.bearerToken?.token ?? '' },
                })
              }
            />
          </FieldGroup>
          <FieldGroup label="Token">
            <DebouncedInput
              value={auth.bearerToken?.token ?? ''}
              onValueCommit={(v: string) =>
                updateAuth({
                  bearerToken: { prefix: auth.bearerToken?.prefix ?? '', token: v },
                })
              }
            />
          </FieldGroup>
        </>
      )}

      {showOAuth2Fields && (
        <>
          <FieldGroup label="Token URL">
            <DebouncedInput
              value={auth.oauth2?.tokenUrl ?? ''}
              onValueCommit={(v: string) =>
                updateAuth({
                  oauth2: { ...auth.oauth2!, tokenUrl: v },
                })
              }
            />
          </FieldGroup>
          <FieldGroup label="Grant Type">
            <Select
              value={auth.oauth2?.grantType ?? 'password'}
              onValueChange={(value: OAuthGrantType) =>
                updateAuth({
                  oauth2: { ...auth.oauth2!, grantType: value },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GRANT_TYPES.map((g) => (
                  <SelectItem key={g.value} value={g.value}>
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup label="Username">
            <DebouncedInput
              value={auth.oauth2?.username ?? ''}
              onValueCommit={(v: string) =>
                updateAuth({
                  oauth2: { ...auth.oauth2!, username: v },
                })
              }
            />
          </FieldGroup>
          <FieldGroup label="Password">
            <DebouncedInput
              type="password"
              value={auth.oauth2?.password ?? ''}
              onValueCommit={(v: string) =>
                updateAuth({
                  oauth2: { ...auth.oauth2!, password: v },
                })
              }
            />
          </FieldGroup>
          <FieldGroup label="Scope">
            <DebouncedInput
              value={auth.oauth2?.scope ?? ''}
              onValueCommit={(v: string) =>
                updateAuth({
                  oauth2: { ...auth.oauth2!, scope: v },
                })
              }
            />
          </FieldGroup>
        </>
      )}

      <Button className="w-full" disabled={isSameAsPing || auth.type === 'none'}>
        Test Authentication
      </Button>
    </div>
  )
}

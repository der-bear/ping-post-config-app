import { useState } from 'react'
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
  SelectSeparator,
} from '@/components/ui/select'
import type {
  AuthenticationType,
  AuthRequestFormat,
  OAuthGrantType,
} from '@/features/delivery-method/types'
import { validateUrl } from '@/lib/validation'
import { cn } from '@/lib/utils'

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

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Break inheritance when user tries to edit a field
  const handleBreakInheritance = () => {
    if (isSameAsPing) {
      // Copy PING's entire auth config to POST when breaking inheritance
      updatePostAuth({
        sameAsPing: false,
        type: pingAuth.type,
        requestFormat: pingAuth.requestFormat,
        basicAuth: pingAuth.basicAuth ? { ...pingAuth.basicAuth } : undefined,
        digestAuth: pingAuth.digestAuth ? { ...pingAuth.digestAuth } : undefined,
        bearerToken: pingAuth.bearerToken ? { ...pingAuth.bearerToken } : undefined,
        oauth2: pingAuth.oauth2 ? { ...pingAuth.oauth2 } : undefined,
      })
    }
  }

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

  // When inheriting from PING, show PING's fields (readonly)
  // When not inheriting, show POST's own fields (editable)
  const activeAuthType = isSameAsPing ? pingAuth.type : auth.type
  const showRequestFormat = activeAuthType !== 'none' && activeAuthType !== 'custom'
  const showBasicFields = activeAuthType === 'basic'
  const showDigestFields = activeAuthType === 'digest'
  const showBearerFields = activeAuthType === 'bearer'
  const showOAuth2Fields = activeAuthType === 'oauth2'

  return (
    <div className="space-y-6">
      <FieldGroup label="Authentication Type">
        <Select value={selectValue} onValueChange={handleAuthTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select authentication type" />
          </SelectTrigger>
          <SelectContent>
            {!isPing && (
              <>
                <SelectItem key="same-as-ping" value="same-as-ping" meta={sameAsPingMeta}>
                  {getAuthLabel(pingAuth.type)}
                </SelectItem>
                <SelectSeparator />
              </>
            )}
            {AUTH_TYPES.map((at) => (
              <SelectItem key={at.value} value={at.value} disabled={at.disabled}>
                {at.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldGroup>

      {showRequestFormat && (
        <FieldGroup label="Authentication Request Format">
          <Select
            value={isSameAsPing ? pingAuth.requestFormat : auth.requestFormat}
            onValueChange={(value: AuthRequestFormat) =>
              updateAuth({ requestFormat: value })
            }
            onOpenChange={(open) => open && handleBreakInheritance()}
            disabled={isSameAsPing}
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
              value={isSameAsPing ? (pingAuth.basicAuth?.username ?? '') : (auth.basicAuth?.username ?? '')}
              onValueCommit={(v: string) =>
                updateAuth({
                  basicAuth: { username: v, password: auth.basicAuth?.password ?? '' },
                })
              }
              onFocus={handleBreakInheritance}
              disabled={isSameAsPing}
            />
          </FieldGroup>
          <FieldGroup label="Password">
            <DebouncedInput
              type="password"
              value={isSameAsPing ? (pingAuth.basicAuth?.password ?? '') : (auth.basicAuth?.password ?? '')}
              onValueCommit={(v: string) =>
                updateAuth({
                  basicAuth: { username: auth.basicAuth?.username ?? '', password: v },
                })
              }
              onFocus={handleBreakInheritance}
              disabled={isSameAsPing}
            />
          </FieldGroup>
        </>
      )}

      {showDigestFields && (
        <>
          <FieldGroup label="Username">
            <DebouncedInput
              value={isSameAsPing ? (pingAuth.digestAuth?.username ?? '') : (auth.digestAuth?.username ?? '')}
              onValueCommit={(v: string) =>
                updateAuth({
                  digestAuth: { username: v, password: auth.digestAuth?.password ?? '' },
                })
              }
              onFocus={handleBreakInheritance}
              disabled={isSameAsPing}
            />
          </FieldGroup>
          <FieldGroup label="Password">
            <DebouncedInput
              type="password"
              value={isSameAsPing ? (pingAuth.digestAuth?.password ?? '') : (auth.digestAuth?.password ?? '')}
              onValueCommit={(v: string) =>
                updateAuth({
                  digestAuth: { username: auth.digestAuth?.username ?? '', password: v },
                })
              }
              onFocus={handleBreakInheritance}
              disabled={isSameAsPing}
            />
          </FieldGroup>
        </>
      )}

      {showBearerFields && (
        <>
          <FieldGroup label="Prefix">
            <DebouncedInput
              value={isSameAsPing ? (pingAuth.bearerToken?.prefix ?? '') : (auth.bearerToken?.prefix ?? '')}
              onValueCommit={(v: string) =>
                updateAuth({
                  bearerToken: { prefix: v, token: auth.bearerToken?.token ?? '' },
                })
              }
              onFocus={handleBreakInheritance}
              disabled={isSameAsPing}
            />
          </FieldGroup>
          <FieldGroup label="Token">
            <DebouncedInput
              value={isSameAsPing ? (pingAuth.bearerToken?.token ?? '') : (auth.bearerToken?.token ?? '')}
              onValueCommit={(v: string) =>
                updateAuth({
                  bearerToken: { prefix: auth.bearerToken?.prefix ?? '', token: v },
                })
              }
              onFocus={handleBreakInheritance}
              disabled={isSameAsPing}
            />
          </FieldGroup>
        </>
      )}

      {showOAuth2Fields && (
        <>
          <FieldGroup label="Token URL">
            <DebouncedInput
              value={isSameAsPing ? (pingAuth.oauth2?.tokenUrl ?? '') : (auth.oauth2?.tokenUrl ?? '')}
              onValueCommit={(v: string) =>
                updateAuth({
                  oauth2: { ...auth.oauth2!, tokenUrl: v },
                })
              }
              onBlur={(e) => {
                const error = validateUrl(e.target.value)
                setErrors(prev => ({ ...prev, tokenUrl: error }))
              }}
              onChange={() => {
                if (errors.tokenUrl) {
                  setErrors(prev => ({ ...prev, tokenUrl: '' }))
                }
              }}
              onFocus={handleBreakInheritance}
              disabled={isSameAsPing}
              className={cn(errors.tokenUrl && !isSameAsPing && 'border-destructive')}
            />
            {errors.tokenUrl && !isSameAsPing && (
              <p className="text-xs text-destructive mt-1">{errors.tokenUrl}</p>
            )}
          </FieldGroup>
          <FieldGroup label="Grant Type">
            <Select
              value={isSameAsPing ? (pingAuth.oauth2?.grantType ?? 'password') : (auth.oauth2?.grantType ?? 'password')}
              onValueChange={(value: OAuthGrantType) =>
                updateAuth({
                  oauth2: { ...auth.oauth2!, grantType: value },
                })
              }
              onOpenChange={(open) => open && handleBreakInheritance()}
              disabled={isSameAsPing}
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
              value={isSameAsPing ? (pingAuth.oauth2?.username ?? '') : (auth.oauth2?.username ?? '')}
              onValueCommit={(v: string) =>
                updateAuth({
                  oauth2: { ...auth.oauth2!, username: v },
                })
              }
              onFocus={handleBreakInheritance}
              disabled={isSameAsPing}
            />
          </FieldGroup>
          <FieldGroup label="Password">
            <DebouncedInput
              type="password"
              value={isSameAsPing ? (pingAuth.oauth2?.password ?? '') : (auth.oauth2?.password ?? '')}
              onValueCommit={(v: string) =>
                updateAuth({
                  oauth2: { ...auth.oauth2!, password: v },
                })
              }
              onFocus={handleBreakInheritance}
              disabled={isSameAsPing}
            />
          </FieldGroup>
          <FieldGroup label="Scope">
            <DebouncedInput
              value={isSameAsPing ? (pingAuth.oauth2?.scope ?? '') : (auth.oauth2?.scope ?? '')}
              onValueCommit={(v: string) =>
                updateAuth({
                  oauth2: { ...auth.oauth2!, scope: v },
                })
              }
              onFocus={handleBreakInheritance}
              disabled={isSameAsPing}
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

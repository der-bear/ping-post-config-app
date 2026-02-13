import { useDeliveryMethodStore } from '@/features/delivery-method/store'
import { FieldGroup } from '@/components/field-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface RetrySettingsProps {
  phase: 'ping' | 'post'
}

const RETRY_COUNTS = [
  { value: '0', label: '0' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '5', label: '5' },
  { value: '10', label: '10' },
]

const TIME_BETWEEN_RETRIES = [
  { value: '0', label: '0 seconds' },
  { value: '5', label: '5 seconds' },
  { value: '10', label: '10 seconds' },
  { value: '30', label: '30 seconds' },
  { value: '60', label: '60 seconds' },
]

export function RetrySettings({ phase }: RetrySettingsProps) {
  const isPing = phase === 'ping'

  const pingRetry = useDeliveryMethodStore((s) => s.config.ping.retrySettings)
  const postRetry = useDeliveryMethodStore((s) => s.config.post.retrySettings)
  const updatePingRetrySettings = useDeliveryMethodStore((s) => s.updatePingRetrySettings)
  const updatePostRetrySettings = useDeliveryMethodStore((s) => s.updatePostRetrySettings)

  const retry = isPing ? pingRetry : postRetry
  const isSameAsPing = !isPing && postRetry.sameAsPing

  // For POST with sameAsPing, show "Same as PING" in all selects
  const retryValue = isSameAsPing ? 'same-as-ping' : (retry.retryAfterFailure ? 'yes' : 'no')
  const countValue = isSameAsPing ? 'same-as-ping' : String(retry.maxRetryCount)
  const timeValue = isSameAsPing ? 'same-as-ping' : String(retry.timeBetweenRetries)

  const sameAsPingMeta = 'Same as PING'

  const handleRetryChange = (value: string) => {
    if (!isPing && value === 'same-as-ping') {
      updatePostRetrySettings({ sameAsPing: true })
    } else if (!isPing) {
      updatePostRetrySettings({ sameAsPing: false, retryAfterFailure: value === 'yes' })
    } else {
      updatePingRetrySettings({ retryAfterFailure: value === 'yes' })
    }
  }

  const handleCountChange = (value: string) => {
    if (!isPing && value === 'same-as-ping') {
      updatePostRetrySettings({ sameAsPing: true })
    } else if (!isPing) {
      updatePostRetrySettings({ sameAsPing: false, maxRetryCount: Number(value) })
    } else {
      updatePingRetrySettings({ maxRetryCount: Number(value) })
    }
  }

  const handleTimeChange = (value: string) => {
    if (!isPing && value === 'same-as-ping') {
      updatePostRetrySettings({ sameAsPing: true })
    } else if (!isPing) {
      updatePostRetrySettings({ sameAsPing: false, timeBetweenRetries: Number(value) })
    } else {
      updatePingRetrySettings({ timeBetweenRetries: Number(value) })
    }
  }

  return (
    <div className="space-y-4">
      <FieldGroup label="Retry After Failure">
        <Select value={retryValue} onValueChange={handleRetryChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(!isPing && pingRetry.retryAfterFailure)
              ? <SelectItem value="same-as-ping" meta={sameAsPingMeta}>{pingRetry.retryAfterFailure ? 'Yes' : 'No'}</SelectItem>
              : <SelectItem value="yes">Yes</SelectItem>
            }
            {(!isPing && !pingRetry.retryAfterFailure)
              ? <SelectItem value="same-as-ping" meta={sameAsPingMeta}>{pingRetry.retryAfterFailure ? 'Yes' : 'No'}</SelectItem>
              : <SelectItem value="no">No</SelectItem>
            }
          </SelectContent>
        </Select>
      </FieldGroup>

      <FieldGroup label="Max Retry Count">
        <Select
          value={countValue}
          onValueChange={handleCountChange}
          disabled={!isSameAsPing && !retry.retryAfterFailure}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RETRY_COUNTS.map((opt) => {
              if (!isPing && opt.value === String(pingRetry.maxRetryCount)) {
                return (
                  <SelectItem key="same-as-ping" value="same-as-ping" meta={sameAsPingMeta}>
                    {opt.label}
                  </SelectItem>
                )
              }
              return (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </FieldGroup>

      <FieldGroup label="Time Between Retries">
        <Select
          value={timeValue}
          onValueChange={handleTimeChange}
          disabled={!isSameAsPing && !retry.retryAfterFailure}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_BETWEEN_RETRIES.map((opt) => {
              if (!isPing && opt.value === String(pingRetry.timeBetweenRetries)) {
                return (
                  <SelectItem key="same-as-ping" value="same-as-ping" meta={sameAsPingMeta}>
                    {opt.label}
                  </SelectItem>
                )
              }
              return (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </FieldGroup>
    </div>
  )
}

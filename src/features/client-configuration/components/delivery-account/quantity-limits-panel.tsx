import { Input, Separator, SwitchField } from '@/components/ui'

import type { ClientConfiguration, LimitSetting } from '../../types'

type QuantityLimits = ClientConfiguration['deliveryAccount']['quantityLimits']
type LimitKey = keyof QuantityLimits

interface QuantityLimitsPanelProps {
  value: QuantityLimits
  onChange: (partial: Partial<QuantityLimits>) => void
}

const limits: Array<{ key: LimitKey; label: string; description: string }> = [
  { key: 'total', label: 'Total Limit', description: 'Maximum leads that may be delivered for this account.' },
  { key: 'hourly', label: 'Hourly Limit', description: 'Maximum leads delivered within 60 minutes.' },
  { key: 'daily', label: 'Daily Limit', description: 'Maximum leads delivered in a single day.' },
  { key: 'weekly', label: 'Weekly Limit', description: 'Maximum leads delivered in a calendar week.' },
  { key: 'monthly', label: 'Monthly Limit', description: 'Maximum leads delivered in a calendar month.' },
  { key: 'yearly', label: 'Yearly Limit', description: 'Maximum leads delivered in a calendar year.' },
]

export function QuantityLimitsPanel({ value, onChange }: QuantityLimitsPanelProps) {
  const update = (key: LimitKey, partial: Partial<LimitSetting>) => {
    onChange({ [key]: { ...value[key], ...partial } })
  }

  return (
    <div className="flex flex-col gap-4">
      {limits.map((limit, index) => (
        <div key={limit.key} className="contents">
          {index > 0 && <Separator />}
          <SwitchField
            label={limit.label}
            description={limit.description}
            checked={value[limit.key].enabled}
            onCheckedChange={(enabled) => update(limit.key, { enabled })}
          >
            <Input
              aria-label={`${limit.label} Value`}
              type="number"
              min="0"
              value={value[limit.key].value}
              onChange={(event) => update(limit.key, { value: Number(event.target.value) || 0 })}
            />
          </SwitchField>
        </div>
      ))}
    </div>
  )
}

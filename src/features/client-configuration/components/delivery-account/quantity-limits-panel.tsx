import { Input, Separator, SwitchField } from '@/components/ui'

import type { ClientConfiguration, LimitSetting } from '../../types'

type QuantityLimits = ClientConfiguration['deliveryAccount']['quantityLimits']
type LimitKey = keyof QuantityLimits

interface QuantityLimitsPanelProps {
  value: QuantityLimits
  onChange: (partial: Partial<QuantityLimits>) => void
}

const limits: Array<{ key: LimitKey; label: string; description: string }> = [
  { key: 'hourly', label: 'Hour Limit', description: 'The amount of leads that can be received within 60 minutes' },
  { key: 'daily', label: 'Daily Limit', description: 'The amount of leads that can be received in a single day' },
  { key: 'weekly', label: 'Weekly Limit', description: 'The amount of leads that can be received in a single week' },
  { key: 'monthly', label: 'Monthly Limit', description: 'The amount of leads that can be received in a single month' },
]

export function QuantityLimitsPanel({ value, onChange }: QuantityLimitsPanelProps) {
  const update = (key: LimitKey, partial: Partial<LimitSetting>) => {
    onChange({ [key]: { ...value[key], ...partial } })
  }

  return (
    <div className="flex flex-col gap-4">
      {limits.map((limit, index) => (
        <div key={limit.key} className="contents">
          {index > 0 && <Separator className="my-0" />}
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

import { useCampaignStore } from '../store'
import { SwitchField } from '@/components/ui'
import { Input } from '@/components/ui/input'

export function QuantityLimits() {
  const limits = useCampaignStore((s) => s.config.quantityLimits)
  const update = useCampaignStore((s) => s.updateQuantityLimits)

  return (
    <div className="space-y-5">
      <SwitchField
        label="Hour Limit"
        description="The amount of leads that can be received within 60 minutes"
        checked={limits.hourLimit.enabled}
        onCheckedChange={(v) => update({ hourLimit: { ...limits.hourLimit, enabled: v } })}
      >
        <Input
          value={limits.hourLimit.value}
          onChange={(e) => update({ hourLimit: { ...limits.hourLimit, value: e.target.value } })}
        />
      </SwitchField>

      <SwitchField
        label="Daily Limit"
        description="The amount of leads that can be received in a single day"
        checked={limits.dailyLimit.enabled}
        onCheckedChange={(v) => update({ dailyLimit: { ...limits.dailyLimit, enabled: v } })}
      >
        <Input
          value={limits.dailyLimit.value}
          onChange={(e) => update({ dailyLimit: { ...limits.dailyLimit, value: e.target.value } })}
        />
      </SwitchField>

      <SwitchField
        label="Monthly Limit"
        description="The amount of leads that can be received in a single month"
        checked={limits.monthlyLimit.enabled}
        onCheckedChange={(v) => update({ monthlyLimit: { ...limits.monthlyLimit, enabled: v } })}
      >
        <Input
          value={limits.monthlyLimit.value}
          onChange={(e) => update({ monthlyLimit: { ...limits.monthlyLimit, value: e.target.value } })}
        />
      </SwitchField>
    </div>
  )
}

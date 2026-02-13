import { useDeliveryMethodStore } from '@/features/delivery-method/store'
import { FieldGroup, SectionHeading } from '@/components/field-group'
import { DebouncedInput } from '@/components/ui/debounced-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

const LEAD_TYPES = [
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'auto-insurance', label: 'Auto Insurance' },
  { value: 'home-insurance', label: 'Home Insurance' },
  { value: 'health-insurance', label: 'Health Insurance' },
  { value: 'life-insurance', label: 'Life Insurance' },
  { value: 'personal-loan', label: 'Personal Loan' },
  { value: 'education', label: 'Education' },
]

const ENVIRONMENTS = [
  { value: 'testing', label: 'Testing' },
  { value: 'production', label: 'Production' },
]

const PROCESS_FOR_PHONE_CALLS = [
  { value: 'default', label: 'Default' },
  { value: 'do-not-send', label: 'Do Not Send' },
  { value: 'send', label: 'Send' },
]

const WHEN_TO_PROCESS = [
  { value: 'start', label: 'Start of Call' },
  { value: 'end', label: 'End of Call' },
]

export function GeneralSettings() {
  const general = useDeliveryMethodStore((s) => s.config.general)
  const updateGeneral = useDeliveryMethodStore((s) => s.updateGeneral)

  return (
    <div className="space-y-6">
      <FieldGroup label="Description">
        <DebouncedInput
          value={general.description}
          onValueCommit={(v: string) => updateGeneral({ description: v })}
          placeholder="Enter a description..."
        />
      </FieldGroup>

      <FieldGroup label="Lead Type">
        <Select
          value={general.leadType}
          disabled
        >
          <SelectTrigger disabled>
            <SelectValue placeholder="Select lead type" />
          </SelectTrigger>
          <SelectContent>
            {LEAD_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldGroup>

      <FieldGroup label="Environment">
        <Select
          value={general.environment}
          onValueChange={(value: 'testing' | 'production') =>
            updateGeneral({ environment: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select environment" />
          </SelectTrigger>
          <SelectContent>
            {ENVIRONMENTS.map((env) => (
              <SelectItem key={env.value} value={env.value}>
                {env.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldGroup>

      <Separator />

      <SectionHeading title="Phone Call Settings" />

      <FieldGroup label="Process for Phone Calls">
        <Select
          value={general.processForPhoneCalls}
          onValueChange={(value: 'default' | 'do-not-send' | 'send') =>
            updateGeneral({ processForPhoneCalls: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            {PROCESS_FOR_PHONE_CALLS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldGroup>

      <FieldGroup label="When to Process with Phone Calls">
        <Select
          value={general.whenToProcessPhoneCalls}
          onValueChange={(value: 'start' | 'end') =>
            updateGeneral({ whenToProcessPhoneCalls: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            {WHEN_TO_PROCESS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldGroup>
    </div>
  )
}

import { GripVertical } from 'lucide-react'
import { useCampaignStore } from '../store'
import { Button } from '@/components/ui/button'
import { SectionHeading, Separator } from '@/components/ui'

export function IntegrationsManage() {
  const integrations = useCampaignStore((s) => s.config.integrations)
  const addIntegration = useCampaignStore((s) => s.addIntegration)
  const removeIntegration = useCampaignStore((s) => s.removeIntegration)

  return (
    <div className="flex flex-col gap-4">
      {/* Added integrations */}
      <div className="flex flex-col gap-2">
        <SectionHeading title="Added" />
        <Separator className="my-0" />
      </div>
      {integrations.added.length === 0 ? (
        <p className="text-xs leading-4 text-muted-foreground">No integrations added yet.</p>
      ) : (
        <div className="flex flex-col">
          {integrations.added.map((item) => (
            <div key={item.id} className="group flex items-center gap-3 py-2">
              <button
                type="button"
                className="shrink-0 inline-flex h-5 w-5 items-center justify-center text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
                aria-label={`Reorder ${item.name}`}
              >
                <GripVertical className="size-4" />
              </button>
              <div className="flex flex-1 items-center gap-3 min-w-0">
                {item.icon && <span className="text-lg">{item.icon}</span>}
                <span className="text-sm font-normal leading-5 truncate">{item.name}</span>
              </div>
              <button
                type="button"
                onClick={() => removeIntegration(item.id)}
                className="text-sm leading-5 text-destructive hover:underline transition-colors"
              >
                Remove
              </button>
              <Button variant="secondary" size="sm">
                Edit
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Available integrations */}
      <div className="flex flex-col gap-2">
        <SectionHeading title="Other Available" />
        <Separator className="my-0" />
      </div>
      {integrations.available.length === 0 ? (
        <p className="text-xs leading-4 text-muted-foreground">No more integrations available.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {integrations.available.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                {item.icon && <span className="text-lg">{item.icon}</span>}
                <span className="text-sm font-normal leading-5">{item.name}</span>
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={() => addIntegration(item.id)}
              >
                Add
              </Button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs leading-4 text-muted-foreground mt-2">
        <span className="font-semibold">Note:</span> Adding too many integrations may delay lead processing.
      </p>
    </div>
  )
}

import { useCampaignStore } from '../store'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/ui'

export function IntegrationsManage() {
  const integrations = useCampaignStore((s) => s.config.integrations)
  const addIntegration = useCampaignStore((s) => s.addIntegration)
  const removeIntegration = useCampaignStore((s) => s.removeIntegration)

  return (
    <div className="space-y-5">
      {/* Added integrations */}
      <SectionHeading title="Added" />
      {integrations.added.length === 0 ? (
        <p className="text-sm text-muted-foreground">No integrations added yet.</p>
      ) : (
        <div className="space-y-2">
          {integrations.added.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center gap-3">
                {item.icon && <span className="text-lg">{item.icon}</span>}
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeIntegration(item.id)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Available integrations */}
      <SectionHeading title="Other Available" />
      {integrations.available.length === 0 ? (
        <p className="text-sm text-muted-foreground">No more integrations available.</p>
      ) : (
        <div className="space-y-2">
          {integrations.available.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                {item.icon && <span className="text-lg">{item.icon}</span>}
                <span className="text-sm">{item.name}</span>
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
    </div>
  )
}

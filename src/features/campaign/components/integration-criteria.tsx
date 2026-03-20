import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function IntegrationCriteria() {
  return (
    <div className="space-y-5">
      <Button className="w-full justify-between" variant="default">
        Add integration criteria
        <ChevronDown className="size-4" />
      </Button>

      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
        No integration criteria configured.
      </div>
    </div>
  )
}

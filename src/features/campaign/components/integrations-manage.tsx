import { GripVertical } from 'lucide-react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useCampaignStore } from '../store'
import { Button } from '@/components/ui/button'
import { SectionHeading, Separator } from '@/components/ui'
import type { Integration } from '../types'

function IntegrationIcon(_props: { item: Integration }) {
  return (
    <div
      aria-hidden="true"
      className="shrink-0 size-12 rounded-[4px] border border-border bg-muted"
    />
  )
}

function AddedRow({
  item,
  onRemove,
}: {
  item: Integration
  onRemove: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-3 py-2"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="shrink-0 inline-flex h-5 w-5 items-center justify-center text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
        aria-label={`Reorder ${item.name}`}
      >
        <GripVertical className="size-4" />
      </button>
      <IntegrationIcon item={item} />
      <div className="flex flex-1 flex-col min-w-0">
        <span className="text-sm font-semibold leading-5 truncate text-foreground">{item.name}</span>
        {item.subtitle && (
          <span className="text-xs leading-4 text-muted-foreground truncate">{item.subtitle}</span>
        )}
      </div>
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="text-sm leading-5 text-destructive hover:underline transition-colors"
      >
        Remove
      </button>
      <Button variant="secondary" size="sm">
        Edit
      </Button>
    </div>
  )
}

export function IntegrationsManage() {
  const integrations = useCampaignStore((s) => s.config.integrations)
  const addIntegration = useCampaignStore((s) => s.addIntegration)
  const removeIntegration = useCampaignStore((s) => s.removeIntegration)
  const reorderAddedIntegrations = useCampaignStore((s) => s.reorderAddedIntegrations)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    reorderAddedIntegrations(String(active.id), String(over.id))
  }

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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={integrations.added.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col">
              {integrations.added.map((item) => (
                <AddedRow key={item.id} item={item} onRemove={removeIntegration} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Available integrations */}
      <div className="flex flex-col gap-2">
        <SectionHeading title="Other Available" />
        <Separator className="my-0" />
      </div>
      {integrations.available.length === 0 ? (
        <p className="text-xs leading-4 text-muted-foreground">No more integrations available.</p>
      ) : (
        <div className="flex flex-col">
          {integrations.available.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-2">
              <IntegrationIcon item={item} />
              <div className="flex flex-1 flex-col min-w-0">
                <span className="text-sm font-semibold leading-5 truncate text-foreground">{item.name}</span>
                {item.subtitle && (
                  <span className="text-xs leading-4 text-muted-foreground truncate">{item.subtitle}</span>
                )}
              </div>
              <Button variant="default" size="sm" onClick={() => addIntegration(item.id)}>
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

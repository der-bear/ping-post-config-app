import { useMemo, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogPanelHeader,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { SavingOverlay } from '@/components/ui/saving-overlay'
import { NavGroup, NavItem, PanelSidebar } from '@/components/panel-layout'
import { cn } from '@/lib/utils'

export interface WizardStep {
  id: string
  label: string
  content: ReactNode
  groupId?: string
  groupLabel?: string
  disabled?: boolean
}

interface WizardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  steps: WizardStep[]
  activeStep: number
  onStepChange: (step: number) => void
  onNext?: (fromStepIndex: number, toStepIndex: number) => void
  onCancel: () => void
  onComplete: () => void
  completeLabel?: string
  completeVariant?: 'default' | 'success'
  showSidebarNav?: boolean
  invalidStepIds?: string[]
  expandedGroupIds?: string[]
  isSaving?: boolean
  savingMessage?: string
  width?: string
}

export function WizardDialog({
  open,
  onOpenChange,
  title,
  steps,
  activeStep,
  onStepChange,
  onNext,
  onCancel,
  onComplete,
  completeLabel = 'Create',
  completeVariant = 'default',
  showSidebarNav = true,
  invalidStepIds = [],
  expandedGroupIds = [],
  isSaving = false,
  savingMessage = 'Saving...',
  width = '791px',
}: WizardDialogProps) {
  let previousStepIndex = -1
  for (let index = activeStep - 1; index >= 0; index -= 1) {
    if (!steps[index]?.disabled) {
      previousStepIndex = index
      break
    }
  }
  const nextStepIndex = steps.findIndex((step, index) => index > activeStep && !step.disabled)
  const isFirstStep = previousStepIndex < 0
  const isLastStep = nextStepIndex < 0
  const currentStep = steps[activeStep]
  const [groupExpandedById, setGroupExpandedById] = useState<Record<string, boolean>>({})

  const handleStepChange = (nextStep: number, options?: { validate?: boolean }) => {
    if (nextStep < 0 || nextStep >= steps.length || steps[nextStep]?.disabled) return

    if (options?.validate) {
      onNext?.(activeStep, nextStep)
    }

    const nextGroupId = steps[nextStep]?.groupId
    if (nextGroupId) {
      setGroupExpandedById((current) => ({ ...current, [nextGroupId]: true }))
    }

    onStepChange(nextStep)
  }
  const groupedNav = useMemo(() => {
    const items: Array<
      | { type: 'step'; step: WizardStep; index: number }
      | { type: 'group'; id: string; label: string; steps: Array<{ step: WizardStep; index: number }> }
    > = []

    for (const [index, step] of steps.entries()) {
      if (!step.groupId || !step.groupLabel) {
        items.push({ type: 'step', step, index })
        continue
      }

      const lastItem = items.at(-1)
      if (lastItem?.type === 'group' && lastItem.id === step.groupId) {
        lastItem.steps.push({ step, index })
      } else {
        items.push({
          type: 'group',
          id: step.groupId,
          label: step.groupLabel,
          steps: [{ step, index }],
        })
      }
    }

    return items
  }, [steps])
  const toggleGroup = (groupId: string, isExpanded: boolean) => {
    setGroupExpandedById((current) => ({ ...current, [groupId]: !isExpanded }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        className="p-0 gap-0 flex flex-col max-h-[80vh] top-[10vh] translate-y-0 overflow-hidden"
        style={{ maxWidth: width }}
      >
        <DialogPanelHeader
          title={title}
          onClose={onCancel}
        />

        <div
          className={cn(
            'flex flex-1 min-h-0 gap-6 overflow-hidden',
            showSidebarNav ? 'px-4 pt-4 pb-8' : 'px-6 pt-6 pb-8',
          )}
        >
          {/* Sidebar navigation — list-group style */}
          {showSidebarNav && (
            <PanelSidebar className="w-[216px] shrink-0 self-start overflow-hidden rounded-sm border border-border">
              {groupedNav.map((item) => {
                if (item.type === 'step') {
                  return (
                    <NavItem
                      key={item.step.id}
                      label={item.step.label}
                      active={item.index === activeStep}
                      disabled={item.step.disabled}
                      invalid={invalidStepIds.includes(item.step.id)}
                      onClick={() => handleStepChange(item.index)}
                    />
                  )
                }

                const isActiveGroup = item.steps.some(({ index }) => index === activeStep)
                const isDisabledGroup = item.steps.every(({ step }) => step.disabled)
                const isExpanded =
                  !isDisabledGroup
                  && (groupExpandedById[item.id] ?? (isActiveGroup || expandedGroupIds.includes(item.id)))
                const isInvalidGroup = item.steps.some(({ step }) => invalidStepIds.includes(step.id))

                return (
                  <NavGroup
                    key={item.id}
                    label={item.label}
                    expanded={isExpanded}
                    onToggle={() => toggleGroup(item.id, isExpanded)}
                    active={isActiveGroup}
                    invalid={isInvalidGroup}
                    disabled={isDisabledGroup}
                  >
                    {item.steps.map(({ step, index }) => (
                      <NavItem
                        key={step.id}
                        label={step.label}
                        active={index === activeStep}
                        disabled={step.disabled}
                        invalid={invalidStepIds.includes(step.id)}
                        onClick={() => handleStepChange(index)}
                        indented
                      />
                    ))}
                  </NavGroup>
                )
              })}
            </PanelSidebar>
          )}

          {/* Step content — vertical scroll when content exceeds modal height */}
          <div className="relative flex-1 min-w-0 overflow-y-auto pr-1">
            {currentStep?.content}
            <SavingOverlay open={isSaving} message={savingMessage} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-2 px-4 py-3 border-t border-border">
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          {!isFirstStep && (
            <Button
              variant="outline"
              onClick={() => handleStepChange(previousStepIndex)}
              disabled={isSaving}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
          )}
          {isLastStep ? (
            <Button
              variant={completeVariant === 'success' ? 'success' : 'default'}
              onClick={onComplete}
              disabled={isSaving}
            >
              {completeLabel}
            </Button>
          ) : (
            <Button
              onClick={() => handleStepChange(nextStepIndex, { validate: true })}
              disabled={isSaving}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          )}
        </div>

      </DialogContent>
    </Dialog>
  )
}

import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogPanelHeader,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export interface WizardStep {
  id: string
  label: string
  content: ReactNode
}

interface WizardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  steps: WizardStep[]
  activeStep: number
  onStepChange: (step: number) => void
  onCancel: () => void
  onComplete: () => void
  completeLabel?: string
  completeVariant?: 'default' | 'success'
  showSidebarNav?: boolean
  canAdvance?: boolean
  width?: string
}

export function WizardDialog({
  open,
  onOpenChange,
  title,
  steps,
  activeStep,
  onStepChange,
  onCancel,
  onComplete,
  completeLabel = 'Create',
  completeVariant = 'default',
  showSidebarNav = true,
  canAdvance = true,
  width = '791px',
}: WizardDialogProps) {
  const isFirstStep = activeStep === 0
  const isLastStep = activeStep === steps.length - 1
  const currentStep = steps[activeStep]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        className="p-0 gap-0 overflow-hidden"
        style={{ maxWidth: width }}
      >
        <DialogPanelHeader
          title={title}
          onClose={onCancel}
        />

        <div className="flex flex-1 min-h-0 gap-6 px-4 pt-4 pb-8">
          {/* Sidebar navigation — list-group style */}
          {showSidebarNav && (
            <nav className="w-[216px] shrink-0 self-start overflow-hidden rounded-sm border border-border">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onStepChange(index)}
                  className={cn(
                    'w-full text-left px-4 py-3 text-sm leading-5 transition-colors duration-75',
                    index > 0 && 'border-t border-border',
                    index === activeStep
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-sidebar-hover',
                  )}
                >
                  {step.label}
                </button>
              ))}
            </nav>
          )}

          {/* Step content */}
          <div className="flex-1 overflow-y-auto">
            {currentStep?.content}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          {!isFirstStep && (
            <Button variant="outline" onClick={() => onStepChange(activeStep - 1)}>
              <ChevronLeft className="size-4" />
              Previous
            </Button>
          )}
          {isLastStep ? (
            <Button
              variant={completeVariant === 'success' ? 'success' : 'default'}
              onClick={onComplete}
              disabled={!canAdvance}
            >
              {completeLabel}
            </Button>
          ) : (
            <Button
              onClick={() => onStepChange(activeStep + 1)}
              disabled={!canAdvance}
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

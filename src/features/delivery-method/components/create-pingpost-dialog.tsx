import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FieldGroup } from '@/components/field-group'
import { DebouncedInput } from '@/components/ui/debounced-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

const LEAD_TYPES = [
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'auto-insurance', label: 'Auto Insurance' },
  { value: 'home-insurance', label: 'Home Insurance' },
  { value: 'health-insurance', label: 'Health Insurance' },
  { value: 'life-insurance', label: 'Life Insurance' },
  { value: 'personal-loan', label: 'Personal Loan' },
  { value: 'education', label: 'Education' },
]

interface CreatePingPostDialogProps {
  open: boolean
  onClose: () => void
  onCreate: (data: { description: string; leadType: string }) => void
}

export function CreatePingPostDialog({ open, onClose, onCreate }: CreatePingPostDialogProps) {
  const [description, setDescription] = useState('')
  const [leadType, setLeadType] = useState('')

  const canCreate = description.trim() !== '' && leadType !== ''

  const handleCreate = () => {
    if (canCreate) {
      onCreate({ description: description.trim(), leadType })
      // Reset form
      setDescription('')
      setLeadType('')
    }
  }

  const handleCancel = () => {
    setDescription('')
    setLeadType('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Create Ping/Post Delivery Method</DialogTitle>
          <DialogDescription>
            Configure a two-phase delivery: PING for bidding evaluation, followed by POST for full
            lead delivery.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <FieldGroup label="Description" required>
            <DebouncedInput
              value={description}
              onValueCommit={setDescription}
              placeholder="e.g., Acme Corp Mortgage Ping/Post"
              autoFocus
            />
          </FieldGroup>

          <FieldGroup label="Lead Type" required>
            <Select value={leadType} onValueChange={setLeadType}>
              <SelectTrigger>
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

          <p className="text-xs text-muted-foreground">
            Field mappings and settings depend on the lead field schema of the selected lead type.
          </p>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!canCreate}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

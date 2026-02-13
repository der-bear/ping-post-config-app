import { useState } from 'react'
import { Search } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogPanelHeader } from '@/components/ui/dialog'
import { MethodSelectorCard } from '@/components/ui/method-selector-card'
import { DebouncedInput } from '@/components/ui/debounced-input'
import { Input } from '@/components/ui/input'
import { FieldGroup } from '@/components/field-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Building2,
  Mail,
  Webhook,
  Repeat,
  FileSpreadsheet,
  MailPlus,
  Upload,
  MessageSquare,
  Package,
} from 'lucide-react'

interface CreateDeliveryMethodModalProps {
  open: boolean
  onClose: () => void
  onCreate: (data: { method: string; description: string; leadType: string }) => void
}

const BASIC_METHODS = [
  {
    id: 'lead-portal',
    icon: <Building2 />,
    title: 'Lead Portal',
    description:
      'Delivers leads directly to the client portal where buyers can view, manage, and process their leads.',
  },
  {
    id: 'email',
    icon: <Mail />,
    title: 'Email',
    description:
      'Sends lead details directly in the body of a customizable email template, typically including a link to the client portal.',
  },
  {
    id: 'http-webhook',
    icon: <Webhook />,
    title: 'HTTP Webhook',
    description:
      'Delivers leads to external systems via HTTP POST or GET using JSON or XML payloads. Supports real-time delivery and custom endpoints.',
  },
]

const ADVANCED_METHODS = [
  {
    id: 'ping-post',
    icon: <Repeat />,
    title: 'Ping/Post',
    description:
      'Sends partial lead data for bidding evaluation, followed by full lead delivery if pricing or acceptance criteria are met.',
  },
  {
    id: 'csv-attachment',
    icon: <FileSpreadsheet />,
    title: 'CSV Attachment',
    description: 'Delivers each lead as an individual CSV file attached to an email message.',
  },
  {
    id: 'batch-email',
    icon: <MailPlus />,
    title: 'Batch Email Delivery',
    description:
      'Aggregates all leads received within a defined timeframe into a single CSV or Excel file and delivers it via email on a schedule.',
  },
  {
    id: 'ftp',
    icon: <Upload />,
    title: 'FTP',
    description:
      'Sends lead details directly in the body of a customizable email template, typically including a link to the client portal.',
  },
  {
    id: 'sms',
    icon: <MessageSquare />,
    title: 'SMS Notification',
    description:
      'Sends lead notifications via SMS using a configurable message template that includes a link to the client portal.',
  },
  {
    id: 'salesexec',
    icon: <Package />,
    title: 'SalesExec Integration',
    description:
      'Provides bidirectional, real-time delivery within SalesExec, including lead status updates, workflow events, and file synchronization.',
  },
]

const LEAD_TYPES = [
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'auto-insurance', label: 'Auto Insurance' },
  { value: 'home-insurance', label: 'Home Insurance' },
  { value: 'health-insurance', label: 'Health Insurance' },
  { value: 'life-insurance', label: 'Life Insurance' },
  { value: 'personal-loan', label: 'Personal Loan' },
  { value: 'education', label: 'Education' },
]

export function CreateDeliveryMethodModal({
  open,
  onClose,
  onCreate,
}: CreateDeliveryMethodModalProps) {
  const [step, setStep] = useState<'select' | 'configure'>('select')
  const [selectedMethod, setSelectedMethod] = useState<string | null>('ping-post')
  const [searchQuery, setSearchQuery] = useState('')
  const [description, setDescription] = useState('')
  const [leadType, setLeadType] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const filterMethods = (methods: typeof BASIC_METHODS) => {
    if (!searchQuery) return methods
    return methods.filter(
      (method) =>
        method.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        method.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }

  const filteredBasic = filterMethods(BASIC_METHODS)
  const filteredAdvanced = filterMethods(ADVANCED_METHODS)

  const selectedMethodData = [...BASIC_METHODS, ...ADVANCED_METHODS].find(
    (m) => m.id === selectedMethod,
  )

  const handleContinue = () => {
    if (!selectedMethod) {
      setErrors({ method: 'Select delivery method to continue' })
      return
    }
    if (selectedMethod === 'ping-post') {
      setErrors({})
      setStep('configure')
    }
  }

  const handleBack = () => {
    setStep('select')
    setDescription('')
    setLeadType('')
    setErrors({})
  }

  const handleCreate = () => {
    const newErrors: Record<string, string> = {}

    if (!leadType) {
      newErrors.leadType = 'Select lead type for field mappings'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    if (selectedMethod) {
      onCreate({
        method: selectedMethod,
        description: description.trim(),
        leadType,
      })
      // Reset state
      setStep('select')
      setSelectedMethod('ping-post')
      setDescription('')
      setLeadType('')
      setSearchQuery('')
      setErrors({})
    }
  }

  const handleClose = () => {
    setStep('select')
    setSelectedMethod('ping-post')
    setDescription('')
    setLeadType('')
    setSearchQuery('')
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && (step === 'select' ? handleClose() : handleBack())}>
      <DialogContent
        className={cn(
          'p-0 gap-0 overflow-hidden shadow-[0px_16px_32px_-8px_rgba(0,0,0,0.1)]',
          step === 'select' ? 'max-w-[95vw] sm:max-w-[884px]' : 'max-w-[95vw] sm:max-w-[480px]'
        )}
        showClose={false}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogPanelHeader
          title={step === 'select' ? 'Create Delivery Method' : 'Create Delivery Method - Ping/Post'}
          showClose={true}
          onClose={step === 'configure' ? handleBack : () => {}}
        />
        <DialogDescription className="sr-only">
          {step === 'select' ? 'Select a delivery method type to create' : 'Configure your delivery method settings'}
        </DialogDescription>

        {/* Content - Step 1: Select Method */}
        {step === 'select' && (
          <>
            <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Title and Search */}
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 sm:gap-2.5 items-start sm:items-center">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                  How should leads be delivered?
                </h3>
                <div className="relative w-full sm:w-[255px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground opacity-80" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search methods..."
                    className="pl-10 h-10"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-border" />

              {/* Basic Methods */}
              {filteredBasic.length > 0 && (
                <div className="space-y-3">
                  <div className="py-2">
                    <p className="font-semibold text-sm text-foreground">Basic</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredBasic.map((method) => (
                      <MethodSelectorCard
                        key={method.id}
                        icon={method.icon}
                        title={method.title}
                        description={method.description}
                        selected={selectedMethod === method.id}
                        disabled={method.id !== 'ping-post'}
                        onClick={() => {
                          setSelectedMethod(method.id)
                          if (errors.method) setErrors((prev) => ({ ...prev, method: '' }))
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Advanced Methods */}
              {filteredAdvanced.length > 0 && (
                <div className="space-y-3">
                  <div className="py-2">
                    <p className="font-semibold text-sm text-foreground">Advanced</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredAdvanced.map((method) => (
                      <MethodSelectorCard
                        key={method.id}
                        icon={method.icon}
                        title={method.title}
                        description={method.description}
                        selected={selectedMethod === method.id}
                        disabled={method.id !== 'ping-post'}
                        onClick={() => {
                          setSelectedMethod(method.id)
                          if (errors.method) setErrors((prev) => ({ ...prev, method: '' }))
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {filteredBasic.length === 0 && filteredAdvanced.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    No delivery methods found.
                  </p>
                </div>
              )}

              {/* Error Message */}
              {errors.method && (
                <p className="text-sm text-destructive text-center">{errors.method}</p>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Footer */}
            <div className="px-5 py-4 flex items-center justify-end gap-2">
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleContinue}>
                Continue
              </Button>
            </div>
          </>
        )}

        {/* Content - Step 2: Configure Ping/Post */}
        {step === 'configure' && (
          <>
            <div className="p-5 space-y-5">
              <FieldGroup label="Description">
                <DebouncedInput
                  value={description}
                  onValueCommit={(value) => {
                    setDescription(value)
                    if (errors.description) setErrors((prev) => ({ ...prev, description: '' }))
                  }}
                  placeholder="e.g., Acme Corp Mortgage Ping/Post"
                  autoFocus
                  className={cn(errors.description && 'border-destructive')}
                />
                {errors.description && (
                  <p className="text-xs text-destructive mt-1">{errors.description}</p>
                )}
              </FieldGroup>

              <FieldGroup label="Lead Type" required>
                <Select
                  value={leadType}
                  onValueChange={(value) => {
                    setLeadType(value)
                    if (errors.leadType) setErrors((prev) => ({ ...prev, leadType: '' }))
                  }}
                >
                  <SelectTrigger className={cn(errors.leadType && 'border-destructive')}>
                    <SelectValue placeholder="Select lead type" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_TYPES.map((type) => (
                      <SelectItem
                        key={type.value}
                        value={type.value}
                        disabled={type.value !== 'mortgage'}
                      >
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.leadType && (
                  <p className="text-xs text-destructive mt-1">{errors.leadType}</p>
                )}
              </FieldGroup>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Footer */}
            <div className="px-5 py-4 flex items-center justify-between gap-2">
              <Button variant="secondary" onClick={handleBack}>
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={handleBack}>
                  Cancel
                </Button>
                <Button onClick={handleCreate}>
                  Create
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

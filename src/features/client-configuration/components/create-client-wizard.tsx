import { useState } from 'react'
import { KeyRound } from 'lucide-react'

import { WizardDialog, type WizardStep } from '@/components/wizard-dialog'
import {
  Button,
  FieldGroup,
  Input,
  SectionHeading,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  SwitchField,
} from '@/components/ui'
import { cn } from '@/lib/utils'

import type { ClientStatus, ClientWizardSubmission, DeliveryType } from '../types'

interface CreateClientWizardProps {
  open: boolean
  onClose: () => void
  onCreate: (submission: ClientWizardSubmission) => void
}

type ErrorKey =
  | 'companyName'
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'portalUsername'
  | 'portalPassword'
  | 'deliveryAccountName'

type WizardErrors = Partial<Record<ErrorKey, string>>

const deliveryTypeOptions: Array<{ value: DeliveryType; label: string }> = [
  { value: 'http-webhook', label: 'HTTP Webhook' },
  { value: 'clickpoint', label: 'ClickPoint Integration' },
  { value: 'ftp', label: 'FTP Drop' },
  { value: 'email', label: 'Email' },
  { value: 'csv', label: 'CSV Attachment' },
  { value: 'lead-portal', label: 'Lead Portal' },
  { value: 'ping-post', label: 'PING/POST' },
  { value: 'batch-email', label: 'Batch Email Delivery' },
  { value: 'sms', label: 'SMS Notification' },
]

function errorClass(error?: string) {
  return cn(error && 'border-destructive')
}

export function CreateClientWizard({ open, onClose, onCreate }: CreateClientWizardProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [errors, setErrors] = useState<WizardErrors>({})
  const [isSaving, setIsSaving] = useState(false)

  const [companyName, setCompanyName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<ClientStatus>('new')
  const [clientGroup, setClientGroup] = useState('No Group')

  const [automatedDelivery, setAutomatedDelivery] = useState(false)
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('http-webhook')
  const [leadType, setLeadType] = useState('Short Mortgage Lead')

  const [portalUsername, setPortalUsername] = useState('')
  const [portalPassword, setPortalPassword] = useState('')

  const [channel, setChannel] = useState('Web and Chat Leads')
  const [deliveryAccountName, setDeliveryAccountName] = useState('')
  const [defaultLeadPrice, setDefaultLeadPrice] = useState('0.00')
  const [criteriaRequired, setCriteriaRequired] = useState(true)
  const [exclusive, setExclusive] = useState(false)
  const [requireOrder, setRequireOrder] = useState(false)

  const isPortal = deliveryType === 'lead-portal'

  const clearError = (key: ErrorKey) => {
    setErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  const contactErrors = (): WizardErrors => {
    const next: WizardErrors = {}
    if (!companyName.trim()) next.companyName = 'Company Name is required.'
    if (!firstName.trim()) next.firstName = 'First Name is required.'
    if (!lastName.trim()) next.lastName = 'Last Name is required.'
    if (!email.trim()) {
      next.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = 'Enter a valid email address.'
    }
    return next
  }

  const portalErrors = (): WizardErrors => {
    if (!isPortal) return {}
    return {
      ...(!portalUsername.trim() ? { portalUsername: 'Username is required.' } : {}),
      ...(!portalPassword ? { portalPassword: 'Password is required.' } : {}),
    }
  }

  const accountErrors = (): WizardErrors =>
    !deliveryAccountName.trim()
      ? { deliveryAccountName: 'Delivery Account Name is required.' }
      : {}

  const validateStep = (stepId?: string) => {
    const nextErrors =
      stepId === 'contact'
        ? contactErrors()
        : stepId === 'portal-login'
          ? portalErrors()
          : stepId === 'delivery-account'
            ? accountErrors()
            : {}

    setErrors((current) => ({ ...current, ...nextErrors }))
    return Object.keys(nextErrors).length === 0
  }

  const handleComplete = async () => {
    const nextErrors = { ...contactErrors(), ...portalErrors(), ...accountErrors() }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      if (Object.keys(contactErrors()).length > 0) {
        setActiveStep(0)
      } else if (Object.keys(portalErrors()).length > 0) {
        setActiveStep(2)
      } else {
        setActiveStep(3)
      }
      return
    }

    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 650))
    onCreate({
      companyName: companyName.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      status,
      clientGroup,
      automatedDelivery,
      deliveryType,
      leadType,
      portalUsername: isPortal ? portalUsername.trim() : '',
      portalPassword: isPortal ? portalPassword : '',
      channel,
      deliveryAccountName: deliveryAccountName.trim(),
      defaultLeadPrice: Number(defaultLeadPrice.replace(/[^0-9.-]/g, '')) || 0,
      criteriaRequired,
      exclusive,
      requireOrder,
    })
    setIsSaving(false)
  }

  const field = (
    key: ErrorKey,
    label: string,
    value: string,
    onChange: (value: string) => void,
    options?: { type?: string; placeholder?: string },
  ) => (
    <FieldGroup label={label} required>
      <Input
        aria-label={label}
        type={options?.type}
        value={value}
        placeholder={options?.placeholder}
        aria-invalid={Boolean(errors[key])}
        className={errorClass(errors[key])}
        onChange={(event) => {
          onChange(event.target.value)
          clearError(key)
        }}
      />
      {errors[key] && <p className="mt-1 text-xs text-destructive">{errors[key]}</p>}
    </FieldGroup>
  )

  const steps: WizardStep[] = [
    {
      id: 'contact',
      label: 'Contact',
      content: (
        <div className="flex flex-col gap-4">
          <SectionHeading
            title="Contact Information"
            description="Add the company and primary person responsible for this client."
          />
          <Separator />
          {field('companyName', 'Company Name', companyName, setCompanyName, {
            placeholder: 'Example: Summit Home Buyers',
          })}
          <div className="grid gap-4 sm:grid-cols-2">
            {field('firstName', 'First Name', firstName, setFirstName)}
            {field('lastName', 'Last Name', lastName, setLastName)}
          </div>
          {field('email', 'Email', email, setEmail, {
            type: 'email',
            placeholder: 'name@company.com',
          })}
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldGroup label="Status">
              <Select value={status} onValueChange={(value) => setStatus(value as ClientStatus)}>
                <SelectTrigger aria-label="Status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="working">Working</SelectItem>
                  <SelectItem value="waiting">Waiting</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
            </FieldGroup>
            <FieldGroup label="Client Group">
              <Select value={clientGroup} onValueChange={setClientGroup}>
                <SelectTrigger aria-label="Client Group"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="No Group">No Group</SelectItem>
                  <SelectItem value="Mortgage Partners">Mortgage Partners</SelectItem>
                  <SelectItem value="Priority Buyers">Priority Buyers</SelectItem>
                </SelectContent>
              </Select>
            </FieldGroup>
          </div>
          <p className="text-xs leading-4 text-muted-foreground">
            <span className="font-semibold">Note:</span> Only active statuses can receive leads.
          </p>
        </div>
      ),
    },
    {
      id: 'delivery-method',
      label: 'Method',
      content: (
        <div className="flex flex-col gap-4">
          <SectionHeading
            title="Delivery Method"
            description="Choose how this client will receive outbound leads."
          />
          <Separator />
          <SwitchField
            label="Automated Delivery"
            description="Automatically send qualified leads through this delivery method."
            checked={automatedDelivery}
            onCheckedChange={setAutomatedDelivery}
          />
          <Separator />
          <FieldGroup label="Type of Delivery">
            <Select value={deliveryType} onValueChange={(value) => setDeliveryType(value as DeliveryType)}>
              <SelectTrigger aria-label="Type of Delivery"><SelectValue /></SelectTrigger>
              <SelectContent>
                {deliveryTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup label="Lead Type">
            <Select value={leadType} onValueChange={setLeadType}>
              <SelectTrigger aria-label="Lead Type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Short Mortgage Lead">Short Mortgage Lead</SelectItem>
                <SelectItem value="Auto Insurance Lead">Auto Insurance Lead</SelectItem>
                <SelectItem value="Home Services Lead">Home Services Lead</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
        </div>
      ),
    },
    {
      id: 'portal-login',
      label: 'Portal Login',
      disabled: !isPortal,
      content: (
        <div className="flex flex-col gap-4">
          <SectionHeading
            title="Portal Login Information"
            description="Create the credentials the client will use to access the Lead Portal."
          />
          <Separator />
          {field('portalUsername', 'Username', portalUsername, setPortalUsername)}
          {field('portalPassword', 'Password', portalPassword, setPortalPassword, {
            type: 'password',
          })}
          <Button
            type="button"
            variant="outline"
            className="self-start"
            onClick={() => {
              setPortalPassword('SafeDemo#4829')
              clearError('portalPassword')
            }}
          >
            <KeyRound className="size-4" />
            Generate Password
          </Button>
          <div className="rounded-[4px] border border-border bg-muted/30 p-4">
            <p className="text-sm font-semibold">Password requirements</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
              <li>At least eight characters</li>
              <li>One uppercase and one lowercase letter</li>
              <li>One number and one special character</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'delivery-account',
      label: 'Account',
      content: (
        <div className="flex flex-col gap-4">
          <SectionHeading
            title="Delivery Account"
            description="Configure the client's first destination for qualified leads."
          />
          <Separator />
          <FieldGroup label="Channel">
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger aria-label="Channel"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Web and Chat Leads">Web and Chat Leads</SelectItem>
                <SelectItem value="Phone Leads">Phone Leads</SelectItem>
                <SelectItem value="All Leads">All Leads</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
          {field(
            'deliveryAccountName',
            'Delivery Account Name',
            deliveryAccountName,
            setDeliveryAccountName,
            { placeholder: 'Example: Summit Web Leads' },
          )}
          <FieldGroup label="Default Lead Price">
            <Input
              aria-label="Default Lead Price"
              value={defaultLeadPrice}
              inputMode="decimal"
              onChange={(event) => setDefaultLeadPrice(event.target.value)}
            />
          </FieldGroup>
          <Separator />
          <SwitchField
            label="Criteria Required"
            description="Require at least one delivery criterion before this account can receive leads."
            checked={criteriaRequired}
            onCheckedChange={setCriteriaRequired}
          />
          <SwitchField
            label="Exclusive"
            description="Reserve leads delivered through this account for this client."
            checked={exclusive}
            onCheckedChange={setExclusive}
          />
          <SwitchField
            label="Require Order"
            description="Deliver leads only while an eligible order is active."
            checked={requireOrder}
            onCheckedChange={setRequireOrder}
          />
        </div>
      ),
    },
  ]

  const invalidStepIds = [
    ...(errors.companyName || errors.firstName || errors.lastName || errors.email ? ['contact'] : []),
    ...(errors.portalUsername || errors.portalPassword ? ['portal-login'] : []),
    ...(errors.deliveryAccountName ? ['delivery-account'] : []),
  ]

  return (
    <WizardDialog
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      title="Create a Client"
      steps={steps}
      activeStep={activeStep}
      onStepChange={setActiveStep}
      onNext={(fromStep) => validateStep(steps[fromStep]?.id)}
      onCancel={onClose}
      onComplete={handleComplete}
      completeLabel="Create"
      completeVariant="success"
      invalidStepIds={invalidStepIds}
      isSaving={isSaving}
      savingMessage="Creating client..."
      width="860px"
    />
  )
}

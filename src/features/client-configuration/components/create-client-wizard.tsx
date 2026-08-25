import { useState } from 'react'
import { Circle, LockKeyhole, Mail, UserRound } from 'lucide-react'

import { WizardDialog, type WizardStep } from '@/components/wizard-dialog'
import {
  FieldGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
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

  const [automatedDelivery, setAutomatedDelivery] = useState(true)
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('lead-portal')
  const [leadType, setLeadType] = useState('Short Mortgage Lead')

  const [portalUsername, setPortalUsername] = useState('')
  const [portalPassword, setPortalPassword] = useState('')
  const [passwordWasGenerated, setPasswordWasGenerated] = useState(false)

  const [channel, setChannel] = useState('Web and Chat Leads')
  const [deliveryAccountName, setDeliveryAccountName] = useState('')
  const [defaultLeadPrice, setDefaultLeadPrice] = useState('$0.00')
  const [criteriaRequired, setCriteriaRequired] = useState(true)
  const [exclusive, setExclusive] = useState(false)
  const [requireOrder, setRequireOrder] = useState(false)

  const isPortal = deliveryType === 'lead-portal'
  const passwordRequirements = [
    {
      label: 'Be at least 8 characters in length',
      met: portalPassword.length >= 8,
    },
    {
      label: 'Contain at least 1 number',
      met: !passwordWasGenerated && /\d/.test(portalPassword),
    },
    {
      label: 'Contain at least 1 special character',
      met: /[^A-Za-z0-9]/.test(portalPassword),
    },
    {
      label: 'Contain at least 1 upper case letter',
      met: /[A-Z]/.test(portalPassword),
    },
  ]
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
    <FieldGroup label={label}>
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

  const statusNote = (
    <p className="text-xs italic leading-4 text-muted-foreground">
      <span className="font-semibold">Note:</span> Only active statuses can receive leads.
    </p>
  )

  const steps: WizardStep[] = [
    {
      id: 'contact',
      label: 'Contact Information',
      content: (
        <div className="flex flex-col gap-4">
          <SectionHeading
            title="Contact Information"
          />
          <Separator className="my-0" />
          {field('companyName', 'Company Name', companyName, setCompanyName, {
            placeholder: 'Required',
          })}
          <div className="grid gap-4 sm:grid-cols-2">
            {field('firstName', 'First Name', firstName, setFirstName, {
              placeholder: 'Required',
            })}
            {field('lastName', 'Last Name', lastName, setLastName, {
              placeholder: 'Required',
            })}
          </div>
          <FieldGroup label="Email">
            <InputGroup>
              <InputGroupAddon><Mail /></InputGroupAddon>
              <InputGroupInput
                aria-label="Email"
                type="email"
                value={email}
                placeholder="Required"
                aria-invalid={Boolean(errors.email)}
                onChange={(event) => {
                  setEmail(event.target.value)
                  clearError('email')
                }}
              />
            </InputGroup>
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
          </FieldGroup>
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
          {statusNote}
        </div>
      ),
    },
    {
      id: 'delivery-method',
      label: 'Delivery Method',
      content: (
        <div className="flex flex-col gap-4">
          <SectionHeading
            title="Delivery Method"
          />
          <Separator className="my-0" />
          <SwitchField
            label="Automated Delivery"
            description="Deliver leads automatically"
            checked={automatedDelivery}
            onCheckedChange={setAutomatedDelivery}
          />
          <Separator className="my-0" />
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
          {statusNote}
        </div>
      ),
    },
    {
      id: 'portal-login',
      label: 'Portal Login Information',
      disabled: !isPortal,
      content: (
        <div className="flex flex-col gap-4">
          <SectionHeading
            title="Portal Login Information"
            description="This web portal allows your clients or buyers to retrieve leads and place orders."
          />
          <Separator className="my-0" />
          <FieldGroup label="Username">
            <InputGroup>
              <InputGroupAddon><UserRound /></InputGroupAddon>
              <InputGroupInput
                aria-label="Username"
                value={portalUsername}
                placeholder="Required"
                aria-invalid={Boolean(errors.portalUsername)}
                onChange={(event) => {
                  setPortalUsername(event.target.value)
                  clearError('portalUsername')
                }}
              />
            </InputGroup>
            {errors.portalUsername && (
              <p className="mt-1 text-xs text-destructive">{errors.portalUsername}</p>
            )}
          </FieldGroup>
          <FieldGroup label="Password">
            <InputGroup>
              <InputGroupAddon>
                <LockKeyhole />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="Password"
                type="password"
                value={portalPassword}
                placeholder="Required"
                aria-invalid={Boolean(errors.portalPassword)}
                onChange={(event) => {
                  setPortalPassword(event.target.value)
                  setPasswordWasGenerated(false)
                  clearError('portalPassword')
                }}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  variant="secondary"
                  data-state={passwordWasGenerated ? 'generated' : 'idle'}
                  onClick={() => {
                    setPortalPassword('-7rumqmX')
                    setPasswordWasGenerated(true)
                    clearError('portalPassword')
                  }}
                >
                  Generate
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            {errors.portalPassword && (
              <p className="mt-1 text-xs text-destructive">{errors.portalPassword}</p>
            )}
          </FieldGroup>
          <div className="py-1">
            <p className="text-sm font-semibold">Password Requirements</p>
            <ul aria-label="Password requirements" className="mt-2 space-y-1 text-xs">
              {passwordRequirements.map((requirement) => (
                <li
                  key={requirement.label}
                  data-state={requirement.met ? 'met' : 'unmet'}
                  className={cn(
                    'flex items-center gap-1.5 text-muted-foreground transition-colors',
                    requirement.met && 'text-success',
                  )}
                >
                  <Circle className="size-2.5 shrink-0 fill-current" aria-hidden="true" />
                  <span>{requirement.label}</span>
                </li>
              ))}
            </ul>
          </div>
          {statusNote}
        </div>
      ),
    },
    {
      id: 'delivery-account',
      label: 'Delivery Account',
      content: (
        <div className="flex flex-col gap-4">
          <SectionHeading
            title="Delivery Account"
          />
          <Separator className="my-0" />
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
          <div className="space-y-1 text-xs leading-4 text-muted-foreground">
            <p>
              Web leads: Leads received through the lead receiver API (
              <a className="text-primary hover:underline" href="#lead-receiver-documentation">
                Lead Receiver Documentation
              </a>
              ) or added manually by a user.
            </p>
            <p>
              Chat leads: Leads received through the messaging system. Visit{' '}
              <a className="text-primary hover:underline" href="#message-flows">
                Message Flows
              </a>{' '}
              for more info.
            </p>
          </div>
          {field(
            'deliveryAccountName',
            'Delivery Account Name',
            deliveryAccountName,
            setDeliveryAccountName,
            { placeholder: 'Example: Semi-exclusive leads in California' },
          )}
          <FieldGroup label="Default Lead Price" description="Price for each lead sent">
            <Input
              aria-label="Default Lead Price"
              value={defaultLeadPrice}
              inputMode="decimal"
              onChange={(event) => setDefaultLeadPrice(event.target.value)}
            />
          </FieldGroup>
          <Separator className="my-0" />
          <SwitchField
            label="Criteria Required"
            description="Require delivery criteria for this delivery account"
            checked={criteriaRequired}
            onCheckedChange={setCriteriaRequired}
          />
          <SwitchField
            label="Exclusive"
            description="Make leads sent to this delivery account exclusive."
            checked={exclusive}
            onCheckedChange={setExclusive}
          />
          <SwitchField
            label="Require Order"
            description="Require an order for lead delivery"
            checked={requireOrder}
            onCheckedChange={setRequireOrder}
          />
          {statusNote}
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
      width="760px"
      dialogClassName="top-6"
      showPreviousOnFirstStep
    />
  )
}

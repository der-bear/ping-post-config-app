#!/usr/bin/env node

import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { buildTimeline, validateTrace } from './campaign-walkthrough-trace.mjs'

const VIEWPORT = { width: 1920, height: 1080, deviceScaleFactor: 2 }
const DEFAULT_BASE_URL = 'http://127.0.0.1:5173/ping-post-config-app/campaign-configuration?walkthrough-capture=1'
const DEFAULT_OUTPUT_ROOT = 'output/campaign-walkthrough-captures'
const SYSTEM_CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const holdForAction = (kind, isFinal) => {
  if (isFinal) return 900
  if (kind === 'focus') return 150
  if (kind === 'open') return 260
  if (kind === 'type') return 320
  if (kind === 'toggle') return 380
  return 360
}

const action = (id, kind, targetRole, stateDelta, extra = {}) => ({
  id,
  kind,
  targetRole,
  stateDelta: [stateDelta],
  holdMs: holdForAction(kind, extra.final),
  ...extra,
})

const shot = (cameraShot, id, kind, targetRole, stateDelta, extra = {}) => action(
  id,
  kind,
  targetRole,
  stateDelta,
  { cameraShot, ...extra },
)

const modeShot = (
  cameraMode,
  cameraShot,
  id,
  kind,
  targetRole,
  stateDelta,
  extra = {},
) => shot(cameraShot, id, kind, targetRole, stateDelta, {
  ...extra,
  cameraMode,
})

const navigationShot = (...args) => modeShot('navigation', ...args)
const contentShot = (...args) => modeShot('content', ...args)
const dialogShot = (...args) => modeShot('dialog', ...args)

export const SCENARIOS = {
  web: {
    channel: 'web',
    launcherName: 'Web campaign',
    setupName: 'Mortgage Web Form',
    requiredTab: 'General',
    actions: [
      navigationShot('web-nav', 'open-general-tab', 'click', 'button', 'navigation.general'),
      contentShot('web-status', 'open-status', 'open', 'combobox', 'general.status.menu'),
      contentShot('web-status', 'select-active-status', 'select', 'option', 'general.status'),
      contentShot('web-payout', 'select-revenue-share', 'click', 'radio', 'general.pricingModel'),
      contentShot('web-payout', 'focus-payout-percentage', 'focus', 'textbox', 'focus.general.revenueSharePct'),
      contentShot('web-payout', 'type-payout-percentage', 'type', 'textbox', 'general.revenueSharePct', {
        text: '12.50', typingDelayMs: 60,
      }),
      contentShot('web-final', 'save-general-settings', 'save', 'button', 'general.saved', {
        final: true,
        cameraFrame: 'target',
        cameraScale: 2.24,
      }),
    ],
  },
  'ping-post': {
    channel: 'ping-post',
    launcherName: 'Ping/Post campaign',
    setupName: 'Mortgage Ping Post',
    requiredTab: 'PING Options',
    actions: [
      navigationShot('ping-nav', 'open-ping-options', 'click', 'button', 'navigation.pingOptions'),
      contentShot('ping-profit', 'toggle-profit-requirement', 'toggle', 'switch', 'ping.profit.enabled'),
      contentShot('ping-profit', 'focus-profit-value', 'focus', 'textbox', 'focus.ping.profit.value'),
      contentShot('ping-profit', 'type-profit-value', 'type', 'textbox', 'ping.profit.value', {
        text: '35', typingDelayMs: 60,
      }),
      contentShot('ping-delivery', 'toggle-minimum-delivery-count', 'toggle', 'switch', 'ping.minimumDeliveryCount.enabled'),
      contentShot('ping-delivery', 'focus-minimum-delivery-value', 'focus', 'textbox', 'focus.ping.minimumDeliveryCount.value'),
      contentShot('ping-delivery', 'type-minimum-delivery-value', 'type', 'textbox', 'ping.minimumDeliveryCount.value', {
        text: '3', typingDelayMs: 60,
      }),
      contentShot('ping-field-grid', 'add-ping-field', 'click', 'button', 'ping.fieldDialog.open'),
      dialogShot('ping-field-select', 'open-lead-field-selector', 'open', 'combobox', 'ping.fieldSelector.open'),
      dialogShot('ping-field-select', 'search-lead-field', 'type', 'textbox', 'ping.fieldSelector.query', {
        text: 'credit', typingDelayMs: 60,
      }),
      dialogShot('ping-field-select', 'select-credit-score-range', 'select', 'option', 'ping.field'),
      dialogShot('ping-field-type', 'open-field-type', 'open', 'combobox', 'ping.type.menu'),
      dialogShot('ping-field-type', 'select-required', 'select', 'option', 'ping.type'),
      dialogShot('ping-field-final', 'save-ping-field', 'save', 'button', 'ping.fieldRequirements', {
        final: true,
        holdSurfaceAfterClick: true,
      }),
    ],
  },
  phone: {
    channel: 'phone',
    launcherName: 'Phone campaign',
    setupName: 'Mortgage Phone',
    requiredTab: 'Phone Numbers',
    actions: [
      navigationShot('phone-nav', 'open-phone-numbers', 'click', 'button', 'navigation.phoneNumbers'),
      contentShot('phone-grid', 'add-ivr-number', 'click', 'button', 'phone.ivrDialog.open'),
      dialogShot('phone-name', 'focus-number-name', 'focus', 'textbox', 'focus.phone.name'),
      dialogShot('phone-name', 'type-number-name', 'type', 'textbox', 'phone.name', {
        text: 'Mortgage Call Line', typingDelayMs: 60,
      }),
      dialogShot('phone-open-purchase', 'purchase-new-number', 'click', 'button', 'phone.purchaseDialog.open'),
      dialogShot('phone-purchase-row', 'select-phone-number-row', 'select', 'row', 'phone.selectedNumber'),
      dialogShot('phone-purchase-confirm', 'purchase-selected-number', 'click', 'button', 'phone.ivrNumber'),
      dialogShot('phone-call-flow', 'open-call-flow', 'open', 'combobox', 'phone.callFlow.menu'),
      dialogShot('phone-call-flow', 'select-main-call-flow', 'select', 'option', 'phone.callFlow'),
      dialogShot('phone-message-flow', 'open-message-flow', 'open', 'combobox', 'phone.messageFlow.menu'),
      dialogShot('phone-message-flow', 'select-main-message-flow', 'select', 'option', 'phone.messageFlow'),
      dialogShot('phone-final', 'save-ivr-number', 'save', 'button', 'phone.saved', {
        final: true,
        holdSurfaceAfterClick: true,
      }),
    ],
  },
  chat: {
    channel: 'chat',
    launcherName: 'Chat campaign',
    setupName: 'Mortgage Chat Leads',
    requiredTab: 'Properties',
    actions: [
      navigationShot('chat-nav', 'open-web-chats', 'click', 'button', 'navigation.webChats'),
      contentShot('chat-grid', 'add-web-chat', 'click', 'button', 'chat.dialog.open'),
      dialogShot('chat-identity', 'focus-chat-name', 'focus', 'textbox', 'focus.chat.name'),
      dialogShot('chat-identity', 'type-chat-name', 'type', 'textbox', 'chat.name', {
        text: 'Website Chat Leads', typingDelayMs: 60,
      }),
      dialogShot('chat-identity', 'focus-chat-description', 'focus', 'textbox', 'focus.chat.description'),
      dialogShot('chat-identity', 'type-chat-description', 'type', 'textbox', 'chat.description', {
        text: 'Mortgage inquiries from the website', typingDelayMs: 60,
      }),
      dialogShot('chat-flow', 'open-chat-message-flow', 'open', 'combobox', 'chat.messageFlow.menu'),
      dialogShot('chat-flow', 'select-mortgage-chat-flow', 'select', 'option', 'chat.messageFlow'),
      dialogShot('chat-profile', 'focus-company-name', 'focus', 'textbox', 'focus.chat.companyName'),
      dialogShot('chat-profile', 'type-company-name', 'type', 'textbox', 'chat.companyName', {
        text: 'CBA Mortgage', typingDelayMs: 60,
      }),
      dialogShot('chat-profile', 'focus-agent-name', 'focus', 'textbox', 'focus.chat.agentName'),
      dialogShot('chat-profile', 'type-agent-name', 'type', 'textbox', 'chat.agentName', {
        text: 'Amy', typingDelayMs: 60,
      }),
      dialogShot('chat-message', 'focus-initial-chat-message', 'focus', 'textbox', 'focus.chat.initialMessage'),
      dialogShot('chat-message', 'type-initial-chat-message', 'type', 'textbox', 'chat.initialMessage', {
        text: 'Hi! How can I help with your mortgage today?', typingDelayMs: 60,
      }),
      dialogShot('chat-options', 'toggle-show-chat-button', 'toggle', 'switch', 'chat.showChatButton'),
      dialogShot('chat-options', 'toggle-auto-show-chat', 'toggle', 'switch', 'chat.autoShowChat'),
      dialogShot('chat-options', 'focus-auto-show-delay', 'focus', 'textbox', 'focus.chat.autoShowDelay'),
      dialogShot('chat-options', 'type-auto-show-delay', 'type', 'textbox', 'chat.autoShowDelay', {
        text: '5', typingDelayMs: 60,
      }),
      dialogShot('chat-final', 'save-web-chat', 'save', 'button', 'chat.saved', {
        final: true,
        cameraFrame: 'chat-options-complete',
        holdSurfaceAfterClick: true,
      }),
    ],
  },
}

export function scenarioActionIds(channel) {
  const scenario = SCENARIOS[channel]
  if (!scenario) throw new Error(`Unknown campaign channel: ${channel}`)
  return scenario.actions.map(({ id }) => id)
}

function parseArgs(argv) {
  const result = {
    baseUrl: DEFAULT_BASE_URL,
    outputRoot: DEFAULT_OUTPUT_ROOT,
    themes: ['light', 'dark'],
    channels: Object.keys(SCENARIOS),
  }
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--base-url') result.baseUrl = argv[++index]
    else if (argument === '--output-root') result.outputRoot = argv[++index]
    else if (argument === '--theme') result.themes = [argv[++index]]
    else if (argument === '--channel') result.channels = [argv[++index]]
    else throw new Error(`Unknown argument: ${argument}`)
  }
  return result
}

function rectUnion(...rectangles) {
  const valid = rectangles.filter(Boolean)
  const left = Math.min(...valid.map(({ x }) => x))
  const top = Math.min(...valid.map(({ y }) => y))
  const right = Math.max(...valid.map(({ x, width }) => x + width))
  const bottom = Math.max(...valid.map(({ y, height }) => y + height))
  return { x: left, y: top, width: right - left, height: bottom - top }
}

function pointForRect(rect, strategy = 'center') {
  if (strategy === 'value') {
    return { x: rect.x + Math.min(160, Math.max(24, rect.width * 0.32)), y: rect.y + rect.height / 2 }
  }
  if (strategy === 'left') {
    return { x: rect.x + Math.min(64, Math.max(20, rect.width * 0.08)), y: rect.y + rect.height / 2 }
  }
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
}

function fieldGroup(page, label) {
  return page.locator('[data-slot="field-group"]').filter({
    has: page.getByText(label, { exact: true }),
  }).last()
}

function switchField(page, label) {
  return page.locator('[data-slot="switch-field"]').filter({
    has: page.getByText(label, { exact: true }),
  }).last()
}

function dialog(page, title) {
  return page.getByRole('dialog').filter({ has: page.getByText(title, { exact: true }) })
}

export class TraceRecorder {
  constructor(page, outputDir, channel, theme) {
    this.page = page
    this.outputDir = outputDir
    this.channel = channel
    this.theme = theme
    this.actions = []
    this.sceneIndex = 0
  }

  async screenshot(label) {
    const safeLabel = label.replace(/[^a-z0-9-]+/gi, '-').toLowerCase()
    const name = `${String(this.sceneIndex).padStart(3, '0')}-${safeLabel}.png`
    this.sceneIndex += 1
    await this.page.screenshot({
      path: path.join(this.outputDir, name),
      type: 'png',
      animations: 'disabled',
      caret: 'initial',
    })
    return name
  }

  async geometry(locator, frameLocator, strategy) {
    await locator.scrollIntoViewIfNeeded()
    await this.page.waitForTimeout(80)
    const targetRect = await locator.boundingBox()
    if (!targetRect) throw new Error(`${this.channel}: target has no live bounding box`)
    const frameRect = frameLocator ? await frameLocator.boundingBox() : targetRect
    if (!frameRect) throw new Error(`${this.channel}: camera frame has no live bounding box`)
    return {
      targetRect,
      frameRect: rectUnion(targetRect, frameRect),
      clickPoint: pointForRect(targetRect, strategy),
    }
  }

  async click(meta, locator, options = {}) {
    const geometry = await this.geometry(locator, options.frameLocator, options.strategy)
    const beforeScene = await this.screenshot(`${meta.id}-before`)
    await locator.click({
      position: {
        x: geometry.clickPoint.x - geometry.targetRect.x,
        y: geometry.clickPoint.y - geometry.targetRect.y,
      },
    })
    await this.page.waitForTimeout(options.waitAfterMs ?? 100)
    const afterScene = meta.holdSurfaceAfterClick
      ? beforeScene
      : await this.screenshot(`${meta.id}-after`)
    this.actions.push({
      ...meta,
      ...geometry,
      beforeScene,
      afterScene,
      startedAtMs: (this.actions.length + 1) * 1000,
    })
  }

  async type(meta, locator, options = {}) {
    const geometry = await this.geometry(locator, options.frameLocator, 'value')
    const focused = await locator.evaluate((element) => document.activeElement === element)
    if (!focused) throw new Error(`${this.channel}/${meta.id}: textbox is not focused before typing`)

    await locator.press('ControlOrMeta+A')
    await locator.press('Backspace')
    await this.page.waitForTimeout(80)
    const typingScenes = [{
      scene: await this.screenshot(`${meta.id}-empty`),
      value: '',
    }]
    let value = ''
    for (const character of meta.text) {
      await this.page.keyboard.type(character, { delay: meta.typingDelayMs })
      value += character
      typingScenes.push({
        scene: await this.screenshot(`${meta.id}-${String(value.length).padStart(2, '0')}`),
        value,
      })
    }

    this.actions.push({
      ...meta,
      ...geometry,
      beforeScene: typingScenes[0].scene,
      afterScene: typingScenes.at(-1).scene,
      typingScenes,
      startedAtMs: (this.actions.length + 1) * 1000,
    })
  }

  async writeTrace() {
    const trace = {
      version: 1,
      channel: this.channel,
      theme: this.theme,
      viewport: VIEWPORT,
      actions: this.actions,
    }
    validateTrace(trace)
    trace.timeline = buildTimeline(trace.actions)
    await writeFile(path.join(this.outputDir, 'trace.json'), `${JSON.stringify(trace, null, 2)}\n`)
    return trace
  }
}

function metaFor(scenario, id) {
  const meta = scenario.actions.find((candidate) => candidate.id === id)
  if (!meta) throw new Error(`${scenario.channel}: missing action ${id}`)
  return meta
}

async function setupScenario(page, scenario) {
  await page.getByRole('button', { name: new RegExp(`^${scenario.launcherName}`) }).click()
  await page.getByRole('button', { name: 'General', exact: true }).click()
  const campaignName = fieldGroup(page, 'Campaign Name').locator('input')
  await campaignName.fill(scenario.setupName)

  if (scenario.channel === 'web') {
    const statusGroup = fieldGroup(page, 'Status')
    await statusGroup.getByRole('combobox').click()
    await page.getByRole('option', { name: 'Inactive', exact: true }).click()
  }
  await page.waitForTimeout(120)
}

async function captureWeb(page, recorder, scenario) {
  const generalButton = page.getByRole('button', { name: 'General', exact: true })
  await recorder.click(metaFor(scenario, 'open-general-tab'), generalButton, {
    frameLocator: page.locator('nav'), strategy: 'left',
  })

  const statusGroup = fieldGroup(page, 'Status')
  const status = statusGroup.getByRole('combobox')
  await recorder.click(metaFor(scenario, 'open-status'), status, {
    frameLocator: statusGroup, strategy: 'value',
  })
  await recorder.click(metaFor(scenario, 'select-active-status'), page.getByRole('option', {
    name: 'Active', exact: true,
  }), { frameLocator: statusGroup, strategy: 'left' })

  const revenueRadio = page.locator('#gs-revenue-share')
  const revenueRow = page.locator('label[for="gs-revenue-share"]')
  await recorder.click(metaFor(scenario, 'select-revenue-share'), revenueRadio, {
    frameLocator: revenueRow,
  })
  const payout = revenueRow.locator('input')
  await recorder.click(metaFor(scenario, 'focus-payout-percentage'), payout, {
    frameLocator: revenueRow, strategy: 'value',
  })
  await recorder.type(metaFor(scenario, 'type-payout-percentage'), payout, {
    frameLocator: revenueRow,
  })
  const layout = page.locator('[data-slot="panel-layout"]')
  const saveButton = layout.getByRole('button', {
    name: 'Save', exact: true,
  })
  const saveMeta = metaFor(scenario, 'save-general-settings')
  await recorder.click(saveMeta, saveButton, {
    frameLocator: saveMeta.cameraFrame === 'target' ? saveButton : revenueRow,
    waitAfterMs: 1700,
  })
}

async function capturePing(page, recorder, scenario) {
  await recorder.click(metaFor(scenario, 'open-ping-options'), page.getByRole('button', {
    name: 'PING Options', exact: true,
  }), { frameLocator: page.locator('nav'), strategy: 'left' })

  const profitGroup = switchField(page, 'Profit Requirement')
  const profitSwitch = profitGroup.getByRole('switch')
  await recorder.click(metaFor(scenario, 'toggle-profit-requirement'), profitSwitch, {
    frameLocator: profitGroup,
  })
  const profit = page.getByRole('textbox', { name: 'Profit Requirement value', exact: true })
  await recorder.click(metaFor(scenario, 'focus-profit-value'), profit, {
    frameLocator: profitGroup, strategy: 'value',
  })
  await recorder.type(metaFor(scenario, 'type-profit-value'), profit, { frameLocator: profitGroup })

  const deliveryGroup = switchField(page, 'Minimum Delivery Count')
  const deliverySwitch = deliveryGroup.getByRole('switch')
  await recorder.click(metaFor(scenario, 'toggle-minimum-delivery-count'), deliverySwitch, {
    frameLocator: deliveryGroup,
  })
  const delivery = page.getByRole('textbox', { name: 'Minimum Delivery Count value', exact: true })
  await recorder.click(metaFor(scenario, 'focus-minimum-delivery-value'), delivery, {
    frameLocator: deliveryGroup, strategy: 'value',
  })
  await recorder.type(metaFor(scenario, 'type-minimum-delivery-value'), delivery, {
    frameLocator: deliveryGroup,
  })

  const pingHeading = page.getByText('Field Requirements for PING', { exact: true })
  const pingGrid = pingHeading.locator('xpath=following::*[@data-slot="data-grid"][1]')
  await recorder.click(metaFor(scenario, 'add-ping-field'), pingGrid.getByRole('button', {
    name: 'Add', exact: true,
  }), { frameLocator: pingGrid })

  const pingDialog = dialog(page, 'PING Required Field')
  const fieldInput = pingDialog.getByRole('combobox', { name: 'Select Lead Field', exact: true })
  const fieldGroupLocator = fieldGroup(page, 'Select Lead Field')
  await recorder.click(metaFor(scenario, 'open-lead-field-selector'), fieldInput, {
    frameLocator: fieldGroupLocator, strategy: 'value',
  })
  await recorder.type(metaFor(scenario, 'search-lead-field'), fieldInput, {
    frameLocator: fieldGroupLocator,
  })
  await recorder.click(metaFor(scenario, 'select-credit-score-range'), page.getByRole('option', {
    name: 'Credit Score Range', exact: true,
  }), { frameLocator: fieldGroupLocator, strategy: 'left' })

  const typeGroup = fieldGroup(page, 'Type')
  await recorder.click(metaFor(scenario, 'open-field-type'), typeGroup.getByRole('combobox'), {
    frameLocator: typeGroup, strategy: 'value',
  })
  await recorder.click(metaFor(scenario, 'select-required'), page.getByRole('option', {
    name: 'Required', exact: true,
  }), { frameLocator: typeGroup, strategy: 'left' })
  await recorder.click(metaFor(scenario, 'save-ping-field'), pingDialog.getByRole('button', {
    name: 'Save', exact: true,
  }), { frameLocator: typeGroup })
}

async function capturePhone(page, recorder, scenario) {
  await recorder.click(metaFor(scenario, 'open-phone-numbers'), page.getByRole('button', {
    name: 'Phone Numbers', exact: true,
  }), { frameLocator: page.locator('nav'), strategy: 'left' })
  const phoneGrid = page.locator('[data-slot="data-grid"]')
  await recorder.click(metaFor(scenario, 'add-ivr-number'), phoneGrid.getByRole('button', {
    name: 'Add', exact: true,
  }), { frameLocator: phoneGrid.locator('[data-slot="data-grid-toolbar"]') })

  const ivrDialog = dialog(page, 'IVR Number Details')
  const nameGroup = fieldGroup(page, 'Name')
  const name = nameGroup.locator('input')
  await recorder.click(metaFor(scenario, 'focus-number-name'), name, {
    frameLocator: nameGroup, strategy: 'value',
  })
  await recorder.type(metaFor(scenario, 'type-number-name'), name, { frameLocator: nameGroup })
  await recorder.click(metaFor(scenario, 'purchase-new-number'), ivrDialog.getByRole('button', {
    name: 'Purchase New Number', exact: true,
  }), { frameLocator: ivrDialog })

  const purchaseDialog = dialog(page, 'Purchase IVR Number')
  const numberRow = purchaseDialog.getByRole('row').filter({
    has: page.getByText('(866) 689-0601', { exact: true }),
  })
  await recorder.click(metaFor(scenario, 'select-phone-number-row'), numberRow, {
    frameLocator: purchaseDialog.locator('[data-slot="data-grid"]'), strategy: 'left',
  })
  await recorder.click(metaFor(scenario, 'purchase-selected-number'), purchaseDialog.getByRole('button', {
    name: 'Purchase', exact: true,
  }), { frameLocator: numberRow })

  const callFlowGroup = fieldGroup(page, 'Call Flow')
  await recorder.click(metaFor(scenario, 'open-call-flow'), callFlowGroup.getByRole('combobox'), {
    frameLocator: callFlowGroup, strategy: 'value',
  })
  await recorder.click(metaFor(scenario, 'select-main-call-flow'), page.getByRole('option', {
    name: 'Main Call Flow', exact: true,
  }), { frameLocator: callFlowGroup, strategy: 'left' })

  const messageFlowGroup = fieldGroup(page, 'Message Flow')
  await recorder.click(metaFor(scenario, 'open-message-flow'), messageFlowGroup.getByRole('combobox'), {
    frameLocator: messageFlowGroup, strategy: 'value',
  })
  await recorder.click(metaFor(scenario, 'select-main-message-flow'), page.getByRole('option', {
    name: 'Main Message Flow', exact: true,
  }), { frameLocator: messageFlowGroup, strategy: 'left' })
  await recorder.click(metaFor(scenario, 'save-ivr-number'), ivrDialog.getByRole('button', {
    name: 'Save', exact: true,
  }), { frameLocator: messageFlowGroup })
}

async function captureChat(page, recorder, scenario) {
  await recorder.click(metaFor(scenario, 'open-web-chats'), page.getByRole('button', {
    name: 'Web Chats', exact: true,
  }), { frameLocator: page.locator('nav'), strategy: 'left' })
  const chatGrid = page.locator('[data-slot="data-grid"]')
  await recorder.click(metaFor(scenario, 'add-web-chat'), chatGrid.getByRole('button', {
    name: 'Add', exact: true,
  }), { frameLocator: chatGrid.locator('[data-slot="data-grid-toolbar"]') })

  const chatDialog = dialog(page, 'Web Chat Dialog')
  const nameGroup = fieldGroup(page, 'Name')
  const name = nameGroup.locator('input')
  await recorder.click(metaFor(scenario, 'focus-chat-name'), name, {
    frameLocator: nameGroup, strategy: 'value',
  })
  await recorder.type(metaFor(scenario, 'type-chat-name'), name, { frameLocator: nameGroup })

  const descriptionGroup = fieldGroup(page, 'Description')
  const description = descriptionGroup.locator('textarea')
  await recorder.click(metaFor(scenario, 'focus-chat-description'), description, {
    frameLocator: descriptionGroup, strategy: 'value',
  })
  await recorder.type(metaFor(scenario, 'type-chat-description'), description, {
    frameLocator: descriptionGroup,
  })

  const messageFlowGroup = fieldGroup(page, 'Message Flow')
  await recorder.click(metaFor(scenario, 'open-chat-message-flow'), messageFlowGroup.getByRole('combobox'), {
    frameLocator: messageFlowGroup, strategy: 'value',
  })
  await recorder.click(metaFor(scenario, 'select-mortgage-chat-flow'), page.getByRole('option', {
    name: 'Mortgage Chat Flow', exact: true,
  }), { frameLocator: messageFlowGroup, strategy: 'left' })

  const companyGroup = fieldGroup(page, 'Company Name')
  const company = companyGroup.locator('input')
  await recorder.click(metaFor(scenario, 'focus-company-name'), company, {
    frameLocator: companyGroup, strategy: 'value',
  })
  await recorder.type(metaFor(scenario, 'type-company-name'), company, { frameLocator: companyGroup })

  const agentGroup = fieldGroup(page, 'Agent Name')
  const agent = agentGroup.locator('input')
  await recorder.click(metaFor(scenario, 'focus-agent-name'), agent, {
    frameLocator: agentGroup, strategy: 'value',
  })
  await recorder.type(metaFor(scenario, 'type-agent-name'), agent, { frameLocator: agentGroup })

  const initialGroup = fieldGroup(page, 'Initial Chat Message')
  const initialMessage = initialGroup.locator('textarea')
  await recorder.click(metaFor(scenario, 'focus-initial-chat-message'), initialMessage, {
    frameLocator: initialGroup, strategy: 'value',
  })
  await recorder.type(metaFor(scenario, 'type-initial-chat-message'), initialMessage, {
    frameLocator: initialGroup,
  })

  const showButton = page.getByRole('switch', { name: 'Show Chat Button', exact: true })
  const showButtonGroup = showButton.locator('xpath=..')
  await recorder.click(metaFor(scenario, 'toggle-show-chat-button'), showButton, {
    frameLocator: showButtonGroup,
  })
  const autoShow = page.getByRole('switch', { name: 'Auto Show Chat', exact: true })
  const autoShowGroup = autoShow.locator('xpath=..')
  await recorder.click(metaFor(scenario, 'toggle-auto-show-chat'), autoShow, {
    frameLocator: autoShowGroup,
  })
  const delay = autoShow.locator('xpath=following::input[1]')
  await recorder.click(metaFor(scenario, 'focus-auto-show-delay'), delay, {
    frameLocator: autoShowGroup, strategy: 'value',
  })
  await recorder.type(metaFor(scenario, 'type-auto-show-delay'), delay, {
    frameLocator: autoShowGroup,
  })
  const saveMeta = metaFor(scenario, 'save-web-chat')
  await recorder.click(saveMeta, chatDialog.getByRole('button', {
    name: 'Save', exact: true,
  }), {
    frameLocator: saveMeta.cameraFrame === 'chat-options-complete'
      ? showButtonGroup
      : autoShowGroup,
  })
}

async function captureScenario(page, outputRoot, theme, channel) {
  const scenario = SCENARIOS[channel]
  if (!scenario) throw new Error(`Unknown channel: ${channel}`)
  const outputDir = path.resolve(outputRoot, theme, channel)
  await rm(outputDir, { recursive: true, force: true })
  await mkdir(outputDir, { recursive: true })
  await setupScenario(page, scenario)
  const recorder = new TraceRecorder(page, outputDir, channel, theme)

  if (channel === 'web') await captureWeb(page, recorder, scenario)
  else if (channel === 'ping-post') await capturePing(page, recorder, scenario)
  else if (channel === 'phone') await capturePhone(page, recorder, scenario)
  else if (channel === 'chat') await captureChat(page, recorder, scenario)
  return recorder.writeTrace()
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const { chromium } = await import('@playwright/test')
  const browser = await chromium.launch({
    headless: true,
    executablePath: SYSTEM_CHROME,
  })
  try {
    for (const theme of args.themes) {
      for (const channel of args.channels) {
        console.log(`Capturing ${channel}/${theme}...`)
        const context = await browser.newContext({
          viewport: { width: VIEWPORT.width, height: VIEWPORT.height },
          deviceScaleFactor: VIEWPORT.deviceScaleFactor,
          colorScheme: theme,
        })
        await context.addInitScript((selectedTheme) => {
          localStorage.setItem('theme', selectedTheme)
        }, theme)
        const page = await context.newPage()
        await page.goto(args.baseUrl, { waitUntil: 'networkidle' })
        await captureScenario(page, args.outputRoot, theme, channel)
        await context.close()
      }
    }
  } finally {
    await browser.close()
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}

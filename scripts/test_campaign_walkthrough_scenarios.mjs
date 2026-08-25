import assert from 'node:assert/strict'
import test from 'node:test'

import * as captureModule from './capture-campaign-walkthroughs.mjs'

const {
  SCENARIOS,
  scenarioActionIds,
} = captureModule

const EXPECTED_ACTIONS = {
  web: [
    'open-general-tab',
    'open-status',
    'select-active-status',
    'select-revenue-share',
    'focus-payout-percentage',
    'type-payout-percentage',
    'save-general-settings',
  ],
  'ping-post': [
    'open-ping-options',
    'toggle-profit-requirement',
    'focus-profit-value',
    'type-profit-value',
    'toggle-minimum-delivery-count',
    'focus-minimum-delivery-value',
    'type-minimum-delivery-value',
    'add-ping-field',
    'open-lead-field-selector',
    'search-lead-field',
    'select-credit-score-range',
    'open-field-type',
    'select-required',
    'save-ping-field',
  ],
  phone: [
    'open-phone-numbers',
    'add-ivr-number',
    'focus-number-name',
    'type-number-name',
    'purchase-new-number',
    'select-phone-number-row',
    'purchase-selected-number',
    'open-call-flow',
    'select-main-call-flow',
    'open-message-flow',
    'select-main-message-flow',
    'save-ivr-number',
  ],
  chat: [
    'open-web-chats',
    'add-web-chat',
    'focus-chat-name',
    'type-chat-name',
    'focus-chat-description',
    'type-chat-description',
    'open-chat-message-flow',
    'select-mortgage-chat-flow',
    'focus-company-name',
    'type-company-name',
    'focus-agent-name',
    'type-agent-name',
    'focus-initial-chat-message',
    'type-initial-chat-message',
    'toggle-show-chat-button',
    'toggle-auto-show-chat',
    'focus-auto-show-delay',
    'type-auto-show-delay',
    'save-web-chat',
  ],
}

test('scene capture requests lossless PNG files from the browser', async () => {
  assert.equal(typeof captureModule.TraceRecorder, 'function')

  let screenshotOptions
  const page = {
    async screenshot(options) {
      screenshotOptions = options
    },
  }
  const recorder = new captureModule.TraceRecorder(
    page,
    '/tmp/campaign-walkthrough-test',
    'web',
    'light',
  )

  const scene = await recorder.screenshot('Status before')

  assert.match(scene, /\.png$/)
  assert.equal(screenshotOptions.type, 'png')
  assert.equal('quality' in screenshotOptions, false)
})

test('each channel exposes the approved strictly sequential action order', () => {
  for (const [channel, ids] of Object.entries(EXPECTED_ACTIONS)) {
    assert.deepEqual(scenarioActionIds(channel), ids, channel)
  }
})

test('no semantic action changes several independent values', () => {
  for (const scenario of Object.values(SCENARIOS)) {
    for (const action of scenario.actions) {
      assert.equal(action.stateDelta.length, 1, `${scenario.channel}/${action.id}`)
      assert.doesNotMatch(action.id, /identity|profile|options-enabled|fields-filled/)
    }
  }
})

test('toggles target actual switches and selections target actual options or rows', () => {
  for (const scenario of Object.values(SCENARIOS)) {
    for (const action of scenario.actions) {
      if (action.kind === 'toggle') {
        assert.equal(action.targetRole, 'switch', `${scenario.channel}/${action.id}`)
      }
      if (action.kind === 'select') {
        assert.ok(
          action.targetRole === 'option' || action.targetRole === 'row',
          `${scenario.channel}/${action.id}`,
        )
      }
    }
  }
})

test('every typed value is entered into one textbox character by character', () => {
  for (const scenario of Object.values(SCENARIOS)) {
    for (const action of scenario.actions.filter(({ kind }) => kind === 'type')) {
      assert.equal(action.targetRole, 'textbox', `${scenario.channel}/${action.id}`)
      assert.equal(typeof action.text, 'string')
      assert.ok(action.text.length > 0)
      assert.equal(action.typingDelayMs, 60)
    }
  }
})

test('chat stays on Properties and configures each requested field individually', () => {
  const chat = SCENARIOS.chat
  assert.equal(chat.requiredTab, 'Properties')
  assert.deepEqual(
    chat.actions.filter(({ kind }) => kind === 'type').map(({ stateDelta }) => stateDelta[0]),
    [
      'chat.name',
      'chat.description',
      'chat.companyName',
      'chat.agentName',
      'chat.initialMessage',
      'chat.autoShowDelay',
    ],
  )
})

test('camera shots follow semantic regions instead of restarting for every action', () => {
  for (const scenario of Object.values(SCENARIOS)) {
    for (const action of scenario.actions) {
      assert.match(action.cameraShot ?? '', /^[a-z][a-z0-9-]+$/, `${scenario.channel}/${action.id}`)
      assert.ok(
        ['navigation', 'content', 'dialog'].includes(action.cameraMode),
        `${scenario.channel}/${action.id}`,
      )
    }
    assert.ok(
      new Set(scenario.actions.map(({ cameraShot }) => cameraShot)).size
        < scenario.actions.length,
      scenario.channel,
    )
    for (let index = 1; index < scenario.actions.length; index += 1) {
      const action = scenario.actions[index]
      const previous = scenario.actions[index - 1]
      if (action.kind === 'type') {
        assert.equal(action.cameraShot, previous.cameraShot, `${scenario.channel}/${action.id}`)
      }
    }
    for (const cameraShot of new Set(scenario.actions.map((action) => action.cameraShot))) {
      assert.equal(
        new Set(
          scenario.actions
            .filter((action) => action.cameraShot === cameraShot)
            .map((action) => action.cameraMode),
        ).size,
        1,
        `${scenario.channel}/${cameraShot}`,
      )
    }
  }
})

test('camera cuts when a new dialog or form region replaces the previous surface', () => {
  const phone = Object.fromEntries(
    SCENARIOS.phone.actions.map((action) => [action.id, action]),
  )
  assert.notEqual(
    phone['purchase-new-number'].cameraShot,
    phone['select-phone-number-row'].cameraShot,
  )
  assert.notEqual(
    phone['select-phone-number-row'].cameraShot,
    phone['purchase-selected-number'].cameraShot,
  )
  assert.notEqual(
    phone['select-main-call-flow'].cameraShot,
    phone['open-message-flow'].cameraShot,
  )

  const ping = Object.fromEntries(
    SCENARIOS['ping-post'].actions.map((action) => [action.id, action]),
  )
  assert.notEqual(
    ping['open-lead-field-selector'].cameraShot,
    ping['open-field-type'].cameraShot,
  )
  assert.notEqual(
    ping['select-required'].cameraShot,
    ping['save-ping-field'].cameraShot,
  )
})

test('interaction holds keep typing responsive while preserving readable outcomes', () => {
  for (const scenario of Object.values(SCENARIOS)) {
    for (const action of scenario.actions) {
      if (action.kind === 'focus') {
        assert.ok(action.holdMs <= 200, `${scenario.channel}/${action.id}`)
      } else if (action.kind === 'save') {
        assert.ok(action.holdMs >= 850, `${scenario.channel}/${action.id}`)
      } else {
        assert.ok(action.holdMs >= 220 && action.holdMs <= 450, `${scenario.channel}/${action.id}`)
      }
    }
  }
})

test('web save reframes to the footer instead of keeping the distant payout field in view', () => {
  const save = SCENARIOS.web.actions.find(({ id }) => id === 'save-general-settings')

  assert.equal(save.cameraFrame, 'target')
  assert.equal(save.cameraScale, 2.24)
})

test('dialog saves keep the completed form visible through the final hold', () => {
  for (const channel of ['ping-post', 'phone', 'chat']) {
    const save = SCENARIOS[channel].actions.at(-1)

    assert.equal(save.kind, 'save', channel)
    assert.equal(save.holdSurfaceAfterClick, true, channel)
  }
})

test('chat final framing includes both configured option groups and Save', () => {
  const save = SCENARIOS.chat.actions.at(-1)

  assert.equal(save.cameraFrame, 'chat-options-complete')
})

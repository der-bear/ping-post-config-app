import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildTimeline,
  containsPoint,
  validateAction,
  validateCursorFrame,
  validateTrace,
} from './campaign-walkthrough-trace.mjs'

const targetRect = { x: 100, y: 100, width: 200, height: 40 }

function validAction(overrides = {}) {
  return {
    id: 'toggle-profit-requirement',
    kind: 'toggle',
    targetRole: 'switch',
    beforeScene: '000-before.png',
    afterScene: '001-after.png',
    targetRect,
    frameRect: { x: 80, y: 60, width: 560, height: 280 },
    clickPoint: { x: 124, y: 120 },
    stateDelta: ['ping.profit.enabled'],
    holdMs: 600,
    ...overrides,
  }
}

test('containsPoint treats target edges as valid click positions', () => {
  assert.equal(containsPoint(targetRect, { x: 100, y: 100 }), true)
  assert.equal(containsPoint(targetRect, { x: 300, y: 140 }), true)
  assert.equal(containsPoint(targetRect, { x: 99.99, y: 120 }), false)
})

test('rejects a click outside its exact live target rectangle', () => {
  assert.throws(
    () => validateAction(validAction({ clickPoint: { x: 90, y: 120 } })),
    /outside target rectangle/,
  )
})

test('rejects a toggle click recorded against a surrounding container', () => {
  assert.throws(
    () => validateAction(validAction({ targetRole: 'group' })),
    /toggle action must target the switch itself/,
  )
})

test('rejects an action that changes several semantic controls', () => {
  assert.throws(
    () => validateAction(validAction({
      stateDelta: ['chat.companyName', 'chat.agentName'],
    })),
    /exactly one semantic state delta/,
  )
})

test('rejects a cursor bitmap that leaves the safe video frame', () => {
  assert.throws(
    () => validateCursorFrame(
      { x: 1870, y: 400, width: 54, height: 72 },
      { width: 1920, height: 1080, inset: 18 },
    ),
    /cursor leaves output frame/,
  )
})

test('accepts a cursor bitmap fully inside the safe video frame', () => {
  assert.doesNotThrow(() => validateCursorFrame(
    { x: 18, y: 18, width: 54, height: 72 },
    { width: 1920, height: 1080, inset: 18 },
  ))
})

test('requires typing scenes to reveal exactly one additional character', () => {
  const action = validAction({
    id: 'type-profit-value',
    kind: 'type',
    targetRole: 'textbox',
    text: '35',
    typingScenes: [
      { scene: '010-empty.png', value: '' },
      { scene: '011-3.png', value: '3' },
      { scene: '012-35.png', value: '35' },
    ],
    afterScene: '012-35.png',
    stateDelta: ['ping.profit.value'],
  })

  assert.doesNotThrow(() => validateAction(action))
  assert.throws(
    () => validateAction({
      ...action,
      typingScenes: [
        { scene: '010-empty.png', value: '' },
        { scene: '012-35.png', value: '35' },
      ],
    }),
    /one character at a time/,
  )
})

test('trace rejects duplicate or simultaneous action timestamps', () => {
  assert.throws(
    () => validateTrace({
      viewport: { width: 1920, height: 1080, deviceScaleFactor: 2 },
      actions: [
        validAction({ id: 'first', startedAtMs: 100 }),
        validAction({ id: 'second', startedAtMs: 100 }),
      ],
    }),
    /strictly sequential/,
  )
})

test('timeline gives every action travel, intent, feedback, and readable hold', () => {
  const timeline = buildTimeline([
    validAction({ id: 'first' }),
    validAction({ id: 'second', holdMs: 650 }),
  ])

  assert.equal(timeline.actions.length, 2)
  assert.ok(timeline.actions[0].travelMs >= 300)
  assert.ok(timeline.actions[0].travelMs <= 550)
  assert.equal(timeline.actions[0].intentMs, 150)
  assert.equal(timeline.actions[0].feedbackMs, 120)
  assert.equal(timeline.actions[0].holdMs, 600)
  assert.ok(timeline.actions[1].startMs >= timeline.actions[0].endMs)
  assert.equal(timeline.actions[1].holdMs, 650)
})

test('timeline reuses a shot without a redundant camera stop', () => {
  const timeline = buildTimeline([
    validAction({ id: 'open-profit', cameraShot: 'profit' }),
    validAction({
      id: 'type-profit',
      kind: 'type',
      targetRole: 'textbox',
      cameraShot: 'profit',
      text: '35',
      typingScenes: [
        { scene: '010-empty.png', value: '' },
        { scene: '011-3.png', value: '3' },
        { scene: '012-35.png', value: '35' },
      ],
      afterScene: '012-35.png',
    }),
  ])

  assert.equal(timeline.actions[1].cameraMoveMs, 0)
  assert.equal(timeline.actions[1].cameraSettleMs, 0)
})

test('cursor begins moving while a new shot camera is still travelling', () => {
  const timeline = buildTimeline([
    validAction({ id: 'first', cameraShot: 'first-shot' }),
    validAction({
      id: 'second',
      cameraShot: 'second-shot',
      clickPoint: { x: 280, y: 120 },
    }),
  ])
  const second = timeline.actions[1]

  assert.ok(second.cameraMoveMs >= 500)
  assert.ok(second.travelStartMs < second.startMs + second.cameraMoveMs)
  assert.ok(second.interactionMs >= second.startMs + second.cameraMoveMs)
})

test('typing in the already focused field adds no synthetic cursor travel', () => {
  const focus = validAction({
    id: 'focus-profit',
    kind: 'focus',
    targetRole: 'textbox',
    cameraShot: 'profit',
  })
  const typing = validAction({
    id: 'type-profit',
    kind: 'type',
    targetRole: 'textbox',
    cameraShot: 'profit',
    text: '35',
    typingScenes: [
      { scene: '010-empty.png', value: '' },
      { scene: '011-3.png', value: '3' },
      { scene: '012-35.png', value: '35' },
    ],
    afterScene: '012-35.png',
  })
  const timeline = buildTimeline([focus, typing])

  assert.equal(timeline.actions[1].travelMs, 0)
})

const CLICK_KINDS = new Set([
  'click',
  'focus',
  'open',
  'select',
  'save',
  'toggle',
  'type',
])

const RECT_KEYS = ['x', 'y', 'width', 'height']

function assertRect(rect, label) {
  if (!rect || RECT_KEYS.some((key) => !Number.isFinite(rect[key]))) {
    throw new Error(`${label} must be a finite rectangle`)
  }
  if (rect.width <= 0 || rect.height <= 0) {
    throw new Error(`${label} must have positive dimensions`)
  }
}

export function containsPoint(rect, point) {
  assertRect(rect, 'target rectangle')
  if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) {
    return false
  }
  return point.x >= rect.x
    && point.x <= rect.x + rect.width
    && point.y >= rect.y
    && point.y <= rect.y + rect.height
}

export function validateCursorFrame(cursorRect, outputFrame) {
  assertRect(cursorRect, 'cursor rectangle')
  const { width, height, inset = 0 } = outputFrame ?? {}
  if (![width, height, inset].every(Number.isFinite) || width <= 0 || height <= 0 || inset < 0) {
    throw new Error('output frame must define positive dimensions and a non-negative inset')
  }

  const safe = cursorRect.x >= inset
    && cursorRect.y >= inset
    && cursorRect.x + cursorRect.width <= width - inset
    && cursorRect.y + cursorRect.height <= height - inset
  if (!safe) throw new Error('cursor leaves output frame safe inset')
  return true
}

function validateTypingScenes(action) {
  if (action.kind !== 'type') return
  if (action.targetRole !== 'textbox') {
    throw new Error('type action must target the focused textbox itself')
  }
  if (typeof action.text !== 'string' || action.text.length === 0) {
    throw new Error('type action must declare non-empty text')
  }
  if (!Array.isArray(action.typingScenes) || action.typingScenes.length !== action.text.length + 1) {
    throw new Error('typing must be captured one character at a time')
  }

  for (let index = 0; index < action.typingScenes.length; index += 1) {
    const expectedValue = action.text.slice(0, index)
    const typingScene = action.typingScenes[index]
    if (!typingScene?.scene || typingScene.value !== expectedValue) {
      throw new Error('typing must be captured one character at a time')
    }
  }
}

export function validateAction(action) {
  if (!action?.id || typeof action.id !== 'string') {
    throw new Error('action must have an id')
  }
  if (!CLICK_KINDS.has(action.kind)) {
    throw new Error(`${action.id}: unsupported action kind`)
  }
  assertRect(action.targetRect, `${action.id} target rectangle`)
  assertRect(action.frameRect, `${action.id} camera frame rectangle`)
  if (!containsPoint(action.targetRect, action.clickPoint)) {
    throw new Error(`${action.id}: click point is outside target rectangle`)
  }
  if (action.kind === 'toggle' && action.targetRole !== 'switch') {
    throw new Error(`${action.id}: toggle action must target the switch itself`)
  }
  if (action.kind === 'select' && action.targetRole !== 'option' && action.targetRole !== 'row') {
    throw new Error(`${action.id}: selection must target the option or row itself`)
  }
  if (!Array.isArray(action.stateDelta) || action.stateDelta.length !== 1) {
    throw new Error(`${action.id}: action must declare exactly one semantic state delta`)
  }
  if (!action.beforeScene || (!action.afterScene && action.kind !== 'type')) {
    throw new Error(`${action.id}: action must reference captured before and after scenes`)
  }
  if (!Number.isFinite(action.holdMs) || action.holdMs < 120 || action.holdMs > 1100) {
    throw new Error(`${action.id}: readable hold must be between 120 and 1100 ms`)
  }
  validateTypingScenes(action)
  return true
}

export function validateTrace(trace) {
  const viewport = trace?.viewport
  if (!viewport || viewport.width !== 1920 || viewport.height !== 1080 || viewport.deviceScaleFactor !== 2) {
    throw new Error('trace viewport must be 1920x1080 at device scale factor 2')
  }
  if (!Array.isArray(trace.actions) || trace.actions.length === 0) {
    throw new Error('trace must contain actions')
  }

  const ids = new Set()
  let previousStartedAt = -Infinity
  for (const action of trace.actions) {
    validateAction(action)
    if (ids.has(action.id)) throw new Error(`duplicate action id: ${action.id}`)
    ids.add(action.id)
    if (Number.isFinite(action.startedAtMs)) {
      if (action.startedAtMs <= previousStartedAt) {
        throw new Error('trace actions must be strictly sequential')
      }
      previousStartedAt = action.startedAtMs
    }
  }
  return true
}

function deterministicTravelMs(id) {
  let hash = 0
  for (const character of id) hash = ((hash * 31) + character.charCodeAt(0)) >>> 0
  return 340 + (hash % 151)
}

function pointerTravelMs(action, previousAction) {
  if (action.kind === 'type' && previousAction?.cameraShot === action.cameraShot) return 0
  if (!previousAction) return 430
  const distance = Math.hypot(
    action.clickPoint.x - previousAction.clickPoint.x,
    action.clickPoint.y - previousAction.clickPoint.y,
  )
  const naturalTravel = Math.round(280 + (distance * 0.18))
  const variation = (deterministicTravelMs(action.id) % 41) - 20
  return Math.max(280, Math.min(680, naturalTravel + variation))
}

export function buildTimeline(actions) {
  let cursorMs = 650
  const timelineActions = actions.map((action, index) => {
    validateAction(action)
    const previousAction = actions[index - 1]
    const cameraShot = action.cameraShot ?? action.id
    const previousCameraShot = previousAction?.cameraShot ?? previousAction?.id
    const changesShot = index > 0 && cameraShot !== previousCameraShot
    const cameraMoveMs = changesShot ? 620 : 0
    const cameraSettleMs = changesShot ? 90 : 0
    const travelMs = pointerTravelMs(action, previousAction)
    const intentMs = 150
    const feedbackMs = 120
    const stateMs = action.kind === 'type'
      ? Math.max(220, action.text.length * 60)
      : 140
    const holdMs = action.holdMs
    const startMs = cursorMs
    const travelStartMs = startMs + (changesShot ? 120 : 0)
    const cameraReadyMs = startMs + cameraMoveMs + cameraSettleMs
    const cursorReadyMs = travelStartMs + travelMs
    const interactionMs = Math.max(cameraReadyMs, cursorReadyMs) + intentMs
    const endMs = interactionMs + feedbackMs + stateMs + holdMs
    cursorMs = endMs
    return {
      ...action,
      startMs,
      cameraMoveMs,
      cameraSettleMs,
      travelMs,
      travelStartMs,
      intentMs,
      interactionMs,
      feedbackMs,
      stateMs,
      holdMs,
      endMs,
    }
  })

  return {
    actions: timelineActions,
    durationMs: cursorMs + 1100,
  }
}

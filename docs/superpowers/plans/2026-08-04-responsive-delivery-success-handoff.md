# Responsive Delivery and Success Handoff Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Delivery Options readable at 1012px and replace the centered lead-source completion screen with a minimal two-column, channel-specific handoff containing a professional 16:9 walkthrough.

**Architecture:** Keep existing campaign state and routing. Align the delivery-card grid breakpoint with `SelectableCard`, extract one reusable `CampaignWalkthroughVideo`, and drive copy/media from the existing channel configuration map. Generate four 1080p WebM assets from real editor captures with smooth camera and pointer motion; keep the existing PNGs as posters.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, Radix Dialog, Lucide React, Playwright, Python Pillow, Playwright's bundled VP8 encoder.

## Global Constraints

- Do not create a git commit until the user explicitly approves one.
- Preserve all unrelated dirty-worktree changes.
- At 1012x1391, Delivery Options uses one full-width card per row.
- At `lg` and above, Delivery Options uses the existing three-column layout.
- Success handoff uses a 38/62 desktop split and stacks below `md`.
- Walkthroughs are 1920x1080, silent, autoplaying, muted, looping, and inline.
- Camera motion is subtle: ease toward the relevant tab, click accent, then settle on the configured panel.
- Reuse existing design-system dialog, button, typography, border, spacing, and icon primitives.
- Keep close behavior and `Next` routing unchanged.

---

### Task 1: Responsive Delivery Options

**Files:**
- Modify: `e2e/campaign-creation-copy.spec.ts`
- Modify: `src/features/campaign/components/delivery-options-content.tsx`

**Interfaces:**
- Consumes: existing `DeliveryOptionsContentProps` and `SelectableCard`.
- Produces: the same component API with a responsive parent grid.

- [x] **Step 1: Add a failing responsive behavior test**

Add a test that opens campaign creation at 1012x1391, advances to Delivery Options, reads the three selectable-card bounding boxes, and asserts identical `x` positions plus strictly increasing `y` positions:

```ts
test('stacks delivery choices at compact desktop widths', async ({ page }) => {
  await page.setViewportSize({ width: 1012, height: 1391 })
  await openCampaignLauncher(page)
  await page.getByRole('button', { name: /Create campaign only/ }).click()
  await page.getByRole('button', { name: /Create New/ }).click()
  await page.getByRole('button', { name: 'Next', exact: true }).click()

  const cards = page.locator('[data-slot="selectable-card"]')
  await expect(cards).toHaveCount(3)
  const boxes = await cards.evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect()
    return { x: rect.x, y: rect.y, width: rect.width }
  }))

  expect(new Set(boxes.map(({ x }) => Math.round(x))).size).toBe(1)
  expect(boxes[1].y).toBeGreaterThan(boxes[0].y)
  expect(boxes[2].y).toBeGreaterThan(boxes[1].y)
  expect(Math.min(...boxes.map(({ width }) => width))).toBeGreaterThan(400)
})
```

- [x] **Step 2: Run the focused test and verify RED**

Run:

```bash
npx playwright test e2e/campaign-creation-copy.spec.ts --project=chromium --grep "stacks delivery choices" --reporter=line
```

Expected: FAIL because the cards currently occupy three columns.

- [x] **Step 3: Implement the minimal responsive grid**

Change the non-forced layout in `DeliveryOptionsContent` to:

```tsx
<div className={stacked ? 'flex flex-col gap-3' : 'grid grid-cols-1 gap-3 lg:grid-cols-3'}>
```

- [x] **Step 4: Run the focused test and verify GREEN**

Run the command from Step 2. Expected: PASS.

- [x] **Step 5: Inspect the scoped diff without committing**

```bash
git diff -- e2e/campaign-creation-copy.spec.ts src/features/campaign/components/delivery-options-content.tsx
```

Expected: only the responsive test and one grid-class change.

---

### Task 2: Success Handoff Contract

**Files:**
- Modify: `e2e/campaign-next-steps.spec.ts`
- Create: `src/features/campaign/components/campaign-walkthrough-video.tsx`
- Modify: `src/features/campaign/components/lead-source-next-steps-dialog.tsx`

**Interfaces:**
- Produces: `CampaignWalkthroughVideo({ channel, title, poster }: { channel: Channel; title: string; poster: string })`.
- Consumes: `Channel`, `import.meta.env.BASE_URL`, and `LeadSourceNextStepsDialog` channel configuration.

- [x] **Step 1: Replace the static-preview assertion with failing handoff assertions**

For each channel case, add `nextStepHeading` and assert:

```ts
await expect(dialog.getByText('Next step', { exact: true })).toBeVisible()
await expect(dialog.getByRole('heading', { name: config.nextStepHeading, exact: true })).toBeVisible()

const video = dialog.locator(`video[data-channel="${config.channelSlug}"]`)
await expect(video).toBeVisible()
await expect(video).toHaveAttribute('poster', new RegExp(`campaign-preview-${config.channelSlug}\\.png$`))
await expect(video.locator('source')).toHaveAttribute(
  'src',
  new RegExp(`campaign-walkthrough-${config.channelSlug}\\.webm$`),
)
expect(await video.evaluate((element: HTMLVideoElement) => ({
  autoplay: element.autoplay,
  muted: element.muted,
  loop: element.loop,
  playsInline: element.playsInline,
}))).toEqual({ autoplay: true, muted: true, loop: true, playsInline: true })
```

At 1012x1391, assert the confirmation and next-step regions sit side by side and the video ratio is within 0.02 of 16/9.

- [x] **Step 2: Run the focused suite and verify RED**

```bash
npx playwright test e2e/campaign-next-steps.spec.ts --project=chromium --reporter=line
```

Expected: FAIL because the dialog has no next-step heading or video and still uses the centered static-image layout.

- [x] **Step 3: Add the reusable video component**

Create `campaign-walkthrough-video.tsx` with a video that has `data-channel`, `aria-label`, `aspect-video`, poster, WebM source, `autoPlay`, `muted`, `loop`, `playsInline`, and `preload="metadata"`.

- [x] **Step 4: Refactor the dialog into the approved split layout**

Extend `ChannelNextStep` with `heading`. Use:

```tsx
<div className="grid min-h-0 flex-1 overflow-y-auto md:grid-cols-[3fr_5fr]">
  <section data-region="creation-confirmation" className="flex flex-col px-7 py-8 md:px-8">
    <div className="flex size-10 items-center justify-center rounded-full bg-success/10 text-success">
      <CircleCheck className="size-6" aria-hidden="true" />
    </div>
    <DialogTitle className="mt-5 text-xl font-semibold leading-7 text-foreground">
      Your lead source has been created!
    </DialogTitle>
    <p className="mt-3 text-sm leading-5 text-muted-foreground">
      Your lead source and initial campaign configuration for{' '}
      <strong className="font-semibold text-foreground">&quot;{campaignName}&quot;</strong>{' '}
      have been created successfully.
    </p>
    <div className="mt-auto flex items-start gap-2 pt-8 text-sm leading-5 text-muted-foreground">
      <CircleHelp className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
      <p>You can always return to the Campaign Settings later to make updates or adjustments.</p>
    </div>
  </section>
  <section
    data-region="channel-next-step"
    className="border-t border-border px-7 py-8 md:border-l md:border-t-0 md:px-8"
  >
    <p className="text-xs font-semibold uppercase tracking-wide text-primary">Next step</p>
    <h2 className="mt-2 text-xl font-semibold leading-7 text-foreground">{nextStep.heading}</h2>
    <p className="mt-3 text-sm leading-5 text-muted-foreground">{nextStep.paragraph}</p>
    <div className="mt-6 overflow-hidden rounded-md border border-border bg-muted">
      <CampaignWalkthroughVideo
        channel={channel}
        title={`${nextStep.heading} walkthrough`}
        poster={nextStep.poster}
      />
    </div>
  </section>
</div>
```

Use Lucide `CircleCheck` and `CircleHelp`. Preserve the footer and existing `Next` handler.

- [x] **Step 5: Run the focused suite**

Run the command from Step 2. Expected: layout, copy, playback properties, and routing pass; media readiness completes after Task 3.

---

### Task 3: Professional 1080p Channel Walkthroughs

**Files:**
- Create: `scripts/generate-campaign-walkthroughs.py`
- Create: `design-qa-assets/walkthrough-sources/web.png`
- Create: `design-qa-assets/walkthrough-sources/ping-post.png`
- Create: `design-qa-assets/walkthrough-sources/phone.png`
- Create: `design-qa-assets/walkthrough-sources/chat.png`
- Create: `public/assets/campaign-walkthrough-web.webm`
- Create: `public/assets/campaign-walkthrough-ping-post.webm`
- Create: `public/assets/campaign-walkthrough-phone.webm`
- Create: `public/assets/campaign-walkthrough-chat.webm`

**Interfaces:**
- Script input: `--source-dir`, `--output-dir`, optional `--ffmpeg`, optional `--cursor`.
- Script output: four 1920x1080 VP8 WebM files named `campaign-walkthrough-{channel}.webm`.

- [x] **Step 1: Capture clean 1920x1080 editor states in the selected Codex browser**

Use the in-app browser viewport capability at 1920x1080. Open each launcher channel card and capture the target panel with no browser chrome into `design-qa-assets/walkthrough-sources/{channel}.png`. Restore the ordinary viewport after capture.

- [x] **Step 2: Implement the deterministic frame generator**

Use Pillow to crop each source to 16:9, render at 1920x1080, and animate the macOS cursor asset. Use cubic easing for pointer movement, a camera push from 1.00 to 1.10 centered on the target tab, a restrained click ring, and a final hold at 1.08. Encode 180 frames at 30fps and 4.5 Mbps through Playwright's bundled VP8 encoder.

- [x] **Step 3: Generate all four walkthroughs**

```bash
python3 scripts/generate-campaign-walkthroughs.py \
  --source-dir design-qa-assets/walkthrough-sources \
  --output-dir public/assets
```

Expected: four non-empty WebM files.

- [x] **Step 4: Verify media metadata and browser decoding**

Use browser-side `videoWidth`, `videoHeight`, `readyState`, and `duration`. Expected for every channel: 1920x1080, duration from 5.5 through 6.5 seconds, and `readyState >= 1`.

- [x] **Step 5: Re-run the channel suite and verify GREEN**

```bash
npx playwright test e2e/campaign-next-steps.spec.ts --project=chromium --reporter=line
```

Expected: all channel handoff tests pass.

---

### Task 4: Regression and Visual QA

**Files:**
- Modify: `design-qa.md`
- Create: `design-qa-assets/success-handoff-1012x1391.png`
- Create: `design-qa-assets/delivery-options-1012x1391.png`

**Interfaces:**
- Consumes the responsive wizard and channel-specific success handoff.
- Produces a passing design-QA record and browser-visible preview.

- [x] **Step 1: Run the relevant regression suites**

```bash
npx playwright test \
  e2e/campaign-creation-copy.spec.ts \
  e2e/campaign-next-steps.spec.ts \
  e2e/campaign-channel-editor.spec.ts \
  --project=chromium --reporter=line
```

Expected: all tests pass.

- [x] **Step 2: Run static verification**

```bash
npx eslint \
  src/features/campaign/components/delivery-options-content.tsx \
  src/features/campaign/components/campaign-walkthrough-video.tsx \
  src/features/campaign/components/lead-source-next-steps-dialog.tsx \
  e2e/campaign-creation-copy.spec.ts \
  e2e/campaign-next-steps.spec.ts
npm run build
git diff --check
```

Expected: all commands exit 0; the existing Vite chunk-size warning is acceptable.

- [x] **Step 3: Verify in the selected Codex browser at 1012x1391**

Reload the local preview. Capture Delivery Options and the Web success handoff. Confirm card readability, 38/62 balance, 16:9 media, clean divider, no overflow, smooth motion, and working `Next` routing.

- [x] **Step 4: Complete design QA**

Compare the browser captures with the approved annotated target and design spec. Update `design-qa.md`, fix P0/P1/P2 issues, and set `final result: passed` only after the same-viewport comparison succeeds.

- [x] **Step 5: Leave the preview open and inspect the final diff**

Keep the completed screen open in the Codex browser. Run `git status --short` and report task files separately from pre-existing unrelated changes. Do not commit.

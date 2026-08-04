# Prototype Channel Launcher Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one-click launcher cards for opening the Web, PING/POST, Phone, and Chat campaign editor prototypes on their channel-specific initial tabs.

**Architecture:** `CampaignEntry` remains the launcher and uses the existing channel profile as the source of each editor's initial tab. `CenteredListGroup` gains a small typed column-count option so the two-card creation group and four-card editor group retain the existing card design without uneven grid rows.

**Tech Stack:** React 19, TypeScript, Zustand, Tailwind CSS, Lucide React, Playwright, Vite.

## Global Constraints

- This UI is a prototype launcher; shortcuts do not represent production navigation.
- Preserve the two existing creation flows unchanged.
- Every shortcut resets the campaign store before setting its channel and initial panel.
- Do not add routing, persistence, backend calls, dependencies, or production data.
- Do not create a Git commit until the user explicitly approves committing.

---

### Task 1: Specify the launcher shortcut behavior with failing tests

**Files:**
- Modify: `e2e/campaign-channel-editor.spec.ts`
- Modify: `e2e/campaign-creation-copy.spec.ts`

**Interfaces:**
- Consumes: launcher card accessible names and the existing `CampaignEditor` subtitle/title.
- Produces: regression coverage for the four direct editor shortcuts and removal of the generic editor card.

- [x] **Step 1: Add the direct-shortcut test matrix**

Add the exact card, subtitle, and target title cases:

```ts
const LAUNCHER_CHANNELS = [
  { card: 'Web campaign', subtitle: 'Campaign - Web', title: 'General Settings' },
  { card: 'Ping/Post campaign', subtitle: 'Campaign - PING/POST', title: 'PING Options' },
  { card: 'Phone campaign', subtitle: 'Campaign - Phone', title: 'Phone Numbers' },
  { card: 'Chat campaign', subtitle: 'Campaign - Chat', title: 'Web Chats' },
] as const
```

For every case, navigate to the launcher, click the card, assert the exact subtitle and heading, click Close, and assert the launcher headings return. Also assert `Open campaign editor` is absent.

- [x] **Step 2: Update the existing editor-preservation test**

Replace its click on `/Open campaign editor/` with the exact `Web campaign` shortcut. Keep the existing Web editor and Delivery Options assertions unchanged.

- [x] **Step 3: Run the shortcut tests and confirm the new contract fails**

Run:

```bash
npx playwright test e2e/campaign-channel-editor.spec.ts e2e/campaign-creation-copy.spec.ts --project=chromium --reporter=line
```

Expected: the new shortcut tests fail because the four cards and launcher group headings do not exist yet.

---

### Task 2: Implement grouped creation and channel-editor launcher cards

**Files:**
- Modify: `src/components/centered-list-group.tsx`
- Modify: `src/features/campaign/components/campaign-entry.tsx`

**Interfaces:**
- Consumes: `Channel`, `getCampaignChannelProfile(channel)`, `resetStore()`, `updateGeneral({ channel })`, and `setActivePanel({ section })`.
- Produces: `CenteredListGroupProps.columns?: 2 | 3 | 4` and `handleShowEditor(channel: Channel): void`.

- [x] **Step 1: Add typed card-column support**

Extend `CenteredListGroupProps` with `columns?: 2 | 3 | 4`, default it to `3`, and map it to static Tailwind classes:

```ts
const cardColumns = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
} as const
```

- [x] **Step 2: Replace the generic editor handler**

Implement the channel-aware handler:

```ts
const handleShowEditor = (channel: Channel) => {
  resetStore()
  updateGeneral({ channel })
  setActivePanel({ section: getCampaignChannelProfile(channel).completionTarget })
  setActiveView('editor')
}
```

- [x] **Step 3: Render two launcher groups**

Wrap two `CenteredListGroup` instances in one vertically centered launcher container:

- `Creation flows`, `columns={2}`: keep the existing lead-source and campaign cards.
- `Edit campaign settings`, `columns={4}`: add Web campaign, Ping/Post campaign, Phone campaign, and Chat campaign cards.

Use icons from the already-installed Lucide library. Each editor card calls `handleShowEditor` with its exact `Channel` value. Remove the generic `Open campaign editor` card.

- [x] **Step 4: Run the focused tests and confirm they pass**

Run the Task 1 Playwright command again. Expected: all tests pass, including all four shortcuts and existing creation-flow coverage.

---

### Task 3: Verify the production prototype

**Files:**
- Verify: `src/components/centered-list-group.tsx`
- Verify: `src/features/campaign/components/campaign-entry.tsx`
- Verify: `e2e/campaign-channel-editor.spec.ts`
- Verify: `e2e/campaign-creation-copy.spec.ts`

**Interfaces:**
- Consumes: the completed launcher and channel editor behavior.
- Produces: verified build output and an updated running production preview.

- [x] **Step 1: Run focused lint and whitespace validation**

Run:

```bash
npx eslint src/components/centered-list-group.tsx src/features/campaign/components/campaign-entry.tsx e2e/campaign-channel-editor.spec.ts e2e/campaign-creation-copy.spec.ts
git diff --check
```

Expected: both commands exit with code 0.

- [x] **Step 2: Build the production bundle**

Run `npm run build`. Expected: TypeScript and Vite succeed; the existing Vite large-chunk advisory may remain non-blocking.

- [x] **Step 3: Verify and hand off the running preview**

Confirm `http://127.0.0.1:4173/ping-post-config-app/campaign-configuration` returns HTTP 200. Verify both group headings and all six cards are visible, open each shortcut and verify its initial tab, then leave the launcher open for the user.

- [x] **Step 4: Confirm the working tree remains uncommitted**

Run `git status --short --branch`, report the launcher files separately from pre-existing changes, and do not commit.

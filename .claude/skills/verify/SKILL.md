---
name: verify
description: Build, launch, and drive this prototype to observe a change working end to end.
---

# Verifying changes in ping-post-config-app

This is a Vite + React prototype with **two independent apps** behind a hand-rolled
router (`src/config/routes.ts`). Pick the right URL or you will drive the wrong one.

## Launch

```bash
npm run dev -- --port 5178      # run in background; Playwright owns 5173
```

Wait for it, then open the surface you need. **The base path is `/ping-post-config-app/`**
(set for GitHub Pages), so a bare `localhost:5178/` will not serve the app:

| Feature | URL |
|---|---|
| Ping/Post delivery method | `http://localhost:5178/ping-post-config-app/` |
| Campaign config | `http://localhost:5178/ping-post-config-app/campaign-configuration.html` |

## Drive it

Use the **Claude Chrome extension** (`mcp__claude-in-chrome__*`), not Playwright and not
chrome-devtools-mcp. CLAUDE.md prefers it for prototype previewing, and it is what the
user expects to watch.

- `find` returns `ref_*` ids, but **clicking by `ref` is unreliable here**. Take a
  screenshot and click by coordinate instead.
- Batch with `browser_batch`: click, `wait` 1s, screenshot. The app has no loading
  states, so a 1s wait is enough between interactions.
- If `new_page` errors with "browser is already running for .../chrome-profile", an
  orphaned Chrome from a prior session is holding the profile:
  `pkill -f "chrome-devtools-mcp/chrome-profile"`.

## Entry points are behind a launcher

Both apps open on a card launcher, not the editor. You must click through:

- **Campaign**: three cards. "Open campaign editor" jumps straight to the editor panels
  (fastest path for editor changes). The other two open the creation wizard.
- **Ping/Post**: a creation modal gates the editor. `e2e/helpers/bypass-creation-modal.ts`
  documents the click path (Continue, pick Mortgage, Create), and note the PING/POST
  sidebar sections render **collapsed** and must be expanded.

## Gotchas

- `npm run build` (`tsc -b && vite build`) passes even with unreachable code. Dead code
  does not fail typecheck, and several modules in this repo are orphaned. Passing `tsc`
  proves nothing about whether your change is wired in. Drive the app.
- Two pre-existing lint errors (`delivery-options-content.tsx` fast-refresh,
  `integrations-manage.tsx` unused `_props`). Not yours; ignore them.
- The campaign feature has **zero e2e coverage**. All 86 Playwright tests target the
  ping/post route only. Runtime observation is the only safety net there.

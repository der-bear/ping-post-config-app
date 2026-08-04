# Prototype Channel Launcher Design

## Goal

Make every channel-specific campaign editor state directly accessible from the prototype launcher without completing the campaign wizard.

## Launcher Structure

The launcher is split into two clearly labeled groups.

### Creation flows

- **Create lead source and campaign** keeps the existing lead-source-first wizard.
- **Create campaign only** keeps the existing campaign wizard.

### Edit campaign settings

- **Web campaign** opens the Web editor on General Settings.
- **Ping/Post campaign** opens the PING/POST editor on PING Options.
- **Phone campaign** opens the Phone editor on Phone Numbers.
- **Chat campaign** opens the Chat editor on Web Chats.

The four editor shortcuts use the existing card styling and open the target state with one click. The existing generic **Open campaign editor** card is removed because the Web shortcut replaces it and the generic label does not expose the available channel variants.

## Behavior and Data Flow

Each editor shortcut:

1. Resets the campaign store to prevent state leaking from a previously viewed prototype.
2. Sets `config.general.channel` to the card's channel.
3. Sets `activePanel` to the channel profile's `completionTarget`.
4. Opens the existing `CampaignEditor` view.

No routing, persistence, backend calls, or production campaign data are added. Existing Close behavior returns to the launcher.

## Component Boundaries

- `CampaignEntry` owns launcher grouping and the shortcut click handler.
- `channel-profile.ts` remains the single source of truth for each channel's initial editor tab.
- Existing `CenteredListGroup` card styling is reused. If grouping needs a wrapper, it remains local to `CampaignEntry`; the shared card component is not redesigned.

## Error and Empty-State Handling

The shortcut handler always starts from the store defaults, so every editor opens in a predictable empty prototype state. Channel profiles are typed as a complete `Record<Channel, CampaignChannelProfile>`, preventing a shortcut from targeting an undefined channel profile.

## Verification

- Verify both existing creation-flow cards still open their wizards.
- Verify each of the four shortcut cards opens the correct channel subtitle and initial panel.
- Verify closing every editor returns to the launcher.
- Verify state does not leak when opening one channel, closing it, and opening another.
- Run focused launcher/channel Playwright tests, focused lint, and the production build.

## Constraints

- This UI is a prototype launcher, so direct shortcuts are intentional and do not represent production navigation.
- No commits are created until the user explicitly approves committing.

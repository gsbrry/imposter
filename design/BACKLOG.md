# Backlog: Impostr

| Item | Owner | Status | Notes |
|---|---|---|---|
| Sentry crash reporting | You, then Code | Waiting: create Sentry account and React Native project "impostr" | Then set EXPO_PUBLIC_SENTRY_DSN in EAS env and SENTRY_AUTH_TOKEN as an EAS secret, and run Prompt 6b in PROMPTS-FOR-CODE.md |
| TalkBack test on a real Android phone | You | To do | Play one full game with TalkBack on |
| Play reviewer access to Pro | You | To do before next store update | Add reviewer as licence tester in Play Console, or grant the entitlement in RevenueCat |
| Upload website | You | To do | Upload website/index.html (sent in chat) to apps.obio.in/imposter/ |
| Privacy policy URL in Play Console | You | To do after upload | https://apps.obio.in/imposter/#privacy |
| Imposter's last chance twist | Later | Idea | See specs/game-flow-changes.md section 3 |
| Session scoreboard | Later | Idea | See specs/game-flow-changes.md section 3 |
| Online play | Phase 2 | Designed | Screens 17 to 22 |
| Rewards, share, invite | Phase 1.5 | Designed | Screens 26 to 30 |
| Player setup: add/remove, edit affordance | Code | Done 2026-10-29 | Game settings (step 2) and player names (step 3). See "Player setup" below. |
| Reveal screen rework | Code | Done 2026-10-29 | Press-and-hold, button colour and text, header placement, undo safety. See "Reveal screen" below. |

---

## Player setup (requested 2026-10-18)

**Game settings (step 2 — `app/game-settings.tsx`)**
- The player-count stepper's `+` button is reported as not clearly visible. It currently
  renders as a honey-coloured plus icon (`components/Stepper.tsx`) — check contrast and
  size against the card background before assuming it is a code bug; may just need a
  stronger visual treatment (filled circle, bigger hit target).

**Player names (step 3 — `app/player-names.tsx`)**
- Names are already directly editable today (a live `TextInput` per row, no tap-to-edit
  step) — but there is no visual cue that they're editable. Add a light grey pencil icon
  next to each name as an edit affordance.
- Add a `+` button on this screen to add another player directly here, instead of only
  being able to set the count back on step 2.
- Add a way to remove a player from this screen (e.g. a delete icon per row). Needs a
  floor: keep the existing 3-player minimum (`MIN_PLAYERS` in `game-settings.tsx`) in
  sync if removal can drop below it.

## Reveal screen (requested 2026-10-18)

Current behaviour in `app/reveal.tsx`, for context: press-and-hold on the card reveals
the word (`onPressIn`), hides on release (`onPressOut`) **and also auto-hides after 3
seconds even while still held** (`PEEK_MS` timer runs regardless of finger state). The
"Hide and pass" button only renders once the word is hidden again
(`hasSeenWord && !wordVisible`), so it is off-screen the whole time the card is held.

Requested changes:
- While the player is touching and holding, keep the word revealed for as long as they
  hold — remove the 3-second auto-hide while still pressed (it can still apply after
  release, if that is wanted as a safety timeout).
- Keep it the *same* card throughout, not a swap to what reads as a different pop-up
  card for the revealed state vs. the pre-reveal "press and hold" prompt.
- The pass/next button should be visible **while holding**, not only after release so
  it is no longer hidden behind the hold gesture.
- Make that button the primary (honey) colour instead of the current ink `InkButton`.
- Button label: "Pass to [Player name]" instead of the current generic "Hide and pass".
- Move the "PLAYER 1 OF 3" counter from the top header down to sit just above the
  action button. Raphy's reasoning: clearer there, worth doing — agreed, no objection
  from this side either.

**Decided and built 2026-10-29:** option 2 — a back button that returns to the
*previous* player's card — shipped as a `GameSettings.revealBackEnabled` toggle in
Game settings, on by default. The privacy gap this opens (whoever now holds the
phone can press-and-hold to see the previous player's word) is mitigated but not
eliminated: going back re-shows that player's own pass-the-phone prompt, gated
behind its own fresh press-and-hold rather than auto-revealing — it does not hand
the word straight over. A one-time tip banner nudges players that this can be
turned off in Game Settings; it only shows after a real gap since the last launch
(`storage.LONG_ABSENCE_MS`, 7 days) and never on a first-ever install, and only
ever once (`storage.getRevealBackTipShown`).

# Phase 1 additions: build spec

Eight items to build alongside the Phase 1 redesign. Each one lists the screens, what to build, and how to know it is done. Screens are in `design/screens/` and on the board (Design tab, "Phase 1 additions").

Order: 1, 2, 5, 8, 3, 7, 6, 4. Items 3, 4 and 7 are store and policy work; they finish just before release.

---

## 1. Pause and exit during a round

**Screens:** 10 Clue round (pause button), 31 Pause game, 32 Exit confirm.

**Build**
- Replace the close icon on Clue round with a pause button (top left).
- Pause opens a bottom sheet. The timer stops and tick sounds stop.
- Sheet actions: Resume (primary), Restart round, End and reveal, Exit to home.
- Exit to home shows a confirm dialog first. Leaving does not count the game in stats.
- Android back button and app going to the background both pause the game.
- The paused screen never shows the secret word.

**Done when**
- The timer value is the same before and after a pause.
- Back button during a round opens the pause sheet, not the previous screen.
- Exiting does not change games played or win counts.
- Restart round keeps the same word and imposter, and restarts clues from player 1.

---

## 2. Crash reporting

**Build**
- Add Sentry (`@sentry/react-native` with its Expo config plugin). One tool only.
- Turn it on for release builds only. Set environment and release from the app version.
- Do not send personal data: turn off default PII, strip player names from breadcrumbs and events.
- Keep the Sentry auth token in EAS secrets, never in the repo.
- Upload source maps during EAS build so stack traces are readable.

**Done when**
- A test crash in an internal build shows in Sentry with a readable stack trace.
- No player names, words or device IDs appear in a sample event.
- Development builds send nothing.

---

## 3. Privacy policy and Play Data safety form

**Build**
- Update `public/privacy-policy.html` with plain sections: what we collect, why, who processes it, how long we keep it, how to contact us.
- Fill the Play Console Data safety form from the table below. Update both whenever a feature in the table ships.

| Data | Phase 1 | Phase 1.5 | Phase 2 | Planned ads |
|---|---|---|---|---|
| Crash logs and diagnostics (Sentry) | Yes, not linked to a person | Yes | Yes | Yes |
| App interactions (analytics events) | No | Yes, not linked to a person | Yes | Yes |
| Purchase history (RevenueCat, Google Play) | Yes | Yes | Yes | Yes |
| Device or other IDs | No | Install referrer for invites | Anonymous device ID for rooms | Advertising ID |
| User content (names, clues) | Stays on the device | Stays on the device | Sent to the server for the room only | Same |
| Support reports (form or email) | Yes, only what the user sends | Yes | Yes | Yes |

- Data is encrypted in transit (HTTPS). Users can ask for deletion through the support email.

**Done when**
- The policy URL in Play Console opens the updated page.
- Every row marked Yes for the release is declared in the Data safety form.

---

## 4. New store screenshots

**Files (ready):** `design/store/screenshot-1.png` to `screenshot-6.png` (1080 x 1920) and `design/store/feature-graphic-1024x500.png`. Source: `design/store/store.html`.

**Build**
- Upload the six screenshots in order and the feature graphic.
- After the app is rebuilt, replace the screen images with real captures at the same size, keeping the captions.
- Short description (80 characters max): `The party word game: one word, one liar. Offline, 3 to 12 players.`

**Done when**
- The listing shows the new screenshots and icon.
- Screenshots match the shipped app.

---

## 5. Accessibility

**Screens:** 14 Settings (Accessibility section).

**Build**
- Every icon button has an `accessibilityLabel` (for example "Pause game", "Back", "Close"). Every control has the right `accessibilityRole`.
- Touch targets are at least 44 x 44.
- Respect system font size. Cap very large headings with `maxFontSizeMultiplier` (about 1.4) so layouts do not break.
- Settings > Larger text: scales text and buttons by 1.15.
- Settings > Reduce motion: turns off pulses, glows and the splash loader. Also follow the system setting (`AccessibilityInfo.isReduceMotionEnabled`).
- Colour tokens already meet contrast: muted text `#6F6757` and honey text `#805B00` on cream both pass 4.5:1.
- Reveal screens: screen readers read the word aloud. Show a one-line tip on Pass the phone when TalkBack is on: "Use headphones so others cannot hear your word."
- Crew and imposter reveal screens have the same reading order and the same number of elements.

**Done when**
- TalkBack can play a full game.
- With the largest system font, no text is cut off on the main flow.
- Reduce motion removes all repeating animations.

---

## 6. Updating words without an app update

**Screens:** 14 Settings (Word packs row), 35 New words added.

**Build**
- Host one JSON file over HTTPS, for example `https://<your-domain>/words/feed.json`. Example shape: `design/specs/words-feed.example.json`.
- On launch, if online and more than 24 hours since the last check, fetch the feed. Never block the app on it.
- Validate before use: correct version field, expected categories only, each word a short plain string, total size under 1 MB. Reject the whole feed if anything fails.
- Store the accepted feed in AsyncStorage and merge it with the bundled `data/words.json`. The bundled list is always the fallback.
- Packs can have `availableFrom` and `availableUntil` dates for festival packs.
- When new words arrive, show the New words sheet once.
- Settings shows word count and last update date, with a Check button.

**Done when**
- The app works fully in airplane mode with only bundled words.
- A broken or oversized feed is ignored and the app keeps the last good words.
- A festival pack appears and disappears on its dates.

---

## 7. Age rating

**Build**
- Fill the IARC questionnaire in Play Console honestly. For Phase 1: no violence, no sexual content, no gambling, no user-to-user communication, in-app purchases yes.
- Set target audience to 13 and over. This keeps ads and analytics simpler under Play's Families policy.
- Review all words in `data/words.json` for adult, offensive or brand-sensitive terms before release. Add a check script that fails if any word is on a blocked list.
- Phase 2 changes the answers: players share names and clues with others, so update the questionnaire and add reporting.

**Done when**
- The rating certificate is issued and matches the content.
- The word check script passes in CI.

---

## 8. In-app support

**Screens:** 14 Settings (Help section), 33 Help and support, 34 Report a problem.

**Build**
- Help and support: Report a problem, Report a word, Purchase help, three quick answers, and the support email shown as text with a copy button.
- Report a problem: type chips (Bug, Bad word, Purchase, Other), a text box, and an "Include device details" toggle (phone model, Android version, app version).
- Send reports to an email inbox or a simple form endpoint. Do not send player names.
- Purchase help opens RevenueCat's customer centre or the Play subscriptions page.
- Replace the placeholder email `support@gooseberry.media` with the real address.

**Done when**
- A report arrives with the selected type, text and device details.
- Copying the email works, and the email is visible as text even if no mail app is set up.

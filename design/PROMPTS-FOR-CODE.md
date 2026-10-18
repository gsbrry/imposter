# Prompts for Code: Impostr redesign

Paste these into Code one at a time, in order. Wait for each to finish and check the result on a phone before pasting the next. Each prompt is self-contained.

Before you start: the project already has uncommitted changes in many `app/` and `components/` files. Prompt 0 deals with them first so nothing is lost.

---

## Prompt 0: Save current work and set up a branch

```
In this Expo project, run git status. Many files under app/, components/ and constants/ have uncommitted changes, and design/ is untracked.
1. Show me a short summary of what the uncommitted changes do (one line per file).
2. Commit them as they are on the current branch with the message "WIP before redesign", so nothing is lost.
3. Commit the design/ folder with the message "Add design v2 reference".
4. Create and switch to a new branch called redesign-v2.
Do not change any code yet. Do not push.
```

---

## Prompt 1: Foundation (theme, fonts, shared components, clean-up)

```
Read design/README.md and design/tokens.json, and open design/index.html (Design and Developer notes tabs). This is the new Honey and Cream design. The HTML is a visual reference only; build everything in React Native.

Do this, in order:
1. Replace the colours in constants/theme.ts with the tokens from design/tokens.json. Rename the old "yellow" keys to clear names (honey, honeyText, ink, cream, muted and so on) and update every call site.
2. Replace Nunito with Outfit (headings, numbers) and Plus Jakarta Sans (body, labels, buttons) using @expo-google-fonts/outfit and @expo-google-fonts/plus-jakarta-sans. Remove Nunito.
3. Build shared components in components/, matching assets/impostr.css: ScreenBackground (cream, two blurred honey orbs, faint dot pattern), GlassCard (expo-blur, fill and border from tokens, radius 20), BottomSheet, GlassTabBar, PrimaryButton (honey gradient), InkButton, GlassButton, TextButton, IconButton, Toggle, Segmented, Stepper, Chip, TextField, Avatar, CategoryTile, RevealCard, TimerRing, VoteCard, ProgressBar.
4. Keep one icon library (lucide-react-native). Remove phosphor-react-native and @lucide/lab if nothing else needs them.
5. Clean-up: delete the duplicate utils/getWord.js and utils/selectImposter.js (keep the .ts files); rename package.json "name" to "impostr"; replace the sort(() => Math.random() - 0.5) shuffle with Fisher-Yates.
6. Every icon-only button gets an accessibilityLabel. Touch targets at least 44 x 44.

Run npm run typecheck and npm run lint and fix all errors. Do not restyle screens yet. Commit with a clear message.
```

---

## Prompt 2: Home, How to play and the setup flow

```
Using the shared components from the last step, rebuild these screens to match design/screens/ exactly (open each HTML file in a browser to compare):
- 01-splash.html -> splash in app/_layout.tsx
- 02-home.html and 03-how-to-play.html -> app/(tabs)/index.tsx (How to play is a bottom sheet)
- 04-category.html -> app/setup.tsx (3-column category grid, Easy / Medium / Chaos segmented control, step 1 of 3 progress)
- 05-game-settings.html -> app/game-settings.tsx
- 06-player-names.html -> app/player-names.tsx
- The tab bar in app/(tabs)/_layout.tsx becomes the floating glass tab bar (Play, Stats, Settings).

Rules: category display names are one word each (General, Vehicles, Home, Food, Bollywood, Sports, Animals, Jobs, Festivals); change them in the word data, not in screen code. One honey button per screen. Straight apostrophes only in all text. Keep all existing game logic and storage keys.

Check each screen at 360 x 640 and 430 x 932: nothing cut off, no sideways scrolling. Run typecheck and lint. Commit.
```

---

## Prompt 3: In-game screens (reveal, clue round, vote, result)

```
Rebuild the in-game screens to match design/screens/:
- 07-pass-phone.html, 08-word-reveal.html, 09-imposter-reveal.html -> app/reveal.tsx
- 10-clue-round.html -> app/clue-round.tsx (pause button top left, timer ring)
- 11-vote.html -> app/vote.tsx
- 12-result.html -> app/result.tsx

Critical rule: the crew reveal and the imposter reveal must use the same RevealCard component with identical colours, size, brightness, layout, animation, haptics and sound. Only the text changes. No red anywhere. In a dark room nobody should be able to tell who the imposter is from the screen or the sound.

Keep the existing imposter selection, word selection, timer, voting and tie logic. Run typecheck and lint. Commit.
```

---

## Prompt 3b: Random starter and new defaults

```
Stay on branch redesign-v2. Read design/specs/game-flow-changes.md, sections 1 and 2, and open design/screens/37-who-starts.html.
1. After the last word reveal, show the Who starts screen: pick a random starting player, show the clue order going round from them, then Start clues. Clue rounds use that order. Rules: imposter can start; no player starts two games in a row (3+ players); uniform random otherwise; Pick again rerolls under the same rules. Word reveal order is unchanged.
2. Defaults: timer per clue Off, clue rounds 2. Only for new installs or players who never changed these settings.
3. Add a unit test that simulates 100 games of 5 players and checks: everyone starts at least once, nobody starts twice in a row, imposter start rate is close to 1 in 5.
Keep all other game logic. Theme tokens only. Run typecheck, lint and the test. Commit. Do not push.
```

---

## Prompt 3c: One more round, Skip vote, reload crash

(The clue-round loop itself was already built in Prompt 3b.)

```
Stay on branch redesign-v2. The clue-round loop is already built; do not rework it.
1. One more round: when the last player of the final clue round finishes, show two buttons: "Go to vote" (primary) and "One more round" (secondary). One more round adds one full pass in the same order and bumps the header to "Clue round X of N+1". It can be used any number of times.
2. Skip vote: add the dashed "Skip vote" cell from design/screens/11-vote.html. A skipped vote is stored as null and counts for nobody. The tally shows "x skipped". If every vote is skipped, go to the result in its existing "Voting skipped" state.
3. Fix the crash when the web build loads /reveal (or any in-game route) directly with no players: if there is no game in progress, redirect to Home instead of calling selectImposter.
4. Keep hold-to-peek with the 3s auto-hide on the reveal.
Add unit tests: One more round adds exactly one pass in the same order; votes with nulls tally correctly; all-null votes give the skipped state. Run typecheck, lint and npm test. Commit. Do not push.
```

---

## Prompt 4: Stats, Settings, Premium, Suggest

```
Rebuild these screens to match design/screens/:
- 13-stats.html -> app/(tabs)/stats.tsx
- 14-settings.html and 36-settings-scrolled.html -> app/(tabs)/settings.tsx. Include all sections: Go Premium card, Gameplay, Sound and feel, Accessibility, Word packs, Help, and the version line. Rows for features that do not exist yet (Larger text, Reduce motion, Word packs, Help and support) can be wired in the next prompts; add them now with the toggles saving to AsyncStorage.
- 15-premium.html -> app/premium.tsx (keep RevenueCat purchase and restore logic; plans Monthly Rs 49, Yearly Rs 199 marked SAVE 66%, Lifetime Rs 599)
- 16-suggest.html -> app/suggest.tsx

Security fix: remove the 7-tap reviewer unlock on the version label (constants/reviewAccess.ts and its use in settings) from release builds. Check the RevenueCat entitlement on every app launch; use the cached premium status only when offline.

Run typecheck and lint. Commit.
```

---

## Prompt 5: Phase 1 additions, part A (pause, accessibility, support)

```
Read design/specs/phase1-additions.md. Build items 1, 5 and 8 and meet every "Done when" check:
- Item 1 Pause and exit: screens 31-pause.html and 32-exit-confirm.html. Pause stops the timer and sounds; Android back and app backgrounding pause the game; exiting does not count in stats; the word is never visible while paused.
- Item 5 Accessibility: labels and roles everywhere, respect system font size with maxFontSizeMultiplier about 1.4 on large headings, Larger text setting (scale 1.15), Reduce motion setting plus the system setting, the headphones tip on Pass the phone when TalkBack is on.
- Item 8 In-app support: 33-help.html and 34-report.html. Show the support email as text with a copy button. Leave the email as a constant called SUPPORT_EMAIL so I can change it.

Run typecheck and lint. Commit.
```

---

## Prompt 6: Phase 1 additions, part B (crash reporting, word updates, age rating, privacy)

```
Read design/specs/phase1-additions.md. Build items 2, 6, 7 and 3 and meet every "Done when" check:
- Item 2 Crash reporting: add @sentry/react-native with its Expo plugin, release builds only, default PII off, no player names in events. Read the DSN from an EXPO_PUBLIC_SENTRY_DSN env var and the auth token from EAS secrets. Never commit a token.
- Item 6 Word updates: fetch a JSON feed (shape in design/specs/words-feed.example.json) from a URL in EXPO_PUBLIC_WORDS_FEED_URL, at most once a day, never blocking the app. Validate the whole file and reject it if anything is wrong or it is over 1 MB. Cache in AsyncStorage, merge with the bundled words, support availableFrom and availableUntil. Show 35-new-words.html once when new words arrive. Wire the Word packs row in Settings.
- Item 7 Age rating: add a script (npm run check-words) that fails if any word in the bundled list is on a blocked list file. Add the blocked list file with a starter set.
- Item 3 Privacy: update public/privacy-policy.html with plain sections (what we collect, why, who processes it, how long, contact) matching the Phase 1 column of the table in the spec.

Run typecheck, lint and check-words. Commit.
```

---

## Prompt 6 (current version): word updates, age rating, privacy, device model

Sentry is moved to the backlog (Prompt 6b) until the account exists.

```
Stay on branch redesign-v2. Read design/specs/phase1-additions.md. Build items 6, 7 and 3 now; item 2 (Sentry) is on hold.

0. Add expo-device and include the phone model and Android version in the report form's device details.
1. Privacy: set PRIVACY_URL in constants/support.ts to https://apps.obio.in/imposter/#privacy and TERMS_URL to https://apps.obio.in/imposter/#terms. Link both from Settings (Help section) and the Premium screen footer. The website itself is hosted separately; do not change public/privacy-policy.html beyond pointing it to the new URL.
2. Item 6, word updates: the feed will live at https://apps.obio.in/imposter/words/feed.json. Read it from EXPO_PUBLIC_WORDS_FEED_URL with that as the default. Create design/website/words/feed.json shaped like design/specs/words-feed.example.json with no extra packs, so I can upload it. Fetch at most once a day, never block, validate the whole file (version, known categories, short plain strings, under 1 MB), reject it entirely if anything fails. Cache in AsyncStorage, merge with bundled words, honour availableFrom and availableUntil. Show 35-new-words.html once when new words arrive. Wire the Settings Word packs row and Check button to the real feed and real last-updated date.
3. Item 7, age rating: add npm run check-words that fails if any bundled or feed word is on a blocked list file; add the list with a starter set and run it inside npm test.
Theme tokens only. Run typecheck, lint and npm test. Commit. Do not push. Finish with the list of things I must set up myself.
```

## Prompt 6b (backlog): Sentry crash reporting

```
Stay on branch redesign-v2. Build item 2 of design/specs/phase1-additions.md: @sentry/react-native with its Expo config plugin, release builds only, default PII off, strip player names and words from events and breadcrumbs. DSN from EXPO_PUBLIC_SENTRY_DSN; auth token from the EAS secret SENTRY_AUTH_TOKEN only. If the DSN is missing the app runs normally with Sentry off. Upload source maps during EAS build. Typecheck, lint, npm test. Commit. Do not push.
```

---

## Prompt 7: Icons, store images and final check

```
1. Wire the new icons from design/icon into app.json: icon -> app-icon-1024.png, android.adaptiveIcon.foregroundImage -> adaptive-foreground-1024.png with backgroundColor #F2B705, splash image -> splash-icon-512.png on #F4EFE4, web favicon -> favicon-48.png. Copy them into assets/images.
2. Render the Play Store images: install Playwright as a dev dependency, then open design/store/store.html in Chromium at deviceScaleFactor 3 and screenshot each element #shot-1 to #shot-6 into design/store/screenshot-1.png to screenshot-6.png (1080 x 1920). Screenshot #feature at deviceScaleFactor 1 into design/store/feature-graphic-1024x500.png. Wait for fonts to load before each screenshot. Put this in a script at design/store/render.mjs and run it.
3. Final pass: walk the full game with 3 and 5 players on a small Android phone. List anything that does not match design/screens/ and fix it.
4. Run typecheck and lint. Commit. Give me a short summary of what changed and anything I must do myself (support email, Sentry DSN, words feed URL, Play Console forms).
```

---

## Prompt 8: Clean-up and performance (report first, then fix)

Run this after Prompt 7, when all screens are rebuilt. Paste it again any time before a release.

```
Stay on branch redesign-v2. Do a clean-up and performance review of the whole app. Part 1 is read-only: do not change any code until I approve.

Part 1, report. Run and summarise each of these:
1. npx expo-doctor and npx expo install --check (wrong or outdated Expo package versions).
2. npx knip (or npx depcheck if knip will not run): unused files, unused exports, unused dependencies and devDependencies.
3. Search for dead code: unused components, styles, constants, AsyncStorage keys no longer read, commented-out blocks, console.log left in.
4. Hardcoded colours, font names or sizes that should come from constants/theme.ts.
5. Bundle size: run npx expo export --platform android --dump-sourcemap, then npx source-map-explorer on the bundle. List the 10 largest modules and anything that looks avoidable.
6. Performance risks: components that re-render on every timer tick, missing React.memo or useCallback on list items, heavy work inside render, BlurView used inside lists or animated views, large images that should be resized, animations not using the native driver or Reanimated worklets.
7. Startup: what runs before the first screen shows (fonts, RevenueCat, storage reads) and what could be deferred.

Give me one table: Finding | File | Why it matters | Suggested fix | Risk of the fix (low, medium, high). Group it into "Safe to fix now" and "Needs my decision". Then stop and wait.

Part 2 happens only after I reply "fix the safe ones" or name the items. Fix them in small commits, one theme per commit. After each commit run npm run typecheck, npm run lint and walk one full game. Never change game rules, storage keys or purchase logic in this prompt.
```

---

## Prompt 9: Security and vulnerability check (report first, then fix)

```
Stay on branch redesign-v2. Do a security review of the app. Part 1 is read-only: do not change any code until I approve.

Part 1, report on each of these:
1. Dependencies: run npm audit --omit=dev and npm audit. List each high or critical issue, which package pulls it in, whether it ships in the app or is build-only, and the safe upgrade path. Do not run npm audit fix --force.
2. Secrets: search the whole repo and git history (git log -p) for API keys, tokens, passwords, keystores and .env files. RevenueCat public SDK keys (goog_ and appl_) are allowed; anything else is a finding. Check .gitignore covers .env, keystores and credentials.
3. Purchases: confirm the 7-tap reviewer unlock is gone from release builds, premium is checked against RevenueCat on launch, and the offline cache has a short expiry.
4. Storage: list everything written to AsyncStorage. Flag anything personal or anything that should not be trusted when read back (for example premium status or reward counts).
5. Network: every URL the app calls. All must be HTTPS. The word feed (if built) must be fully validated before use and never treated as code or HTML.
6. Inputs: player names, suggestion text and report text. Check length limits and that nothing is rendered as HTML or passed to a URL unescaped.
7. Android: permissions in app.json (only what is needed, blocked list kept), android:allowBackup, cleartext traffic off, deep link handling, debug flags off in release.
8. Crash reporting and analytics: no player names, words or device identifiers sent.
9. Web build: anything exposed in the web bundle that should not be.

Give me one table: Finding | Severity (critical, high, medium, low) | File | Fix | Effort. Then stop and wait.

Part 2 happens only after I reply "fix critical and high" or name the items. Fix in small commits, then re-run npm audit, typecheck and lint and show the before and after counts. Do not push.
```

---

## Later (do not paste yet)

- Phase 1.5: rewards, streaks, share result card, invite friends (screens 26 to 30, Growth tab).
- Phase 2: online play (screens 17 to 22).
- Ads: planned placements (screens 23 to 25).

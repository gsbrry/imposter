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

## Prompt 7: Icons, store images and final check

```
1. Wire the new icons from design/icon into app.json: icon -> app-icon-1024.png, android.adaptiveIcon.foregroundImage -> adaptive-foreground-1024.png with backgroundColor #F2B705, splash image -> splash-icon-512.png on #F4EFE4, web favicon -> favicon-48.png. Copy them into assets/images.
2. Render the Play Store images: install Playwright as a dev dependency, then open design/store/store.html in Chromium at deviceScaleFactor 3 and screenshot each element #shot-1 to #shot-6 into design/store/screenshot-1.png to screenshot-6.png (1080 x 1920). Screenshot #feature at deviceScaleFactor 1 into design/store/feature-graphic-1024x500.png. Wait for fonts to load before each screenshot. Put this in a script at design/store/render.mjs and run it.
3. Final pass: walk the full game with 3 and 5 players on a small Android phone. List anything that does not match design/screens/ and fix it.
4. Run typecheck and lint. Commit. Give me a short summary of what changed and anything I must do myself (support email, Sentry DSN, words feed URL, Play Console forms).
```

---

## Later (do not paste yet)

- Phase 1.5: rewards, streaks, share result card, invite friends (screens 26 to 30, Growth tab).
- Phase 2: online play (screens 17 to 22).
- Ads: planned placements (screens 23 to 25).

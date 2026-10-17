# Impostr design v2: Honey and Cream

Design reference for rebuilding the Impostr app UI. To build it, paste the prompts in `PROMPTS-FOR-CODE.md` into Code one at a time. Open `index.html` in a browser to see the full board. It has six tabs: Design, Growth and marketing, Developer notes, Security, Testing, and Roadmap and gaps. Each screen also has its own page in `screens/`, built at real app size. Resize the browser window to check how it responds.

The HTML is the visual reference. Rebuild it in React Native with the existing Expo Router screens. Do not ship the HTML.

## Folder map

| Path | What it is |
|---|---|
| `index.html` | Design board in tabs: screens, growth, developer notes, security, testing, roadmap |
| `screens/NN-name.html` | One screen per file, full size and responsive |
| `assets/impostr.css` | All design tokens and component styles (source of truth for values) |
| `assets/screens.js` | Screen markup used by the board and the screen pages |
| `tokens.json` | Colours, type, radius, spacing and shadow as plain values |
| `specs/phase1-additions.md` | Build spec for the 8 Phase 1 additions, with done checks |
| `specs/words-feed.example.json` | Example of the online word feed |
| `store/` | Play Store screenshots (1080 x 1920), feature graphic, and their source page |
| `icon/` | App icon (SVG source plus PNG exports) |
| `archive/` | Earlier v1 concept, for reference only |

## Screen map

| # | Screen | File in app | Status |
|---|---|---|---|
| 01 | Splash | `app/_layout.tsx` | Phase 1 |
| 02 | Home | `app/(tabs)/index.tsx` | Phase 1 |
| 03 | How to play (sheet) | `app/(tabs)/index.tsx` | Phase 1 |
| 04 | Choose category | `app/setup.tsx` | Phase 1 |
| 05 | Game settings | `app/game-settings.tsx` | Phase 1 |
| 06 | Player names | `app/player-names.tsx` | Phase 1 |
| 07 | Pass the phone | `app/reveal.tsx` | Phase 1 |
| 08 | Word reveal | `app/reveal.tsx` | Phase 1 |
| 09 | Imposter reveal | `app/reveal.tsx` | Phase 1 |
| 10 | Clue round | `app/clue-round.tsx` | Phase 1 |
| 11 | Vote | `app/vote.tsx` | Phase 1 |
| 12 | Result | `app/result.tsx` | Phase 1 |
| 13 | Stats | `app/(tabs)/stats.tsx` | Phase 1 |
| 14 | Settings | `app/(tabs)/settings.tsx` | Phase 1 |
| 15 | Premium | `app/premium.tsx` | Phase 1 |
| 16 | Suggest a category | `app/suggest.tsx` | Phase 1 |
| 17 | Choose how to play | new `app/mode.tsx` | Phase 2 (online) |
| 18 | Host room | new `app/online/host.tsx` | Phase 2 (online) |
| 19 | Join room | new `app/online/join.tsx` | Phase 2 (online) |
| 20 | Invite link page | web route `/join/[code]` | Phase 2 (online) |
| 21 | Online clue round | new `app/online/round.tsx` | Phase 2 (online) |
| 22 | Online vote | new `app/online/vote.tsx` | Phase 2 (online) |
| 23-25 | Ad placements | Home, Result, Stats | Planned, not in current build |
| 26 | Home with rewards | `app/(tabs)/index.tsx` | Phase 1.5 |
| 27 | Rewards | new `app/rewards.tsx` | Phase 1.5 |
| 28 | Reward unlocked | new modal | Phase 1.5 |
| 29 | Share result | `app/result.tsx` (sheet) | Phase 1.5 |
| 30 | Invite friends | new `app/invite.tsx` | Phase 1.5 |
| 31 | Pause game | `app/clue-round.tsx` (sheet) | Phase 1 |
| 32 | Exit confirm | `app/clue-round.tsx` (dialog) | Phase 1 |
| 33 | Help and support | new `app/help.tsx` | Phase 1 |
| 34 | Report a problem | new `app/report.tsx` | Phase 1 |
| 35 | New words added | `app/(tabs)/index.tsx` (sheet) | Phase 1 |

## Design rules

1. **One theme: Honey and Cream.** Cream background, honey yellow for the single primary action per screen, ink black for text and selected states. Replace the green values in `constants/theme.ts` (the `yellow*` keys) with the tokens in `tokens.json`.
2. **No red for the imposter.** Word reveal and Imposter reveal must look identical: same card, same colours, same brightness, same layout. Only the text changes. In a dark room, a colour or brightness change would give the imposter away.
3. **Glass only on floating layers.** Cards, sheets, the tab bar and icon buttons are glass. Primary buttons stay solid.
4. **Corners:** 10, 14, 20, 24px. No 28px or pill-shaped containers.
5. **Category names are one word:** General, Vehicles, Home, Food, Bollywood, Sports, Animals, Jobs, Festivals. Update the display names in `data/words.json` or the category list.
6. **Plain text only in copy.** Use straight apostrophes. Avoid curly quotes so text never shows broken characters.

## Phase 1 additions

Pause and exit, crash reporting, privacy and Data safety, store screenshots, accessibility, word updates without an app update, age rating, and in-app support. Build them from `specs/phase1-additions.md`, in the order given there. Settings (screen 14) and Clue round (screen 10) were updated for these.

Text colours were darkened to pass contrast: muted `#6F6757`, honey text `#805B00`.

## Fonts

| Role | Font | Expo package |
|---|---|---|
| Headings, numbers, timer | Outfit 600, 700, 800 | `@expo-google-fonts/outfit` |
| Body, labels, buttons | Plus Jakarta Sans 400 to 700 | `@expo-google-fonts/plus-jakarta-sans` |

Labels are Plus Jakarta Sans 600, 10.5px, uppercase, letter-spacing 1.2px. Replace Nunito.

## Liquid glass in React Native

- `expo-blur` `BlurView`, `intensity` about 40, `tint="light"`.
- Fill `rgba(255,252,245,0.55)`, 1px border `rgba(255,255,255,0.85)`, radius 20.
- Shadow: colour `#1C1404`, opacity 0.18, radius 18, offset y 10 (Android: `elevation` 4 plus the same fill).
- Behind the glass, place two blurred honey circles (`#FFD13D` and `#F6DCA0`) and a faint dot pattern on the cream background, as in the board. Without something behind it, glass looks flat.
- On Android, if blur performance is poor, use the fill colour without blur. It still reads correctly.

## Responsive behaviour

- Layout is a single column, 18px side padding, sized from screen width (works from 320px to 480px wide).
- Headings scale with width (see `clamp()` sizes in the CSS). On short screens the content scrolls and the main button sits at the end of the content.
- Grids: categories are 3 columns and vote cards 2 columns at every phone width.
- Tablets and web: keep the app column at a maximum width of 480px, centred.

## Growth (Phase 1.5)

- Reward ladder counted on the device: 5 games unlocks Chaos, 10 games unlocks Food, a 3-day streak gives a 24-hour Pro pass, 2 friend installs unlock Bollywood.
- Share result card after every game, with the app link on it.
- Personal invite link with a prewritten message.
- Full detail, marketing ideas and metrics are in the Growth and marketing tab.

## Security and testing

See the Security and Testing tabs. Fix first: remove the 7-tap reviewer unlock from release builds, and check the RevenueCat entitlement on every launch.

## Ads (planned, not in the current plan)

- One native ad card, full content width, about 76px tall, labelled AD.
- Only on Home (below categories), Result (below Play again), Stats and Settings (bottom). It shows when the player scrolls to the bottom or when the screen already has empty space.
- Never on Pass the phone, reveal, clue round, vote, setup, Premium or online rooms. No pop-ups or full-screen video.
- Hidden for Premium users. Suggested library: `react-native-google-mobile-ads` (native ad format).

## Online play (Phase 2, next iteration)

- Host creates a room with a 5-letter code and a share link, for example `https://impostr.app/join/HNY42`.
- The link opens the app straight into the room (Android App Links and Expo Linking scheme `impostr://join/HNY42`). If the app is not installed, the link shows the invite page with Play Store and play-in-browser options.
- Each player sees their own word on their own phone. Clues and votes sync live. This needs a real-time backend, which the app does not have today, since it is fully offline.

## Web version

The app already builds for web through Expo. On web, wrap the root layout in a centred column, maximum 480px wide, on the same cream background. From 980px wide, show the two side panels from the board (get the app, join with a code, how it works). Below that, show the app column only.

## Icon files

| File | Use |
|---|---|
| `icon/app-icon-1024.png` | `expo.icon` (square, the store applies the mask) |
| `icon/adaptive-foreground-1024.png` | `android.adaptiveIcon.foregroundImage`, background colour `#F2B705` |
| `icon/play-store-512.png` | Play Store listing icon |
| `icon/splash-icon-512.png` | Splash image on `#F4EFE4` |
| `icon/favicon-48.png` | `web.favicon` |
| `icon/app-icon.svg` | Master artwork with rounded corners, for marketing |

# Imposter

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-pafyxc8b)

# Impostr — Party Word Game
### Built by Gooseberry Media

A fully offline party social deduction word game built with React Native + Expo.  
Players give clues, spot the imposter, and vote — no internet required.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React Native | 0.81 | Cross-platform mobile UI |
| Expo SDK | 54 | Toolchain, builds, native APIs |
| Expo Router | 6 | File-based navigation |
| TypeScript | 5.9 | Type safety |
| AsyncStorage | Latest | Local offline data storage |
| RevenueCat | Latest | In-app subscriptions |
| Phosphor Icons | Latest | UI icons |
| Nunito Font | Latest | Typography |

---

## Project Structure

```
impostr/
├── app/                          # Expo Router screens
│   ├── (tabs)/                   # Bottom tab screens
│   │   ├── index.tsx             # Home screen
│   │   ├── stats.tsx             # Stats screen
│   │   └── settings.tsx          # Settings screen
│   ├── setup.tsx                 # Category + difficulty setup
│   ├── game-settings.tsx         # Players + timer setup
│   ├── player-names.tsx          # Enter player names
│   ├── reveal.tsx                # Word reveal screen
│   ├── clue-round.tsx            # Clue giving screen
│   ├── vote.tsx                  # Voting screen
│   ├── result.tsx                # Result + imposter reveal
│   ├── premium.tsx               # Subscription paywall
│   ├── paywall.tsx               # RevenueCat built-in paywall
│   └── _layout.tsx               # Root layout + RC init
├── context/
│   └── GameContext.tsx           # Global game state
├── hooks/
│   └── usePremium.ts             # RevenueCat premium hook
├── constants/
│   ├── theme.ts                  # Colors, fonts, spacing
│   └── revenuecat.ts             # RC API keys + product IDs
├── data/
│   └── words.json                # All word lists (offline)
├── utils/
│   ├── selectImposter.ts         # Fair imposter algorithm
│   └── getWord.ts                # Anti-repeat word selection
├── components/                   # Reusable UI components
├── assets/                       # Images, fonts, icons
├── app.json                      # Expo configuration
└── eas.json                      # EAS Build configuration
```

---

## Design System

### Colours — 3 only, strictly enforced

| Name | Hex | Usage |
|---|---|---|
| Yellow | `#FFD600` | Primary accent, CTAs, icons, highlights |
| Near-black | `#060412` | App background |
| White | `#FFFFFF` | Text, card surfaces |
| Rose | `#F43F5E` | Imposter reveal flash only |

### Typography
- Font: **Nunito** (Regular, SemiBold, Bold, ExtraBold)
- Hero text: 48px weight 800
- Word display: 36px weight 800 yellow
- Screen titles: 22px weight 700
- Body: 15px weight 400
- Labels: 10px weight 500 ALL CAPS

### Icons
- Library: **Phosphor React Native**
- Colour: `#FFD600` always — single colour, no exceptions
- Weight: `duotone` throughout

---

## AsyncStorage Keys

| Key | Data |
|---|---|
| `IMPOSTR_PLAYER_NAMES` | Last used player names array |
| `IMPOSTR_SAVED_PLAYERS` | All saved player names (max 20) |
| `IMPOSTR_GAME_SETTINGS` | Timer, clues per turn settings |
| `IMPOSTR_PREMIUM_CACHE` | Premium status cache + expiry |
| `IMPOSTR_STATS` | Games played, wins, history |
| `IMPOSTR_USED_WORDS` | Recently used words per category |
| `IMPOSTR_HISTORY` | Recent imposters for fair rotation |
| `IMPOSTR_SETTINGS` | Sound, haptics, language prefs |
| `IMPOSTR_TICK_SOUND` | Countdown tick sound toggle |
| `IMPOSTR_HORN_SOUND` | Time up horn sound toggle |
| `IMPOSTR_SOUND_MASTER` | Master sound toggle |
| `IMPOSTR_HAPTICS` | Haptic feedback toggle |
| `IMPOSTR_TEAM_VOTE` | Team vote together toggle |

---

## Word Categories

| Category | Tier | Words per difficulty |
|---|---|---|
| General | Free | 50 easy / 50 medium / 50 hard |
| Vehicles | Free | 50 easy / 50 medium / 50 hard |
| Home & Household | Free | 50 easy / 50 medium / 50 hard |
| Food & Drinks | Premium | 50 easy / 50 medium / 50 hard |
| Bollywood & Movies | Premium | 50 easy / 50 medium / 50 hard |
| Sports & Games | Premium | 50 easy / 50 medium / 50 hard |
| Animals & Nature | Premium | 50 easy / 50 medium / 50 hard |
| Jobs & Professions | Premium | 50 easy / 50 medium / 50 hard |
| Festival & Celebration | Premium | 50 easy / 50 medium / 50 hard |
| Custom (user-added) | Premium | Unlimited |

---

## Subscription Plans (RevenueCat)

| Plan | Price | Product ID |
|---|---|---|
| Monthly | ₹49/month | `monthly` |
| Yearly | ₹199/year | `yearly` |
| Lifetime | ₹599 one time | `lifetime` |

Entitlement ID: `in.Impostr.gooseberrymedia Pro`

---

## Prerequisites — Windows Build Setup

Install these once on your Windows machine:

1. **Node.js LTS** → [nodejs.org](https://nodejs.org)
2. **Git** → [git-scm.com](https://git-scm.com)
3. **EAS CLI** — open Command Prompt as Administrator:
```bash
npm install -g eas-cli
```
4. **Expo account** → [expo.dev](https://expo.dev) — sign up free

---

## Local Development Setup

```bash
# Clone the repository
git clone https://github.com/YOURUSERNAME/impostr
cd impostr

# Install dependencies
npm install

# Start development server
npx expo start

# Scan QR code with Expo Go app on your phone
# OR press 'w' for web browser
```

---

## Building APK / AAB

### First time only — login and configure:
```bash
eas login
eas build:configure
```

### Build APK for phone testing (direct install):
```bash
eas build --platform android --profile preview
```
- Output: `.apk` file
- Install directly on Android phone
- No Play Store needed

### Build AAB for Play Store submission:
```bash
eas build --platform android --profile production
```
- Output: `.aab` file
- Upload to Google Play Console
- Required for Play Store listing

### Build both platforms at once:
```bash
eas build --platform all --profile production
```

### After build completes:
EAS provides a download link in terminal:
```
✓ Build finished
Download: https://expo.dev/artifacts/eas/xxxxx.apk
```
Click link to download file.

---

## Installing APK on Android Phone

**Option A — USB cable:**
1. Connect phone to PC
2. Allow file transfer on phone
3. Copy APK to phone Downloads folder
4. Open Files app on phone → tap APK → Install

**Option B — WhatsApp:**
1. Open web.whatsapp.com on PC
2. Send APK to your own number
3. Open on phone → download → install

**Option C — Google Drive:**
1. Upload APK to Google Drive on PC
2. Open Drive on phone → download → install

> Allow "Install from unknown sources" in phone settings if prompted.

---

## Uploading to Google Play Store

1. Download `.aab` file from EAS
2. Go to [play.google.com/console](https://play.google.com/console)
3. Open **Impostr** app
4. Left menu → **Test and release** → **Internal testing**
5. Click **Create new release**
6. Upload `.aab` file
7. Add release notes
8. **Save** → **Review** → **Start rollout**

### Play Store requirements checklist:
- [ ] App icon 512×512px PNG
- [ ] Feature graphic 1024×500px
- [ ] Minimum 2 phone screenshots
- [ ] Short description (max 80 chars)
- [ ] Full description (max 4000 chars)
- [ ] Privacy policy URL
- [ ] Content rating questionnaire filled
- [ ] Category: Games → Party

---

## RevenueCat Setup

### API Keys location:
```
constants/revenuecat.ts
```

### Switch from test to production:
1. Go to [app.revenuecat.com](https://app.revenuecat.com)
2. Connect Google Play Store configuration
3. Copy production API key (starts with `goog_`)
4. Replace test key in `constants/revenuecat.ts`
5. Rebuild production AAB

### Products to create in Play Console:
```
Subscriptions:
  ID: monthly    → ₹49/month
  ID: yearly     → ₹199/year

In-app products:
  ID: lifetime   → ₹599 one time
```

---

## Web Deployment (Netlify)

```bash
# Export web build
npx expo export --platform web

# Deploy to Netlify
# Option 1: Drag dist/ folder to netlify.com/drop
# Option 2: CLI
npm install -g netlify-cli
netlify deploy --dir dist --prod
```

Live at: `impostr.netlify.app` (or your custom domain)

> Web version is free to play — no payments on web.
> Shows "Download on Android" banner to drive app installs.

---

## Keeping Code Updated

### After making changes in Bolt:
1. In Bolt → click GitHub sync button
2. Commit and push changes

### On your Windows machine:
```bash
cd impostr
git pull
npm install
eas build --platform android --profile preview
```

---

## Common Errors and Fixes

| Error | Fix |
|---|---|
| `eas not recognized` | Run cmd as Administrator, reinstall eas-cli |
| `npm EACCES permission denied` | Run cmd as Administrator |
| `git not recognized` | Restart cmd after installing Git |
| `node not recognized` | Restart cmd after installing Node.js |
| `Build failed - keystore error` | Run `eas credentials --platform android` |
| `Metro bundler error` | Delete node_modules, run `npm install` again |
| `Expo Go - Failed to download` | Run `npx expo start --tunnel` |
| `RevenueCat not initialising` | Check Platform.OS !== 'web' guard |

---

## Game Logic Notes

### Fair Imposter Algorithm
Located in `utils/selectImposter.ts`
- Tracks last N/2 imposters in AsyncStorage
- Never picks same person twice in a row
- Resets tracking when all players have been imposter
- Chaos mode: randomly picks 1 or 2 imposters

### Word Anti-Repeat System
Located in `utils/getWord.ts`
- Tracks last 30 used words per category
- Resets when fewer than 20% of words remain unused
- Ensures fresh words every game session

---

## Package Name

```
com.gooseberrymedia.impostr
```

> This is permanent — never change after first Play Store upload.

---

## Contact

**Gooseberry Media**  
Individual Proprietorship, India  
App: Impostr  
Platform: Android (Google Play) + Web

---

*README last updated: May 2026*

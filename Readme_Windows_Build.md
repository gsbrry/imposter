Here's the complete Windows guide:

---

**PART 1 — Install required software (one time only)**

**Step 1 — Install Node.js:**
1. Go to **nodejs.org**
2. Download **LTS version** (green button)
3. Run installer → click Next all the way → Finish
4. Verify: open Command Prompt → type:
```
node --version
npm --version
```
Both should show version numbers.

---

**Step 2 — Install Git:**
1. Go to **git-scm.com**
2. Download for Windows → run installer
3. All default settings → Finish
4. Verify:
```
git --version
```

---

**Step 3 — Install EAS CLI:**

Open Command Prompt as Administrator:
- Press **Windows key**
- Type **cmd**
- Right click → **Run as administrator**
- Then type:
```
npm install -g eas-cli
```
Verify:
```
eas --version
```

---

**PART 2 — Get your code from GitHub**

**Step 4 — Clone your Bolt project:**

First push from Bolt to GitHub:
1. In Bolt → look for GitHub icon top right
2. Connect GitHub → create new repo called `impostr`
3. Push code

Then on your Windows machine open Command Prompt:
```
cd Desktop
git clone https://github.com/YOURUSERNAME/impostr
cd impostr
```

---

**Step 5 — Install project dependencies:**
```
npm install
```

Wait 2-3 minutes for all packages to download.

---

**Step 6 — Check app.json is correct:**
```
type app.json
```

Confirm you see:
```json
"package": "com.gooseberrymedia.impostr"
```

---

**PART 3 — Login to Expo**

**Step 7 — Login:**
```
eas login
```

Enter your expo.dev email and password. You should see:
```
Logged in as youremail@gmail.com
```

---

**Step 8 — Configure EAS (first time only):**
```
eas build:configure
```

When asked platform → press Enter to select **All** or type **android**.

This creates/updates `eas.json` file. If it already exists from Bolt, just confirm.

---

**PART 4 — Build**

**For testing on your phone (APK — direct install):**
```
eas build --platform android --profile preview
```

**For Play Store submission (AAB):**
```
eas build --platform android --profile production
```

---

**What happens after running build command:**

```
1. EAS asks "Generate a new Android Keystore?" → Yes
2. Build uploads to EAS cloud servers
3. Terminal shows build progress:
   ✓ Compressing project
   ✓ Uploading to EAS
   ✓ Build started
   Build URL: https://expo.dev/builds/xxxxx
4. Wait 10-15 minutes
5. Terminal shows download link when done
```

---

**Step 9 — Download your APK:**

EAS gives you a link like:
```
https://expo.dev/artifacts/eas/xxxxx.apk
```

Click it → file downloads to your computer.

---

**PART 5 — Install APK on your phone**

**Option A — USB cable:**
1. Connect phone to PC via USB
2. Phone asks "Allow file transfer" → tap Yes
3. Copy APK file to phone Downloads folder
4. On phone → open Files app → Downloads → tap APK
5. Install (allow unknown sources if asked)

**Option B — WhatsApp to yourself:**
1. Open WhatsApp on PC (web.whatsapp.com)
2. Send APK file to your own number
3. Open on phone → download → install

**Option C — Google Drive:**
1. Upload APK to Google Drive
2. Open Drive on phone → download APK → install

---

**PART 6 — Upload AAB to Play Store**

After production build finishes:

1. Download the `.aab` file
2. Go to **play.google.com/console**
3. Impostr app → **Test and release** → **Internal testing**
4. **Create new release**
5. Upload `.aab` file
6. Add release notes:
```
First release of Impostr — party word game
```
7. **Save** → **Review** → **Start rollout**

---

**Common Windows errors and fixes:**

| Error | Fix |
|---|---|
| `eas not recognized` | Run cmd as Administrator, reinstall eas-cli |
| `npm EACCES` | Run cmd as Administrator |
| `git not recognized` | Restart cmd after installing Git |
| `node not recognized` | Restart cmd after installing Node |
| `Build failed - keystore` | Run `eas credentials` to reset |
| `Metro bundler error` | Run `npm install` again |

---

**PART 7 — Keep code updated**

Every time you make changes in Bolt:

**In Bolt:**
1. Click GitHub sync button
2. Commit and push changes

**On Windows:**
```
cd Desktop/impostr
git pull
npm install
eas build --platform android --profile preview
```

That's it — new APK with your latest changes!

---

**Full command summary — copy this:**

```
# First time setup
npm install -g eas-cli
git clone https://github.com/YOURUSERNAME/impostr
cd impostr
npm install
eas login
eas build:configure

# Every build after
eas build --platform android --profile preview   # APK for testing
eas build --platform android --profile production # AAB for Play Store
```

---

Do you have a GitHub account already? If yes, next step is connecting Bolt to GitHub and pushing your code — share a screenshot of Bolt's top menu and I'll show you exactly where the GitHub sync button is!

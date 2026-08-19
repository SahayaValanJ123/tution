# How to Build Native Android APK for Tuition Register

This project is configured with **Automatic GitHub Actions**, as well as local build commands.

---

## ⚡ Method 1: Automatic Build via GitHub Actions (Zero Setup Needed)

Every time you push your code to GitHub, GitHub Actions will automatically compile the `.apk` file for you!

1. Push your repository to GitHub (`git push origin main`).
2. Go to your GitHub repository in your browser.
3. Click on the **Actions** tab at the top.
4. Click on the latest workflow run named **"Build Android APK"**.
5. Scroll down to **Artifacts** and click **`tuition-register-apk`** to download your ready-to-install `.apk` file!

*(You can also trigger it manually by going to `Actions` ➔ `Build Android APK` ➔ `Run workflow`).*

---

## 💻 Method 2: Local Build using Capacitor & Android Studio

### Requirements
- Node.js installed on your computer
- Android Studio (free download)

### Step-by-Step Commands
Open terminal in `d:\TUTION` and run:

```bash
# 1. Install dependencies
npm install

# 2. Add Android platform
npx cap add android

# 3. Copy web files and build APK
npx cap copy android
cd android && ./gradlew assembleDebug
```

Your generated APK will be at:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🌐 Method 3: Using Bubblewrap CLI (Instant PWA to APK)

```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest=manifest.json
bubblewrap build
```

---

## Key Features Built-In
- 📓 **Notebook Attendance Register**: 2-way sticky grid matching physical class register notebooks.
- 💬 **WhatsApp Parent Fee Reminder**: One-click WhatsApp message trigger prefilled with fee details.
- 💰 **Fee Status & Receipts**: Green paid checkmarks, red fee pending alerts, payment mode receipts.
- 📱 **Offline Data Storage**: Uses browser `localStorage` — works without internet anywhere.
- 🤖 **Automated GitHub Actions CI/CD**: Automatic APK compilation on every push.

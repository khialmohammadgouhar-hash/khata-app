# Khata — Customer Ledger App

A React Native (Expo) app for tracking customer credit and payments, with
admin/staff accounts, inventory, expenses, invoices, and multi-language
support (English / Pashto). Works on both iOS and Android.

## Option A — Test instantly with Expo Go (no build needed)

1. Install Node.js on a computer, or use Expo Snack (snack.expo.dev) from
   your phone browser and paste in `App.js`.
2. `npm install` then `npx expo start`, and scan the QR code with the
   **Expo Go** app.

This is the fastest way to try the app, but it doesn't produce an
installable app icon on your home screen.

## Option B — Build a real installable Android APK (free, no computer needed)

This uses **EAS Build**, Expo's free cloud build service, triggered
entirely from a phone browser through GitHub.

1. Create a free account at **github.com** (if you don't have one).
2. Create a new repository and upload every file in this project to it
   (GitHub's website lets you drag and drop files to upload, even from a
   phone browser).
3. Go to **expo.dev**, sign in with your Expo account, open
   **Settings → Connections → GitHub**, and connect your GitHub account.
4. Open your project on expo.dev (create one if you haven't), go to
   **Project settings → GitHub**, and connect the repository you just
   created.
5. Go to the project's **Builds** page and tap **"Build from GitHub"**.
   Choose the branch (`main`), platform **Android**, and profile
   **preview** (this profile is already configured in `eas.json` to
   produce a plain `.apk` file you can install directly, instead of the
   Play Store format).
6. Wait for the build to finish (usually 10-20 minutes). When it's done,
   the build page gives you a **download link** for the `.apk` file.
7. Open that link on your Android phone and tap to install (you may need
   to allow "install from unknown sources" in your phone's settings).

That's it — no Google Play account, no fees, and the app icon and name
("Khata") will appear exactly as configured.

## iOS

Apple requires a paid Apple Developer account ($99/year) even to install
an app only for yourself, so an iOS build isn't available through the free
route above. If you get a developer account later, the same `eas.json` and
`app.json` are ready — building for iOS just needs `platform: ios` chosen
in the same "Build from GitHub" flow.

## Project structure

```
App.js         The entire app (screens, auth, roles, translations, storage)
app.json       App name, icon, and platform configuration
eas.json       Build profiles (preview = installable APK)
package.json   Dependencies
assets/        App icon, adaptive icon, splash screen
```

## Data & accounts

Data (customers, products, expenses, staff accounts) is stored only on
the device it's used on — there's no shared server yet. Setting up a real
backend (so an Admin and staff can share the same data from different
phones) is the next step once you're ready for it.

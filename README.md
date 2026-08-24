# AirSafe

Air quality monitoring app built with React Native (Expo SDK 54).

## Prerequisites

- [Node.js](https://nodejs.org/) v20.19.4 or later
- npm or yarn
- [Expo Go](https://expo.dev/go) app on your phone (iOS or Android)
- Git

## Setup

1. Clone the repo

```bash
git clone https://github.com/your-username/AirSafe.git
cd AirSafe
```

2. Install dependencies

```bash
npm install
```

3. Start the dev server

```bash
npx expo start
```

4. Scan the QR code with Expo Go on your phone

- **iOS:** Open the Camera app and scan the QR code
- **Android:** Open Expo Go and scan the QR code

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run android` | Start on Android device/emulator |
| `npm run ios` | Start on iOS simulator |
| `npm run web` | Start on web browser |

## Sharing with others (tunnel)

```bash
npx expo start --tunnel
```

This lets anyone scan the QR code from anywhere without being on the same Wi-Fi network.

## Building a standalone APK (Android)

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

## Building for iOS

Requires an [Apple Developer](https://developer.apple.com/) account ($99/year).

```bash
eas build --platform ios
```

## Tech Stack

- Expo SDK 54
- React Native 0.81.5
- React 19.1.0
- TypeScript 5.9.2
- Poppins font (Google Fonts)
- react-native-svg (charts)
- expo-linear-gradient (gradient cards)

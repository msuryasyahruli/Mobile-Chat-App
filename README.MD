# MobileChatApp 📱

---

## 📖 Overview

A **cross‑platform mobile chat application** built with **Expo** and **React Native**. The app supports authentication via Firebase, real‑time chat screens, contact management, and a polished navigation experience using React Navigation's native stack.

---

## ✨ Features

- **Firebase Auth** – secure sign‑in / sign‑up flow.
- **Chat screen** with user‑specific conversations.
- **Add contact** and **user detail** screens.
- **Bottom‑tab navigator** for main sections (Chats, Profile, Settings).
- **Responsive design** for phones and tablets.
- **Dark‑mode aware** UI components.
- **Expo Router ready** – navigation lives in `src/app/` (future expansion).

---

## 🛠️ Tech Stack

| Layer           | Technology                                                        |
| --------------- | ----------------------------------------------------------------- |
| UI              | React Native 0.86, Expo SDK 57                                    |
| Navigation      | `@react-navigation/native-stack`, `@react-navigation/bottom-tabs` |
| State / Storage | React hooks + AsyncStorage                                        |
| Backend         | Firebase Auth (client‑side)                                       |
| Icons           | `@expo/vector-icons`                                              |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (>= 20) – recommended to use **bun** if a `bun.lock` file exists.
- **Expo CLI** – install globally with `npm i -g expo-cli`.
- **Git** – for version control.
- An **Expo account** (optional but useful for OTA updates).

### Installation

```bash
# Clone the repo
git clone <your-repo-url>
cd MobileChatApp

# Install Expo‑compatible dependencies (always use expo install)
expo install
# Or explicitly install missing packages
npx expo install @expo/vector-icons @react-native-async-storage/async-storage @react-navigation/bottom-tabs @react-navigation/native @react-navigation/native-stack expo-font expo-image-picker expo-status-bar expo-updates firebase uuid
```

> **Important:** Use `npx expo install` instead of `npm install`/`yarn add` – it resolves the correct SDK‑compatible versions.

### Running the App (development)

```bash
# Start the Expo dev server
npx expo start
```

- Press `a` for Android emulator/device, `i` for iOS, or `w` for web.
- Lint: `npx expo lint`
- Type‑check (if using TypeScript): `npx tsc --noEmit`

### Building for Production

```bash
# Create a development build (includes native modules like image‑picker)
 npx expo run:android   # Android
 npx expo run:ios       # iOS (requires macOS)

# Or use EAS for cloud builds
 bunx eas-cli@latest build --profile production
```

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/awesome-feature`).
3. Make your changes and run `npx expo lint` & `npx tsc --noEmit`.
4. Submit a Pull Request with a clear description.

---

## 📄 License

MIT © 2026 Your Name

---

_Happy coding!_

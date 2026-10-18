import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

// Konfigurasi dari project Firebase Anda
const firebaseConfig = {
  apiKey: "AIzaSyB9wAacldjlr6MgLT4-LwA0y8qh9qzwZNQ",
  authDomain: "baceoo.firebaseapp.com",
  projectId: "baceoo",
  storageBucket: "baceoo.firebasestorage.app",
  messagingSenderId: "1079011661015",
  appId: "1:1079011661015:web:e2f107aaa2e3ea0b218c92",
  measurementId: "G-8MPV1LP3Q3",
};

// Mencegah inisialisasi ganda saat Fast Refresh
let app;
let auth;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  // Persistensi sesi login menggunakan AsyncStorage
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} else {
  app = getApp();
  auth = getAuth(app);
}

const db = getFirestore(app);

export { auth, db };

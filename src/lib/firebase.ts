import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { isSupported } from "firebase/analytics";

// YOUR CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyAzY0zF_vwg6F5FfPxopE5yh_2gzIOVJPA",
  authDomain: "kaesar-gaesang.firebaseapp.com",
  projectId: "kaesar-gaesang",
  storageBucket: "kaesar-gaesang.firebasestorage.app",
  messagingSenderId: "374663048554",
  appId: "1:374663048554:web:011d18882497c12e5f0913",
  measurementId: "G-7TX1X0HXD1"
};

// 1. INITIALIZE APP (SINGLETON PATTERN)
// This prevents "Firebase App already initialized" errors during hot reloads
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 2. EXPORT SERVICES
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// 3. SAFE ANALYTICS INIT (Client-Side Only)
let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      import("firebase/analytics").then(({ getAnalytics }) => {
        analytics = getAnalytics(app);
      });
    }
  });
}

export { app, auth, db, googleProvider, analytics };
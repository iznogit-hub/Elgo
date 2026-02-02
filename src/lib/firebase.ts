import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { isSupported } from "firebase/analytics";

// YOUR CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyBnBntRTxKDssUGDJC33EzqGflb2MD7xzM",
  authDomain: "bubblepops-39e96.firebaseapp.com",
  projectId: "bubblepops-39e96",
  storageBucket: "bubblepops-39e96.firebasestorage.app",
  messagingSenderId: "992553228672",
  appId: "1:992553228672:web:729f4ffd7e30fe4ca74965"
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
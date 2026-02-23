import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD4s0rkhtNJz6xROfEFBDZwHehvmuiHv4g",
  authDomain: "iftarsharebd.firebaseapp.com",
  projectId: "iftarsharebd",
  storageBucket: "iftarsharebd.firebasestorage.app",
  messagingSenderId: "944804380628",
  appId: "1:944804380628:web:a9811b045975e39e28e041",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);

// 🔥 Important: Only initialize auth in browser
export const auth =
  typeof window !== "undefined" ? getAuth(app) : null;

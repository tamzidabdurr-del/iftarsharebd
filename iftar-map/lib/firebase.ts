import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, where, doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD4s0rkhtNJz6xROfEFBDZwHehvmuiHv4g",
  authDomain: "iftarsharebd.firebaseapp.com",
  projectId: "iftarsharebd",
  storageBucket: "iftarsharebd.firebasestorage.app",
  messagingSenderId: "944804380628",
  appId: "1:944804380628:web:a9811b045975e39e28e041",
  measurementId: "G-BSSYXZHDG2"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

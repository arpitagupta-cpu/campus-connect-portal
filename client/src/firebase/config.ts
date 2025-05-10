import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// For debugging purposes
console.log("Firebase config values:", {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? "Present" : "Missing",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? "Present" : "Missing",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ? "Present" : "Missing",
});

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: "461704274268", // Extracted from your app ID
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
console.log("Initializing Firebase with config:", firebaseConfig);
const app = initializeApp(firebaseConfig);
console.log("Firebase initialized successfully");

// Initialize Firebase services
export const auth = getAuth(app);
export const storage = getStorage(app);
export const firestore = getFirestore(app);

export default app;

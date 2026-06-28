// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

let AsyncStorage;
if (Platform.OS !== "web") {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
}

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAk4i3fMMVHcyehmf1Ebq2geVH92Ze6Syg",
  authDomain: "proauth-a5eed.firebaseapp.com",
  projectId: "proauth-a5eed",
  // storageBucket: "proauth-a5eed.firebasestorage.app",
  storageBucket: "proauth-a5eed.appspot.com",
  messagingSenderId: "394929459576",
  appId: "1:394929459576:web:e62a92f84d6c18636c388d",
  measurementId: "G-47L1CS3FRF"
};

// Initialize app once
const app = initializeApp(firebaseConfig);

// ✅ Initialize Auth with platform-specific configuration
let auth;
if (Platform.OS === "web") {
  // Use getAuth for web platform
  auth = getAuth(app);
} else {
  // Use initializeAuth with persistence for React Native
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

export { auth };

// ✅ Initialize Firestore
export const db = getFirestore(app);
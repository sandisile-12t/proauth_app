// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAk4i3fMMVHcyehmf1Ebq2geVH92Ze6Syg",
  authDomain: "proauth-a5eed.firebaseapp.com",
  projectId: "proauth-a5eed",
  storageBucket: "proauth-a5eed.firebasestorage.app",
  messagingSenderId: "394929459576",
  appId: "1:394929459576:web:e62a92f84d6c18636c388d",
  measurementId: "G-47L1CS3FRF"
};

// Initialize app once
const app = initializeApp(firebaseConfig);

// ✅ Initialize Auth only once
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// ✅ Initialize Firestore
export const db = getFirestore(app);
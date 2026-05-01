// Import the functions you need from the SDKs you need
import {initializeApp } from "firebase/app";
import {getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
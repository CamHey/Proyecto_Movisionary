// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ✅ Pega aquí tu config real (el que te dio Firebase Web App)
const firebaseConfig = {
  apiKey: "AIzaSyCQ5xQc062Hk2rZu_V2J4Dy4ElagFnLWxQ",
  authDomain: "movisionary-chat.firebaseapp.com",
  projectId: "movisionary-chat",
  storageBucket: "movisionary-chat.firebasestorage.app",
  messagingSenderId: "588689969498",
  appId: "1:588689969498:web:2aaef28848a4168f86e363",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

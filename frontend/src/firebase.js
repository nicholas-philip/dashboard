// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            "AIzaSyDsIJ8LGjwTSo-gevd6-7mt-zYcdOH6AB8",
  authDomain:        "terrasense-dbe12.firebaseapp.com",
  projectId:         "terrasense-dbe12",
  storageBucket:     "terrasense-dbe12.firebasestorage.app",
  messagingSenderId: "162130572395",
  appId:             "1:162130572395:web:4d1e47b68084ae35a2ad2e",
  measurementId:     "G-W3NZCVKQHX",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

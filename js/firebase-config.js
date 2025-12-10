// Import the functions you need from the SDKs you need

// TODO: Add SDKs for Firebase products that you want to use

// js/firebase-config.js
// Load Firebase directly from the CDN (browser-friendly ESM)
import { initializeApp, setLogLevel } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js"; 
// Optional: see more logs in console
setLogLevel("debug");


const firebaseConfig = {
  apiKey: "AIzaSyDINMHh2LB0WOAvR3Ts9IFwP0Mg4w8daFU",

  authDomain: "swoosh-27d33.firebaseapp.com",

  projectId: "swoosh-27d33",

  storageBucket: "swoosh-27d33.firebasestorage.app",

  databaseURL: "https://swoosh-27d33-default-rtdb.firebaseio.com/",

  messagingSenderId: "887379670059",

  appId: "1:887379670059:web:d6f8303005b37d2c45e66e",

  measurementId: "G-S1JP811VS8",
};


// init
const app = initializeApp(firebaseConfig);
console.log("✅ Firebase initialized");

// export for other files
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const storage = getStorage(app);
export const db = getDatabase(app); 
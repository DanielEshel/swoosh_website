/**
 * js/firebase-config.js
 * Initializes the Firebase application and exports core services.
 */

// Load Firebase directly from the CDN (browser-friendly ESM format)
import { initializeApp, setLogLevel } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

// Optional: Enable debug logging in the console to troubleshoot Firebase issues
setLogLevel("debug");

/**
 * Firebase project configuration object.
 * Contains API keys and identifiers necessary to connect to the backend.
 */
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

// Initialize the Firebase application with the config
const app = initializeApp(firebaseConfig);
console.log("Firebase initialized");

// Export initialized services so they can be imported and used in other files
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider(); // Google OAuth provider
export const storage = getStorage(app);           // Cloud Storage (for videos)
export const db = getDatabase(app);               // Realtime Database (for metadata)
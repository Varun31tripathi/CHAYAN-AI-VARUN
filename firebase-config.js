// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDUcG95XK9gg3PBKqYZVBYk5rarf-vExck",
  authDomain: "chayan2-platform.firebaseapp.com",
  projectId: "chayan2-platform",
  storageBucket: "chayan2-platform.firebasestorage.app",
  messagingSenderId: "694117760821",
  appId: "1:694117760821:web:68d2b2dee6fd158984567c",
  measurementId: "G-PB84HY01ED"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged };
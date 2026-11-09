import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";

import { onAuthReady } from "/src/authentication.js";
import { db } from "./firebaseConfig.js";
import { doc, onSnapshot } from "firebase/firestore";
import {
  collection,
  getDoc,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

function showName() {
  // Pass a CALLBACK function to run when Firebase finishes checking login status
  onAuthReady(function (user) {
    // Firebase passes the user object (or null)
    if (user) {
      // User is logged in
      const name = user.displayName || user.email; // Use email if name is missing
      document.getElementById("name-goes-here").textContent = " " + name;
    } else {
      // User is NOT logged in
      location.href = "index.html"; // Redirect to login page
    }
  });
}

showName();


onAuthReady(async function (user) {
  if (!user) {
    location.href = "index.html"; // Not logged in → back to start
  } else {
    currentUser = user; // 1. Remember who's logged in
    const userDoc = await getDoc(doc(db, "users", user.uid)); // 2. Get their user doc

    displayReminders();
  }
});
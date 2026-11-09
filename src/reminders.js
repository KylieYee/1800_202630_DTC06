import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";

import { getAuth, onAuthStateChanged } from "firebase/auth";
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
import { setDoc, arrayUnion, arrayRemove } from "firebase/firestore";

let currentUser = null;
let favorites = [];

// Displays reminders
const displayReminders = async (user) => {
  try {
    // Gets reminders from Firestore
    const remindersRef = collection(db, "Reminders", user.uid, "UserReminders");

    const remindersSnap = await getDocs(remindersRef);
    console.log("USER UID:", user.uid);

    console.log("REMINDERS PATH:", remindersRef.path);

    console.log("NUMBER OF REMINDERS:", remindersSnap.size);

    console.log(
      "REMINDER DATA:",
      remindersSnap.docs.map((doc) => doc.data()),
    );

    // Connects to HTML
    const container = document.getElementById("reminders-go-here");
    const template = document.getElementById("reminderCardTemplate");

    // Clears previous reminders
    container.innerHTML = "";

    // Goes through each reminder
    remindersSnap.forEach((doc) => {
      const reminder = doc.data();

      // Copies the template
      let newcard = template.content.cloneNode(true);

      // Gets reminder information
      newcard.querySelector(".card-title").textContent = reminder.title;
      newcard.querySelector(".card-date").textContent = reminder.date;
      newcard.querySelector(".card-time").textContent = reminder.time;
      newcard.querySelector(".card-frequency").textContent = reminder.frequency;
      newcard.querySelector(".card-details").textContent = reminder.details;

      // Links to individual reminder page
      newcard.querySelector(".read-more").href =
        `eachReminder.html?docID=${encodeURIComponent(doc.id)}`;

      setupCheckbox(newcard, doc.id);

      // Displays the reminder
      container.appendChild(newcard);
    });

    if (remindersSnap.empty) {
      container.textContent = "You have no reminders yet.";
    }
  } catch (error) {
    console.error("Error loading reminders:", error);
  }
};

// Checks if user is logged in
const auth = getAuth();

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    const userDoc = await getDoc(doc(db, "Reminders", currentUser.uid)); // 2. Get their user doc
    favorites = userDoc.data()?.favorites || []; // uses "optional chaining" (?.)
    displayReminders(user);
  } else {
    document.getElementById("reminders-go-here").textContent =
      "Please log in to view your reminders.";
  }
});

// ------------------------------------------------------------
// setupHeart(card, hikeID)
// Gets ONE card's heart ready:
//   - on page load: fills the heart if this hike is already a favourite
//   - connects the click to toggleFavourite()
// card   = the card we just built from the template
// hikeID = this hike's document ID (doc.id)
// ------------------------------------------------------------
function setupCheckbox(card, reminderId) {
  const checkbox = card.querySelector(".check-btn");
  
  if (!checkbox) {
    console.error("Checkbox not found");
    return;
  }

  // Checks whether reminder is already completed
  if (favorites.includes(reminderId)) {
    checkbox.classList.replace("bi-square", "bi-check-square");
  }

  // Connects checkbox to toggle function
  checkbox.addEventListener("click", function () {
    toggleCheckbox(checkbox, reminderId);
  });
}

// ------------------------------------------------------------
// toggleFavourite(heart, hikeID)
// Runs on every click: adds or removes the hike from favourites
// heart  = the heart icon that was clicked
// hikeID = which hike it belongs to
// ------------------------------------------------------------
async function toggleCheckbox(checkbox, reminderId) {
  const userRef = doc(db, "Reminders", currentUser.uid);

  if (checkbox.classList.contains("bi-check-square")) {
    // Remove from completed reminders
    await setDoc(
      userRef,
      { favorites: arrayRemove(reminderId) },
      { merge: true },
    );

    checkbox.classList.replace("bi-check-square", "bi-square");
    favorites.splice(favorites.indexOf(reminderId), 1);
  } else {
    // Add to completed reminders
    await setDoc(
      userRef,
      { favorites: arrayUnion(reminderId) },
      { merge: true },
    );

    checkbox.classList.replace("bi-square", "bi-check-square");
    favorites.push(reminderId);
  }
}
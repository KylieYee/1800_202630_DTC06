import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "./firebaseConfig.js";
import { doc, onSnapshot } from "firebase/firestore";
import {
  collection,
  getDoc,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

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

onAuthStateChanged(auth, (user) => {
  if (user) {
    displayReminders(user);
  } else {
    document.getElementById("reminders-go-here").textContent =
      "Please log in to view your reminders.";
  }
});

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "./firebaseConfig.js";
import { doc, getDoc } from "firebase/firestore";

// Declare variable: the hike ID from the URL (eachHike.html?docID=abc123)
const params = new URL(window.location.href).searchParams;
const reminderId = params.get("docID");

// Fetch the hike and display its name and image
async function displayReminder(user) {
  try {
    const reminderRef = doc(
      db,
      "Reminders",
      user.uid,
      "UserReminders",
      reminderId,
    );

    const reminderSnap = await getDoc(reminderRef);

    if (!reminderSnap.exists()) {
      document.getElementById("reminderTitle").textContent =
        "Reminder not found.";
      return;
    }

    const reminder = reminderSnap.data();

    document.getElementById("reminderTitle").textContent = reminder.title;
    document.getElementById("reminderDate").textContent = reminder.date;
    document.getElementById("reminderTime").textContent = reminder.time;
    document.getElementById("reminderFrequency").textContent =
      reminder.frequency;
    document.getElementById("reminderDetails").textContent = reminder.details;
  } catch (error) {
    console.error("Error loading reminder:", error);
    document.getElementById("reminderTitle").textContent =
      "Error loading hike.";
  }
}

const auth = getAuth();
onAuthStateChanged(auth, (user) => {
  if (user) {
    displayReminder(user); // Triggers code only when the user is successfully found
  } else {
    document.getElementById("reminderTitle").textContent =
      "Please log in to view this reminder.";
  }
});

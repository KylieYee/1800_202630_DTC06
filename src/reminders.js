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
  deleteDoc
} from "firebase/firestore";
import { setDoc, arrayUnion, arrayRemove } from "firebase/firestore";

let currentUser = null;
let checked = [];

// Displays reminders
const displayReminders = async (user) => {
  try {
    // Gets reminders from Firestore
    const remindersRef = collection(db, "Reminders", user.uid, "UserReminders");
    const remindersSnap = await getDocs(remindersRef);

    console.log(
      "REMINDER DATA:",
      remindersSnap.docs.map((doc) => doc.data()),
    );

    // Connects to HTML
    const container = document.getElementById("reminders-go-here");
    const completedContainer = document.getElementById("completed-reminders");

    const template = document.getElementById("reminderCardTemplate");
    const completedTemplate = document.getElementById(
      "completedReminderCardTemplate",
    );

    // Clears previous reminders
    container.innerHTML = "";

    // Goes through each reminder
    remindersSnap.forEach((doc) => {
      const reminder = doc.data();
      const reminderId = doc.id;

      if (checked.includes(reminderId)) {
        return;
      }

      let newcard = template.content.cloneNode(true);

      newcard.querySelector(".card-title").textContent = reminder.title;
      newcard.querySelector(".card-date").textContent = reminder.date;
      newcard.querySelector(".card-time").textContent = reminder.time;
      newcard.querySelector(".card-frequency").textContent = reminder.frequency;
      newcard.querySelector(".card-details").textContent = reminder.details;

      newcard.querySelector(".read-more").href =
        `createReminder.html?docID=${encodeURIComponent(doc.id)}`;
      newcard.querySelector(".delete-reminder").dataset.id = doc.id;

      setupCheckbox(newcard, doc.id);

      container.appendChild(newcard);
    });

    //for the checkmarked reminders
    checked.forEach((checkedId) => {
      const doc = remindersSnap.docs.find((doc) => doc.id === checkedId);

      if (!doc) return;

      const reminder = doc.data();

      let newcard = completedTemplate.content.cloneNode(true);

      newcard.querySelector(".card-title").textContent = reminder.title;
      newcard.querySelector(".card-date").textContent = reminder.date;
      newcard.querySelector(".card-time").textContent = reminder.time;
      newcard.querySelector(".card-frequency").textContent = reminder.frequency;
      newcard.querySelector(".card-details").textContent = reminder.details;

      newcard.querySelector(".read-more").href =
        `createReminder.html?docID=${encodeURIComponent(doc.id)}`;
      newcard.querySelector(".delete-reminder").dataset.id = doc.id;

      setupCheckbox(newcard, doc.id);

      completedContainer.appendChild(newcard);
    });
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
    checked = userDoc.data()?.checked || []; // uses "optional chaining" (?.)
    displayReminders(user);
  } else {
    document.getElementById("reminders-go-here").textContent =
      "Please log in to view your reminders.";
  }
});

function setupCheckbox(card, reminderId) {
  const checkbox = card.querySelector(".check-btn");

  if (!checkbox) {
    console.error("Checkbox not found");
    return;
  }

  // Checks whether reminder is already completed
  if (checked.includes(reminderId)) {
    checkbox.classList.replace("bi-square", "bi-check-square");
  }

  // Connects checkbox to toggle function
  checkbox.addEventListener("click", function () {
    toggleCheckbox(checkbox, reminderId);
  });
}

async function toggleCheckbox(checkbox, reminderId) {
  const container = document.getElementById("reminders-go-here");
  const completedContainer = document.getElementById("completed-reminders");
  const userRef = doc(db, "Reminders", currentUser.uid);

  const reminderCard = checkbox.closest(".col-12");

  if (checkbox.classList.contains("bi-check-square")) {
    // Remove from completed reminders
    await setDoc(
      userRef,
      { checked: arrayRemove(reminderId) },
      { merge: true },
    );

    checkbox.classList.replace("bi-check-square", "bi-square");
    checked.splice(checked.indexOf(reminderId), 1);

    container.appendChild(reminderCard);
  } else {
    // Add to completed reminders
    await setDoc(userRef, { checked: arrayUnion(reminderId) }, { merge: true });

    checkbox.classList.replace("bi-square", "bi-check-square");
    checked.push(reminderId);
    completedContainer.appendChild(reminderCard);
  }
}

const deleteReminder = async () => {
  ["reminders-go-here", "completed-reminders"].forEach((id) => {
    const container = document.getElementById(id);

    if (!container) return;

    container.addEventListener("click", async (e) => {
      const deleteId = e.target.closest(".delete-reminder");
      if (!deleteId) {
        return;
      }
      e.preventDefault();
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        const currentReminderId = deleteId.dataset.id;
        
        const userRef = doc(db, "Reminders", currentUser.uid);
        const currentReminder = doc(
          db,
          "Reminders",
          user.uid,
          "UserReminders",
          currentReminderId,
        );

        await deleteDoc(currentReminder);

        await setDoc(
          userRef,
          { checked: arrayRemove(currentReminderId) },
          { merge: true },
        );
        checked.splice(checked.indexOf(currentReminderId), 1);

        deleteId.closest(".col-12").remove();
      } catch (error) {
        showError(authErrorMessage(error));
        console.error(error);
      }
    });
  });
};

deleteReminder();

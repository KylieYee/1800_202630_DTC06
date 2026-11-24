import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

const params = new URLSearchParams(window.location.search);
const reminderId = params.get("docID");

const loadReminder = async (user) => {
  if (!reminderId) return;

  const reminderRef = doc(
    db,
    "Reminders",
    user.uid,
    "UserReminders",
    reminderId,
  );

  const reminderSnap = await getDoc(reminderRef);

  if (reminderSnap.exists()) {
    const reminder = reminderSnap.data();

    document.getElementById("reminder-title").value = reminder.title;
    document.getElementById("date-select").value = reminder.date;
    document.getElementById("time-select").value = reminder.time;
    document.getElementById("reminder-frequency").value = reminder.frequency;
    document.getElementById("reminder-details").value = reminder.details;

    document.getElementById("submit-button").innerHTML = "Save Changes";
  }
};


const submitForm = async () => {
  document
    .getElementById("reminderForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      //gets user
      const auth = getAuth();
      const user = auth.currentUser;

      //gets values
      const title = document.getElementById("reminder-title").value;
      const selectedDate = document.getElementById("date-select").value;
      const selectedTime = document.getElementById("time-select").value;
      const selectedFrequency =
        document.getElementById("reminder-frequency").value;
      const details = document.getElementById("reminder-details").value;
    
      try { //adds to firestore
        const reminderData = {
          userId: user.uid,
          date: selectedDate,
          time: selectedTime,
          frequency: selectedFrequency,
          title: title,
          details: details,
        };

        if (reminderId) {
          // Updates existing reminder
          const reminderRef = doc(
            db,
            "Reminders",
            user.uid,
            "UserReminders",
            reminderId,
          );

          await updateDoc(reminderRef, reminderData);
        } else {
          // Creates new reminder
          await addDoc(collection(db, "Reminders", user.uid, "UserReminders"), {
            ...reminderData,
            createdAt: serverTimestamp(),
          });
        }

        document.getElementById("reminderForm").reset();
        location.href = "reminder.html";
      } catch (error) { //catch errors
        showError(authErrorMessage(error));
        console.error(error);
      }
    });
};

submitForm();

onAuthStateChanged(getAuth(), (user) => {
  if (user) {
    loadReminder(user);
  }
});
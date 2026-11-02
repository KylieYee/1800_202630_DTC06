import { getAuth } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";

const submitForm = async () => {
  document
    .getElementById("reminderForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const auth = getAuth();
      const user = auth.currentUser;

      const title = document.getElementById("reminder-title").value;
      const selectedDate = document.getElementById("date-select").value;
      const selectedTime = document.getElementById("time-select").value;
      const selectedFrequency =
        document.getElementById("reminder-frequency").value;
      const details = document.getElementById("reminder-details").value;
    
      try {
        await addDoc(collection(db, "Reminders", user.email, "UserReminders"), {
          userId: user.uid,
          date: selectedDate,
          time: selectedTime,
          frequency: selectedFrequency,
          createdAt: serverTimestamp(),
          title: title,
          details: details
        });

        document.getElementById("reminderForm").reset();
        location.href = "reminder.html";
      } catch (error) {
        showError(authErrorMessage(error));
        console.error(error);
      }
    });
};

submitForm();
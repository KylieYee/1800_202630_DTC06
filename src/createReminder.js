import { getAuth } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";

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
        await addDoc(collection(db, "Reminders", user.uid, "UserReminders"), {
          userId: user.uid,
          date: selectedDate,
          time: selectedTime,
          frequency: selectedFrequency,
          createdAt: serverTimestamp(),
          title: title,
          details: details,
        });

        document.getElementById("reminderForm").reset();
        location.href = "reminder.html";
      } catch (error) { //catch errors
        showError(authErrorMessage(error));
        console.error(error);
      }
    });
};

submitForm();
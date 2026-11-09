import { db } from "./firebaseConfig.js";
import { onAuthReady } from "./authentication.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "firebase/firestore";

let currentUser = null;

// Check authentication
onAuthReady(function (user) {

    if (!user) {
        location.href = "login.html";
        return;
    }

    currentUser = user;

});

// Save a new goal
async function saveGoal(event) {

    event.preventDefault();

    if (!currentUser) {
        alert("Please wait for login verification.");
        return;
    }

    const newGoal = {
        title: document.getElementById("goal-title").value.trim(),
        description: document.getElementById("goal-description").value.trim(),
        createdAt: serverTimestamp()
    };

    if (!newGoal.title || !newGoal.description) {
        alert("Please fill in both fields.");
        return;
    }

    try {

        await addDoc(
            collection(db, "users", currentUser.uid, "goals"),
            newGoal
        );

        // Return to the goals page
        location.href = "goal.html";

    } catch (error) {

        console.error("Error saving goal:", error);
        alert("Could not save your goal.");

    }

}

// Connect form
document.getElementById("goal-form")
    .addEventListener("submit", saveGoal);
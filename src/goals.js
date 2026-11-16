import { db } from "./firebaseConfig.js";
import { onAuthReady } from "./authentication.js";

import {
    collection,
    doc,
    getDocs,
    updateDoc
} from "firebase/firestore";

// Check authentication
onAuthReady(async function (user) {

    if (!user) {
        location.href = "login.html";
        return;
    }

    // Get the goals belonging to this user
    await loadGoals(user);

});


// Retrieve and display goals
async function loadGoals(user) {

    const goalsList = document.getElementById("goals-list");

    try {

        const goalsCollection = collection(
            db,
            "users",
            user.uid,
            "goals"
        );

        const snapshot = await getDocs(goalsCollection);

        // Check if the user has any goals
        if (snapshot.empty) {

            goalsList.textContent = "You haven't created any goals yet.";

            return;

        }

        // Clear the loading message
        goalsList.replaceChildren();

        // Display each goal
        snapshot.forEach(function (goalDoc) {

            const goal = goalDoc.data();

            // Create a Bootstrap column
            const column = document.createElement("div");
            column.className = "col-md-6 col-lg-4";

            // Create a Bootstrap card
            const card = document.createElement("div");
            card.className = "card h-100";

            const cardBody = document.createElement("div");
            cardBody.className = "card-body";

            const titleRow = document.createElement("div");
            titleRow.className = "d-flex justify-content-between align-items-start";

            // Goal title
            const title = document.createElement("h5");
            title.className = "card-title";
            title.textContent = goal.title;


            // Adds check label 
            const completedLabel = document.createElement("label");
            completedLabel.className = "form-check";

            const completedCheckbox = document.createElement("input");
            completedCheckbox.type = "checkbox";
            completedCheckbox.className = "form-check-input";


            // Goals without a saved completion state start unchecked.
            completedCheckbox.checked = goal.completed === true;
            completedCheckbox.setAttribute("aria-label", `Mark ${goal.title} as complete`);
            

            // Save the completion state; revert the checkbox if saving fails.
            completedCheckbox.addEventListener("change", async function () {
                const isCompleted = completedCheckbox.checked;
                completedCheckbox.disabled = true;

                try {
                    await updateDoc(
                        doc(db, "users", user.uid, "goals", goalDoc.id),
                        { completed: isCompleted }
                    );
                } catch (error) {
                    console.error("Error updating goal completion:", error);
                    completedCheckbox.checked = !isCompleted;
                    alert("Could not update your goal.");
                } finally {
                    completedCheckbox.disabled = false;
                }
            });

            completedLabel.appendChild(completedCheckbox);
            titleRow.appendChild(title);
            titleRow.appendChild(completedLabel);

            // Goal description
            const description = document.createElement("p");
            description.className = "card-text";
            description.textContent = goal.description;

            // Add elements together
            cardBody.appendChild(titleRow);
            cardBody.appendChild(description);

            card.appendChild(cardBody);
            column.appendChild(card);

            goalsList.appendChild(column);

        });

    } catch (error) {

        console.error("Error loading goals:", error);
        goalsList.textContent = "Could not load your goals.";

    }

}
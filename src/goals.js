import { db } from "./firebaseConfig.js";
import { onAuthReady } from "./authentication.js";

import {
    collection,
    doc,
    deleteDoc,
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
    const completedGoalsList = document.getElementById("completed-goals-list");

    try {

        const goalsCollection = collection(
            db,
            "users",
            user.uid,
            "goals"
        );

        const snapshot = await getDocs(goalsCollection);

        goalsList.replaceChildren();
        completedGoalsList.replaceChildren();

        // Display each goal
        snapshot.forEach(function (goalDoc) {

            const goal = goalDoc.data();

            // Create a Bootstrap column
            const column = document.createElement("div");
            column.className = "col-md-6 col-lg-4 goal-card";

            // Create a Bootstrap card
            const card = document.createElement("div");
            card.className = "card h-100";

            const cardBody = document.createElement("div");
            cardBody.className = "card-body";

            const titleRow = document.createElement("div");
            titleRow.className = "d-flex justify-content-between align-items-start";

            const titleActions = document.createElement("div");
            titleActions.className = "d-flex align-items-start gap-2";

            // Goal title
            const title = document.createElement("h5");
            title.className = "card-title";
            title.textContent = goal.title;

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "btn btn-sm btn-outline-danger";
            deleteButton.textContent = "Delete";
            deleteButton.setAttribute("aria-label", `Delete ${goal.title}`);

            deleteButton.addEventListener("click", async function () {
                if (!confirm(`Are you sure you want to delete "${goal.title}"?`)) {
                    return;
                }

                deleteButton.disabled = true;

                try {
                    await deleteDoc(
                        doc(db, "users", user.uid, "goals", goalDoc.id)
                    );
                    column.remove();
                    setEmptyStateIfNeeded(goalsList, "You haven't created any goals yet.");
                    setEmptyStateIfNeeded(completedGoalsList, "No completed goals yet.");
                } catch (error) {
                    console.error("Error deleting goal:", error);
                    alert("Could not delete your goal.");
                    deleteButton.disabled = false;
                }
            });


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

                    const sourceList = isCompleted ? goalsList : completedGoalsList;
                    const destinationList = isCompleted ? completedGoalsList : goalsList;
                    destinationList.querySelector(".goal-empty-state")?.remove();
                    destinationList.appendChild(column);
                    setEmptyStateIfNeeded(
                        sourceList,
                        isCompleted ? "You haven't created any goals yet." : "No completed goals yet."
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
            titleActions.appendChild(completedLabel);
            titleActions.appendChild(deleteButton);
            titleRow.appendChild(titleActions);

            // Goal description
            const description = document.createElement("p");
            description.className = "card-text";
            description.textContent = goal.description;

            // Add elements together
            cardBody.appendChild(titleRow);
            cardBody.appendChild(description);

            card.appendChild(cardBody);
            column.appendChild(card);

            (goal.completed === true ? completedGoalsList : goalsList).appendChild(column);

        });

        setEmptyStateIfNeeded(goalsList, "You haven't created any goals yet.");
        setEmptyStateIfNeeded(completedGoalsList, "No completed goals yet.");

    } catch (error) {

        console.error("Error loading goals:", error);
        goalsList.textContent = "Could not load your goals.";
        completedGoalsList.textContent = "Could not load your goals.";

    }

    function setEmptyStateIfNeeded(list, message) {
        if (list.querySelector(".goal-card")) {
            return;
        }

        const emptyMessage = document.createElement("p");
        emptyMessage.className = "col-12 goal-empty-state";
        emptyMessage.textContent = message;
        list.replaceChildren(emptyMessage);
    }

}
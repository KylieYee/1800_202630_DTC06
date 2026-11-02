
import { auth, db } from "./firebaseConfig.js";

import {
    onAuthStateChanged,
    signOut
} from "firebase/auth";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "firebase/firestore";


// Get the profile input fields
const inputs = document.querySelectorAll(".form-control");

const fullNameInput = inputs[0];
const ageInput = inputs[1];
const heightInput = inputs[2];

// Get the logout button
const logoutButton = document.querySelector(".btn-danger");


// Create a Save Profile button
const saveButton = document.createElement("button");

saveButton.type = "button";
saveButton.className = "btn btn-primary mb-3";
saveButton.textContent = "Save Profile";

// Add Save button before Logout button
logoutButton.parentElement.insertBefore(
    saveButton,
    logoutButton
);


// Check if a user is logged in
onAuthStateChanged(auth, async (user) => {

    if (user) {

        // Reference the user's document in Firestore
        const userRef = doc(db, "users", user.uid);

        try {

            // READ: Get the user's profile from Firestore
            const documentSnapshot = await getDoc(userRef);

            if (documentSnapshot.exists()) {

                const profileData = documentSnapshot.data();

                // Display saved profile information
                fullNameInput.value = profileData.fullName || "";
                ageInput.value = profileData.age || "";
                heightInput.value = profileData.height || "";

            } else {

                // No profile exists yet
                fullNameInput.value = user.email || "";

            }

        } catch (error) {

            console.error("Error reading profile:", error);
            alert("Could not load your profile.");

        }

    } else {

        // No authenticated user
        fullNameInput.value = "";
        ageInput.value = "";
        heightInput.value = "";

        saveButton.disabled = true;
        logoutButton.disabled = true;

    }

});


// Save profile information
saveButton.addEventListener("click", async () => {

    const user = auth.currentUser;

    if (!user) {
        alert("Please log in first.");
        return;
    }

    // Collect information from the inputs
    const profileData = {
        fullName: fullNameInput.value.trim(),
        age: ageInput.value.trim(),
        height: heightInput.value.trim(),
        email: user.email,
        updatedAt: serverTimestamp()
    };

    try {

        // WRITE: Save profile information to Firestore
        const userRef = doc(db, "users", user.uid);

        await setDoc(userRef, profileData, {
            merge: true
        });

        alert("Profile saved successfully!");

    } catch (error) {

        console.error("Error saving profile:", error);
        alert("Could not save your profile.");

    }

});


// Log out the current user
logoutButton.addEventListener("click", async () => {

    try {

        await signOut(auth);

        window.location.href = "index.html";

    } catch (error) {

        console.error("Error logging out:", error);
        alert("Could not log out.");

    }

});

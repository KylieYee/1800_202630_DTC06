import { updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthReady } from "./authentication.js";
import { db } from "./firebaseConfig.js";

const profileForm = document.getElementById("profile-form");
const welcomeName = document.getElementById("profile-welcome-name");
const nameInput = document.getElementById("profile-name");
const ageInput = document.getElementById("profile-age");
const heightInput = document.getElementById("profile-height");
const weightInput = document.getElementById("profile-weight");
const editButton = document.getElementById("profile-edit");
const saveButton = document.getElementById("profile-save");
const message = document.getElementById("profile-message");
const profileInputs = [nameInput, ageInput, heightInput, weightInput];

let currentUser = null;

onAuthReady(async function (user) {
    if (!user) {
        location.href = "login.html";
        return;
    }

    currentUser = user;
    welcomeName.textContent = user.displayName || user.email || "there";

    try {
        const profileSnapshot = await getDoc(doc(db, "users", user.uid));
        const profile = profileSnapshot.exists() ? profileSnapshot.data() : {};
        const name = typeof profile.name === "string" && profile.name.trim()
            ? profile.name
            : user.displayName || "";

        nameInput.value = name;
        ageInput.value = profile.age ?? "";
        heightInput.value = profile.height ?? "";
        weightInput.value = profile.weight ?? "";
        welcomeName.textContent = name || user.email || "there";
        editButton.disabled = false;
    } catch (error) {
        console.error("Error loading profile:", error);
        showMessage("Could not load your profile. Please try again.", "text-danger");
    }
});

editButton.addEventListener("click", function () {
    profileInputs.forEach(function (input) {
        input.readOnly = false;
    });
    editButton.disabled = true;
    saveButton.disabled = false;
    message.textContent = "";
    nameInput.focus();
});

profileForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!currentUser || !profileForm.reportValidity()) {
        return;
    }

    const name = nameInput.value.trim();
    if (!name) {
        showMessage("Please enter your full name.", "text-danger");
        nameInput.focus();
        return;
    }

    const profile = {
        name,
        age: ageInput.value === "" ? null : Number(ageInput.value),
        height: heightInput.value === "" ? null : Number(heightInput.value),
        weight: weightInput.value === "" ? null : Number(weightInput.value)
    };

    editButton.disabled = true;
    saveButton.disabled = true;
    showMessage("Saving your profile...", "text-muted");

    try {
        await setDoc(doc(db, "users", currentUser.uid), profile, { merge: true });
    } catch (error) {
        console.error("Error saving profile:", error);
        showMessage("Could not save your profile. Please try again.", "text-danger");
        editButton.disabled = false;
        saveButton.disabled = false;
        return;
    }

    try {
        await updateProfile(currentUser, { displayName: name });
        welcomeName.textContent = name;
        setEditing(false);
        showMessage("Profile saved.", "text-success");
    } catch (error) {
        console.error("Error updating login profile name:", error);
        welcomeName.textContent = name;
        setEditing(false);
        showMessage(
            "Profile details were saved, but the login profile name could not be updated.",
            "text-warning"
        );
    }
});

function setEditing(isEditing) {
    profileInputs.forEach(function (input) {
        input.readOnly = !isEditing;
    });
    editButton.disabled = isEditing;
    saveButton.disabled = !isEditing;
}

function showMessage(text, className) {
    message.textContent = text;
    message.className = `mt-3 mb-0 ${className}`;
}

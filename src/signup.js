
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebaseConfig.js";

const signupForm = document.getElementById("signup-form");

const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirm-password");

const signupError = document.getElementById("signup-error");

signupForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    signupError.textContent = "";

    if (password.value !== confirmPassword.value) {
        signupError.textContent = "Passwords do not match.";
        return;
    }

    try {

        console.log("Attempting to create account...");

        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email.value,
            password.value
        );

        console.log("Account successfully created!");
        console.log("User email:", userCredential.user.email);
        console.log("User ID:", userCredential.user.uid);

        window.location.href = "profile.html";

    } catch (error) {

        console.error("Firebase error:", error.code);
        console.error("Firebase message:", error.message);

        signupError.textContent = error.message;

    }

});

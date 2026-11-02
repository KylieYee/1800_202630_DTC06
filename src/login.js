// Import Firebase Authentication
import { signInWithEmailAndPassword } from "firebase/auth";

// Import Firebase authentication instance
import { auth } from "./firebaseConfig.js";

// Get HTML elements
const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("login-error");

// Listen for form submission
loginForm.addEventListener("submit", async function (event) {

    // Prevent page refresh
    event.preventDefault();

    // Get user input
    const email = emailInput.value;
    const password = passwordInput.value;
    errorMessage.textContent = "";

    try {

        // Authenticate user with Firebase
        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        // Login successful
        console.log("User logged in:", userCredential.user.uid);

        // Redirect to profile page
        window.location.href = "profile.html";

    } catch (error) {

        // Display error
        errorMessage.textContent = error.message;

    }

});
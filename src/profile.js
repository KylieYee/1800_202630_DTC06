
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebaseConfig.js";

// Get the profile container
const profileContainer = document.getElementById("profile-container");

// Check if the user is logged in
onAuthStateChanged(auth, function (user) {

    if (user) {

        // User is logged in
        profileContainer.innerHTML = `
            <h1 class="p-5">Welcome User</h1>

            <div class="d-flex flex-row align-items-center">
                <img src="images/blank-profile-picture-973460_1280.png"
                     class="w-25 p-5"
                     alt="Profile picture">

                <div class="d-flex flex-column">
                    <p>You are logged in as:</p>
                    <p id="user-email"></p>

                    <button class="btn btn-danger" id="logout-btn">
                        Logout
                    </button>
                </div>
            </div>
        `;

        // Display email
        document.getElementById("user-email").textContent = user.email;

        // Logout
        document.getElementById("logout-btn").addEventListener("click", async function () {
            await signOut(auth);
        });

    } else {

        // User is not logged in
        profileContainer.innerHTML = `
            <h1 class="p-5">Welcome User</h1>

            <div class="d-flex flex-row align-items-center">
                <img src="images/blank-profile-picture-973460_1280.png"
                     class="w-25 p-5"
                     alt="Profile picture">

                <div class="d-flex flex-column">
                    <p>Please log in or create an account to continue.</p>

                    <div>
                        <button class="btn btn-primary" id="login-btn">
                            Login
                        </button>

                        <button class="btn btn-success" id="signup-btn">
                            Create An Account
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Login button
        document.getElementById("login-btn").addEventListener("click", function () {
            window.location.href = "login.html";
        });

        // Signup button
        document.getElementById("signup-btn").addEventListener("click", function () {
            window.location.href = "signup.html";
        });
    }

});

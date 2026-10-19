// Import Firebase authentication tools
import { logoutUser } from "/src/authentication.js"; // Our function to log out the user
import { onAuthReady } from "/src/authentication.js"; // Our function co get authenticated user

class SiteNavbar extends HTMLElement {
  constructor() {
    super();
    this.renderNavbar();
    this.renderAuthControls();
  }

  renderNavbar() {
   this.innerHTML = `
    <!-- Navigation bar start -->
<header class="p-2" style="background-color: grey;">
    <nav class="navbar navbar-expand-md">
        <div class="container-fluid">

            <!-- Moon logo -->
            <a class="navbar-brand d-flex align-items-center" href="index.html">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTZZrRqTCtuxp8DE4qTXfGporgJrpz1On3Dmg-eOlG7w&s=10"
                    alt="Moon logo" class="rounded-circle border border-2 border-white"
                    style="width: 48px; height: 48px; object-fit: cover;">
            </a>

            <!-- Mobile menu button -->
            <button class="navbar-toggler bg-light" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar"
                aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <!-- Navigation links -->
            <div class="collapse navbar-collapse justify-content-center" id="mainNavbar">
                <div class="navbar-nav text-center">
                    <a href="index.html" class="nav-link px-3 text-white">Home</a>
                    <a href="Event.html" class="nav-link px-3 text-white">Event</a>
                    <a href="tracker.html" class="nav-link px-3 text-white">Tracker</a>
                    <a href="reminder.html" class="nav-link px-3 text-white">Reminder</a>
                    <a href="profile.html" class="nav-link px-3 text-white">Profile</a>
                </div>
            </div>

        </div>
    </nav>
    </header>
    <!-- Navigation bar end -->
  }

  /**
   * Displays Log in or Log out button in the navbar based on Firebase authentication status.
   * Updates automatically when the user's login status changes.
   * Uses callbacks to detect auth changes and handle the Log out button click.
   */
  renderAuthControls() {
    const authControls = this.querySelector("#authControls"); // Find #authControls inside this navbar

    // Invisible placeholder prevents layout shifting while Firebase checks login status
    authControls.innerHTML = `<div class="btn btn-outline-light" style="visibility: hidden; min-width: 80px;">Log out</div>`;

    // Pass a callback that runs when Firebase reports the login status
    onAuthReady(function (user) {
      // Receives the user object (or null)

      if (user) {
        // User is logged in
        authControls.innerHTML = `<button class="btn btn-outline-light" id="signOutBtn" type="button" style="min-width: 80px;">Log out</button>`;

        const signOutBtn = authControls.querySelector("#signOutBtn");
        signOutBtn.addEventListener("click", logoutUser); // Callback: runs when Log out is clicked
      } else {
        // User is NOT logged in, and gets redirected to login page if user clicks the login button
        authControls.innerHTML = `<a class="btn btn-outline-light" id="loginBtn" href="/login.html" style="min-width: 80px;">Log in</a>`;
      }
    });
  }
}

customElements.define("site-navbar", SiteNavbar);

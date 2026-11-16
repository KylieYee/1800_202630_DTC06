import { db } from "./firebaseConfig.js";
import { onAuthReady } from "./authentication.js";
import {
    addDoc,
    collection,
    getDocs,
    serverTimestamp
} from "firebase/firestore";

let currentUser = null;

// Check login before loading the signed-in user's events.
onAuthReady(async function (user) {
    if (!user) {
        location.href = "login.html";
        return;
    }

    currentUser = user;
    await loadEvents(user);
});

const eventForm = document.getElementById("event-form");
const eventMessage = document.getElementById("event-message");
const submitButton = eventForm.querySelector('button[type="submit"]');
const eventsList = document.getElementById("events-list");


// Fetch this user's events and display them as date-sorted cards.
async function loadEvents(user) {
    eventsList.textContent = "Loading your events...";

    try {
        const eventsCollection = collection(db, "users", user.uid, "events");
        const snapshot = await getDocs(eventsCollection);

        if (snapshot.empty) {
            eventsList.textContent = "You haven't added any events yet.";
            return;
        }

        const events = snapshot.docs
            .map((eventDoc) => eventDoc.data())
            .sort((first, second) => first.date.localeCompare(second.date));

        eventsList.replaceChildren();

        events.forEach((savedEvent) => {


            // Build a card showing the event name and a readable date.
            const column = document.createElement("div");
            column.className = "col-md-6 col-lg-4";

            const card = document.createElement("div");
            card.className = "card h-100";

            const cardBody = document.createElement("div");
            cardBody.className = "card-body";

            const title = document.createElement("h3");
            title.className = "card-title h5";
            title.textContent = savedEvent.title;

            const date = document.createElement("time");
            date.className = "card-text";
            date.dateTime = savedEvent.date;
            date.textContent = new Intl.DateTimeFormat(undefined, {
                dateStyle: "long"
            }).format(new Date(`${savedEvent.date}T00:00:00`));

            cardBody.append(title, date);
            card.appendChild(cardBody);
            column.appendChild(card);
            eventsList.appendChild(column);
        });
    } catch (error) {
        console.error("Error loading events:", error);
        eventsList.textContent = "Could not load your events.";
    }
}


// Save the submitted event, then refresh the cards to show it.
eventForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!currentUser) {
        eventMessage.textContent = "Please wait for login verification.";
        return;
    }

    const title = document.getElementById("event-title").value.trim();
    const date = document.getElementById("event-date").value;

    if (!title || !date) {
        eventMessage.textContent = "Enter an event name and choose a date.";
        return;
    }

    submitButton.disabled = true;
    eventMessage.textContent = "";

    try {
        await addDoc(collection(db, "users", currentUser.uid, "events"), {
            title,
            date,
            createdAt: serverTimestamp()
        });

        eventForm.reset();
        eventMessage.textContent = "Event added.";
        await loadEvents(currentUser);
    } catch (error) {
        console.error("Error saving event:", error);
        eventMessage.textContent = "Could not save your event.";
    } finally {
        submitButton.disabled = false;
    }
});

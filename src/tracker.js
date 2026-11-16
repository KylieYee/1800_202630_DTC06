let seconds = 0;
let interval = null;
let isRunning = false;

const timerDisplay = document.getElementById("timer-display");
const toggleBtn = document.getElementById("toggle-btn");

// Updates timer display
const updateDisplay = () => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  timerDisplay.textContent =
    String(hours).padStart(2, "0") +
    ":" +
    String(minutes).padStart(2, "0") +
    ":" +
    String(remainingSeconds).padStart(2, "0");
};

// Updates every second (1000)
const startTimer = () => {
  interval = setInterval(() => {
    seconds++;
    updateDisplay();
  }, 1000);
};

// Toggle button
toggleBtn.addEventListener("click", () => {
  if (isRunning) {
    // Pause
    clearInterval(interval);
    interval = null;
    toggleBtn.innerHTML = '<i class="bi bi-play display-1"></i>';
    isRunning = false;
  } else {
    // Play
    startTimer();
    toggleBtn.innerHTML = '<i class="bi bi-pause display-1"></i>';
    isRunning = true;
  }
});

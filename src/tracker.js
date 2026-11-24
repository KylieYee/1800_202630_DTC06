let seconds = 0; //seconds
let interval = null; // tracks timer
let isRunning = false; //if timer going
let currentTimer = "stopwatch"; //default stopwatch can switch to countdown
let inputTime = 300;

const timerDisplay = document.getElementById("timer-display");
const toggleBtn = document.getElementById("toggle-btn");
const resetBtn = document.getElementById("reset-timer");

//formats time
function formatTime(seconds){
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return (
    String(hours).padStart(2, "0") +
    ":" +
    String(minutes).padStart(2, "0") +
    ":" +
    String(remainingSeconds).padStart(2, "0")
  );
}

// Updates timer display
const updateDisplay = () => {
  timerDisplay.textContent = formatTime(seconds);
};

// Updates every second (1000)
const startTimer = () => {
  interval = setInterval(() => {
    if (currentTimer == "stopwatch") {
      seconds++;
    } else {
      if (seconds > 0) {
        seconds--
      } else {
        clearInterval(interval);
        interval = null;
        isRunning = false;
        toggleBtn.innerHTML = '<i class="bi bi-play display-1"></i>';
      }
    }
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

//resets timer
resetBtn.addEventListener("click", () => {
  saveHistory();
  clearInterval(interval);
  interval = null;

  if(currentTimer == "stopwatch"){
    seconds = 0;
  } else {
    seconds = inputTime;
  }
  updateDisplay();

  toggleBtn.innerHTML = '<i class="bi bi-play display-1"></i>';
  isRunning = false;
});

//switch between countdown/stopwtach
document.querySelectorAll('input[name="options"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    saveHistory();
    clearInterval(interval);
    interval = null;

    seconds = 0;
    updateDisplay();

    toggleBtn.innerHTML = '<i class="bi bi-play display-1"></i>';
    isRunning = false;

    if (radio.id === "stopwatch-btn") {
      currentTimer = "stopwatch";
    } else if (radio.id === "countdown-btn") {
      currentTimer = "countdown";
      seconds = inputTime;
      updateDisplay();
    }
  });
});

function saveHistory(){
  const template = document.getElementById("history-timer");
  const container = document.getElementById("history-container");

  const newHistory = template.content.cloneNode(true);

  const type = newHistory.querySelector("#type-time");
  const expected = newHistory.querySelector("#expected-time");
  const actual = newHistory.querySelector("#actual-time");

  if (currentTimer == "stopwatch"){
    type.textContent = "Stopwatch";
    expected.textContent = "N/A";
    actual.textContent = formatTime(seconds);
  } else {
    type.textContent = "Countdown";
    expected.textContent = formatTime(inputTime);
    actual.textContent = formatTime(inputTime - seconds);
  }
  if(currentTimer == "stopwatch" && seconds == 0){
    return;
  }
  if (currentTimer == "countdown" && inputTime - seconds == 0){
    return;
  }
  container.appendChild(newHistory);
}
const hue = document.getElementById("hue");
const sat = document.getElementById("sat");
const light = document.getElementById("light");
const target = document.getElementById("target");
const player = document.getElementById("player");
const checkBtn = document.getElementById("check");
const restartBtn = document.getElementById("restart");
const pauseBtn = document.getElementById("pause");
const accuracyEl = document.getElementById("accuracy");
const timeEl = document.getElementById("time");

const successSound = document.getElementById("success-sound");
const failSound = document.getElementById("fail-sound");

let targetH, targetS, targetL;
let time = 60;
let timer;
let paused = false;

// Generate random target color
function randomColor() {
  targetH = Math.floor(Math.random() * 360);
  targetS = Math.floor(Math.random() * 100);
  targetL = Math.floor(Math.random() * 100);
  const gradient = `linear-gradient(90deg, hsl(${targetH}, ${targetS}%, ${targetL}%), hsl(${(targetH + 50) % 360}, ${(targetS + 30) % 100}%, ${(targetL + 20) % 100}%))`;
  target.style.background = gradient;
}

function updatePlayerColor() {
  const gradient = `linear-gradient(90deg, hsl(${hue.value}, ${sat.value}%, ${light.value}%), hsl(${(+hue.value + 50) % 360}, ${(Number(sat.value) + 30) % 100}%, ${(Number(light.value) + 20) % 100}%))`;
  player.style.background = gradient;
}

function calculateAccuracy() {
  const hDiff = Math.abs(targetH - hue.value);
  const sDiff = Math.abs(targetS - sat.value);
  const lDiff = Math.abs(targetL - light.value);
  const diff = (hDiff + sDiff + lDiff) / 3;
  const acc = Math.max(0, 100 - diff);
  return acc.toFixed(1);
}

checkBtn.addEventListener("click", () => {
  const acc = calculateAccuracy();
  accuracyEl.textContent = acc;
  if (acc > 90) {
    successSound.play();
    player.style.boxShadow = "0 0 30px lime";
  } else {
    failSound.play();
    player.style.boxShadow = "0 0 30px red";
  }
});

[hue, sat, light].forEach((slider) => {
  slider.addEventListener("input", updatePlayerColor);
});

restartBtn.addEventListener("click", () => {
  resetGame();
});

pauseBtn.addEventListener("click", () => {
  paused = !paused;
  if (paused) {
    clearInterval(timer);
    document.body.classList.add("paused");
    pauseBtn.textContent = "▶ Resume";
  } else {
    startTimer();
    document.body.classList.remove("paused");
    pauseBtn.textContent = "⏸ Pause";
  }
});

function startTimer() {
  timer = setInterval(() => {
    if (!paused) {
      time--;
      timeEl.textContent = time;
      if (time <= 0) {
        clearInterval(timer);
        alert("⏱ Time's up!");
      }
    }
  }, 1000);
}

function resetGame() {
  clearInterval(timer);
  time = 60;
  timeEl.textContent = time;
  accuracyEl.textContent = "--";
  document.body.classList.remove("paused");
  pauseBtn.textContent = "⏸ Pause";
  randomColor();
  updatePlayerColor();
  startTimer();
}

randomColor();
updatePlayerColor();
startTimer();

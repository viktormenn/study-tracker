// -------------------------
//   КРУГЛЫЙ ТАЙМЕР
// -------------------------

let circleSeconds = Number(localStorage.getItem("circle_time") || 0);
let circleRunning = localStorage.getItem("circle_running") === "1";
let circleLastTick = Date.now();

const circleBtn = document.getElementById("circle-btn");
const circleTime = document.getElementById("circle-time");
const circleProgress = document.querySelector("circle.progress");

function formatCircle(sec) {
  const h = String(Math.floor(sec / 3600)).padStart(2, "0");
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

// Обновляет визуальный прогресс полоски на круге
function updateCircleVisual() {
  const max = 440; // SVG окружность имеет stroke-dasharray: 440
  const secondsInCycle = 60; // один цикл = 60 секунд
  // Вычисляем % прогресса в текущем цикле
  const progress = (circleSeconds % secondsInCycle) / secondsInCycle;
  // Конвертируем в stroke-dashoffset (от полного к пустому)
  const offset = max - max * progress;
  circleProgress.style.strokeDashoffset = offset;
}

function resetCircle() {
  circleSeconds = 0;
  localStorage.setItem("circle_time", 0);
  circleTime.textContent = formatCircle(0);
  updateCircleVisual();
}

function tickCircle() {
  const now = Date.now();
  const diff = Math.floor((now - circleLastTick) / 1000);

  if (diff > 0) {
    // ВАЖНО: проверяем смену дня ДО увеличения времени
    // (чтобы в конце дня не потерять секунды)
    checkDayChange(circleSeconds, resetCircle);

    if (circleRunning) {
      circleSeconds += diff;
      addToStats(diff); // добавляем секунды в статистику
      localStorage.setItem("circle_time", circleSeconds);
      circleTime.textContent = formatCircle(circleSeconds);
      updateCircleVisual();
    }

    circleLastTick = now;
  }

  requestAnimationFrame(tickCircle);
}

circleBtn.addEventListener("click", () => {
  circleRunning = !circleRunning;
  localStorage.setItem("circle_running", circleRunning ? "1" : "0");
  circleBtn.textContent = circleRunning ? "Пауза" : "Старт";
  circleLastTick = Date.now();
});

circleTime.textContent = formatCircle(circleSeconds);
circleBtn.textContent = circleRunning ? "Пауза" : "Старт";
updateCircleVisual();
tickCircle();
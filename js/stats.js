// -------------------------
//   ХРАНЕНИЕ СТАТИСТИКИ
// -------------------------

let stats = JSON.parse(localStorage.getItem("study_stats") || "{}");
let lastStatsDay = localStorage.getItem("stats_last_day");

// Инициализация даты при первом запуске
if (!lastStatsDay) {
  lastStatsDay = new Date().toISOString().slice(0, 10);
  localStorage.setItem("stats_last_day", lastStatsDay);
}

// Сохранение статистики
function saveStats() {
  localStorage.setItem("study_stats", JSON.stringify(stats));
  localStorage.setItem("stats_last_day", lastStatsDay);
}

// Добавить время в статистику
function addToStats(seconds) {
  const today = new Date().toISOString().slice(0, 10);

  if (!stats[today]) stats[today] = 0;

  stats[today] += seconds;
  saveStats();
}

// Проверяем смену дня
function checkDayChange(currentSeconds, resetCallback) {
  const today = new Date().toISOString().slice(0, 10);

  if (today !== lastStatsDay) {
    if (currentSeconds > 0) {
      if (!stats[lastStatsDay]) stats[lastStatsDay] = 0;
      stats[lastStatsDay] += currentSeconds;
    }

    lastStatsDay = today;
    saveStats();
    resetCallback();
  }
}

// Форматирование времени
function formatStatsTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${h}ч ${m}м`;
}

// -------------------------
//   ГОДОВОЙ КАЛЕНДАРЬ
// -------------------------

function renderYearCalendar() {
  const container = document.getElementById("year-calendar");
  const label = document.getElementById("year-label");
  if (!container || !label) return;

  const stats = JSON.parse(localStorage.getItem("study_stats") || "{}");
  const year = new Date().getFullYear();

  label.textContent = year;

  const months = Array(12).fill(0);

  for (const date in stats) {
    const [y, m] = date.split("-").map(Number);
    if (y === year) {
      months[m - 1] += stats[date];
    }
  }

  function getLevel(sec) {
    if (sec > 60 * 60) return 4;
    if (sec > 40 * 60) return 3;
    if (sec > 20 * 60) return 2;
    if (sec > 0) return 1;
    return 0;
  }

  const names = ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"];

  container.innerHTML = months.map((sec, i) => `
    <div class="year-month month-level-${getLevel(sec)}" data-month="${i}">
      ${names[i]}
    </div>
  `).join("");

  container.querySelectorAll(".year-month").forEach(el => {
    el.addEventListener("click", () => {
      const monthIndex = Number(el.dataset.month);
      renderCalendar(year, monthIndex);
    });
  });
}

// -------------------------
//   БОЛЬШОЙ КАЛЕНДАРЬ
// -------------------------

function renderCalendar(year, month) {
  const calendar = document.getElementById("calendar");
  const monthLabel = document.getElementById("calendar-month");
  if (!calendar || !monthLabel) return;

  const stats = JSON.parse(localStorage.getItem("study_stats") || "{}");

  const monthNames = [
    "Январь","Февраль","Март","Апрель","Май","Июнь",
    "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"
  ];

  monthLabel.textContent = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay + 6) % 7; // Пн = 0

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  calendar.innerHTML = "";

  // Пустые клетки
  for (let i = 0; i < offset; i++) {
    const empty = document.createElement("div");
    empty.classList.add("calendar-day");
    calendar.appendChild(empty);
  }

  // Дни месяца
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const sec = stats[dateKey] || 0;

    const div = document.createElement("div");
    div.classList.add("calendar-day");

    let level = 0;
    if (sec > 60 * 60) level = 4;
    else if (sec > 40 * 60) level = 3;
    else if (sec > 20 * 60) level = 2;
    else if (sec > 0) level = 1;

    div.classList.add(`activity-${level}`);

    div.innerHTML = sec > 0
      ? `${day}<br>${formatStatsTime(sec)}`
      : `${day}`;

    div.addEventListener("click", () => openDayDetails(dateKey));

    calendar.appendChild(div);
  }
}

// -------------------------
//   МОДАЛКА
// -------------------------

function openDayDetails(dateKey) {
  const modal = document.getElementById("day-details");
  const dateEl = document.getElementById("details-date");
  const timeEl = document.getElementById("details-time");
  const tasksEl = document.getElementById("details-tasks");

  const sec = stats[dateKey] || 0;

  dateEl.textContent = dateKey;
  timeEl.textContent = formatStatsTime(sec);
  tasksEl.innerHTML = "<li>Пока задач нет</li>";

  modal.classList.remove("hidden");
}

document.getElementById("close-details").addEventListener("click", () => {
  document.getElementById("day-details").classList.add("hidden");
});

// -------------------------
//   СТАРТ
// -------------------------

renderYearCalendar();
renderCalendar(new Date().getFullYear(), new Date().getMonth());

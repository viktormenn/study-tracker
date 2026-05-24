// -------------------------
//   ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
// -------------------------


document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const tab = btn.dataset.tab;

    document.querySelectorAll(".tab-page").forEach(page => {
      page.classList.add("hidden");
    });

    document.getElementById("tab-" + tab).classList.remove("hidden");
  });
});


// -------------------------
//   СОСТОЯНИЕ
// -------------------------

let state = JSON.parse(localStorage.getItem("tracker_state_v2") || "{}");

function save() {
  localStorage.setItem("tracker_state_v2", JSON.stringify(state));
}


// -------------------------
//   ОБНОВЛЕНИЕ ПРОГРЕССА
// -------------------------

function updateProgress() {
  let total = 0;
  let done = 0;

  PLAN.forEach((tasks, d) => {
    tasks.forEach((_, i) => {
      total++;
      if (state[`d${d}t${i}`]) done++;
    });
  });

  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  document.getElementById("global-percent").textContent = percent + "%";
  document.getElementById("global-bar").style.width = percent + "%";

  updateStreakUI();
  renderStats();
}


// -------------------------
//   РЕНДЕР СТАТИСТИКИ
// -------------------------

function renderStats() {
}


// -------------------------
//   РЕНДЕР КАЛЕНДАРЯ   
// -------------------------

function renderCalendar(year = new Date().getFullYear(), month = new Date().getMonth()) {
  const calendar = document.getElementById("calendar");
  const monthLabel = document.getElementById("calendar-month");
  if (!calendar || !monthLabel) return; 

  calendar.innerHTML = "";

  const stats = JSON.parse(localStorage.getItem("study_stats") || "{}");

  

  const monthNames = [
    t("calendar.month.january"), t("calendar.month.february"), t("calendar.month.march"),
    t("calendar.month.april"), t("calendar.month.may"), t("calendar.month.june"),
    t("calendar.month.july"), t("calendar.month.august"), t("calendar.month.september"),
    t("calendar.month.october"), t("calendar.month.november"), t("calendar.month.december")
  ];

  monthLabel.textContent = `${monthNames[month]} ${year}`;

  // Получаем день недели первого числа (0=воскресенье, 1=понедельник...)
  let firstDay = new Date(year, month, 1).getDay();
  // Конвертируем воскресенье из 0 в 7 (для корректного отступа в сетке)
  if (firstDay === 0) firstDay = 7;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Добавляем пустые ячейки до первого дня месяца
  for (let i = 1; i < firstDay; i++) {
    const empty = document.createElement("div");
    calendar.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const div = document.createElement("div");
    div.className = "calendar-day";

    // Вычисляем уровень активности на основе минут
    // level: 0=нет, 1=слабая, 2=средняя, 3=высокая, 4=очень высокая
    const minutes = stats[dateStr] || 0;
    let level = 0;
    if (minutes > 60) level = 4;
    else if (minutes > 40) level = 3;
    else if (minutes > 20) level = 2;
    else if (minutes > 0) level = 1;

    div.classList.add(`activity-${level}`);

    // Показываем число дня и время, если есть активность
    if (minutes > 0) {
      div.innerHTML = `${day}\n${formatStatsTime(minutes)}`;
    } else {
      div.textContent = day;
    }

    div.addEventListener("click", () => openDayDetails(dateStr));

    calendar.appendChild(div);
  }
}

// -------------------------
//   ДЕТАЛИ ДНЯ
// -------------------------

function openDayDetails(dateStr) {
  const modal = document.getElementById("day-details");
  const dateEl = document.getElementById("details-date");
  const timeEl = document.getElementById("details-time");
  const tasksEl = document.getElementById("details-tasks");

  const stats = JSON.parse(localStorage.getItem("study_stats") || "{}");
  const state = JSON.parse(localStorage.getItem("tracker_state_v2") || "{}");

  dateEl.textContent = `${t("modal.date")}: ${dateStr}`;

  if (stats[dateStr]) {
    timeEl.textContent = `${t("modal.time")}: ${formatStatsTime(stats[dateStr])}`;
  } else {
    timeEl.textContent = `${t("modal.time")}: ${t("modal.noData")}`;
  }

  tasksEl.innerHTML = "";

  // Ищем все отмеченные задачи за этот день
  // key в state имеет формат: "d[dayIndex]t[taskIndex]"
  Object.keys(state).forEach(key => {
    const doneDate = localStorage.getItem(key + "_date");
    if (doneDate === dateStr) {
      // Парсим индексы дня и задачи из ключа
      const [dayIndex, taskIndex] = key.replace("d", "").split("t").map(Number);
      const taskName = PLAN[dayIndex][taskIndex];

      const li = document.createElement("li");
      li.textContent = taskName;
      tasksEl.appendChild(li);
    }
  });

  modal.classList.remove("hidden");
}

document.getElementById("close-details").addEventListener("click", () => {
  document.getElementById("day-details").classList.add("hidden");
});


// -------------------------
//   СТАРТ
// -------------------------

document.addEventListener("DOMContentLoaded", async () => {
  await setLanguage("ru"); // загружаем язык по умолчанию
  renderPlan();            // рендерим только после загрузки переводов
  renderYearCalendar()
  renderCalendar();
  
});



// -------------------------
//   ПЕРЕКЛЮЧАТЕЛЬ ЯЗЫКА
// -------------------------

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".lang-btn");
  const menu = document.querySelector(".lang-menu");

  btn.addEventListener("click", () => {
    menu.classList.toggle("hidden");
  });

  menu.addEventListener("click", async (e) => {
    const lang = e.target.dataset.lang;
    if (!lang) return;

    await setLanguage(lang);
    renderPlan();
    renderCalendar();
    renderYearCalendar();
    menu.classList.add("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".lang-selector")) {
      menu.classList.add("hidden");
    }
  });
});
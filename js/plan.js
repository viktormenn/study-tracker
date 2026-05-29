
function getPlan() {
    return translations.plan; // ← теперь план берётся из JSON
}

function highlightCurrentDay() {
    const days = document.querySelectorAll(".day");
    let highlighted = false;

    days.forEach(day => {
        day.classList.remove("current-day");
    });

    for (const day of days) {
        const tasks = day.querySelectorAll("input[type='checkbox']");
        const allDone = [...tasks].every(t => t.checked);

        if (!allDone) {
            day.classList.add("current-day");
            highlighted = true;
            break;
        }
    }

    if (!highlighted && days.length > 0) {
        days[days.length - 1].classList.add("current-day");
    }
}

function updateDayProgress(dayNumber) {
    const day = document.querySelector(`.day[data-day="${dayNumber}"]`);
    if (!day) return;

    const tasks = day.querySelectorAll("input[type='checkbox']");
    const total = tasks.length;
    const done = [...tasks].filter(t => t.checked).length;

    return { done, total };
}

function renderPlan() {
    const container = document.getElementById("days");
    if (!container) return;

    container.innerHTML = "";

    window.PLAN = getPlan();

    PLAN.forEach((topics, d) => {
        const day = document.createElement("div");
        day.className = "day";
        day.dataset.day = d + 1;

        const header = document.createElement("div");
        header.className = "day-header";

        const title = `${t("day.label")} ${d + 1}`;
        const subtitle = topics.join(" • ");

        header.innerHTML = `
            <div>
                <div class="day-title">${title}</div>
                <div class="day-subtitle">${subtitle}</div>
            </div>
            <div><span class="toggle">▾</span></div>
        `;

        const body = document.createElement("div");
        body.className = "day-body";

        topics.forEach((task, i) => {
            const id = `d${d}t${i}`;

            const label = document.createElement("label");
            label.className = "task";

            label.innerHTML = `
                <input type="checkbox" ${state[id] ? "checked" : ""}>
                ${task}
            `;

            const checkbox = label.querySelector("input");

            checkbox.addEventListener("change", () => {
                state[id] = checkbox.checked;

                if (checkbox.checked) {
                    const today = new Date().toISOString().slice(0, 10);
                    localStorage.setItem(id + "_date", today);
                    onTaskChecked();
                }

                updateDayProgress(d + 1);
                save();
                updateProgress();
            });

            body.appendChild(label);
        });

        header.addEventListener("click", () => {
            body.style.display = body.style.display === "block" ? "none" : "block";
        });

        day.appendChild(header);
        day.appendChild(body);
        container.appendChild(day);
    });
   
    updateProgress();
    renderCalendar();
    highlightCurrentDay();
}

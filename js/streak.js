let streak = Number(localStorage.getItem("streak") || 0);
let lastDay = localStorage.getItem("streak_last_day") || "";

// Русское склонение
function formatDaysRu(n) {
    n = Math.abs(n) % 100;
    const n1 = n % 10;

    if (n > 10 && n < 20) return t("streak.day_many");
    if (n1 === 1) return t("streak.day_one");
    if (n1 >= 2 && n1 <= 4) return t("streak.day_few");
    return t("streak.day_many");
}

// Английское склонение
function formatDaysEn(n) {
    return n === 1 ? t("streak.day_one") : t("streak.day_many");
}

function formatDays(n) {
    return currentLang === "en" ? formatDaysEn(n) : formatDaysRu(n);
}

function updateStreakUI() {
    const countEl = document.getElementById("streak-count");
    const iconEl = document.getElementById("streak-icon");

    if (countEl) countEl.textContent = `${streak} ${formatDays(streak)}`;
    if (iconEl) iconEl.classList.toggle("active", streak > 0);
}

function onTaskChecked() {
    const today = new Date().toISOString().slice(0, 10);

    if (today !== lastDay) {
        const yesterday = new Date(Date.now() - 86400000)
            .toISOString()
            .slice(0, 10);

        if (lastDay === yesterday) streak++;
        else streak = 1;

        lastDay = today;

        localStorage.setItem("streak", streak);
        localStorage.setItem("streak_last_day", lastDay);
    }

    updateStreakUI();
}

updateStreakUI();

let translations = {};
let currentLang = localStorage.getItem("lang") || "ru";

async function loadLocale(lang) {
    const res = await fetch(`./locales/${lang}.json`);
    translations = await res.json();
}

// Поддержка вложенных ключей: "calendar.months.0"
function t(key) {
    const parts = key.split(".");
    let value = translations;

    for (const p of parts) {
        if (value[p] === undefined) return key;
        value = value[p];
    }

    return value;
}

function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        el.textContent = t(key);
    });
}

async function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("lang", lang);

    await loadLocale(lang);
    applyTranslations();

    document.getElementById("current-lang").textContent = lang.toUpperCase();

    if (window.renderCalendar) renderCalendar();
    if (window.updateStreakUI) updateStreakUI();
}

document.addEventListener("DOMContentLoaded", () => {
    setLanguage(currentLang);
});

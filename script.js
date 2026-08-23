/* ==========================================================================
   PRAGUE QUANT CLUB — SCRIPT
   --------------------------------------------------------------------------
   1. EVENTS — edit this array to update the calendar. Nothing else needed.
   2. Language switcher (CS default in HTML, EN dictionary below)
   3. Calendar rendering (upcoming events only, language-aware)
   4. Mobile hamburger menu
   5. Reveal-on-scroll (IntersectionObserver)
   6. Footer year
   ========================================================================== */

"use strict";

/* ==========================================================================
   0. PŘIJÍMACÍ ŘÍZENÍ — EDIT HERE
   Datum začátku náboru. Modál pod tlačítkem „Přidej se k nám" se podle
   dnešního data sám přepne mezi „zatím nenabíráme" a „nábor běží".
   ========================================================================== */
const ADMISSIONS_OPEN = new Date("2026-10-18T00:00:00+02:00");

/* Odkaz na přihlašovací formulář (Google Form). Nechte prázdné, dokud
   formulář neexistuje — tlačítko se v modálu objeví až po doplnění URL. */
const ADMISSIONS_FORM_URL = "";


/* ==========================================================================
   1. EVENTS — EDIT HERE
   date must be "YYYY-MM-DD". Only future events (including today) are shown;
   past events are simply hidden.
   Optional: add titleEn / locationEn / descriptionEn for the English version.
   ========================================================================== */
var EVENTS = [
  // SEM PŘIDÁVEJTE AKCE — jeden řádek na akci, v libovolném pořadí. Příklad:
  //
  // { date: "2026-09-15", title: "Uvítací večer", titleEn: "Welcome night",
  //   location: "VŠE, místnost NB 350", description: "Zahájení nového semestru." },
  //
];

/* Zobrazí se, pokud v seznamu nejsou žádné budoucí akce */
var EMPTY_UPCOMING_MESSAGE = {
  cs: 'Momentálně nejsou naplánované žádné akce. Sledujte náš ' +
      '<a href="https://instagram.com/praguequantclub" target="_blank" rel="noopener">Instagram</a>' +
      ', kde vše oznamujeme.',
  en: 'No events are scheduled right now. Follow our ' +
      '<a href="https://instagram.com/praguequantclub" target="_blank" rel="noopener">Instagram</a>' +
      ' where we announce everything.'
};


/* ==========================================================================
   2. LANGUAGE SWITCHER
   Czech lives in the HTML (source of truth). The dictionary below holds the
   English strings, keyed by the data-i18n attribute. Values may contain HTML.
   ========================================================================== */
var I18N_EN = {
  "skip": "Skip to content",

  "nav.about": "About",
  "nav.partners": "Partners",
  "nav.calendar": "Calendar",
  "nav.contact": "Contact",

  "hero.tagline": "Where mathematics meets the markets.",
  "hero.ctaJoin": "Join us",
  "hero.ctaEvents": "Upcoming events",

  "about.eyebrow": "About",
  "about.heading": "A community of people passionate about quantitative finance.",
  "about.lede":
    "Prague Quant Club brings together students curious about how mathematics, " +
    "statistics and programming shape modern financial markets. We meet in " +
    "Prague throughout the academic year.",

  "stats.members": "Members",
  "stats.partners": "Partner firms",

  "modal.heading": "Admissions",

  "card1.h": "Goal",
  "card1.p":
    "We create an environment for educating students in the field of " +
    "quantitative finance. Our goal is to prepare everyone with interest " +
    "and drive for work in the industry. We supplement standard " +
    "coursework with the skills that trading firms and funds truly " +
    "require.",
  "card2.h": "Events",
  "card2.p":
    "We organize seminars in statistics, linear algebra, probability and " +
    "programming, the fields quantitative finance is built on. In " +
    "addition, talks and meetings with representatives of quant firms, " +
    "interview preparation, and friendly poker nights.",
  "card3.h": "Format",
  "card3.p":
    "During the semester we meet roughly once every two weeks. Members " +
    "who meet the attendance requirement and submit the required number " +
    "of assigned problem sets receive a certificate of participation at " +
    "the end.",
  "card4.h": "Team",
  "card4.p":
    "The club is run by students of mathematics, statistics and " +
    "economics from Charles University. Membership is not tied to a " +
    "single faculty or school, it is open to anyone with interest and " +
    "enthusiasm for the field of quantitative finance.",

  "partners.label2": "// events with",
  "partners.tba": "to be announced",

  "calendar.eyebrow": "Calendar",
  "calendar.heading": "Upcoming events.",
  "calendar.tba": "to be announced",

  "contact.eyebrow": "Contact",
  "contact.heading": "Get in touch.",
  "contact.location.label": "Where to find us",
  "contact.location.line1": "Institute of Economic Studies FSV UK",

  "footer.legal": "The club is a student initiative and acts independently of the university."
};

var currentLang = "cs";

(function languageSwitcher() {
  var btn = document.getElementById("lang-toggle");
  var nodes = document.querySelectorAll("[data-i18n]");

  // Remember the Czech originals so we can switch back without a reload.
  nodes.forEach(function (el) {
    el.setAttribute("data-cs-html", el.innerHTML);
  });

  function applyLang(lang) {
    currentLang = lang;
    document.documentElement.setAttribute("lang", lang);

    nodes.forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (lang === "en" && I18N_EN[key]) {
        el.innerHTML = I18N_EN[key];
      } else {
        el.innerHTML = el.getAttribute("data-cs-html");
      }
    });

    if (btn) {
      // The button shows the language you would switch TO.
      btn.textContent = lang === "cs" ? "EN" : "CS";
      btn.setAttribute("aria-label", lang === "cs" ? "Switch to English" : "Přepnout do češtiny");
    }

    renderCalendar(lang);

    try { localStorage.setItem("pqc-lang", lang); } catch (e) { /* private mode etc. */ }
  }

  if (btn) {
    btn.addEventListener("click", function () {
      applyLang(currentLang === "cs" ? "en" : "cs");
    });
  }

  // Restore saved choice (default: Czech).
  var saved = null;
  try { saved = localStorage.getItem("pqc-lang"); } catch (e) { /* ignore */ }
  applyLang(saved === "en" ? "en" : "cs");
})();


/* ==========================================================================
   3. CALENDAR RENDERING — upcoming only, language-aware
   ========================================================================== */
function renderCalendar(lang) {
  var upcomingEl = document.getElementById("upcoming-events");
  if (!upcomingEl) return;

  // "Today" at midnight so events happening today still count as upcoming.
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  var MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                   "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function parseDate(str) {
    var p = str.split("-");
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }

  // cs: "15. 9. 2026" | en: "15 Sep 2026"
  function formatDate(d) {
    if (lang === "en") {
      return d.getDate() + " " + MONTHS_EN[d.getMonth()] + " " + d.getFullYear();
    }
    return d.getDate() + ". " + (d.getMonth() + 1) + ". " + d.getFullYear();
  }

  function escapeHtml(s) {
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  // Prefer the English field when in EN and it exists.
  function pick(ev, field) {
    if (lang === "en" && ev[field + "En"]) return ev[field + "En"];
    return ev[field] || "";
  }

  function eventRow(ev) {
    var d = parseDate(ev.date);
    return (
      '<div class="event-row">' +
        '<span class="event-date">' + formatDate(d) + "</span>" +
        '<span class="event-title" title="' + escapeHtml(pick(ev, "description")) + '">' +
          escapeHtml(pick(ev, "title")) +
        "</span>" +
        '<span class="event-location">' + escapeHtml(pick(ev, "location")) + "</span>" +
      "</div>"
    );
  }

  var upcoming = EVENTS.filter(function (ev) {
    return parseDate(ev.date) >= today;
  });

  upcoming.sort(function (a, b) { return parseDate(a.date) - parseDate(b.date); });

  if (upcoming.length === 0) {
    upcomingEl.innerHTML = '<p class="event-empty">' + EMPTY_UPCOMING_MESSAGE[lang] + "</p>";
  } else {
    upcomingEl.innerHTML = upcoming.map(eventRow).join("");
  }
}


/* ==========================================================================
   4. MOBILE HAMBURGER MENU
   ========================================================================== */
(function mobileNav() {
  var header = document.getElementById("site-header");
  var toggle = document.getElementById("nav-toggle");
  var menu = document.getElementById("nav-menu");
  if (!header || !toggle || !menu) return;

  toggle.addEventListener("click", function () {
    var open = header.classList.toggle("menu-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Zavřít menu" : "Otevřít menu");
  });

  // Close the menu after tapping a link
  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      header.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Otevřít menu");
    });
  });
})();


/* ==========================================================================
   5. REVEAL-ON-SCROLL — subtle fade-and-rise via IntersectionObserver
   ========================================================================== */
(function revealOnScroll() {
  var items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    // Old browser: just show everything.
    items.forEach(function (el) { el.classList.add("visible"); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target); // animate once, then leave it alone
      }
    });
  }, { threshold: 0.12 });

  items.forEach(function (el) { observer.observe(el); });
})();


/* ==========================================================================
   6. FOOTER YEAR
   ========================================================================== */
(function footerYear() {
  var el = document.getElementById("footer-year");
  if (el) el.textContent = String(new Date().getFullYear());
})();


/* ==========================================================================
   7. JOIN MODAL — „Přidej se k nám"
   Opens a dialog; content depends on today's date vs ADMISSIONS_OPEN.
   Closes on X, backdrop click and Escape. Focus moves into the dialog on
   open and returns to the triggering button on close.
   ========================================================================== */
(function joinModal() {
  var backdrop = document.getElementById("join-modal");
  var closeBtn = document.getElementById("join-modal-close");
  var textEl = document.getElementById("join-modal-text");
  var actionsEl = document.getElementById("join-modal-actions");
  var triggers = document.querySelectorAll("[data-join-cta]");
  var panel = backdrop ? backdrop.querySelector(".modal") : null;
  if (!backdrop || !panel || !closeBtn || !textEl || !actionsEl) return;

  var lastFocused = null;

  // "18.10.2026" — rendered from ADMISSIONS_OPEN, single source of truth.
  function formatOpenDate() {
    var d = ADMISSIONS_OPEN;
    var dd = String(d.getDate()).padStart(2, "0");
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    return dd + "." + mm + "." + d.getFullYear();
  }

  function renderContent() {
    var isOpen = new Date() >= ADMISSIONS_OPEN;
    var en = currentLang === "en";

    if (isOpen) {
      textEl.textContent = en
        ? "Admissions are open."
        : "Přijímací řízení je otevřené.";
      if (ADMISSIONS_FORM_URL) {
        var link = document.createElement("a");
        link.className = "btn btn-filled";
        link.href = ADMISSIONS_FORM_URL;
        link.target = "_blank";
        link.rel = "noopener";
        link.textContent = en ? "Application form" : "Přihlašovací formulář";
        actionsEl.innerHTML = "";
        actionsEl.appendChild(link);
      } else {
        actionsEl.innerHTML = "";
      }
    } else {
      textEl.textContent = en
        ? "We're not recruiting members yet. Admissions open " + formatOpenDate() + "."
        : "Zatím nenabíráme nové členy. Přijímací řízení začíná " + formatOpenDate() + ".";
      actionsEl.innerHTML = "";
    }

    closeBtn.setAttribute("aria-label", en ? "Close" : "Zavřít");
  }

  function onKeydown(e) {
    if (e.key === "Escape") closeModal();
  }

  function openModal() {
    lastFocused = document.activeElement;
    renderContent();
    backdrop.hidden = false;
    panel.focus();
    document.addEventListener("keydown", onKeydown);
  }

  function closeModal() {
    backdrop.hidden = true;
    document.removeEventListener("keydown", onKeydown);
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    lastFocused = null;
  }

  triggers.forEach(function (btn) {
    btn.addEventListener("click", openModal);
  });

  closeBtn.addEventListener("click", closeModal);

  // Click on the dark backdrop (not the panel) closes the dialog.
  backdrop.addEventListener("click", function (e) {
    if (e.target === backdrop) closeModal();
  });
})();

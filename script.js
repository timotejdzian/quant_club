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

/* Application terminal (Přihlášky): web-app URL of the Google Apps
   Script in apps-script/Code.gs (ends with /exec). While this is empty the
   terminal is hidden on the site; add ?terminal to the URL to try it in demo
   mode, where nothing is sent. */
const APPLY_ENDPOINT = "https://script.google.com/macros/s/AKfycby284eOSocbIgx-yx1cnH98qcY8C4CYauXb8V85etaqTb7m7uvmTqKSr_tyCk5UEQ/exec";


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
  { date: "2026-11-26", title: "Wincent workshop",
    location: "IES FSV UK, místnost 314", locationEn: "IES FSV UK, room 314" },
];

/* Zobrazí se pod seznamem akcí, pokud nějaké jsou */
var MORE_EVENTS_MESSAGE = {
  cs: "Další akce oznámíme později.",
  en: "More events will be announced later."
};

/* Zobrazí se, pokud v seznamu nejsou žádné budoucí akce */
var EMPTY_UPCOMING_MESSAGE = {
  cs: 'Nejbližší termíny oznamujeme na ' +
      '<a href="https://instagram.com/praguequantclub" target="_blank" rel="noopener">Instagramu</a>.',
  en: 'We announce upcoming dates on ' +
      '<a href="https://instagram.com/praguequantclub" target="_blank" rel="noopener">Instagram</a>.'
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
  "nav.applications": "Applications",

  "hero.tagline": "Where mathematics meets the markets.",
  "hero.ctaJoin": "Join us",
  "hero.ctaEvents": "Upcoming events",
  "hero.nov17quote": "“Who, if not us? When, if not now?”",
  "hero.nov17": "Students, November 1989 · International Students' Day",
  "hero.xmas": "Merry Christmas",
  "hero.newyear": "Happy New Year!",

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

  "footer.legal": "The club is a student initiative and acts independently of the university.",

  "applications.eyebrow": "Applications",
  "applications.heading": "Applications",
  "applications.lede": "We accept applications on a rolling basis throughout the whole semester. Fill in your application right here in the terminal and upload your CV.",
  "applications.formLabel": "Submit your application via the form:",
  "applications.formButton": "Fill in the application",
  "applications.checklistHeading": "What to prepare",
  "applications.checklistIntro": "You will upload your CV as a PDF in the form. Include:",
  "applications.checklist1": "University, programme and year",
  "applications.checklist2": "Grade average",
  "applications.checklist3": "Experience: jobs, internships, projects",
  "applications.checklist4": "Research and publications, if you have any",
  "applications.checklist5": "Competitions and olympiads",
  "applications.checklist6": "Interests",
  "applications.format": "We <strong>HIGHLY recommend</strong> using the <a href=\"https://www.overleaf.com/latex/templates/jakes-resume/syzfjbzwjncs\" target=\"_blank\" rel=\"noopener\" data-i18n=\"applications.formatLink\">Jake's Resume</a> template.",
  "applications.formatLink": "Jake's Resume",
  "applications.toggle": "How does the selection process work?",
  "applications.step1Heading": "Step 1 — Application and CV",
  "applications.step1Text": "Fill in the application form and upload your CV as a PDF. Beyond your studies we care about what you do outside them: projects, competitions, research, interests. One page is enough.",
  "applications.step2Heading": "Step 2 — Test",
  "applications.step2Text": "A written test in Czech. We will let you know the date and location after you apply. Covers four areas: algebra and basic calculus, probability and statistics, brain teasers, and structured thinking. It is not about memorised knowledge, it is about how you reason.",
  "applications.step3Heading": "Step 3 — Interview",
  "applications.step3Text": "A short in-person conversation. We want to get to know you and work through one open-ended problem to see how you structure your approach."
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

    // Handle aria-label translations
    var ariaNodes = document.querySelectorAll("[data-i18n-aria]");
    ariaNodes.forEach(function (el) {
      var key = el.getAttribute("data-i18n-aria");
      if (lang === "en" && I18N_EN[key]) {
        el.setAttribute("aria-label", I18N_EN[key]);
      } else if (el.hasAttribute("data-cs-aria")) {
        el.setAttribute("aria-label", el.getAttribute("data-cs-aria"));
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
    upcomingEl.innerHTML = upcoming.map(eventRow).join("") +
      '<p class="event-empty">' + MORE_EVENTS_MESSAGE[lang] + "</p>";
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
   4.5 REVEAL-ON-SCROLL — subtle fade-and-rise via IntersectionObserver
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
   5. STATISTICS COUNTER ANIMATION
   ========================================================================== */
(function statsCounter() {
  var statNumbers = document.querySelectorAll(".stat-number");
  if (!statNumbers.length) return;

  function animateCounter(el, target, duration) {
    var start = 0;
    var startTime = null;

    function step(currentTime) {
      if (!startTime) startTime = currentTime;
      var progress = Math.min((currentTime - startTime) / duration, 1);
      var current = Math.floor(progress * target);
      el.textContent = String(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = String(target);
      }
    }

    requestAnimationFrame(step);
  }

  if (!("IntersectionObserver" in window)) {
    // Old browser: just show final numbers
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        var targetValue = parseInt(el.textContent, 10);
        if (!isNaN(targetValue)) {
          el.textContent = "0";
          // Faster duration: 100ms per unit (e.g., 6 = 600ms, 2 = 200ms)
          var duration = targetValue * 100;
          animateCounter(el, targetValue, duration);
        }
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(function (el) { observer.observe(el); });
})();


/* ==========================================================================
   5.5 FOOTER YEAR
   ========================================================================== */
(function footerYear() {
  var el = document.getElementById("footer-year");
  if (el) el.textContent = String(new Date().getFullYear());
})();


/* ==========================================================================
   6. JOIN MODAL — „Přidej se k nám"
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


/* ==========================================================================
   7. APPLICATIONS — PROCESS PANEL TOGGLE
   Toggles the process panel visibility. Responds to Enter and Space.
   Respects prefers-reduced-motion on the expand animation.
   Opens automatically if location.hash is "#prijimaci-rizeni" on load.
   ========================================================================== */
(function processToggle() {
  var toggle = document.getElementById("process-toggle");
  var panel = document.getElementById("process-panel");
  if (!toggle || !panel) return;

  function openPanel() {
    panel.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
  }

  function closePanel() {
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
  }

  function togglePanel() {
    if (panel.hidden) {
      openPanel();
    } else {
      closePanel();
    }
  }

  toggle.addEventListener("click", togglePanel);

  // Handle keyboard events (Enter and Space)
  toggle.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      togglePanel();
    }
  });

  // Open panel if hash is #prijimaci-rizeni on load
  if (window.location.hash === "#prijimaci-rizeni") {
    openPanel();
    // Scroll to the section
    var section = document.getElementById("prihlasky");
    if (section) {
      setTimeout(function () {
        section.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }
})();

/* ==========================================================================
   Christmas mode — on automatically from 1 Dec to 26 Dec, or with ?xmas in
   the URL to preview. Adds a neon LED string under the nav; the hero lights
   (below) switch to Christmas colours and add pixel snow.
   ========================================================================== */
(function () {
  var now = new Date(), m = now.getMonth(), d = now.getDate();
  // New Year (31 Dec + 1 Jan, or ?newyear to preview): greeting swaps to
  // "Happy New Year" and the hero gets fireworks (further below).
  var ny = /[?&]newyear\b/.test(location.search) || (m === 11 && d === 31) || (m === 0 && d === 1);
  var on = ny || /[?&]xmas\b/.test(location.search) || (m === 11 && d <= 26);
  var header = document.getElementById("site-header");
  if (!on || !header) return;
  document.documentElement.classList.add("xmas");
  if (ny) document.documentElement.classList.add("newyear");

  var string = document.createElement("div");
  string.className = "xmas-lights";
  string.setAttribute("aria-hidden", "true");
  var n = Math.ceil(Math.max(window.innerWidth, screen.width) / 34);
  for (var i = 0; i < n; i++) string.appendChild(document.createElement("span"));
  header.appendChild(string);
})();

/* ==========================================================================
   Hero background — one style per visit, stored on <html data-hero>:
   always "lights" (the grid tiles; Christmas mode recolours them and adds snow).
   Preview the others with ?hero=montecarlo|candles.
   ========================================================================== */
(function () {
  var STYLES = ["lights"];   // the original grid with travelling lights; "montecarlo" / "candles" also exist
  var forced = (location.search.match(/[?&]hero=(lights|candles|montecarlo)\b/) || [])[1];
  document.documentElement.dataset.hero = forced || STYLES[Math.floor(Math.random() * STYLES.length)];
})();

/* ==========================================================================
   Hero grid — dots of light travelling along the grid lines.
   Each dot runs along a line, sometimes turns at an intersection, leaves a
   short trail and lights up the grid lines around it. Canvas sits on top of
   the static CSS grid; reduced-motion users just get the static grid.
   ========================================================================== */
(function () {
  var hero = document.getElementById("hero");
  var wrap = hero && hero.querySelector(".hero-grid");
  // Runs for the "lights" hero, and in Christmas mode on any hero (snow only).
  var XMAS = document.documentElement.classList.contains("xmas");
  var LIGHTS = document.documentElement.dataset.hero === "lights";
  if (!wrap || !(LIGHTS || XMAS) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var CELL = 56;         // must match background-size in .hero-grid
  var COUNT = 7;          // dots on screen
  var SPEED = 110;        // px per second
  var GLOW = 120;         // radius of the lit area around a dot
  var TRAIL = 22;         // trail length in samples

  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  if (!ctx) return;
  wrap.appendChild(canvas);

  var w = 0, h = 0, dpr = 1, dots = [], last = 0, raf = 0, visible = true;
  var DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  // Colours as [base, highlight] "r, g, b". Christmas mode swaps indigo for
  // red / green / gold / ice and adds pixel snow.
  var COLORS = XMAS
    ? [["230, 40, 70", "255, 120, 140"], ["30, 200, 110", "120, 255, 170"],
       ["240, 180, 40", "255, 220, 130"], ["60, 190, 255", "160, 230, 255"]]
    : [["91, 91, 240", "150, 150, 255"]];
  var flakes = [];
  if (XMAS) COUNT = 9;
  if (!LIGHTS) COUNT = 0;   // another hero style is showing: snow only, no dots

  function rand(n) { return Math.floor(Math.random() * n); }

  function spawn(d) {
    d = d || {};
    d.x = rand(Math.floor(w / CELL) + 1) * CELL;
    d.y = rand(Math.floor(h / CELL) + 1) * CELL;
    var dir = DIRS[rand(4)];
    d.dx = dir[0]; d.dy = dir[1];
    d.life = 0;
    d.maxLife = 5 + Math.random() * 6;   // seconds
    d.speed = SPEED * (0.7 + Math.random() * 0.6);
    d.trail = [];
    d.toNext = CELL;                     // px left to the next intersection
    var col = COLORS[rand(COLORS.length)];
    d.c = col[0]; d.h = col[1];
    return d;
  }

  function flake(f, top) {
    f = f || {};
    f.x = Math.random() * w;
    f.y = top ? -4 : Math.random() * h;
    f.size = Math.random() < 0.25 ? 3 : 2;           // square "pixels"
    f.speed = 14 + Math.random() * 26;
    f.phase = Math.random() * 6.28;
    f.a = 0.25 + Math.random() * 0.5;
    return f;
  }

  function snow(dt, now) {
    for (var i = 0; i < flakes.length; i++) {
      var f = flakes[i];
      f.y += f.speed * dt;
      if (f.y > h + 4) flake(f, true);
      var x = f.x + Math.sin(now / 1400 + f.phase) * 12;
      ctx.fillStyle = "rgba(225, 238, 255, " + f.a + ")";
      ctx.fillRect(Math.round(x), Math.round(f.y), f.size, f.size);
    }
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = wrap.clientWidth; h = wrap.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!dots.length) for (var i = 0; i < COUNT; i++) dots.push(spawn());
    if (XMAS && !flakes.length) for (var j = 0; j < Math.round(w * h / 9000); j++) flakes.push(flake());
  }

  function step(d, dt) {
    var move = d.speed * dt;
    while (move > 0) {
      var m = Math.min(move, d.toNext);
      d.x += d.dx * m; d.y += d.dy * m;
      d.toNext -= m; move -= m;
      if (d.toNext <= 0) {
        // At an intersection: snap, maybe turn 90°.
        d.x = Math.round(d.x / CELL) * CELL; d.y = Math.round(d.y / CELL) * CELL;
        if (Math.random() < 0.3) {
          var s = Math.random() < 0.5 ? 1 : -1, t = d.dx;
          d.dx = -d.dy * s; d.dy = t * s;
        }
        d.toNext = CELL;
      }
    }
    d.trail.push([d.x, d.y]);
    if (d.trail.length > TRAIL) d.trail.shift();
    d.life += dt;
    var off = d.x < -CELL || d.y < -CELL || d.x > w + CELL || d.y > h + CELL;
    if (d.life > d.maxLife || off) spawn(d);
  }

  // Fade in at birth, fade out before respawn.
  function alpha(d) {
    return Math.min(1, d.life / 0.8, (d.maxLife - d.life) / 0.8);
  }

  // Grid lines inside the dot's glow radius, lit with a radial gradient.
  function litLines(d, a) {
    var x0 = Math.floor((d.x - GLOW) / CELL) * CELL, x1 = d.x + GLOW;
    var y0 = Math.floor((d.y - GLOW) / CELL) * CELL, y1 = d.y + GLOW;
    var g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, GLOW);
    g.addColorStop(0, "rgba(" + d.h + ", " + 0.45 * a + ")");
    g.addColorStop(1, "rgba(" + d.c + ", 0)");
    ctx.strokeStyle = g;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var x = x0; x <= x1; x += CELL) { ctx.moveTo(x + 0.5, y0); ctx.lineTo(x + 0.5, y1); }
    for (var y = y0; y <= y1; y += CELL) { ctx.moveTo(x0, y + 0.5); ctx.lineTo(x1, y + 0.5); }
    ctx.stroke();

    // Soft wash on the area itself.
    var f = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, GLOW * 0.8);
    f.addColorStop(0, "rgba(" + d.c + ", " + 0.08 * a + ")");
    f.addColorStop(1, "rgba(" + d.c + ", 0)");
    ctx.fillStyle = f;
    ctx.fillRect(d.x - GLOW, d.y - GLOW, GLOW * 2, GLOW * 2);
  }

  function trail(d, a) {
    var t = d.trail;
    ctx.lineCap = "round";
    for (var i = 1; i < t.length; i++) {
      var k = i / t.length;
      ctx.strokeStyle = "rgba(" + d.h + ", " + 0.7 * k * a + ")";
      ctx.lineWidth = 1 + k;
      ctx.beginPath();
      ctx.moveTo(t[i - 1][0] + 0.5, t[i - 1][1] + 0.5);
      ctx.lineTo(t[i][0] + 0.5, t[i][1] + 0.5);
      ctx.stroke();
    }
    // Head: bright core + small halo.
    var hgl = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, 10);
    hgl.addColorStop(0, "rgba(255, 255, 255, " + 0.95 * a + ")");
    hgl.addColorStop(0.3, "rgba(" + d.h + ", " + 0.6 * a + ")");
    hgl.addColorStop(1, "rgba(" + d.c + ", 0)");
    ctx.fillStyle = hgl;
    ctx.fillRect(d.x - 10, d.y - 10, 20, 20);
  }

  function frame(now) {
    var dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
    last = now;
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";   // overlapping glows add up
    for (var i = 0; i < dots.length; i++) {
      var d = dots[i];
      step(d, dt);
      var a = alpha(d);
      litLines(d, a);
      trail(d, a);
    }
    ctx.globalCompositeOperation = "source-over";
    if (XMAS) snow(dt, now);
    raf = visible ? requestAnimationFrame(frame) : 0;
  }

  // Stop animating while the hero is scrolled out of view.
  new IntersectionObserver(function (entries) {
    visible = entries[0].isIntersecting;
    if (visible && !raf) { last = 0; raf = requestAnimationFrame(frame); }
  }).observe(hero);

  window.addEventListener("resize", resize);
  resize();
})();

/* Hero style "candles" — live BTC/USDT 1-second candles behind the title.
   Data: Binance public market-data API (REST for history, WebSocket for live),
   no key needed. If it can't be reached, simulated candles are shown instead.
   Monochrome. Hover: terminal-style crosshair, price label, OHLC readout. */
(function () {
  if (document.documentElement.dataset.hero !== "candles") return;
  var hero = document.getElementById("hero");
  var wrap = hero && hero.querySelector(".hero-grid");
  if (!wrap) return;
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var STEP = 14, BODY = 8, SPEED = 16;   // px per candle, body width (thinner on phones, see resize), px/s simulated
  var REST = "https://data-api.binance.vision/api/v3/klines?symbol=BTCUSDT&interval=1s&limit=";
  var STREAM = "wss://data-stream.binance.vision/ws/btcusdt@kline_1s";
  var INK = "233, 235, 241";
  var FONT = "11px 'Instrument Sans', 'Segoe UI', sans-serif";

  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  wrap.appendChild(canvas);

  var w = 0, h = 0, dpr = 1, candles = [], offset = 0, last = 0;
  var lo = 0, hi = 1, mouse = null, price = 100, live = false;

  // The chart fills the left 86% of the hero; price labels sit to its right.
  function slots() { return Math.ceil(w * 0.86 / STEP); }
  function labelX() { return Math.round(w * 0.86) + 10; }

  function next() {
    var o = price, c = o * (1 + (Math.random() - 0.495) * 0.03);
    var hgh = Math.max(o, c) * (1 + Math.random() * 0.01);
    var low = Math.min(o, c) * (1 - Math.random() * 0.01);
    price = c;
    return { o: o, h: hgh, l: low, c: c };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = wrap.clientWidth; h = wrap.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    STEP = w < 600 ? 8 : 14; BODY = w < 600 ? 4 : 8;
    if (!live) while (candles.length < slots() + 1) candles.push(next());
    range(1);
  }

  // Candle length in ms. Binance sends 1 s klines; a larger BUCKET merges them.
  // The same 1 s kline arrives repeatedly (it updates within its second) — harmless.
  var BUCKET = 1000;
  function add(t, o, hgh, l, c) {
    var bt = Math.floor(t / BUCKET) * BUCKET, lastC = candles[candles.length - 1];
    if (lastC && lastC.t === bt) {
      lastC.h = Math.max(lastC.h, +hgh); lastC.l = Math.min(lastC.l, +l); lastC.c = +c;
    } else if (!lastC || bt > lastC.t) {        // new candle: shift left smoothly
      candles.push({ t: bt, o: +o, h: +hgh, l: +l, c: +c });
      while (candles.length > slots()) { candles.shift(); offset -= STEP; }
      offset = Math.max(offset, -STEP * 3);
    }
  }

  function loadLive() {
    fetch(REST + Math.min(1000, slots() * BUCKET / 1000))
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (rows) {
        if (!rows.length) return;
        candles = [];
        rows.forEach(function (k) { add(k[0], k[1], k[2], k[3], k[4]); });
        live = true; offset = 0; range(1);
        still ? draw() : connect();
      })
      .catch(function () { /* keep the simulated candles */ });
  }

  function connect() {
    var ws = new WebSocket(STREAM);
    ws.onmessage = function (e) {
      var k = JSON.parse(e.data).k;
      add(k.t, k.o, k.h, k.l, k.c);
    };
    ws.onclose = function () { setTimeout(connect, 5000); };
  }

  // Ease the price scale towards the visible min/max so it never jumps.
  function range(k) {
    var a = Infinity, b = -Infinity;
    candles.forEach(function (c) { a = Math.min(a, c.l); b = Math.max(b, c.h); });
    lo += (a - lo) * k; hi += (b - hi) * k;
  }
  function y(p) { return h * 0.78 - (p - lo) / (hi - lo || 1) * h * 0.5; }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1;
    var hover = mouse ? Math.floor((mouse.x + offset) / STEP) : -1;

    // Moving average.
    ctx.beginPath();
    var sum = 0;
    candles.forEach(function (c, i) {
      sum += c.c; if (i >= 10) sum -= candles[i - 10].c;
      var x = i * STEP - offset + STEP / 2, m = sum / Math.min(i + 1, 10);
      i ? ctx.lineTo(x, y(m)) : ctx.moveTo(x, y(m));
    });
    ctx.strokeStyle = "rgba(" + INK + ", 0.22)";
    ctx.stroke();

    candles.forEach(function (c, i) {
      var x = Math.round(i * STEP - offset) + 0.5, a = i === hover ? 0.75 : 0.2;
      ctx.strokeStyle = ctx.fillStyle = "rgba(" + INK + ", " + a + ")";
      ctx.beginPath();
      ctx.moveTo(x + BODY / 2, y(c.h)); ctx.lineTo(x + BODY / 2, y(c.l));
      ctx.stroke();
      var top = y(Math.max(c.o, c.c)), hgt = Math.max(1, y(Math.min(c.o, c.c)) - top);
      if (c.c >= c.o) ctx.strokeRect(x, top, BODY, hgt);   // up: hollow
      else ctx.fillRect(x, top, BODY, hgt);                // down: filled
    });

    // Last price line + label.
    var lastC = candles[candles.length - 1], ly = Math.round(y(lastC.c)) + 0.5;
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = "rgba(" + INK + ", 0.25)";
    ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(w, ly); ctx.stroke();
    ctx.font = FONT; ctx.textBaseline = "middle";
    label(lastC.c.toFixed(2), labelX(), ly, 0.5);
    if (live) {
      ctx.fillStyle = "rgba(" + INK + ", 0.45)";
      var tag = "BTC/USDT · " + BUCKET / 1000 + "s · live";
      ctx.fillText(tag, Math.min(labelX() - 6, w - ctx.measureText(tag).width - 8), ly - 22);
    }

    if (mouse) {
      var mx = Math.round(mouse.x) + 0.5, my = Math.round(mouse.y) + 0.5;
      ctx.strokeStyle = "rgba(" + INK + ", 0.35)";
      ctx.beginPath();
      ctx.moveTo(mx, 0); ctx.lineTo(mx, h); ctx.moveTo(0, my); ctx.lineTo(w, my);
      ctx.stroke();
      var p = lo + (h * 0.78 - mouse.y) / (h * 0.5) * (hi - lo);
      label(p.toFixed(2), labelX(), my, 0.9);
      var c = candles[hover];
      if (c) {
        ctx.fillStyle = "rgba(" + INK + ", 0.8)";
        ctx.fillText((c.t ? new Date(c.t).toLocaleTimeString("cs-CZ") + "  " : "") +
                     "O " + c.o.toFixed(2) + "  H " + c.h.toFixed(2) +
                     "  L " + c.l.toFixed(2) + "  C " + c.c.toFixed(2), mx + 10, my - 14);
      }
    }
    ctx.setLineDash([]);
  }

  function label(text, x, yy, a) {
    var bw = Math.ceil(ctx.measureText(text).width) + 12;
    x = Math.min(x, w - bw);   // stay on screen on narrow phones
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(7, 8, 12, 0.9)";
    ctx.fillRect(x - 6, yy - 9, bw, 18);
    ctx.strokeStyle = "rgba(" + INK + ", " + a * 0.5 + ")";
    ctx.strokeRect(x - 5.5, yy - 8.5, bw - 1, 17);
    ctx.fillStyle = "rgba(" + INK + ", " + a + ")";
    ctx.fillText(text, x, yy);
    ctx.setLineDash([3, 4]);
  }

  var onScreen = true;   // skip work while the hero is scrolled away
  new IntersectionObserver(function (e) { onScreen = e[0].isIntersecting; }).observe(hero);

  function frame(now) {
    if (!onScreen) { last = 0; requestAnimationFrame(frame); return; }
    var dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
    last = now;
    if (live) offset += (0 - offset) * Math.min(1, dt * 8);   // ease into the new candle
    else {
      offset += SPEED * dt;
      while (offset >= STEP) { offset -= STEP; candles.shift(); candles.push(next()); }
    }
    range(0.12);
    draw();
    requestAnimationFrame(frame);
  }

  hero.addEventListener("pointermove", function (e) {
    var r = wrap.getBoundingClientRect();
    mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
    if (still) draw();
  });
  hero.addEventListener("pointerleave", function () { mouse = null; if (still) draw(); });
  window.addEventListener("resize", resize);
  resize();
  still ? draw() : requestAnimationFrame(frame);
  loadLive();
})();

/* Hero style "montecarlo" — Monte Carlo price paths.
   Price history as glowing candles on the left, a "now" marker, then random
   walks fanning out to the right; where they end builds a dotted histogram under the expected bell curve (dashed). Mouse x = volatility σ,
   mouse y = drift μ. Monochrome. */
/* box = element the canvas fills, pointerEl = element that listens for the
   mouse, before = optional child of box to insert the canvas in front of. */
function monteCarlo(box, pointerEl, before) {
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Layout, left to right: price history as glowing candles -> bright "now"
  // marker -> fan of simulated future paths -> dotted histogram of where they end.
  var STEP = 6, GROW = 190, LIFE = 9, EVERY = 0.07, MAX = 260, BIN = 9;   // GROW = px/s a path draws at
  var INK = "233, 235, 241", LAV = "200, 188, 255", VIOLET = "118, 78, 255";
  var FONT = "11px 'Instrument Sans', 'Segoe UI', sans-serif";
  var XMAS_DOTS = document.documentElement.classList.contains("xmas") &&
    ["255, 60, 90", "50, 230, 130", "255, 200, 60", "60, 200, 255"];   // red, green, gold, ice

  var canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";
  var ctx = canvas.getContext("2d");
  box.insertBefore(canvas, before || null);

  var w = 0, h = 0, dpr = 1, paths = [], bins = [], candles = [], stars = [], last = 0, clock = 0, timer = 0;
  var sigma = 0.25, mu = 0.05, target = { s: 0.25, m: 0.05 }, mouse = null;
  var x0, y0, x1, span, cw;

  function gauss() {
    return Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(6.2832 * Math.random());
  }

  function resize() {
    if (box.clientWidth === w && box.clientHeight === h) return;   // phone URL bar show/hide
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = box.clientWidth; h = box.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var phone = w < 700;                       // phones: the whole chart sits below the buttons
    x0 = w * (phone ? 0.24 : 0.3); x1 = w * (phone ? 0.87 : 0.9);   // the fan gets the space between x0 and x1
    // Desktop: the short history ends just left of the title; the fan runs behind it to the right.
    var title = !phone && box.querySelector(".hero-title");
    if (title) x0 = Math.max(w * 0.16, title.getBoundingClientRect().left - box.getBoundingClientRect().left - 40);
    y0 = h * (phone ? 0.83 : 0.46); span = h * (phone ? 0.2 : 0.38);
    bins = new Array(Math.ceil(h / BIN)).fill(0);
    paths = [];

    // Price history: walked backwards from the "now" point, so the last close lands on it.
    cw = phone ? 7 : 11;
    candles = [];
    var c = y0, lim = h * (phone ? 0.07 : 0.16);
    for (var x = x0 - cw; x > -cw; x -= cw) {
      var o = c + gauss() * h * (phone ? 0.012 : 0.02) + h * 0.0015;   // earlier prices sit a little lower
      o = Math.max(y0 - lim, Math.min(y0 + lim * 1.3, o));
      candles.push({ x: x, o: o, c: c,
                     hi: Math.min(o, c) - Math.random() * h * 0.016,
                     lo: Math.max(o, c) + Math.random() * h * 0.016 });
      c = o;
    }
    stars = [];
    for (var s = 0; s < Math.round(w * h / 22000); s++) {
      stars.push([Math.random() * w, Math.random() * h, Math.random() * 6.28]);
    }
  }

  function spawn() {
    var n = Math.ceil((x1 - x0) / STEP), y = y0, pts = [y];
    var sd = sigma * span / Math.sqrt(n), drift = -mu * span / n;
    for (var i = 0; i < n; i++) { y += drift + sd * gauss(); pts.push(y); }
    // Christmas mode: about half of the path heads get a festive colour.
    var c = XMAS_DOTS && Math.random() < 0.5 ? XMAS_DOTS[Math.floor(Math.random() * 4)] : "";
    return { pts: pts, len: 0, age: 0, done: false, c: c };
  }

  function update(dt) {
    sigma += (target.s - sigma) * 0.08; mu += (target.m - mu) * 0.08;
    timer += dt;
    while (timer > EVERY) { timer -= EVERY; if (paths.length < MAX) paths.push(spawn()); }
    var decay = Math.exp(-dt / 45);
    for (var b = 0; b < bins.length; b++) bins[b] *= decay;
    paths = paths.filter(function (p) {
      p.len = Math.min(p.pts.length - 1, p.len + GROW * dt / STEP);
      if (!p.done && p.len >= p.pts.length - 1) {
        p.done = true;
        var k = Math.floor(p.pts[p.pts.length - 1] / BIN);
        if (k >= 0 && k < bins.length) bins[k] += 1;
      }
      if (p.done) p.age += dt;
      return p.age < LIFE;
    });
  }

  function glow(x, y, r, stops) {
    var g = ctx.createRadialGradient(x, y, 0, x, y, r);
    stops.forEach(function (s) { g.addColorStop(s[0], s[1]); });
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // Violet haze around the "now" point, and a few twinkling stars.
    glow(x0, y0, Math.max(w, h) * 0.6, [[0, "rgba(" + VIOLET + ", 0.16)"], [1, "rgba(" + VIOLET + ", 0)"]]);
    stars.forEach(function (s) {
      ctx.fillStyle = "rgba(" + LAV + ", " + (0.12 + 0.22 * (0.5 + 0.5 * Math.sin(clock * 1.3 + s[2]))) + ")";
      ctx.fillRect(s[0], s[1], 1.5, 1.5);
    });

    // History: soft echoes of the price line, then the candles themselves.
    ctx.lineWidth = 1;
    for (var k = 1; k <= 4; k++) {
      ctx.strokeStyle = "rgba(" + LAV + ", " + 0.16 / k + ")";
      ctx.beginPath();
      candles.forEach(function (c, i) {
        var y = c.c + Math.sin(i * 0.9 + clock * 0.35 + k * 1.7) * k * 5;
        i ? ctx.lineTo(c.x + cw / 2, y) : ctx.moveTo(c.x + cw / 2, y);
      });
      ctx.stroke();
    }
    ctx.shadowColor = "rgba(" + LAV + ", 0.9)"; ctx.shadowBlur = 8;
    candles.forEach(function (c) {
      var top = Math.min(c.o, c.c), bw = cw - 3;
      ctx.fillStyle = "rgba(" + INK + ", 0.4)";
      ctx.fillRect(c.x + cw / 2 - 0.5, c.hi, 1, c.lo - c.hi);                    // wick
      ctx.fillStyle = "rgba(" + INK + ", " + (c.c <= c.o ? 0.85 : 0.55) + ")";   // up brighter than down
      ctx.fillRect(c.x + 1.5, top, bw, Math.max(2, Math.abs(c.c - c.o)));        // body
    });
    ctx.shadowBlur = 0;

    // Future: the fan of simulated paths.
    ctx.lineWidth = 0.8;
    paths.forEach(function (p) {
      var a = 0.3 * (1 - p.age / LIFE);
      ctx.strokeStyle = "rgba(" + LAV + ", " + a + ")";
      ctx.beginPath();
      ctx.moveTo(x0, p.pts[0]);
      for (var i = 1; i <= p.len; i++) ctx.lineTo(x0 + i * STEP, p.pts[i]);
      ctx.stroke();
      if (!p.done) {   // bright head while the path is still drawing
        var i2 = Math.floor(p.len);
        var r = p.c ? 2.5 : 1.5;
        ctx.fillStyle = p.c ? "rgb(" + p.c + ")" : "rgba(" + INK + ", 0.95)";
        ctx.fillRect(x0 + i2 * STEP - r, p.pts[i2] - r, r * 2, r * 2);
      }
    });

    // Fade everything behind the title and tagline so the text stays readable.
    var rx = Math.min(w * 0.36, 420), ry = h * 0.27;
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.translate(w / 2, h / 2); ctx.scale(1, ry / rx);
    glow(0, 0, rx, [[0, "rgba(0, 0, 0, 0.8)"], [0.6, "rgba(0, 0, 0, 0.62)"], [1, "rgba(0, 0, 0, 0)"]]);
    ctx.restore();

    // The "now" point: a small marker where history ends and the simulation starts.
    ctx.fillStyle = "rgba(" + INK + ", 0.9)";
    ctx.fillRect(x0 - 2.5, y0 - 2.5, 5, 5);

    // Histogram of end points: rows of dots behind a thin divider.
    // The dots and the expected (normal) distribution share one scale.
    var sdPx = sigma * span, mean = y0 - mu * span, total = 0;
    for (var t = 0; t < bins.length; t++) total += bins[t];
    var peak = total * BIN / (sdPx * 2.5066);                 // expected count in the tallest row
    var hx = x1 + 12, hw = w - hx - 10, max = Math.max.apply(null, bins.concat(peak, 4));
    ctx.fillStyle = "rgba(" + LAV + ", 0.18)";
    var yTop = Math.max(0, mean - sdPx * 3.4), yBot = Math.min(h, mean + sdPx * 3.4);   // only where the curve lives
    ctx.fillRect(hx - 6, yTop, 1, yBot - yTop);
    ctx.fillStyle = "rgba(" + INK + ", 0.55)";
    bins.forEach(function (c, k) {
      if (c < 0.05) return;
      for (var d = 0, n = Math.round(c / max * hw / 4); d < n; d++) ctx.fillRect(hx + d * 4, k * BIN + 3, 2, 2);
    });
    // Expected distribution of the end points: dashed bell curve over the dots.
    var scale = peak / max * hw;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = "rgba(" + INK + ", 0.7)";
    ctx.beginPath();
    for (var yy = yTop; yy <= yBot; yy += 4) {
      var z = (yy - mean) / sdPx, bx = hx + Math.exp(-z * z / 2) * scale;
      yy > yTop ? ctx.lineTo(bx, yy) : ctx.moveTo(bx, yy);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Soft edges: fade everything out before it reaches the menu bar at the top
    // (and the bottom edge), so wide-ranging paths never look cut off.
    var topFade = ctx.createLinearGradient(0, 0, 0, 190);
    topFade.addColorStop(0, "rgba(0, 0, 0, 1)"); topFade.addColorStop(0.45, "rgba(0, 0, 0, 1)");
    topFade.addColorStop(1, "rgba(0, 0, 0, 0)");
    var bottomFade = ctx.createLinearGradient(0, h - 70, 0, h);
    bottomFade.addColorStop(0, "rgba(0, 0, 0, 0)"); bottomFade.addColorStop(1, "rgba(0, 0, 0, 1)");
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = topFade; ctx.fillRect(0, 0, w, 190);
    ctx.fillStyle = bottomFade; ctx.fillRect(0, h - 70, w, 70);
    ctx.globalCompositeOperation = "source-over";

    // Parameter readout next to the mouse.
    if (mouse) {
      ctx.font = FONT;
      ctx.fillStyle = "rgba(" + INK + ", 0.9)";
      ctx.fillText("σ " + sigma.toFixed(2) + "   μ " + (mu >= 0 ? "+" : "") + mu.toFixed(2), mouse.x + 14, mouse.y - 10);
    }
  }

  var onScreen = true;   // skip work while the box is scrolled away
  new IntersectionObserver(function (e) { onScreen = e[0].isIntersecting; }).observe(box);

  function frame(now) {
    if (!onScreen) { last = 0; requestAnimationFrame(frame); return; }
    var dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
    last = now; clock += dt;
    if (!mouse) {   // idle: let the parameters wander a little
      target.s = 0.25 + Math.sin(clock / 7) * 0.08;
      target.m = Math.sin(clock / 11) * 0.12;
    }
    update(dt);
    draw();
    requestAnimationFrame(frame);
  }

  pointerEl.addEventListener("pointermove", function (e) {
    var r = box.getBoundingClientRect();
    mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
    target.s = Math.max(0.08, 0.08 + 0.45 * mouse.x / w);
    target.m = 0.3 - 0.6 * mouse.y / h;
  });
  pointerEl.addEventListener("pointerleave", function () { mouse = null; });
  window.addEventListener("resize", resize);
  resize();

  if (still) {   // one static frame of finished paths
    for (var i = 0; i < MAX; i++) {
      var p = spawn(), end = p.pts[p.pts.length - 1];
      p.len = p.pts.length - 1; p.done = true; p.age = LIFE / 2;
      if (end >= 0 && end < h) bins[Math.floor(end / BIN)] += 1;
      paths.push(p);
    }
    draw();
  } else requestAnimationFrame(frame);
}

(function () {
  if (document.documentElement.dataset.hero !== "montecarlo") return;
  var hero = document.getElementById("hero");
  var inner = hero && hero.querySelector(".hero-inner");
  if (inner) monteCarlo(hero, hero, inner);
})();

/* New Year fireworks over the hero (html.newyear, set in Christmas mode above).
   Rockets climb from the bottom and burst into sparks that fall and fade. */
(function () {
  var hero = document.getElementById("hero");
  var inner = hero && hero.querySelector(".hero-inner");
  if (!inner || !document.documentElement.classList.contains("newyear") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var COLORS = ["255, 60, 90", "50, 230, 130", "255, 200, 60", "60, 200, 255", "255, 255, 255"];
  var canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";
  var ctx = canvas.getContext("2d");
  hero.insertBefore(canvas, inner);

  var w = 0, h = 0, rockets = [], sparks = [], last = 0, timer = 0, onScreen = true;

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = hero.clientWidth; h = hero.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function burst(r) {
    var n = 50 + Math.floor(Math.random() * 40);
    for (var i = 0; i < n; i++) {
      var a = Math.random() * 6.2832, s = 40 + Math.random() * 190;
      sparks.push({ x: r.x, y: r.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, c: r.c });
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    if (!onScreen) { last = 0; return; }
    var dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
    last = now;

    timer -= dt;
    if (timer <= 0) {
      timer = 0.4 + Math.random() * 0.9;
      var ty = h * (0.12 + Math.random() * 0.4);
      rockets.push({ x: w * (0.1 + Math.random() * 0.8), y: h, ty: ty, vy: (ty - h) / 0.9,
                     c: COLORS[Math.floor(Math.random() * COLORS.length)] });
    }

    // Fade the previous frame instead of clearing it: leaves short trails.
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";

    rockets = rockets.filter(function (r) {
      r.y += r.vy * dt;
      ctx.fillStyle = "rgba(" + r.c + ", 0.9)";
      ctx.fillRect(r.x - 1, r.y, 2, 6);
      if (r.y > r.ty) return true;
      burst(r);
      return false;
    });
    sparks = sparks.filter(function (s) {
      var drag = 1 - 1.5 * dt;
      s.vx *= drag; s.vy = s.vy * drag + 90 * dt;      // air drag + gravity
      s.x += s.vx * dt; s.y += s.vy * dt;
      s.life -= dt / 1.6;
      if (s.life <= 0) return false;
      ctx.fillStyle = "rgba(" + s.c + ", " + s.life + ")";
      ctx.fillRect(s.x - 1.25, s.y - 1.25, 2.5, 2.5);
      return true;
    });
  }

  new IntersectionObserver(function (e) { onScreen = e[0].isIntersecting; }).observe(hero);
  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(frame);
})();

/* 17 November — Velvet Revolution / International Students' Day (that day
   only, or ?nov17 to preview). Shows the greeting above the title
   (html.nov17) and a crowd of jingling keys along the bottom of the hero,
   under the Monte Carlo simulation. */
(function () {
  var now = new Date();
  var on = /[?&]nov17\b/.test(location.search) || (now.getMonth() === 10 && now.getDate() === 17);
  var hero = document.getElementById("hero");
  var inner = hero && hero.querySelector(".hero-inner");
  if (!on || !inner) return;
  document.documentElement.classList.add("nov17");
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";
  var ctx = canvas.getContext("2d");
  hero.insertBefore(canvas, inner);

  var w = 0, h = 0, keys = [], onScreen = true;

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = hero.clientWidth; h = hero.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    keys = [];
    // Two layers: small dim keys at the back, then larger bright ones in front.
    [[0.78, 7, 0.16], [0.84, 11, 0.5]].forEach(function (layer) {
      for (var x = 10; x < w; x += layer[1] * (1.6 + Math.random() * 1.6)) {
        keys.push({ x: x, y: h * (layer[0] + Math.random() * 0.07), s: layer[1] * (0.8 + Math.random() * 0.5),
                    f: 5 + Math.random() * 6, p: Math.random() * 6.28, a: layer[2] * (0.7 + Math.random() * 0.6),
                    flip: Math.random() < 0.5 ? -1 : 1 });
      }
    });
    draw(0);
  }

  // A solid key silhouette (s = size unit; the key is about 3.4 s long): round
  // bow with a hole, shaft, two-tooth bit. It hangs from the top of the bow
  // and swings around that point.
  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    keys.forEach(function (k) {
      var s = k.s;
      ctx.save();
      ctx.translate(k.x, k.y);
      ctx.rotate(Math.sin(t * k.f + k.p) * 0.4);
      ctx.scale(k.flip, 1);                                           // teeth left or right
      ctx.fillStyle = "rgba(233, 235, 241, " + k.a + ")";
      ctx.beginPath();
      ctx.arc(0, s * 0.7, s * 0.7, 0, 6.2832);                        // bow
      ctx.moveTo(s * 0.32, s * 0.6);
      ctx.arc(0, s * 0.6, s * 0.32, 0, 6.2832);                       // hole (cut out by evenodd)
      ctx.rect(-s * 0.13, s * 1.3, s * 0.26, s * 2.1);                // shaft
      ctx.rect(s * 0.13, s * 2.45, s * 0.42, s * 0.24);               // teeth
      ctx.rect(s * 0.13, s * 2.95, s * 0.58, s * 0.3);
      ctx.fill("evenodd");
      ctx.restore();
    });
  }

  function frame(now) {
    requestAnimationFrame(frame);
    if (onScreen) draw(now / 1000);
  }

  new IntersectionObserver(function (e) { onScreen = e[0].isIntersecting; }).observe(hero);
  window.addEventListener("resize", resize);
  resize();
  if (!still) requestAnimationFrame(frame);
})();

/* Contact section — implied volatility surface as a stack of smile curves
   (.contact-visual, the empty right half; hidden on narrow screens).
   One curve σ(K) per maturity T: steep, skewed smiles in front (short T)
   flattening towards the back (long T). Each curve hides the ones behind it.
   The skew sways slowly; mouse x sets the skew, mouse y the viewing tilt. */
(function () {
  var section = document.getElementById("contact");
  var box = section && section.querySelector(".contact-visual");
  if (!box) return;
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var NT = 24, NK = 70;                    // maturities (curves) x strikes (points)
  var INK = "233, 235, 241", ACCENT = "120, 120, 255", BG = "#07080c";   // BG = --bg
  var FONT = "11px 'Instrument Sans', 'Segoe UI', sans-serif";

  var canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
  var ctx = canvas.getContext("2d");
  box.appendChild(canvas);

  var w = 0, h = 0, last = 0, clock = 0, onScreen = false, mouse = false;
  var skew = 0.15, tilt = 0.3, target = { skew: 0.15, tilt: 0.3 };

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = box.clientWidth; h = box.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (still) draw();
  }

  // k in [-1, 1] (strike around the money), t in [0, 1] (maturity).
  function vol(k, t) {
    var near = 0.25 + 0.75 * Math.exp(-2.4 * t);         // smile fades with maturity
    return 0.16 + 0.1 * t + (0.5 * k * k - skew * k) * near +
           0.018 * Math.sin(k * 5 + t * 6 - clock * 0.9);
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    var W = Math.min(w * 0.6, 440), amp = W * 0.42;       // curve width, height of σ = 1
    var dx = W * 0.3, dy = Math.min(h * tilt, 260);       // how far the back row is shifted
    var left = (w - W - dx) / 2, bottom = h * 0.5 + (dy + amp * 0.5) / 2;
    var SMAX = 0.8, s, q;                                 // top of the σ axis
    ctx.font = FONT; ctx.lineJoin = "round";

    // Box behind the surface: floor outline, back wall and left wall with σ grid lines.
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(" + INK + ", 0.13)";
    ctx.beginPath();
    ctx.moveTo(left, bottom); ctx.lineTo(left + dx, bottom - dy);                  // floor, left edge
    ctx.lineTo(left + dx + W, bottom - dy); ctx.lineTo(left + W, bottom);          // floor, back + right edge
    ctx.moveTo(left + dx, bottom - dy); ctx.lineTo(left + dx, bottom - dy - SMAX * amp);         // back-left post
    ctx.moveTo(left + dx + W, bottom - dy); ctx.lineTo(left + dx + W, bottom - dy - SMAX * amp); // back-right post
    for (s = 0.2; s <= SMAX + 0.01; s += 0.2) {
      ctx.moveTo(left, bottom - s * amp); ctx.lineTo(left + dx, bottom - dy - s * amp);          // left wall
      ctx.lineTo(left + dx + W, bottom - dy - s * amp);                                          // back wall
    }
    ctx.stroke();

    ctx.lineWidth = 1.2;
    for (var j = NT - 1; j >= 0; j--) {                   // back to front
      var u = j / (NT - 1), x0 = left + u * dx, y0 = bottom - u * dy, min = [0, 1e9];
      ctx.beginPath();
      for (var i = 0; i < NK; i++) {
        var k = -1 + 2 * i / (NK - 1), x = x0 + i / (NK - 1) * W, y = y0 - vol(k, u) * amp;
        if (y0 - y < min[1]) min = [x, y0 - y, y];
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.lineTo(x0 + W, y0 + 2); ctx.lineTo(x0, y0 + 2);  // close down to the baseline
      ctx.fillStyle = BG;
      ctx.fill();                                         // hide the curves behind
      ctx.beginPath();                                    // then the curve itself on top
      for (i = 0; i < NK; i++) {
        x = x0 + i / (NK - 1) * W; y = y0 - vol(-1 + 2 * i / (NK - 1), u) * amp;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.strokeStyle = "rgba(" + INK + ", " + (0.75 - 0.6 * u) + ")";
      ctx.stroke();
      ctx.fillStyle = "rgba(" + ACCENT + ", " + (0.95 - 0.7 * u) + ")";
      ctx.fillRect(min[0] - 1.5, min[2] - 1.5, 3, 3);     // lowest vol on this curve
    }

    // Axes in front of the surface, with ticks and labels.
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(" + INK + ", 0.5)";
    ctx.fillStyle = "rgba(" + INK + ", 0.5)";
    ctx.beginPath();
    ctx.moveTo(left, bottom - SMAX * amp); ctx.lineTo(left, bottom);               // σ axis
    ctx.lineTo(left + W, bottom);                                                  // K axis
    ctx.lineTo(left + W + dx, bottom - dy);                                        // T axis
    ctx.textBaseline = "middle"; ctx.textAlign = "right";
    for (s = 0.2; s <= SMAX + 0.01; s += 0.2) {                                    // σ ticks
      ctx.moveTo(left - 5, bottom - s * amp); ctx.lineTo(left, bottom - s * amp);
      ctx.fillText(Math.round(s * 100) + "%", left - 9, bottom - s * amp);
    }
    ctx.fillText("σ", left - 9, bottom - SMAX * amp - 16);
    ctx.textAlign = "center";
    for (q = 0; q <= 4; q++) {                                                     // K ticks (% of spot)
      ctx.moveTo(left + q / 4 * W, bottom); ctx.lineTo(left + q / 4 * W, bottom + 5);
      ctx.fillText(80 + q * 10, left + q / 4 * W, bottom + 16);
    }
    ctx.textAlign = "left";
    ["1M", "6M", "1Y", "2Y"].forEach(function (label, n) {                         // T ticks
      var tx = left + W + n / 3 * dx, ty = bottom - n / 3 * dy;
      ctx.moveTo(tx, ty); ctx.lineTo(tx + 5, ty + 2);
      ctx.fillText(label, tx + 10, ty + 5);
    });
    ctx.stroke();
    ctx.fillText("T", left + W + dx + 12, bottom - dy - 10);
    ctx.fillText("K  (% spot)      skew " + skew.toFixed(2), left, bottom + 38);
    ctx.textBaseline = "alphabetic";
  }

  function frame(now) {
    requestAnimationFrame(frame);
    if (!onScreen) { last = 0; return; }           // off screen, or hidden on phones
    var dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
    last = now; clock += dt;
    if (!mouse) target.skew = 0.15 + Math.sin(clock / 5) * 0.15;
    skew += (target.skew - skew) * 0.06;
    tilt += (target.tilt - tilt) * 0.06;
    draw();
  }

  section.addEventListener("pointermove", function (e) {
    var r = section.getBoundingClientRect();
    mouse = true;
    target.skew = -0.35 + 0.7 * (e.clientX - r.left) / r.width;
    target.tilt = 0.18 + 0.24 * (e.clientY - r.top) / r.height;
  });
  section.addEventListener("pointerleave", function () { mouse = false; target.tilt = 0.3; });
  new IntersectionObserver(function (e) { onScreen = e[0].isIntersecting; }).observe(box);
  window.addEventListener("resize", resize);
  resize();
  if (!still) requestAnimationFrame(frame);
})();


/* ==========================================================================
   APPLICATION TERMINAL — how people apply.
   A bash-like prompt in the Applications section asks for name, school,
   e-mail, motivation, CV (PDF) and consent to data processing, then POSTs it
   all as JSON to APPLY_ENDPOINT (Google Apps Script, see apps-script/Code.gs).
   Everything the applicant types is printed with textContent, never as HTML.
   ========================================================================== */
(function () {
  var wrap = document.getElementById("apply-terminal-wrap");
  var body = document.getElementById("terminal-body");
  var log = document.getElementById("terminal-log");
  var form = document.getElementById("terminal-form");
  var input = document.getElementById("terminal-input");
  var label = document.getElementById("terminal-prompt");
  var fileBtn = document.getElementById("terminal-file-btn");
  var fileInput = document.getElementById("terminal-file");
  var trap = document.getElementById("terminal-hp");
  if (!wrap || !form) return;

  var demo = !APPLY_ENDPOINT;
  if (demo && !/[?&]terminal\b/.test(location.search)) return;   // not configured: stay hidden
  wrap.hidden = false;

  var MAX_CV = 5 * 1024 * 1024;   // keep in sync with apps-script/Code.gs
  var CONTACT = "info@praguequantclub.org";
  var TEXT = {
    cs: {
      intro: "Prague Quant Club · přihláška. Odpověz na každou otázku a potvrď klávesou Enter.",
      q_name: "jméno a příjmení", q_school: "škola a obor", q_email: "e-mail",
      q_motivation: "proč se chceš přidat (pár vět)", q_cv: "životopis (PDF, max 5 MB)",
      q_consent: "souhlasíš? [a/n]", q_confirm: "odeslat přihlášku? [a/n]",
      consentText: "Souhlasím se zpracováním svých osobních údajů (jméno, škola, e-mail, motivace, " +
        "životopis) klubem Prague Quant Club pro účely přijímacího řízení. Souhlas lze kdykoli " +
        "odvolat na " + CONTACT + ".",
      choose: "[ vybrat PDF ]", summary: "--- shrnutí ---", restart: "Dobře, začínáme znovu.",
      empty: "✗ Tohle pole nemůže být prázdné.",
      badEmail: "✗ To nevypadá jako e-mailová adresa.",
      short: "✗ Napiš prosím aspoň pár vět (minimálně 20 znaků).",
      notPdf: "✗ Životopis musí být soubor PDF.", tooBig: "✗ Soubor je větší než 5 MB.",
      yn: "✗ Odpověz a (ano) nebo n (ne).",
      needConsent: "✗ Bez souhlasu přihlášku přijmout nemůžeme.",
      p_pack: "konsoliduji data", p_send: "odesílám přihlášku",
      p_trojan: "stahuji trojského koně",
      sent: "✔ Přihláška odeslána. Ozveme se ti na {email}.",
      failed: "✗ Odeslání se nepodařilo. Zkus to znovu; kdyby to nešlo, napiš nám na " + CONTACT + ".",
      demo: "✔ Demo režim: nic se neodeslalo (v script.js chybí APPLY_ENDPOINT)."
    },
    en: {
      intro: "Prague Quant Club · application. Answer each question and press Enter.",
      q_name: "full name", q_school: "school and programme", q_email: "e-mail",
      q_motivation: "why do you want to join (a few sentences)", q_cv: "CV (PDF, max 5 MB)",
      q_consent: "do you agree? [y/n]", q_confirm: "submit the application? [y/n]",
      consentText: "I consent to Prague Quant Club processing my personal data (name, school, e-mail, " +
        "motivation, CV) for the purposes of the admission process. I can withdraw this consent " +
        "at any time at " + CONTACT + ".",
      choose: "[ choose PDF ]", summary: "--- summary ---", restart: "OK, starting over.",
      empty: "✗ This field cannot be empty.",
      badEmail: "✗ That does not look like an e-mail address.",
      short: "✗ Please write at least a few sentences (20 characters minimum).",
      notPdf: "✗ The CV must be a PDF file.", tooBig: "✗ The file is larger than 5 MB.",
      yn: "✗ Answer y (yes) or n (no).",
      needConsent: "✗ We cannot accept an application without consent.",
      p_pack: "consolidating data", p_send: "sending application",
      p_trojan: "downloading trojan horse",
      sent: "✔ Application sent. We will get back to you at {email}.",
      failed: "✗ Sending failed. Try again; if it keeps failing, write to us at " + CONTACT + ".",
      demo: "✔ Demo mode: nothing was sent (APPLY_ENDPOINT is missing in script.js)."
    }
  };
  function t(key) { return TEXT[currentLang === "en" ? "en" : "cs"][key]; }

  var STEPS = ["name", "school", "email", "motivation", "cv", "consent", "confirm"];
  var data = {}, cv = null, step = 0, busy = false;

  function print(text, cls) {
    var p = document.createElement("p");
    if (cls) p.className = cls;
    p.textContent = text;
    log.appendChild(p);
    body.scrollTop = body.scrollHeight;
  }

  // Show the prompt for the current step.
  function ask() {
    var s = STEPS[step], isFile = s === "cv";
    if (s === "consent") print(t("consentText"), "terminal-dim");
    if (s === "confirm") {
      print(t("summary"), "terminal-dim");
      ["name", "school", "email", "motivation"].forEach(function (k) {
        print("  " + t("q_" + k).split(" (")[0] + ": " + data[k], "terminal-dim");
      });
      print("  CV: " + cv.name, "terminal-dim");
    }
    label.textContent = t("q_" + s) + " ›";
    input.hidden = isFile; fileBtn.hidden = !isFile;
    fileBtn.textContent = t("choose");
    input.maxLength = s === "motivation" ? 1500 : 200;
    input.inputMode = s === "email" ? "email" : "text";
    input.autocomplete = { name: "name", email: "email" }[s] || "off";
    body.scrollTop = body.scrollHeight;
  }

  // Handle one typed answer; on a bad answer print why and stay on the step.
  function answer(value) {
    var s = STEPS[step], v = value.trim();
    print(t("q_" + s) + " › " + v, "terminal-echo");
    if (s === "consent" || s === "confirm") {
      var yes = /^(a|ano|y|yes)$/i.test(v), no = /^(n|ne|no)$/i.test(v);
      if (!yes && !no) return print(t("yn"), "terminal-err");
      if (s === "consent" && no) return print(t("needConsent"), "terminal-err");
      if (s === "confirm") {
        if (yes) return send();
        print(t("restart"), "terminal-dim");
        return start();
      }
    } else {
      if (!v) return print(t("empty"), "terminal-err");
      if (s === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) return print(t("badEmail"), "terminal-err");
      if (s === "motivation" && v.length < 20) return print(t("short"), "terminal-err");
      data[s] = v;
    }
    step++;
    ask();
  }

  function start() {
    data = {}; cv = null; step = 0;
    print("$ ./apply.sh", "terminal-cmd");
    print(t("intro"), "terminal-dim");
    ask();
  }

  function finish() { form.hidden = true; }

  function fail() {
    busy = false;
    print(t("failed"), "terminal-err");
    form.hidden = false;
    label.textContent = t("q_confirm") + " ›";   // still on the confirm step: "a" retries
  }

  // One installer-style progress line:  label   [#######.........]  42%
  // It fills over `ms`. With `wait` (a promise) it holds at 90% until that
  // settles, and rejects if it fails.
  function progress(text, ms, wait) {
    return new Promise(function (resolve, reject) {
      var p = document.createElement("p");
      p.className = "terminal-dim";
      p.setAttribute("aria-hidden", "true");          // don't read every tick to screen readers
      log.appendChild(p);
      var narrow = body.clientWidth < 520, width = narrow ? 16 : 24;
      var gap = narrow ? "\n  " : new Array(Math.max(2, 28 - text.length)).join(" ");
      var t0 = Date.now(), ready = !wait, failed = false;
      if (wait) wait.then(function () { ready = true; }, function () { failed = true; });

      var timer = setInterval(function () {
        if (failed) { clearInterval(timer); return reject(); }
        var f = Math.min(1, (Date.now() - t0) / ms);
        if (!ready) f = Math.min(f, 0.9);
        var n = Math.round(f * width), pct = String(Math.round(f * 100));
        p.textContent = text + gap + "[" + new Array(n + 1).join("#") + new Array(width - n + 1).join(".") +
                        "] " + "   ".slice(pct.length) + pct + "%";
        body.scrollTop = body.scrollHeight;
        if (f === 1) { clearInterval(timer); resolve(); }
      }, 60);
    });
  }

  // The real upload: resolves when the Apps Script confirms it saved the application.
  function post() {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = reject;
      reader.onload = function () {
        var payload = {
          name: data.name, school: data.school, email: data.email, motivation: data.motivation,
          consent: true, lang: currentLang, website: trap.value,
          cv: { name: cv.name, type: cv.type, data: String(reader.result).split(",")[1] }
        };
        // text/plain keeps this a "simple" request, which Apps Script web apps accept cross-origin.
        fetch(APPLY_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload)
        })
          .then(function (r) { return r.json(); })
          .then(function (r) { r.ok ? resolve() : reject(new Error(r.error)); })
          .catch(reject);
      };
      reader.readAsDataURL(cv);
    });
  }

  function send() {
    busy = true;
    form.hidden = true;
    var request = demo ? Promise.resolve() : post();   // starts now, behind the progress bars
    request.catch(function () {});                     // failure is handled by the "sending" bar below
    progress(t("p_pack"), 900)
      .then(function () { return progress(t("p_send"), 1200, request); })
      .then(function () { return progress(t("p_trojan"), 1400); })
      .then(function () {
        print(demo ? t("demo") : t("sent").replace("{email}", data.email), "terminal-ok");
        finish();
      })
      .catch(fail);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (busy || input.hidden) return;
    var v = input.value;
    input.value = "";
    answer(v);
  });

  fileBtn.addEventListener("click", function () { fileInput.click(); });
  fileInput.addEventListener("change", function () {
    var f = fileInput.files[0];
    fileInput.value = "";                       // so picking the same file again fires "change"
    if (!f) return;
    if (f.type !== "application/pdf") return print(t("notPdf"), "terminal-err");
    if (f.size > MAX_CV) return print(t("tooBig"), "terminal-err");
    cv = f;
    print(t("q_cv") + " › " + f.name + " (" + Math.max(1, Math.round(f.size / 1024)) + " kB)", "terminal-echo");
    step++;
    ask();
    input.focus();
  });

  // Clicking anywhere in the window puts the cursor on the prompt, like a real terminal.
  body.addEventListener("click", function (e) {
    if (e.target === fileBtn || window.getSelection().toString()) return;
    if (!input.hidden && !form.hidden) input.focus({ preventScroll: true });
  });

  start();
})();

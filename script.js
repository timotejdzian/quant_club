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
  "applications.lede": "We accept applications on a rolling basis throughout the whole semester. If you want to apply, send an email with your CV to <a href=\"mailto:info@praguequantclub.org\">info@praguequantclub.org</a>.",
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
   Hero grid — dots of light travelling along the grid lines.
   Each dot runs along a line, sometimes turns at an intersection, leaves a
   short trail and lights up the grid lines around it. Canvas sits on top of
   the static CSS grid; reduced-motion users just get the static grid.
   ========================================================================== */
(function () {
  var hero = document.getElementById("hero");
  var wrap = hero && hero.querySelector(".hero-grid");
  if (!wrap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var CELL = 56;          // must match background-size in .hero-grid
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
    return d;
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = wrap.clientWidth; h = wrap.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!dots.length) for (var i = 0; i < COUNT; i++) dots.push(spawn());
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
    g.addColorStop(0, "rgba(140, 140, 255, " + 0.45 * a + ")");
    g.addColorStop(1, "rgba(91, 91, 240, 0)");
    ctx.strokeStyle = g;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var x = x0; x <= x1; x += CELL) { ctx.moveTo(x + 0.5, y0); ctx.lineTo(x + 0.5, y1); }
    for (var y = y0; y <= y1; y += CELL) { ctx.moveTo(x0, y + 0.5); ctx.lineTo(x1, y + 0.5); }
    ctx.stroke();

    // Soft wash on the area itself.
    var f = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, GLOW * 0.8);
    f.addColorStop(0, "rgba(91, 91, 240, " + 0.08 * a + ")");
    f.addColorStop(1, "rgba(91, 91, 240, 0)");
    ctx.fillStyle = f;
    ctx.fillRect(d.x - GLOW, d.y - GLOW, GLOW * 2, GLOW * 2);
  }

  function trail(d, a) {
    var t = d.trail;
    ctx.lineCap = "round";
    for (var i = 1; i < t.length; i++) {
      var k = i / t.length;
      ctx.strokeStyle = "rgba(170, 170, 255, " + 0.7 * k * a + ")";
      ctx.lineWidth = 1 + k;
      ctx.beginPath();
      ctx.moveTo(t[i - 1][0] + 0.5, t[i - 1][1] + 0.5);
      ctx.lineTo(t[i][0] + 0.5, t[i][1] + 0.5);
      ctx.stroke();
    }
    // Head: bright core + small halo.
    var hgl = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, 10);
    hgl.addColorStop(0, "rgba(255, 255, 255, " + 0.95 * a + ")");
    hgl.addColorStop(0.3, "rgba(160, 160, 255, " + 0.6 * a + ")");
    hgl.addColorStop(1, "rgba(91, 91, 240, 0)");
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

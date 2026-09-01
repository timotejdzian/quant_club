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

/* ==========================================================================
   TEAM — EDIT HERE
   Each team member must have: name, group, avatar ("m" or "f").
   Optional: photo (path to headshot image; leave empty string for placeholder).
   When photo is empty, the avatar-{m,f}.svg placeholder will be used.
   ========================================================================== */
var TEAM = [
  // SEM PŘIDÁVEJTE ČLENY TÝMU — jeden řádek na osobu. Příklad:
  //
  // { name: "Jan Novák", group: "Zakladatelé", groupEn: "Founders", avatar: "m", photo: "" },
  //
  { name: "Klára Machalíčková", group: "Zakladatelé", groupEn: "Founders", avatar: "f", photo: "" },
  { name: "Josef Hlahůlek", group: "Zakladatelé", groupEn: "Founders", avatar: "m", photo: "" },
  { name: "Timotej Dzian", group: "Zakladatelé", groupEn: "Founders", avatar: "m", photo: "" },
  { name: "Ondřej Vild", group: "Zakladatelé", groupEn: "Founders", avatar: "m", photo: "" },
  { name: "Hynek Holub", group: "Zakladatelé", groupEn: "Founders", avatar: "m", photo: "" },
  { name: "Juraj Kvasnička", group: "Sociální sítě", groupEn: "Social media", avatar: "m", photo: "" }
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
  "nav.team": "Team",
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

  "team.heading": "Team",

  "applications.eyebrow": "Applications",
  "applications.heading": "Applications",
  "applications.lede": "Applications are open for the winter semester 2026. The deadline is 11 October. The entrance test is in Czech.",
  "applications.emailLabel": "Write to us at:",
  "applications.copyButton": "Copy",
  "applications.copyConfirmation": "Copied",
  "applications.copyAriaLabel": "Copy email address",
  "applications.checklistHeading": "What to send",
  "applications.checklistIntro": "One email, one attachment: your CV as a PDF. Include:",
  "applications.checklist1": "University, programme and year",
  "applications.checklist2": "Grade average",
  "applications.checklist3": "Experience: jobs, internships, projects",
  "applications.checklist4": "Research and publications, if you have any",
  "applications.checklist5": "Competitions and olympiads",
  "applications.checklist6": "Interests",
  "applications.format": "Format: we recommend the <a href=\"https://www.overleaf.com/latex/templates/jakes-resume/syzfjbzwjncs\" target=\"_blank\" rel=\"noopener\" data-i18n=\"applications.formatLink\">Jake's Resume</a> template.",
  "applications.formatLink": "Jake's Resume",
  "applications.note": "Subject line in the format: Přihláška – Your Name. We reply within three days.",
  "applications.toggle": "How does the selection process work?",
  "applications.step1Heading": "Step 1 — Application and CV",
  "applications.step1Text": "Send us your CV as a PDF. Beyond your studies we care about what you do outside them: projects, competitions, research, interests. One page is enough.",
  "applications.step1Meta": "by 11 October",
  "applications.step2Heading": "Step 2 — Online test",
  "applications.step2Text": "A written test in Czech covering four areas: algebra and basic calculus, probability and statistics, brain teasers, and structured thinking. It is not about memorised knowledge, it is about how you reason.",
  "applications.step2Meta": "second week of October, 45 minutes. The exact schedule will be sent to applicants.",
  "applications.step3Heading": "Step 3 — Interview",
  "applications.step3Text": "A short online conversation. We want to get to know you and work through one open-ended problem to see how you structure your approach.",
  "applications.step3Meta": "20 minutes, online"
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
      } else {
        // Reset to Czech default (already in HTML)
        if (key === "applications.copyAriaLabel") {
          el.setAttribute("aria-label", "Kopírovat e-mailovou adresu");
        }
      }
    });

    if (btn) {
      // The button shows the language you would switch TO.
      btn.textContent = lang === "cs" ? "EN" : "CS";
      btn.setAttribute("aria-label", lang === "cs" ? "Switch to English" : "Přepnout do češtiny");
    }

    renderCalendar(lang);
    renderTeam(lang);

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
   4. TEAM RENDERING — grouped by role
   ========================================================================== */
function renderTeam(lang) {
  var teamEl = document.getElementById("team-grid");
  if (!teamEl) return;

  function escapeHtml(s) {
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function pickGroup(member) {
    if (lang === "en" && member.groupEn) return member.groupEn;
    return member.group || "";
  }

  // Group members by their group field
  var groups = {};
  TEAM.forEach(function (member) {
    var g = pickGroup(member);
    if (!groups[g]) groups[g] = [];
    groups[g].push(member);
  });

  // Sort groups to ensure "Zakladatelé"/"Founders" comes first
  var sortedGroups = Object.keys(groups).sort(function (a, b) {
    var aIsFounders = a === "Zakladatelé" || a === "Founders";
    var bIsFounders = b === "Zakladatelé" || b === "Founders";
    if (aIsFounders && !bIsFounders) return -1;
    if (!aIsFounders && bIsFounders) return 1;
    return 0;
  });

  var html = "";
  sortedGroups.forEach(function (groupName) {
    var members = groups[groupName];
    html += '<div class="team-group reveal">';
    html += '<h2 class="team-group-label">' + escapeHtml(groupName) + "</h2>";
    html += '<div class="team-cards">';
    members.forEach(function (m) {
      var avatarSrc = m.photo ? escapeHtml(m.photo) : "assets/avatar-" + m.avatar + ".svg";
      html += '<div class="team-card">';
      html += '<div class="team-avatar">';
      html += '<img src="' + avatarSrc + '" alt="" aria-hidden="true">';
      html += "</div>";
      html += '<p class="team-name">' + escapeHtml(m.name) + "</p>";
      html += "</div>";
    });
    html += "</div>";
    html += "</div>";
  });

  teamEl.innerHTML = html;

  // Make newly rendered elements visible immediately
  teamEl.querySelectorAll('.reveal').forEach(function(el) {
    el.classList.add('visible');
  });
}

// Render team on page load if the element exists
(function() {
  if (document.getElementById("team-grid")) {
    renderTeam(currentLang);
  }
})();


/* ==========================================================================
   5. MOBILE HAMBURGER MENU
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
   5.5 STATISTICS COUNTER ANIMATION
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


/* ==========================================================================
   8. APPLICATIONS — CLIPBOARD COPY
   Copies the email address to the clipboard using navigator.clipboard.writeText.
   Shows confirmation for 2 seconds, then reverts. Hides button if API unavailable.
   ========================================================================== */
(function clipboardCopy() {
  var btn = document.getElementById("copy-email-button");
  var status = document.getElementById("copy-status");
  if (!btn || !status) return;

  var emailAddress = "info@praguequantclub.org";
  var confirmationTimeout = null;

  // Hide button if clipboard API is unavailable
  if (!navigator.clipboard || !navigator.clipboard.writeText) {
    btn.style.display = "none";
    return;
  }

  btn.addEventListener("click", function () {
    navigator.clipboard.writeText(emailAddress).then(function () {
      // Get the confirmation text based on current language
      var confirmText = currentLang === "en"
        ? I18N_EN["applications.copyConfirmation"]
        : "Zkopírováno";

      // Update button text
      var span = btn.querySelector("span");
      if (span) span.textContent = confirmText;

      // Update status for screen readers
      status.textContent = confirmText;

      // Clear any existing timeout
      if (confirmationTimeout) clearTimeout(confirmationTimeout);

      // Revert after 2 seconds
      confirmationTimeout = setTimeout(function () {
        var copyText = currentLang === "en"
          ? I18N_EN["applications.copyButton"]
          : "Kopírovat";
        if (span) span.textContent = copyText;
        status.textContent = "";
      }, 2000);
    }).catch(function (err) {
      // Silently fail if clipboard write fails
      console.error("Failed to copy email:", err);
    });
  });
})();


/* ==========================================================================
   9. APPLICATIONS — PROCESS PANEL TOGGLE
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

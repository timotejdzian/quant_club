/* ==========================================================================
   PRAGUE QUANT CLUB — SCRIPT
   --------------------------------------------------------------------------
   1. EVENTS — edit this array to update the calendar. Nothing else needed.
   2. Calendar rendering (upcoming / past, semester grouping, toggle)
   3. Sticky nav state (transparent over hero -> solid after scrolling)
   4. Mobile hamburger menu
   5. Reveal-on-scroll (IntersectionObserver)
   6. Footer year
   ========================================================================== */

"use strict";

/* ==========================================================================
   1. EVENTS — EDIT HERE
   date must be "YYYY-MM-DD". Events are automatically sorted and split
   into Upcoming / Past based on today's date.
   ========================================================================== */
var EVENTS = [
  // SEM PŘIDÁVEJTE AKCE — jeden řádek na akci, v libovolném pořadí. Příklad:
  //
  // { date: "2026-09-15", title: "Uvítací večer", location: "VŠE, místnost NB 350", description: "Zahájení nového semestru." },
  //
  // Nadcházející a proběhlé akce se rozdělí automaticky podle data.
];

/* Zobrazí se pod „Nadcházející", pokud v seznamu nejsou žádné budoucí akce */
var EMPTY_UPCOMING_MESSAGE =
  'Momentálně nejsou naplánované žádné akce — sledujte náš ' +
  '<a href="https://instagram.com/praguequantclub" target="_blank" rel="noopener">Instagram</a>' +
  ', kde vše oznamujeme.';

/* How many most-recent semesters stay expanded in "Past events" */
var EXPANDED_SEMESTERS = 2;


/* ==========================================================================
   2. CALENDAR RENDERING
   ========================================================================== */
(function renderCalendar() {
  var upcomingEl = document.getElementById("upcoming-events");
  var pastEl = document.getElementById("past-events");
  var toggleBtn = document.getElementById("toggle-semesters");
  if (!upcomingEl || !pastEl) return;

  // "Today" at midnight so events happening today still count as upcoming.
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  function parseDate(str) {
    var p = str.split("-");
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }

  // Czech date format: "15. 9. 2026"
  function formatDate(d) {
    return d.getDate() + ". " + (d.getMonth() + 1) + ". " + d.getFullYear();
  }

  // Aug–Dec = Podzim (fall), Jan–Jul = Jaro (spring)
  function semesterOf(d) {
    return (d.getMonth() >= 7 ? "Podzim " : "Jaro ") + d.getFullYear();
  }

  // Czech plural for "akce": 1 akce, 2–4 akce, 5+ akcí
  function eventCountLabel(n) {
    if (n === 1) return "1 akce";
    if (n >= 2 && n <= 4) return n + " akce";
    return n + " akcí";
  }

  // Sortable key for a semester: year * 2 (+1 for Fall)
  function semesterKey(d) {
    return d.getFullYear() * 2 + (d.getMonth() >= 7 ? 1 : 0);
  }

  function escapeHtml(s) {
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function eventRow(ev) {
    var d = parseDate(ev.date);
    return (
      '<div class="event-row">' +
        '<span class="event-date">' + formatDate(d) + "</span>" +
        '<span class="event-title" title="' + escapeHtml(ev.description || "") + '">' +
          escapeHtml(ev.title) +
        "</span>" +
        '<span class="event-location">' + escapeHtml(ev.location || "") + "</span>" +
      "</div>"
    );
  }

  // --- Split into upcoming / past ---
  var upcoming = [];
  var past = [];
  EVENTS.forEach(function (ev) {
    (parseDate(ev.date) >= today ? upcoming : past).push(ev);
  });

  upcoming.sort(function (a, b) { return parseDate(a.date) - parseDate(b.date); }); // ascending
  past.sort(function (a, b) { return parseDate(b.date) - parseDate(a.date); });     // descending

  // --- Render upcoming ---
  if (upcoming.length === 0) {
    upcomingEl.innerHTML = '<p class="event-empty">' + EMPTY_UPCOMING_MESSAGE + "</p>";
  } else {
    upcomingEl.innerHTML = upcoming.map(eventRow).join("");
  }

  // --- Render past, grouped by semester (already sorted newest first) ---
  var groups = [];   // [{ name, key, events: [] }]
  var byKey = {};
  past.forEach(function (ev) {
    var d = parseDate(ev.date);
    var key = semesterKey(d);
    if (!byKey[key]) {
      byKey[key] = { name: semesterOf(d), key: key, events: [] };
      groups.push(byKey[key]);
    }
    byKey[key].events.push(ev);
  });
  groups.sort(function (a, b) { return b.key - a.key; });

  if (groups.length === 0) {
    pastEl.innerHTML = '<p class="event-empty">Proběhlé akce se zde objeví po našem prvním semestru.</p>';
  } else {
  pastEl.innerHTML = groups.map(function (group, i) {
    var collapsed = i >= EXPANDED_SEMESTERS ? " collapsed" : "";
    var count = eventCountLabel(group.events.length);
    return (
      '<div class="semester-group' + collapsed + '">' +
        '<h4 class="semester-heading">' + group.name +
          '<span class="semester-count">' + count + "</span>" +
        "</h4>" +
        '<div class="event-list">' + group.events.map(eventRow).join("") + "</div>" +
      "</div>"
    );
  }).join("");
  }

  // --- "Show all semesters" toggle (only if some semesters are collapsed) ---
  if (groups.length > EXPANDED_SEMESTERS && toggleBtn) {
    toggleBtn.hidden = false;
    toggleBtn.addEventListener("click", function () {
      var hidden = pastEl.querySelectorAll(".semester-group.collapsed");
      var expanding = hidden.length > 0;
      if (expanding) {
        hidden.forEach(function (el) { el.classList.remove("collapsed"); el.dataset.wasCollapsed = "1"; });
        toggleBtn.textContent = "Zobrazit méně semestrů";
        toggleBtn.setAttribute("aria-expanded", "true");
      } else {
        pastEl.querySelectorAll('.semester-group[data-was-collapsed="1"]').forEach(function (el) {
          el.classList.add("collapsed");
        });
        toggleBtn.textContent = "Zobrazit všechny semestry";
        toggleBtn.setAttribute("aria-expanded", "false");
      }
    });
  }
})();


/* ==========================================================================
   3. MOBILE HAMBURGER MENU
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

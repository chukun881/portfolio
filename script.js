/* Yew Chu Kun — portfolio
   No dependencies. Theme memory, nav, reveals, count-up numbers,
   accuracy gauge, masthead sensor grid, portrait scan readout,
   cursor ring. Every effect degrades for reduced motion / touch. */

(function () {
  "use strict";

  var root = document.documentElement;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var hasIO = "IntersectionObserver" in window;

  /* ---------- Theme: follow OS by default, remember manual choice ---------- */
  var THEME_KEY = "portfolio-theme";
  try {
    var saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") {
      root.setAttribute("data-theme", saved);
    }
  } catch (e) { /* storage blocked — stay on OS preference */ }

  var themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      var current = root.getAttribute("data-theme");
      var isDark = current ? current === "dark" : systemDark;
      var next = isDark ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
      window.dispatchEvent(new CustomEvent("themechange"));
    });
  }

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("nav-toggle");
  var navMenu = document.getElementById("nav-menu");
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var open = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    navMenu.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        navMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (reducedMotion || !hasIO) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Section spy ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-links a[href^='#']"));
  if (hasIO && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (link) {
          if (link.getAttribute("href") === "#" + id) {
            link.setAttribute("aria-current", "true");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Count-up numbers ---------- */
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function formatCount(value, decimals, format) {
    var out;
    if (decimals > 0) out = value.toFixed(decimals);
    else out = String(Math.round(value));
    if (format === "comma") out = out.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return out;
  }
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var format = el.getAttribute("data-format");
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    if (reducedMotion || !isFinite(target)) {
      el.textContent = prefix + formatCount(target, decimals, format) + suffix;
      return;
    }
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var t = Math.min((ts - start) / duration, 1);
      el.textContent = prefix + formatCount(target * easeOut(t), decimals, format) + suffix;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (hasIO) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countObserver.observe(el); });
  } else {
    counters.forEach(runCounter);
  }

  /* ---------- Accuracy gauge fill ---------- */
  var gauges = Array.prototype.slice.call(document.querySelectorAll(".gauge-fill"));
  function fillGauge(el) { el.style.width = el.getAttribute("data-fill") + "%"; }
  if (hasIO) {
    var gaugeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          fillGauge(entry.target);
          gaugeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    gauges.forEach(function (el) { gaugeObserver.observe(el); });
  } else {
    gauges.forEach(fillGauge);
  }

  /* ---------- Masthead sensor grid (canvas) ---------- */
  var canvas = document.getElementById("lab-grid");
  if (canvas && !reducedMotion && window.innerWidth > 760) {
    var ctx = canvas.getContext("2d");
    var masthead = canvas.parentElement;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, dots = [];
    var pointer = { x: -9999, y: -9999 };
    var running = false, inView = true;
    var frame = 0;
    var GAP = 26, RADIUS = 150;

    function cssVar(name) {
      return getComputedStyle(root).getPropertyValue(name).trim();
    }
    var pine = cssVar("--pine") || "#2E6B4F";

    function build() {
      W = masthead.clientWidth;
      H = masthead.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];
      for (var y = GAP / 2; y < H; y += GAP) {
        for (var x = GAP / 2; x < W; x += GAP) {
          dots.push({ x: x, y: y, phase: (x * 0.02) + (y * 0.013) });
        }
      }
    }

    function draw() {
      if (!running) return;
      frame++;
      if (frame % 90 === 0) pine = cssVar("--pine") || pine;
      ctx.clearRect(0, 0, W, H);
      var t = performance.now() / 1000;
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        var breathe = 0.5 + 0.5 * Math.sin(t * 0.9 + d.phase);
        var alpha = 0.05 + breathe * 0.07;
        var size = 1.3 + breathe * 0.5;
        var dx = d.x - pointer.x, dy = d.y - pointer.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < RADIUS) {
          var force = 1 - dist / RADIUS;
          alpha += force * 0.55;
          size += force * 1.9;
        }
        ctx.globalAlpha = Math.min(alpha, 0.85);
        ctx.fillStyle = pine;
        ctx.beginPath();
        ctx.arc(d.x, d.y, size, 0, 6.2832);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    }

    function start() { if (!running && inView && !document.hidden) { running = true; requestAnimationFrame(draw); } }
    function stop() { running = false; }

    build();
    start();

    window.addEventListener("resize", function () {
      if (window.innerWidth <= 760) { stop(); ctx.clearRect(0, 0, W, H); return; }
      build();
    });
    masthead.addEventListener("pointermove", function (e) {
      var rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    });
    masthead.addEventListener("pointerleave", function () { pointer.x = -9999; pointer.y = -9999; });
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
    if (hasIO) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        inView ? start() : stop();
      }, { threshold: 0 }).observe(canvas);
    }
  }

  /* ---------- Portrait scan readout ---------- */
  var scanReadout = document.querySelector(".scan-readout");
  var portrait = document.querySelector(".portrait");
  if (scanReadout && portrait && !reducedMotion) {
    var sliceN = 64, scanTimer = null;
    portrait.addEventListener("pointerenter", function () {
      scanTimer = window.setInterval(function () {
        sliceN = 1 + Math.floor(Math.random() * 128);
        scanReadout.textContent =
          "slice " + String(sliceN).padStart(3, "0") + " / 128 · axial";
      }, 420);
    });
    portrait.addEventListener("pointerleave", function () {
      window.clearInterval(scanTimer);
      scanReadout.textContent = "slice 064 / 128 · axial";
    });
  }

  /* ---------- Cursor ring (fine pointers only) ---------- */
  if (finePointer && !reducedMotion) {
    var ring = document.createElement("div");
    ring.className = "cursor-ring";
    ring.setAttribute("aria-hidden", "true");
    document.body.appendChild(ring);
    var rx = -100, ry = -100, tx = -100, ty = -100, ringVisible = false;
    document.addEventListener("pointermove", function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!ringVisible) { rx = tx; ry = ty; ringVisible = true; ring.classList.add("is-on"); }
      var hot = e.target.closest("a, button, .cert-row, .figure-card");
      ring.classList.toggle("is-hot", !!hot);
    });
    document.addEventListener("pointerleave", function () {
      ringVisible = false; ring.classList.remove("is-on");
    });
    (function ringLoop() {
      rx += (tx - rx) * 0.16;
      ry += (ty - ry) * 0.16;
      ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%, -50%)";
      requestAnimationFrame(ringLoop);
    })();
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();

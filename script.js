/* Lumen Studio — Stage 2 */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var mobileQuery = window.matchMedia("(max-width: 820px)");

  /* ---------------------------------------------------------
     Header navigation (Stage 1, unchanged behaviour)
     --------------------------------------------------------- */
  (function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("primary-nav");
    var header = document.querySelector(".site-header");
    var yearEl = document.getElementById("year");

    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
    if (!toggle || !nav) return;

    function isOpen() {
      return nav.getAttribute("data-open") === "true";
    }

    function setNav(open) {
      nav.setAttribute("data-open", open ? "true" : "false");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      var label = toggle.querySelector(".nav-toggle-label");
      if (label) label.textContent = open ? "Close" : "Menu";
      if (open) {
        var first = nav.querySelector("a");
        if (first) first.focus();
      }
    }

    toggle.addEventListener("click", function () {
      setNav(!isOpen());
    });

    nav.addEventListener("click", function (event) {
      if (event.target && event.target.tagName === "A" && mobileQuery.matches) {
        setNav(false);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isOpen()) {
        setNav(false);
        toggle.focus();
      }
    });

    document.addEventListener("click", function (event) {
      if (!mobileQuery.matches || !isOpen()) return;
      var node = event.target;
      while (node) {
        if (node === header) return;
        node = node.parentNode;
      }
      setNav(false);
    });

    var onViewportChange = function (event) {
      if (!event.matches) setNav(false);
    };
    if (typeof mobileQuery.addEventListener === "function") {
      mobileQuery.addEventListener("change", onViewportChange);
    } else if (typeof mobileQuery.addListener === "function") {
      mobileQuery.addListener(onViewportChange);
    }

    var sections = document.querySelectorAll("main section[id]");
    var navLinks = document.querySelectorAll(".primary-nav a[href^='#']");

    if ("IntersectionObserver" in window && sections.length && navLinks.length) {
      var observer = new IntersectionObserver(
        function (entries) {
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
        },
        { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
      );
      Array.prototype.forEach.call(sections, function (section) {
        observer.observe(section);
      });
    }
  })();

  /* ---------------------------------------------------------
     Project data (fictional — demo only)
     --------------------------------------------------------- */
  var PROJECTS = {
    northline: {
      title: "Northline",
      category: "Brand Identity",
      year: "2025",
      desc: "A restrained identity system built on a single continuous rule — typography, wayfinding, and a modular mark that stretches across print and screen.",
      overview:
        "The concept starts with one line that never breaks: a single rule that becomes a divider, a baseline, a route marker, and the edge of the mark itself. Type sits hard against it, colour stays deliberately narrow, and every application is judged by whether it still reads at a glance from across a room.",
      deliverables: ["Visual identity system", "Typography and colour guidelines", "Signage and print applications"]
    },
    forma: {
      title: "Forma",
      category: "Digital Experience",
      year: "2025",
      desc: "A digital experience shaped around editorial pacing: generous type, deliberate motion, and an interface that stays out of the way of the content.",
      overview:
        "The concept treats a website like a printed sequence rather than a stack of blocks. Sections are paced with varying density — a wide statement, a quiet detail, a dense index — and motion is used only to mark a change of chapter. Navigation stays minimal so the reading order does the directing.",
      deliverables: ["Responsive website direction", "Component and layout system", "Interaction and motion notes"]
    },
    signal: {
      title: "Signal House",
      category: "Campaign",
      year: "2024",
      desc: "A campaign concept built from repetition and interruption — one message, held long enough to land, then cut with a sharp graphic counterpoint.",
      overview:
        "The concept repeats a single line across formats until it becomes familiar, then interrupts it once with a hard geometric cut. The repetition builds recognition; the interruption creates the moment worth remembering. Crops and formats are planned together so the idea survives being resized.",
      deliverables: ["Campaign art direction", "Key visual and format toolkit", "Motion and social cutdowns"]
    },
    mono: {
      title: "Mono Objects",
      category: "Art Direction",
      year: "2024",
      desc: "Art direction for an imagined object series: single-colour staging, hard light, and compositions that treat everyday forms as sculpture.",
      overview:
        "The concept removes everything except form: one background colour per frame, a single hard light source, and framing that lets an ordinary object read as a piece of sculpture. The direction is documented as a set of rules — light angle, distance, backdrop — so a series stays consistent frame to frame.",
      deliverables: ["Art direction system", "Shot list and lighting guidance", "Styling and retouch direction"]
    }
  };

  /* ---------------------------------------------------------
     1. Project filtering
     --------------------------------------------------------- */
  (function initFilters() {
    var buttons = document.querySelectorAll(".filter-btn");
    var projects = document.querySelectorAll(".project");
    var status = document.getElementById("filter-status");
    if (!buttons.length || !projects.length) return;

    var labels = {
      all: null,
      brand: "Brand",
      digital: "Digital",
      campaign: "Campaign",
      art: "Art Direction"
    };

    function applyFilter(key) {
      var visible = 0;
      Array.prototype.forEach.call(projects, function (item) {
        var match = key === "all" || item.getAttribute("data-category") === key;
        if (match) {
          item.removeAttribute("hidden");
          visible += 1;
        } else {
          item.setAttribute("hidden", "");
        }
      });

      Array.prototype.forEach.call(buttons, function (btn) {
        var active = btn.getAttribute("data-filter") === key;
        btn.setAttribute("aria-pressed", active ? "true" : "false");
      });

      if (status) {
        var label = labels[key];
        if (key === "all") {
          status.textContent = "Showing all " + visible + " projects";
        } else if (visible === 1) {
          status.textContent = "Showing 1 project — " + label;
        } else {
          status.textContent = "Showing " + visible + " projects — " + label;
        }
      }
    }

    Array.prototype.forEach.call(buttons, function (btn) {
      btn.addEventListener("click", function () {
        applyFilter(btn.getAttribute("data-filter"));
      });
    });

    applyFilter("all");
  })();

  /* ---------------------------------------------------------
     2. Project detail dialog
     --------------------------------------------------------- */
  (function initDialog() {
    var dialog = document.getElementById("project-dialog");
    if (!dialog || typeof dialog.showModal !== "function") return;

    var titleEl = document.getElementById("dialog-title");
    var categoryEl = document.getElementById("dialog-category");
    var yearEl = document.getElementById("dialog-year");
    var descEl = document.getElementById("dialog-desc");
    var overviewEl = document.getElementById("dialog-overview");
    var listEl = document.getElementById("dialog-deliverables");
    var closeBtn = document.getElementById("dialog-close");
    var trigger = null;

    function fill(key) {
      var data = PROJECTS[key];
      if (!data) return false;
      titleEl.textContent = data.title;
      categoryEl.textContent = data.category;
      yearEl.textContent = data.year;
      descEl.textContent = data.desc;
      overviewEl.textContent = data.overview;
      listEl.innerHTML = "";
      data.deliverables.forEach(function (item, i) {
        var li = document.createElement("li");
        li.textContent = item;
        li.setAttribute("data-index", "0" + (i + 1));
        listEl.appendChild(li);
      });
      return true;
    }

    function lockScroll(lock) {
      document.documentElement.classList.toggle("dialog-open", lock);
    }

    function open(key, source) {
      if (!fill(key)) return;
      trigger = source || null;
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }
      lockScroll(true);
      if (closeBtn) closeBtn.focus();
    }

    function close() {
      if (typeof dialog.close === "function" && dialog.open) {
        dialog.close();
      } else {
        dialog.removeAttribute("open");
        lockScroll(false);
        restore();
      }
    }

    function restore() {
      lockScroll(false);
      if (trigger && document.contains(trigger)) {
        trigger.focus();
      }
      trigger = null;
    }

    Array.prototype.forEach.call(document.querySelectorAll(".project-open"), function (btn) {
      btn.addEventListener("click", function () {
        open(btn.getAttribute("data-project"), btn);
      });
    });

    if (closeBtn) closeBtn.addEventListener("click", close);

    dialog.addEventListener("close", restore);

    dialog.addEventListener("cancel", function () {
      /* native Escape close — focus restoration handled on "close" */
    });

    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) close();
    });
  })();

  /* ---------------------------------------------------------
     3. Service selection + localStorage
     --------------------------------------------------------- */
  var STORAGE_KEY = "lumen:selected-service";

  function readStoredService() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (err) {
      return null;
    }
  }

  function writeStoredService(value) {
    try {
      if (value === null) {
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        window.localStorage.setItem(STORAGE_KEY, value);
      }
    } catch (err) {
      /* storage unavailable — selection still works for this visit */
    }
  }

  (function initServices() {
    var services = document.querySelectorAll(".service");
    var status = document.getElementById("service-status");
    if (!services.length) return;

    function select(service, announce) {
      Array.prototype.forEach.call(services, function (item) {
        var isTarget = item === service;
        var btn = item.querySelector(".service-select");
        var panel = item.querySelector(".service-panel");

        item.classList.toggle("is-selected", isTarget);
        if (btn) btn.setAttribute("aria-expanded", isTarget ? "true" : "false");
        if (panel) {
          if (isTarget) {
            panel.removeAttribute("hidden");
          } else {
            panel.setAttribute("hidden", "");
          }
        }
        if (btn) {
          var label = btn.querySelector(".select-label");
          if (label) label.textContent = isTarget ? "Selected" : "Select service";
        }
      });

      var id = service.getAttribute("data-service");
      writeStoredService(id);

      if (announce && status) {
        var name = service.querySelector(".service-name");
        status.textContent = (name ? name.textContent : "Service") + " selected.";
      }
    }

    function deselectAll(announce) {
      Array.prototype.forEach.call(services, function (item) {
        item.classList.remove("is-selected");
        var btn = item.querySelector(".service-select");
        var panel = item.querySelector(".service-panel");
        if (btn) btn.setAttribute("aria-expanded", "false");
        if (panel) panel.setAttribute("hidden", "");
        var label = btn && btn.querySelector(".select-label");
        if (label) label.textContent = "Select service";
      });
      writeStoredService(null);
      if (announce && status) status.textContent = "Service selection cleared.";
    }

    Array.prototype.forEach.call(services, function (service) {
      var btn = service.querySelector(".service-select");
      if (!btn) return;
      btn.addEventListener("click", function () {
        var expanded = btn.getAttribute("aria-expanded") === "true";
        if (expanded) {
          deselectAll(true);
        } else {
          select(service, true);
        }
      });
    });

    var stored = readStoredService();
    if (stored) {
      var match = document.querySelector('.service[data-service="' + stored + '"]');
      if (match) select(match, false);
    }
  })();

  /* ---------------------------------------------------------
     4. Contact form
     Custom validation first, then delivery:
     - action=""            -> demo mode, no network at all
     - Formspree endpoint   -> POST via fetch with sending,
                               success, and accessible error states
     --------------------------------------------------------- */
  (function initForm() {
    var form = document.getElementById("inquiry-form");
    var success = document.getElementById("form-success");
    if (!form || !success) return;

    var successName = document.getElementById("success-name");
    var successSummary = document.getElementById("success-summary");
    var successKicker = document.getElementById("success-kicker");
    var successNote = document.getElementById("success-note");
    var resetBtn = document.getElementById("form-reset");
    var submitBtn = document.getElementById("form-submit");
    var statusEl = document.getElementById("form-status");
    var errorEl = document.getElementById("form-error");
    var noteEl = document.getElementById("form-note");
    var defaultLabel = submitBtn ? submitBtn.textContent : "Send inquiry";
    var sending = false;

    var FIELDS = [
      { id: "f-name", error: "f-name-error", validate: notEmpty, msg: "Please enter your name." },
      { id: "f-email", error: "f-email-error", validate: isEmail, msg: "Please enter a valid email address, for example name@example.com." },
      { id: "f-type", error: "f-type-error", validate: notEmpty, msg: "Please choose a project type." },
      { id: "f-timeline", error: "f-timeline-error", validate: notEmpty, msg: "Please choose a timeline." },
      { id: "f-message", error: "f-message-error", validate: notEmpty, msg: "Please add a short message about the project." }
    ];

    function notEmpty(value) {
      return value.trim().length > 0;
    }

    function isEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
    }

    function endpoint() {
      return (form.getAttribute("action") || "").trim();
    }

    function endpointReady() {
      return /^https?:\/\/formspree\.io\//i.test(endpoint());
    }

    function updateModeCopy() {
      if (!noteEl) return;
      noteEl.textContent = endpointReady()
        ? "Sends via Formspree. Nothing is stored in this browser."
        : "Demo mode — no Formspree endpoint configured, nothing is sent.";
    }

    function setSending(on) {
      sending = on;
      if (on) {
        form.setAttribute("aria-busy", "true");
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Sending…";
        }
        if (errorEl) errorEl.setAttribute("hidden", "");
        if (statusEl) {
          statusEl.textContent = "Sending your inquiry…";
          statusEl.removeAttribute("hidden");
        }
      } else {
        form.removeAttribute("aria-busy");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = defaultLabel;
        }
        if (statusEl) {
          statusEl.textContent = "";
          statusEl.setAttribute("hidden", "");
        }
      }
    }

    function setFieldError(field, message) {
      var input = document.getElementById(field.id);
      var errorTarget = document.getElementById(field.error);
      if (!input || !errorTarget) return;
      if (message) {
        input.setAttribute("aria-invalid", "true");
        errorTarget.textContent = message;
        errorTarget.removeAttribute("hidden");
      } else {
        input.removeAttribute("aria-invalid");
        errorTarget.textContent = "";
        errorTarget.setAttribute("hidden", "");
      }
    }

    function validateField(field) {
      var input = document.getElementById(field.id);
      if (!input) return true;
      var ok = field.validate(input.value);
      setFieldError(field, ok ? "" : field.msg);
      return ok;
    }

    FIELDS.forEach(function (field) {
      var input = document.getElementById(field.id);
      if (!input) return;
      input.addEventListener("blur", function () {
        if (input.value !== "" || input.hasAttribute("aria-invalid")) validateField(field);
      });
      input.addEventListener("input", function () {
        if (input.getAttribute("aria-invalid") === "true") validateField(field);
      });
      input.addEventListener("change", function () {
        if (input.getAttribute("aria-invalid") === "true") validateField(field);
      });
    });

    function showSuccess(live) {
      var nameVal = document.getElementById("f-name").value.trim();
      var typeVal = document.getElementById("f-type").value;
      var timeVal = document.getElementById("f-timeline").value;

      form.setAttribute("hidden", "");
      success.removeAttribute("hidden");
      if (successName) successName.textContent = nameVal || "friend";
      if (successSummary) {
        successSummary.textContent =
          "Project type: " + typeVal + " · Timeline: " + timeVal +
          (live
            ? ". Delivered to the studio inbox via Formspree."
            : ". Your details stay in this browser — the demo form does not send anything.");
      }
      if (successKicker) successKicker.textContent = live ? "Inquiry received" : "Inquiry received — demo";
      if (successNote) {
        successNote.textContent = live
          ? "Sent via Formspree. Lumen Studio is a fictional demo, so no real reply will follow — it is a portfolio demonstration."
          : "This is a fictional demo studio, so nothing was sent. In a live build this is where Formspree would handle delivery.";
      }
      success.focus();
    }

    function showError() {
      setSending(false);
      if (errorEl) {
        errorEl.removeAttribute("hidden");
        errorEl.focus();
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (sending) return;

      var firstInvalid = null;
      FIELDS.forEach(function (field) {
        var ok = validateField(field);
        if (!ok && !firstInvalid) {
          firstInvalid = document.getElementById(field.id);
        }
      });

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      updateModeCopy();
      var url = endpoint();

      if (!/^https?:\/\/formspree\.io\//i.test(url)) {
        showSuccess(false);
        return;
      }

      setSending(true);
      fetch(url, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (response) {
          if (response.ok) {
            setSending(false);
            showSuccess(true);
          } else {
            showError();
          }
        })
        .catch(function () {
          showError();
        });
    });

    updateModeCopy();

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        setSending(false);
        form.reset();
        FIELDS.forEach(function (field) {
          setFieldError(field, "");
        });
        if (errorEl) errorEl.setAttribute("hidden", "");
        success.setAttribute("hidden", "");
        form.removeAttribute("hidden");
        updateModeCopy();
        var first = document.getElementById("f-name");
        if (first) first.focus();
      });
    }
  })();

  /* ---------------------------------------------------------
     5. Service CTA → prefill inquiry form
     --------------------------------------------------------- */
  (function initServiceCta() {
    var ctas = document.querySelectorAll(".service-cta");
    var typeSelect = document.getElementById("f-type");
    if (!ctas.length || !typeSelect) return;

    Array.prototype.forEach.call(ctas, function (cta) {
      cta.addEventListener("click", function (event) {
        event.preventDefault();

        var value = cta.getAttribute("data-project-type");
        if (value) typeSelect.value = value;

        var target = document.getElementById("inquiry");
        if (target) {
          target.scrollIntoView({
            behavior: reduceMotion.matches ? "auto" : "smooth",
            block: "start"
          });
        }

        var focusDelay = reduceMotion.matches ? 0 : 420;
        window.setTimeout(function () {
          typeSelect.focus({ preventScroll: true });
        }, focusDelay);
      });
    });
  })();
  /* ---------------------------------------------------------
     6. Back to top — smooth scroll + focus management
     --------------------------------------------------------- */
  (function initBackToTop() {
    var link = document.querySelector(".footer-top-link");
    if (!link) return;
    var wordmark = document.querySelector(".wordmark");

    link.addEventListener("click", function (event) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? "auto" : "smooth" });
      var target = wordmark;
      if (target) {
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        window.setTimeout(function () {
          target.focus({ preventScroll: true });
        }, reduceMotion.matches ? 0 : 420);
      }
    });
  })();
})();

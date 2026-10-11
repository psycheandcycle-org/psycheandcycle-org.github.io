/* Psyche & Cycle — site interactions */

(function () {
  "use strict";

  // Navigation: mobile menu open/close and link handling
  const navToggle = document.querySelector(".nav__toggle");
  const navMenu = document.getElementById("nav-menu");

  function setMenuOpen(isOpen) {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    navMenu.classList.toggle("is-open", isOpen);
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      setMenuOpen(!isOpen);
    });

    navMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenuOpen(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    });
  }

  // Interactive Photo Explorer: open/close keyboard-friendly dialogs
  const hotspots = document.querySelectorAll("[data-hotspot]");
  let lastFocusedHotspot = null;

  function getFocusable(container) {
    return container.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
  }

  function openPopup(dialog, trigger) {
    if (!dialog || typeof dialog.showModal !== "function") return;
    lastFocusedHotspot = trigger || null;
    dialog.showModal();
    const closeBtn = dialog.querySelector(".popup__close");
    if (closeBtn) closeBtn.focus();
  }

  function closePopup(dialog) {
    if (!dialog || !dialog.open) return;
    dialog.close();
    if (lastFocusedHotspot) {
      lastFocusedHotspot.focus();
      lastFocusedHotspot = null;
    }
  }

  hotspots.forEach(function (hotspot) {
    hotspot.addEventListener("click", function () {
      const id = hotspot.getAttribute("aria-controls");
      const dialog = id ? document.getElementById(id) : null;
      openPopup(dialog, hotspot);
    });
  });

  document.querySelectorAll("dialog.popup").forEach(function (dialog) {
    const closeBtn = dialog.querySelector(".popup__close");
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        closePopup(dialog);
      });
    }

    dialog.addEventListener("click", function (event) {
      const rect = dialog.getBoundingClientRect();
      const clickedOutside =
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom;
      if (clickedOutside) {
        closePopup(dialog);
      }
    });

    dialog.addEventListener("cancel", function (event) {
      event.preventDefault();
      closePopup(dialog);
    });

    // Keep Tab focus inside the open dialog
    dialog.addEventListener("keydown", function (event) {
      if (event.key !== "Tab" || !dialog.open) return;
      const focusable = Array.from(getFocusable(dialog));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  });

  // Blog: category filter buttons and search field
  const filterButtons = document.querySelectorAll(".filter-btn");
  const searchInput = document.getElementById("blog-search");
  const blogCards = document.querySelectorAll(".blog-card");
  const emptyMessage = document.getElementById("blog-empty");
  let activeFilter = "all";

  function normalize(value) {
    return (value || "").toLowerCase().trim();
  }

  function updateBlogView() {
    const query = normalize(searchInput ? searchInput.value : "");
    let visibleCount = 0;

    blogCards.forEach(function (card) {
      const category = card.getAttribute("data-category") || "";
      const title = normalize(card.getAttribute("data-title"));
      const excerpt = normalize(card.getAttribute("data-excerpt"));
      const matchesFilter = activeFilter === "all" || category === activeFilter;
      const matchesSearch =
        !query || title.includes(query) || excerpt.includes(query) || normalize(category).includes(query);

      const isVisible = matchesFilter && matchesSearch;
      card.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    if (emptyMessage) {
      emptyMessage.hidden = visibleCount > 0;
    }
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeFilter = button.getAttribute("data-filter") || "all";
      filterButtons.forEach(function (btn) {
        const isActive = btn === button;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-pressed", String(isActive));
      });
      updateBlogView();
    });
  });

  filterButtons.forEach(function (button) {
    button.setAttribute("aria-pressed", String(button.classList.contains("is-active")));
  });

  if (searchInput) {
    searchInput.addEventListener("input", updateBlogView);
  }

  // Newsletter: validate email and show status messages
  const newsletterForm = document.getElementById("newsletter-form");
  const emailInput = document.getElementById("newsletter-email");
  const submitBtn = document.getElementById("newsletter-submit");
  const messageEl = document.getElementById("newsletter-message");

  function isValidEmail(value) {
    // Practical client-side check (not a full RFC parser)
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function setNewsletterMessage(text, type) {
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.classList.remove("is-error", "is-success");
    if (type) messageEl.classList.add(type);
  }

  if (newsletterForm && emailInput && submitBtn) {
    newsletterForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const email = emailInput.value.trim();

      if (!email) {
        setNewsletterMessage("Enter your email to subscribe.", "is-error");
        emailInput.focus();
        return;
      }

      if (!isValidEmail(email)) {
        setNewsletterMessage("That doesn't look like a valid email address.", "is-error");
        emailInput.focus();
        return;
      }

      const originalLabel = submitBtn.textContent;
      submitBtn.textContent = "Subscribing...";
      submitBtn.disabled = true;

      window.setTimeout(function () {
        setNewsletterMessage("You're in. Watch your inbox for the next issue.", "is-success");
        newsletterForm.reset();
        submitBtn.textContent = originalLabel;
        submitBtn.disabled = false;
      }, 700);
    });
  }
})();

(function () {
  var GOOGLE_ADS_ID = "AW-17897197249";
  var FORM_CONVERSION_LABEL = "AW-17897197249/GH7eCKa30sccEMGdhtZC";
  var CONTACT_CONVERSION_LABEL = "AW-17897197249/W58oCKm30sccEMGdhtZC";
  var header = document.querySelector("[data-header]");
  var primaryNav = header && header.querySelector(".site-nav");

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GOOGLE_ADS_ID);

  function updateHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
    var mobileActions = document.querySelector(".mobile-actions");
    if (mobileActions) {
      mobileActions.classList.toggle("is-visible", window.scrollY > 280);
    }
  }

  function setupNavigation() {
    if (!header || !primaryNav) return;

    var isAgencyPage = document.body.classList.contains("agency-page");
    primaryNav.innerHTML = (isAgencyPage ? [
      '<a href="#agency-services">Services</a>',
      '<a href="/photos/">Work</a>',
      '<a href="#agency-process">How it works</a>',
      '<a href="#agency-proof">Reviews</a>',
      '<a href="#agency-areas">Areas</a>',
      '<a href="#agency-enquiry">Enquire</a>'
    ] : [
      '<a href="/#services">Services</a>',
      '<a href="/photos/">Work</a>',
      '<a href="/letting-agent-property-maintenance/">For agents</a>',
      '<a href="/#proof">Reviews</a>',
      '<a href="/#areas">Areas</a>',
      '<a href="/#contact">Contact</a>'
    ]).join("");

    var toggle = document.createElement("button");
    toggle.className = "nav-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-label", "Open navigation");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = "<span></span><span></span><span></span>";
    header.querySelector(".header-inner").appendChild(toggle);

    function closeNavigation() {
      header.classList.remove("nav-open");
      document.body.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation");
    }

    toggle.addEventListener("click", function () {
      var isOpen = header.classList.toggle("nav-open");
      document.body.classList.toggle("menu-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    });

    primaryNav.addEventListener("click", closeNavigation);
    window.addEventListener("resize", function () {
      if (window.innerWidth > 980) closeNavigation();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNavigation();
    });
  }

  function setupMobileActions() {
    var actions = document.createElement("nav");
    actions.className = "mobile-actions";
    actions.setAttribute("aria-label", "Quick contact");
    actions.innerHTML = '<a href="tel:+447912758192">Call Samson</a><a href="https://wa.me/447912758192">WhatsApp</a>';
    document.body.appendChild(actions);
  }

  function scrollToHashTarget() {
    if (!window.location.hash) return;

    var id = window.location.hash.slice(1);
    var target = document.getElementById(id);
    if (!target) return;

    window.requestAnimationFrame(function () {
      target.scrollIntoView({ block: "start" });
    });
  }

  function loadGoogleTag() {
    if (document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) return;
    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + GOOGLE_ADS_ID;
    document.head.appendChild(script);
  }

  function storeClickIds() {
    if (!window.SamsonConsent || !window.SamsonConsent.canMeasure()) return;
    var params = new URLSearchParams(window.location.search);
    ["gclid", "gbraid", "wbraid"].forEach(function (key) {
      var value = params.get(key);
      if (value) {
        window.localStorage.setItem("samson_" + key, value);
      }
    });
  }

  function ensureHiddenField(form, name) {
    var field = form.querySelector('[name="' + name + '"]');
    if (field) return field;

    field = document.createElement("input");
    field.type = "hidden";
    field.name = name;
    form.appendChild(field);
    return field;
  }

  function hydrateForm(form) {
    if (window.SamsonConsent && window.SamsonConsent.canMeasure()) {
      ["gclid", "gbraid", "wbraid"].forEach(function (key) {
        var value = window.localStorage.getItem("samson_" + key);
        if (value) {
          ensureHiddenField(form, key).value = value;
        }
      });
    }

    var emailField = form.querySelector('input[name="email"]');
    var replyToField = form.querySelector("#reply-to-field, [name=\"_replyto\"]");
    if (replyToField && emailField) {
      replyToField.value = emailField.value;
    }
  }

  function reportAdsConversion(sendTo, url, callback) {
    var completed = false;
    var finish = function () {
      if (completed) return;
      completed = true;
      if (callback) callback();
      if (url) window.location.href = url;
    };

    if (typeof window.gtag === "function") {
      window.gtag("event", "conversion", {
        send_to: sendTo,
        value: 1.0,
        currency: "GBP",
        event_callback: finish
      });
      window.setTimeout(finish, 900);
      return;
    }

    finish();
  }

  function setupContactTracking() {
    document.querySelectorAll('a[href^="tel:"], a[href^="https://wa.me/"]').forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        reportAdsConversion(CONTACT_CONVERSION_LABEL, link.href);
      });
    });
  }

  function setupFormTracking() {
    document.querySelectorAll("form.quote-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          form.reportValidity();
          return;
        }

        if (form.dataset.adsSubmitting === "true") return;
        event.preventDefault();
        form.dataset.adsSubmitting = "true";
        hydrateForm(form);

        var formStatus = form.querySelector(".form-status, #form-status");
        if (formStatus) {
          formStatus.textContent = "Sending your quote request by email...";
        }

        reportAdsConversion(FORM_CONVERSION_LABEL, null, function () {
          form.submit();
        });
      });
    });
  }

  setupNavigation();
  setupMobileActions();
  loadGoogleTag();
  storeClickIds();
  window.addEventListener("samson:consent-changed", function (event) {
    if (event.detail && event.detail.measurement) storeClickIds();
  });
  updateHeader();
  scrollToHashTarget();
  window.setTimeout(scrollToHashTarget, 250);
  window.addEventListener("scroll", updateHeader, { passive: true });
  window.addEventListener("load", scrollToHashTarget);
  window.addEventListener("hashchange", scrollToHashTarget);
  setupContactTracking();
  setupFormTracking();
})();

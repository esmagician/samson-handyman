(function () {
  "use strict";

  var STORAGE_KEY = "samson_consent_v2";
  var NOTICE_VERSION = "2026-07-17";
  var CLICK_ID_KEYS = ["gclid", "gbraid", "wbraid"];
  var currentChoice = null;
  var banner = null;
  var preferences = null;
  var settingsButton = null;
  var previousFocus = null;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    functionality_storage: "granted",
    security_storage: "granted",
    wait_for_update: 500
  });
  window.gtag("set", "ads_data_redaction", true);
  window.gtag("set", "url_passthrough", true);

  function readChoice() {
    try {
      var saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
      if (
        saved &&
        saved.noticeVersion === NOTICE_VERSION &&
        typeof saved.measurement === "boolean" &&
        typeof saved.personalisation === "boolean"
      ) {
        return saved;
      }
    } catch (error) {
      return null;
    }
    return null;
  }

  function consentState(choice) {
    var measurement = choice && choice.measurement === true;
    var personalisation = measurement && choice.personalisation === true;

    return {
      ad_storage: measurement ? "granted" : "denied",
      ad_user_data: measurement ? "granted" : "denied",
      ad_personalization: personalisation ? "granted" : "denied",
      analytics_storage: measurement ? "granted" : "denied"
    };
  }

  function clearAdvertisingStorage() {
    CLICK_ID_KEYS.forEach(function (key) {
      window.localStorage.removeItem("samson_" + key);
      document.querySelectorAll('[name="' + key + '"]').forEach(function (field) {
        field.value = "";
      });
    });

    var cookiePrefixes = ["_ga", "_gid", "_gat", "_gcl_", "__gads", "__gpi"];
    var hostnameParts = window.location.hostname.split(".");
    var rootDomain = hostnameParts.length > 1
      ? "." + hostnameParts.slice(-2).join(".")
      : window.location.hostname;

    document.cookie.split(";").forEach(function (cookie) {
      var name = cookie.split("=")[0].trim();
      var shouldClear = cookiePrefixes.some(function (prefix) {
        return name.indexOf(prefix) === 0;
      });
      if (!shouldClear) return;

      document.cookie = name + "=; Max-Age=0; path=/; SameSite=Lax";
      if (rootDomain) {
        document.cookie = name + "=; Max-Age=0; path=/; domain=" + rootDomain + "; SameSite=Lax";
      }
    });
  }

  function announceChoice(choice) {
    var detail = {
      measurement: choice.measurement,
      personalisation: choice.personalisation,
      noticeVersion: choice.noticeVersion,
      updatedAt: choice.updatedAt
    };

    try {
      window.dispatchEvent(new CustomEvent("samson:consent-changed", { detail: detail }));
    } catch (error) {
      var event = document.createEvent("CustomEvent");
      event.initCustomEvent("samson:consent-changed", false, false, detail);
      window.dispatchEvent(event);
    }
  }

  function applyChoice(measurement, personalisation, source, persist) {
    currentChoice = {
      measurement: measurement === true,
      personalisation: measurement === true && personalisation === true,
      noticeVersion: NOTICE_VERSION,
      updatedAt: new Date().toISOString(),
      source: source || "saved"
    };

    window.gtag("consent", "update", consentState(currentChoice));

    if (!currentChoice.measurement) {
      clearAdvertisingStorage();
    }

    if (persist !== false) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(currentChoice));
      } catch (error) {
        // Consent still applies for this page if browser storage is unavailable.
      }
    }

    announceChoice(currentChoice);
    updateVisibility();
  }

  function addStylesheet() {
    if (document.querySelector('link[href^="/assets/consent.css"]')) return;
    var stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "/assets/consent.css?v=20260718";
    document.head.appendChild(stylesheet);
  }

  function bannerMarkup() {
    return [
      '<section class="samson-consent-banner" data-consent-banner role="region" aria-labelledby="samson-consent-title">',
      '  <div class="samson-consent-banner__inner">',
      '    <div class="samson-consent-copy">',
      '      <p class="samson-consent-kicker">Your privacy choices</p>',
      '      <h2 id="samson-consent-title">Choose how this site uses data</h2>',
      '      <p>We use essential storage to remember your choice. With your permission, Samson Handyman and Google use cookies and data to measure enquiries and improve advertising. You can accept, reject or manage these uses.</p>',
      '      <p class="samson-consent-links"><a href="/privacy-policy/">Privacy policy</a><a href="https://business.safety.google/privacy/" target="_blank" rel="noopener noreferrer">How Google uses data</a></p>',
      "    </div>",
      '    <div class="samson-consent-actions">',
      '      <button type="button" class="samson-consent-button samson-consent-button--primary" data-consent-action="accept">Accept all</button>',
      '      <button type="button" class="samson-consent-button" data-consent-action="reject">Reject non-essential</button>',
      '      <button type="button" class="samson-consent-button samson-consent-button--text" data-consent-action="manage">Manage choices</button>',
      "    </div>",
      "  </div>",
      "</section>"
    ].join("");
  }

  function preferencesMarkup() {
    return [
      '<div class="samson-consent-backdrop" data-consent-preferences hidden>',
      '  <section class="samson-consent-dialog" role="dialog" aria-modal="true" aria-labelledby="samson-preferences-title">',
      '    <div class="samson-consent-dialog__header">',
      '      <div><p class="samson-consent-kicker">Privacy settings</p><h2 id="samson-preferences-title">Manage your choices</h2></div>',
      '      <button type="button" class="samson-consent-close" data-consent-action="close" aria-label="Close privacy settings">&times;</button>',
      "    </div>",
      '    <p>Choose whether Google may use cookies and data for measurement and personalised advertising. You can change this at any time.</p>',
      '    <div class="samson-consent-options">',
      '      <div class="samson-consent-option">',
      '        <div><strong>Essential storage</strong><span>Remembers your privacy choice and supports site security.</span></div>',
      '        <span class="samson-consent-always">Always active</span>',
      "      </div>",
      '      <label class="samson-consent-option" for="samson-consent-measurement">',
      '        <div><strong>Measurement</strong><span>Allows Google Ads to measure quote requests, calls and WhatsApp clicks.</span></div>',
      '        <span class="samson-consent-switch"><input id="samson-consent-measurement" type="checkbox"><span aria-hidden="true"></span></span>',
      "      </label>",
      '      <label class="samson-consent-option" for="samson-consent-personalisation">',
      '        <div><strong>Personalised advertising</strong><span>Allows Google to use consented data to make advertising more relevant.</span></div>',
      '        <span class="samson-consent-switch"><input id="samson-consent-personalisation" type="checkbox"><span aria-hidden="true"></span></span>',
      "      </label>",
      "    </div>",
      '    <p class="samson-consent-dialog__links"><a href="/privacy-policy/">Read the privacy policy</a><a href="https://business.safety.google/privacy/" target="_blank" rel="noopener noreferrer">Google business data privacy</a></p>',
      '    <div class="samson-consent-dialog__actions">',
      '      <button type="button" class="samson-consent-button samson-consent-button--primary" data-consent-action="save">Save choices</button>',
      '      <button type="button" class="samson-consent-button" data-consent-action="accept">Accept all</button>',
      '      <button type="button" class="samson-consent-button samson-consent-button--text" data-consent-action="reject">Reject all</button>',
      "    </div>",
      "  </section>",
      "</div>"
    ].join("");
  }

  function settingsMarkup() {
    return '<button type="button" class="samson-consent-settings" data-consent-action="manage" aria-label="Open privacy choices">Privacy choices</button>';
  }

  function updateVisibility() {
    if (!banner || !settingsButton) return;
    var hasChoice = currentChoice !== null;
    banner.hidden = hasChoice;
    settingsButton.hidden = !hasChoice || (preferences && !preferences.hidden);
  }

  function openPreferences() {
    if (!preferences) return;
    previousFocus = document.activeElement;

    var measurementInput = preferences.querySelector("#samson-consent-measurement");
    var personalisationInput = preferences.querySelector("#samson-consent-personalisation");
    measurementInput.checked = currentChoice ? currentChoice.measurement : false;
    personalisationInput.checked = currentChoice ? currentChoice.personalisation : false;
    personalisationInput.disabled = !measurementInput.checked;

    preferences.hidden = false;
    document.body.classList.add("samson-consent-modal-open");
    updateVisibility();
    preferences.querySelector('[data-consent-action="save"]').focus();
  }

  function closePreferences() {
    if (!preferences) return;
    preferences.hidden = true;
    document.body.classList.remove("samson-consent-modal-open");
    updateVisibility();
    if (previousFocus && typeof previousFocus.focus === "function") {
      previousFocus.focus();
    }
  }

  function handleAction(action) {
    if (action === "accept") {
      applyChoice(true, true, "accept-all", true);
      closePreferences();
      return;
    }

    if (action === "reject") {
      applyChoice(false, false, "reject-all", true);
      closePreferences();
      return;
    }

    if (action === "manage") {
      openPreferences();
      return;
    }

    if (action === "close") {
      closePreferences();
      return;
    }

    if (action === "save") {
      var measurement = preferences.querySelector("#samson-consent-measurement").checked;
      var personalisation = preferences.querySelector("#samson-consent-personalisation").checked;
      applyChoice(measurement, personalisation, "custom", true);
      closePreferences();
    }
  }

  function buildInterface() {
    var wrapper = document.createElement("div");
    wrapper.innerHTML = bannerMarkup() + preferencesMarkup() + settingsMarkup();
    while (wrapper.firstChild) {
      document.body.appendChild(wrapper.firstChild);
    }

    banner = document.querySelector("[data-consent-banner]");
    preferences = document.querySelector("[data-consent-preferences]");
    settingsButton = document.querySelector(".samson-consent-settings");

    document.addEventListener("click", function (event) {
      var control = event.target.closest("[data-consent-action]");
      if (!control) return;
      handleAction(control.getAttribute("data-consent-action"));
    });

    var measurementInput = preferences.querySelector("#samson-consent-measurement");
    var personalisationInput = preferences.querySelector("#samson-consent-personalisation");
    measurementInput.addEventListener("change", function () {
      personalisationInput.disabled = !measurementInput.checked;
      if (!measurementInput.checked) personalisationInput.checked = false;
    });

    preferences.addEventListener("click", function (event) {
      if (event.target === preferences) closePreferences();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && preferences && !preferences.hidden) {
        closePreferences();
      }
    });

    updateVisibility();
  }

  addStylesheet();
  currentChoice = readChoice();
  if (currentChoice) {
    window.gtag("consent", "update", consentState(currentChoice));
    if (!currentChoice.measurement) clearAdvertisingStorage();
  }

  window.SamsonConsent = {
    get: function () {
      return currentChoice ? Object.assign({}, currentChoice) : null;
    },
    canMeasure: function () {
      return Boolean(currentChoice && currentChoice.measurement);
    },
    open: openPreferences,
    noticeVersion: NOTICE_VERSION
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildInterface);
  } else {
    buildInterface();
  }
})();

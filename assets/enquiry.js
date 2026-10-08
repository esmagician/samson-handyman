(function () {
  'use strict';
  var SOURCE_KEY = 'samson_enquiry_source';
  var CAMPAIGN_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var AD_KEYS = ['gclid', 'gbraid', 'wbraid'];
  var SOURCE_FIELDS = CAMPAIGN_KEYS.concat(['landing_page', 'referrer_host']);

  function canMeasure() {
    return Boolean(window.SamsonConsent && window.SamsonConsent.canMeasure());
  }

  function field(form, name) {
    var input = form.querySelector('[name="' + name + '"]');
    if (!input) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      form.appendChild(input);
    }
    return input;
  }

  function readSource() {
    try {
      var source = JSON.parse(window.sessionStorage.getItem(SOURCE_KEY));
      if (source && Date.now() - source.recorded_at < 24 * 60 * 60 * 1000) return source;
    } catch (error) { /* Enquiries work when storage is unavailable. */ }
    return null;
  }

  function rememberSource() {
    if (!canMeasure()) return;
    var params = new URLSearchParams(window.location.search);
    var source = readSource();
    var hasCampaign = CAMPAIGN_KEYS.some(function (key) { return params.has(key); });
    if (!source || hasCampaign) {
      source = { landing_page: window.location.pathname, recorded_at: Date.now() };
      try { source.referrer_host = document.referrer ? new URL(document.referrer).hostname : ''; }
      catch (error) { source.referrer_host = ''; }
      CAMPAIGN_KEYS.forEach(function (key) {
        var value = params.get(key);
        if (value) source[key] = value.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 120);
      });
      try { window.sessionStorage.setItem(SOURCE_KEY, JSON.stringify(source)); }
      catch (error) { /* Tracking must never prevent contact. */ }
    }
  }

  function serviceFor(form) {
    var contextForm = form || document.querySelector('form.quote-form');
    var service = contextForm && contextForm.querySelector('[name="service_interest"]');
    return (service && service.value) || document.body.dataset.service || 'General handyman enquiry';
  }

  function hydrate(form) {
    field(form, 'enquiry_page').value = window.location.pathname;
    if (!field(form, 'service_interest').value) field(form, 'service_interest').value = serviceFor(form);
    var source = canMeasure() && readSource();
    SOURCE_FIELDS.forEach(function (key) {
      field(form, key).value = source && source[key] ? source[key] : '';
      field(form, key).disabled = !source;
    });
    AD_KEYS.forEach(function (key) {
      var input = field(form, key);
      input.disabled = !canMeasure();
      if (!canMeasure()) input.value = '';
    });

    var email = form.querySelector('[name="email"]');
    var hasEmail = Boolean(email && email.value.trim());
    field(form, '_replyto').value = hasEmail ? email.value.trim() : '';
    field(form, '_replyto').disabled = !hasEmail;
    var response = field(form, '_autoresponse');
    response.value = 'Thanks for getting in touch. I’ve received your job details and will get back to you to discuss the work. Edvardas, Samson Handyman — 07912 758192.';
    response.disabled = !hasEmail;
  }

  function setupForm(form, index) {
    var phone = form.querySelector('[name="phone"]');
    var email = form.querySelector('[name="email"]');
    if (!phone || !email) return;
    var hint = form.querySelector('.contact-help');
    if (hint) {
      hint.id = 'contact-help-' + index;
      phone.setAttribute('aria-describedby', hint.id);
      email.setAttribute('aria-describedby', hint.id);
    }
    function updateContactRequirement() {
      phone.required = !email.value.trim();
      email.required = !phone.value.trim();
      hydrate(form);
    }
    [phone, email].forEach(function (input) {
      input.addEventListener('input', updateContactRequirement);
      input.addEventListener('change', updateContactRequirement);
    });
    updateContactRequirement();
    // Run before either page template's submission handler calls native form.submit().
    form.addEventListener('submit', function (event) {
      updateContactRequirement();
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopImmediatePropagation();
        form.reportValidity();
      }
    }, true);
    form.addEventListener('reset', function () { window.setTimeout(updateContactRequirement, 0); });
  }

  function refreshAttribution() {
    if (canMeasure()) rememberSource();
    else {
      try { window.sessionStorage.removeItem(SOURCE_KEY); }
      catch (error) { /* No storage to clear. */ }
    }
    document.querySelectorAll('form.quote-form').forEach(hydrate);
  }

  function init() {
    rememberSource();
    document.querySelectorAll('form.quote-form').forEach(setupForm);
    window.addEventListener('samson:consent-changed', refreshAttribution);
    document.addEventListener('click', function (event) {
      var link = event.target.closest('a[href^="tel:"], a[href^="https://wa.me/"]');
      if (!link || !canMeasure() || typeof window.gtag !== 'function') return;
      window.gtag('event', 'contact_click', {
        contact_method: link.href.indexOf('tel:') === 0 ? 'phone' : 'whatsapp',
        page_path: window.location.pathname,
        service_interest: serviceFor(null)
      });
    }, true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

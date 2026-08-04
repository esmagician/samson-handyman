window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function () {
  window.dataLayer.push(arguments);
};
window.gtag('js', new Date());
window.gtag('config', 'AW-17897197249');

const SAMSON_TRACKING = {
  formSubmit: 'AW-17897197249/GH7eCKa30sccEMGdhtZC',
  contactClick: 'AW-17897197249/W58oCKm30sccEMGdhtZC'
};
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const ALLOWED_ATTACHMENT_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'];

function storeClickIds() {
  if (!window.SamsonConsent || !window.SamsonConsent.canMeasure()) return;
  const params = new URLSearchParams(window.location.search);
  try {
    ['gclid', 'gbraid', 'wbraid'].forEach((key) => {
      const value = params.get(key);
      if (value) localStorage.setItem(`samson_${key}`, value);
    });
  } catch (error) {
    // Tracking must never interrupt browsing when storage is unavailable.
  }
}

function hydrateClickIdFields() {
  if (!window.SamsonConsent || !window.SamsonConsent.canMeasure()) return;
  try {
    ['gclid', 'gbraid', 'wbraid'].forEach((key) => {
      const value = localStorage.getItem(`samson_${key}`);
      document.querySelectorAll(`[name="${key}"]`).forEach((field) => {
        if (value) field.value = value;
      });
    });
  } catch (error) {
    // Quote forms still work without advertising identifiers.
  }
}

function validateAttachment(form) {
  const field = form.querySelector('input[type="file"][name="attachment"]');
  if (!field) return true;
  field.setCustomValidity('');
  if (!field.files || !field.files.length) return true;

  const file = field.files[0];
  const lowerName = file.name.toLowerCase();
  const allowedExtension = ALLOWED_ATTACHMENT_EXTENSIONS.some((extension) => lowerName.endsWith(extension));
  if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type) && !allowedExtension) {
    field.setCustomValidity('Choose a JPG, PNG, WebP, HEIC or HEIF image.');
  } else if (file.size > MAX_ATTACHMENT_BYTES) {
    field.setCustomValidity('Choose an image smaller than 10 MB, or send larger photos by WhatsApp.');
  }

  if (!field.checkValidity()) {
    field.reportValidity();
    return false;
  }
  return true;
}

function ensureHiddenField(form, name) {
  let field = form.querySelector(`[name="${name}"]`);
  if (field) return field;

  field = document.createElement('input');
  field.type = 'hidden';
  field.name = name;
  form.appendChild(field);
  return field;
}

function createSubmissionToken() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function setSuccessRedirect(form) {
  const token = createSubmissionToken();
  ensureHiddenField(form, '_next').value =
    `https://www.samsonhandyman.com/thank-you/?submitted=${encodeURIComponent(token)}`;
  try {
    window.sessionStorage.setItem(`samson_pending_form_${token}`, '1');
  } catch (error) {
    // Continue when session storage is unavailable; the form still needs to submit.
  }
}

function reportAdsConversion(sendTo, url) {
  let navigated = false;
  const callback = function () {
    if (url && !navigated) {
      navigated = true;
      window.location = url;
    }
  };

  if (typeof window.gtag === 'function') {
    window.gtag('event', 'conversion', {
      send_to: sendTo,
      value: 1.0,
      currency: 'GBP',
      event_callback: callback
    });
    if (url) window.setTimeout(callback, 900);
    return false;
  }

  if (url) window.location = url;
  return true;
}

document.addEventListener('DOMContentLoaded', () => {
  storeClickIds();
  hydrateClickIdFields();

  window.addEventListener('samson:consent-changed', (event) => {
    if (event.detail && event.detail.measurement) {
      storeClickIds();
      hydrateClickIdFields();
    }
  });

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="tel:"], a[href^="https://wa.me/"]');
    if (!link) return;
    if (!window.SamsonConsent || !window.SamsonConsent.canMeasure()) return;
    event.preventDefault();
    reportAdsConversion(SAMSON_TRACKING.contactClick, link.href);
  });

  document.querySelectorAll('form[data-track-form="quote"]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      if (!validateAttachment(form) || !form.checkValidity()) {
        event.preventDefault();
        form.reportValidity();
        return;
      }
      event.preventDefault();
      setSuccessRedirect(form);
      form.submit();
    });

    const attachment = form.querySelector('input[type="file"][name="attachment"]');
    if (attachment) attachment.addEventListener('change', () => validateAttachment(form));
  });

  if (document.querySelector('[data-form-success]')) {
    const token = new URLSearchParams(window.location.search).get('submitted');
    if (token && token.length <= 120) {
      const storageKey = `samson_form_conversion_${token}`;
      let alreadyReported = false;
      try {
        const pendingKey = `samson_pending_form_${token}`;
        if (window.sessionStorage.getItem(pendingKey) !== '1') return;
        alreadyReported = window.sessionStorage.getItem(storageKey) === 'reported';
        if (!alreadyReported) window.sessionStorage.setItem(storageKey, 'reported');
        window.sessionStorage.removeItem(pendingKey);
      } catch (error) {
        return;
      }
      if (!alreadyReported) reportAdsConversion(SAMSON_TRACKING.formSubmit);
    }
  }
});

window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'AW-17897197249');

const SAMSON_TRACKING = {
  formSubmit: 'AW-17897197249/GH7eCKa30sccEMGdhtZC',
  contactClick: 'AW-17897197249/W58oCKm30sccEMGdhtZC'
};

function storeClickIds() {
  const params = new URLSearchParams(window.location.search);
  ['gclid', 'gbraid', 'wbraid'].forEach((key) => {
    const value = params.get(key);
    if (value) localStorage.setItem(`samson_${key}`, value);
  });
}

function hydrateClickIdFields() {
  ['gclid', 'gbraid', 'wbraid'].forEach((key) => {
    const field = document.querySelector(`[name="${key}"]`);
    const value = localStorage.getItem(`samson_${key}`);
    if (field && value) field.value = value;
  });
}

function reportAdsConversion(sendTo, url) {
  let navigated = false;
  const callback = function () {
    if (url && !navigated) {
      navigated = true;
      window.location = url;
    }
  };

  if (typeof gtag === 'function') {
    gtag('event', 'conversion', {
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

  document.querySelectorAll('a[href^="tel:"], a[href^="https://wa.me/"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      reportAdsConversion(SAMSON_TRACKING.contactClick, link.href);
    });
  });

  document.querySelectorAll('form[data-track-form="quote"]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      if (!form.checkValidity()) return;
      event.preventDefault();
      let submitted = false;
      const submitOnce = () => {
        if (submitted) return;
        submitted = true;
        form.submit();
      };
      gtag('event', 'conversion', {
        send_to: SAMSON_TRACKING.formSubmit,
        value: 1.0,
        currency: 'GBP',
        event_callback: submitOnce
      });
      window.setTimeout(submitOnce, 900);
    });
  });
});

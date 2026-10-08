(function () {
  'use strict';
  var configured = false;
  var productionHost = /^(www\.)?samsonhandyman\.com$/i.test(window.location.hostname);

  function configureAnalytics() {
    if (configured || !productionHost || !window.SamsonConsent || !window.SamsonConsent.canMeasure()) return;
    configured = true;
    if (!window.SamsonGoogleTagInitialised) {
      window.gtag('js', new Date());
      window.SamsonGoogleTagInitialised = true;
    }
    // The existing Google tag loads the library. Configure GA4 before page scripts
    // can report a confirmed enquiry, and keep previews out of the live property.
    window.gtag('config', 'G-LPJCTMQJGN', {
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
  }

  configureAnalytics();
  window.addEventListener('samson:consent-changed', configureAnalytics);
})();

(function () {
  'use strict';

  var form = document.querySelector('.agency-form');
  if (!form) return;

  var uploads = Array.from(form.querySelectorAll('input[type="file"]'));
  var maxTotalBytes = 10000000;

  function validateFiles(changedInput) {
    var total = 0;
    var lastUpload;
    uploads.forEach(function (input) {
      input.setCustomValidity('');
      var file = input.files[0];
      if (!file) return;
      total += file.size;
      lastUpload = input;
      if (input.name === 'checkout_report') {
        if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') {
          input.setCustomValidity('Choose a PDF checkout report.');
        }
      } else if (!/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name) &&
                 !/^image\/(jpeg|png|webp|heic|heif)$/.test(file.type)) {
        input.setCustomValidity('Choose a JPG, PNG, WebP, HEIC or HEIF photo.');
      }
    });
    if (total > maxTotalBytes) {
      var field = changedInput && changedInput.files.length ? changedInput : lastUpload;
      field.setCustomValidity('Choose smaller files totalling 10 MB or less, or email your report and photos.');
    }
  }

  form.addEventListener('change', function (event) {
    if (!uploads.includes(event.target)) return;
    validateFiles(event.target);
    event.target.reportValidity();
  });
  form.addEventListener('invalid', function (event) {
    var details = event.target.closest('details');
    if (details) details.open = true;
  }, true);
  form.addEventListener('submit', function (event) {
    validateFiles();
    if (!form.reportValidity()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
  form.addEventListener('reset', function () {
    uploads.forEach(function (input) { input.setCustomValidity(''); });
  });
})();

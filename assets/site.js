document.addEventListener('DOMContentLoaded', () => {
  const service = document.body.dataset.service || '';
  document.querySelectorAll('[data-service-field]').forEach((field) => {
    field.value = service;
  });
});

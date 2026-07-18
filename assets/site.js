document.addEventListener('DOMContentLoaded', () => {
  const service = document.body.dataset.service || '';
  document.querySelectorAll('[data-service-field]').forEach((field) => {
    field.value = service;
  });

  const header = document.querySelector('.site-header');
  const brand = header && header.querySelector('.brand');
  const nav = header && header.querySelector('.nav');

  if (header && brand && nav) {
    const oldMark = brand.querySelector('.brand-mark');
    if (oldMark) {
      const logo = document.createElement('img');
      logo.src = '/assets/logo.png';
      logo.width = 52;
      logo.height = 52;
      logo.alt = '';
      oldMark.replaceWith(logo);
    }

    nav.innerHTML = [
      '<a href="/#services">Services</a>',
      '<a href="/photos/">Work</a>',
      '<a href="/#proof">Reviews</a>',
      '<a href="/#areas">Areas</a>',
      '<a href="/contact/">Contact</a>'
    ].join('');

    if (!header.querySelector('.header-call')) {
      const call = document.createElement('a');
      call.className = 'header-call';
      call.href = 'tel:+447912758192';
      call.textContent = '07912 758192';
      header.appendChild(call);
    }

    const toggle = document.createElement('button');
    toggle.className = 'nav-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Open navigation');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<span></span><span></span><span></span>';
    header.appendChild(toggle);

    const closeNavigation = () => {
      header.classList.remove('nav-open');
      document.body.classList.remove('menu-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation');
    };

    toggle.addEventListener('click', () => {
      const isOpen = header.classList.toggle('nav-open');
      document.body.classList.toggle('menu-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    });
    nav.addEventListener('click', closeNavigation);
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) closeNavigation();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeNavigation();
    });
  }

  const mobileActions = document.createElement('nav');
  mobileActions.className = 'mobile-actions';
  mobileActions.setAttribute('aria-label', 'Quick contact');
  mobileActions.innerHTML = '<a href="tel:+447912758192">Call Samson</a><a href="https://wa.me/447912758192">WhatsApp</a>';
  document.body.appendChild(mobileActions);

  const updateMobileActions = () => {
    mobileActions.classList.toggle('is-visible', window.scrollY > 280);
  };
  updateMobileActions();
  window.addEventListener('scroll', updateMobileActions, { passive: true });
});

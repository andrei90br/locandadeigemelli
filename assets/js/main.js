// Menu mobile e header che cambia stile allo scroll.
(() => {
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    header.classList.toggle('is-open', open);
    document.body.classList.toggle('no-scroll', open);
  };

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });

  // Richiesta appartamenti: i campi data mostrano l'etichetta finché sono vuoti, come nei siti degli hotel.
  const form = document.querySelector('[data-request-form]');
  const aptSelect = form.querySelector('[data-apt-select]');
  const arrival = form.querySelector('[data-arrival]');
  const departure = form.querySelector('[data-departure]');
  const today = new Date().toISOString().slice(0, 10);
  const nextDay = (value) => { const d = new Date(value + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10); };

  form.querySelectorAll('[data-date]').forEach((input) => {
    input.addEventListener('focus', () => {
      input.type = 'date';
      input.min = input === departure && arrival.value ? nextDay(arrival.value) : today;
      try { input.showPicker(); } catch (e) { /* non supportato */ }
    });
    input.addEventListener('blur', () => { if (!input.value) input.type = 'text'; });
  });
  arrival.addEventListener('change', () => {
    if (arrival.value && departure.value && departure.value <= arrival.value) departure.value = '';
  });
  form.addEventListener('submit', (e) => {
    if (departure.value <= arrival.value) {
      e.preventDefault();
      departure.type = 'date';
      departure.setCustomValidity(' ');
      departure.reportValidity();
      departure.setCustomValidity('');
      return;
    }
    form.querySelector('[data-nights-input]').value = Math.round((new Date(departure.value) - new Date(arrival.value)) / 86400000);
  });

  document.querySelectorAll('[data-apt]').forEach((link) =>
    link.addEventListener('click', () => { aptSelect.value = link.dataset.apt; })
  );
  if (new URLSearchParams(location.search).get('richiesta') === 'inviata') {
    document.querySelector('[data-request-sent]').hidden = false;
    form.hidden = true;
    window.addEventListener('load', () => document.getElementById('richiesta').scrollIntoView({ behavior: 'instant' }));
  }
})();

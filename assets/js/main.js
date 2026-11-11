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

  // Richiesta appartamenti: barra stile hotel (date, ospiti, appartamento), poi dati dell'ospite.
  const form = document.querySelector('[data-request-form]');
  const aptSelect = form.querySelector('[data-apt-select]');
  const arrival = form.querySelector('[data-arrival]');
  const departure = form.querySelector('[data-departure]');
  const nightsOut = form.querySelector('[data-nights]');
  const nightsInput = form.querySelector('[data-nights-input]');
  const details = form.querySelector('[data-step-details]');
  const summary = form.querySelector('[data-summary]');

  const iso = (d) => d.toISOString().slice(0, 10);
  const addDays = (value, n) => { const d = new Date(value + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
  arrival.min = iso(new Date());
  departure.min = addDays(arrival.min, 1);

  const nights = () => {
    if (!arrival.value || !departure.value) return 0;
    return Math.round((new Date(departure.value) - new Date(arrival.value)) / 86400000);
  };
  const update = () => {
    const n = nights();
    nightsOut.textContent = n > 0 ? n : '–';
    nightsInput.value = n > 0 ? n : '';
  };
  arrival.addEventListener('change', () => {
    if (!arrival.value) return;
    departure.min = addDays(arrival.value, 1);
    if (!departure.value || departure.value <= arrival.value) departure.value = addDays(arrival.value, 1);
    update();
  });
  departure.addEventListener('change', update);

  details.hidden = true;
  form.querySelector('[data-continue]').addEventListener('click', () => {
    if (!arrival.reportValidity() || !departure.reportValidity()) return;
    if (nights() < 1) { departure.setCustomValidity(' '); departure.reportValidity(); departure.setCustomValidity(''); return; }
    const parts = [...form.querySelectorAll('[data-step-stay] .bk-cell')].map((cell) => {
      const label = cell.querySelector('.bk-label').textContent;
      const field = cell.querySelector('select, input');
      const value = field ? (field.tagName === 'SELECT' ? field.selectedOptions[0].textContent : new Date(field.value + 'T12:00:00Z').toLocaleDateString(document.documentElement.lang, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })) : cell.querySelector('.bk-value').textContent;
      return `${label}: ${value}`;
    });
    summary.textContent = parts.join(' · ');
    details.hidden = false;
    form.querySelector('input[name="Nome"]').focus();
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

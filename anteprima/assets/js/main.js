// Header, menu mobile, date, barra di prenotazione, modulo richiesta e galleria.
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
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });

  // Date: il campo mostra l'etichetta finché è vuoto, poi diventa un selettore di data.
  const today = new Date().toISOString().slice(0, 10);
  const nextDay = (v) => { const d = new Date(v + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10); };
  const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v || '');

  const setupDates = (form) => {
    const arrival = form.querySelector('[data-arrival]');
    const departure = form.querySelector('[data-departure]');
    if (!arrival || !departure) return null;
    form.querySelectorAll('[data-date]').forEach((input) => {
      if (input.value) input.type = 'date';
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
    const checkOrder = (e) => {
      if (departure.value && arrival.value && departure.value <= arrival.value) {
        e.preventDefault();
        departure.type = 'date';
        departure.setCustomValidity(' ');
        departure.reportValidity();
        departure.setCustomValidity('');
        return false;
      }
      return true;
    };
    return { arrival, departure, checkOrder };
  };

  document.querySelectorAll('[data-booking-bar]').forEach((bar) => {
    const d = setupDates(bar);
    bar.addEventListener('submit', (e) => d && d.checkOrder(e));
  });

  // Modulo richiesta: precompilato dai parametri della barra o dal link dell'appartamento.
  const form = document.querySelector('[data-request-form]');
  if (form) {
    const params = new URLSearchParams(location.search);
    const set = (sel, value) => {
      const el = form.querySelector(sel);
      if (!el || value == null || value === '') return;
      if (el.tagName === 'SELECT' && ![...el.options].some((o) => o.value === value || o.text === value)) return;
      el.value = value;
    };
    if (isDate(params.get('arrivo'))) set('[data-arrival]', params.get('arrivo'));
    if (isDate(params.get('partenza'))) set('[data-departure]', params.get('partenza'));
    set('[data-adults]', params.get('adulti'));
    set('[data-children]', params.get('bambini'));
    set('[data-apt-select]', params.get('apt'));

    const d = setupDates(form);
    form.addEventListener('submit', (e) => {
      if (!d.checkOrder(e)) return;
      form.querySelector('[data-nights-input]').value =
        Math.round((new Date(d.departure.value) - new Date(d.arrival.value)) / 86400000);
    });

    if (params.get('richiesta') === 'inviata') {
      document.querySelector('[data-request-sent]').hidden = false;
      form.hidden = true;
    }
  }

  // Galleria con lightbox.
  const dialog = document.querySelector('[data-lightbox-dialog]');
  if (dialog && typeof dialog.showModal === 'function') {
    const img = dialog.querySelector('img');
    document.querySelectorAll('[data-lightbox]').forEach((link) =>
      link.addEventListener('click', (e) => {
        e.preventDefault();
        img.src = link.href;
        img.alt = link.querySelector('img').alt;
        dialog.showModal();
      })
    );
    dialog.addEventListener('click', () => dialog.close());
  }
})();

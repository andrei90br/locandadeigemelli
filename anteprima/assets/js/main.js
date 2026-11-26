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

    // Età dei bambini: un campo obbligatorio per ogni bambino indicato.
    const children = form.querySelector('[data-children]');
    const agesBox = form.querySelector('[data-ages]');
    const ages = [...form.querySelectorAll('[data-child-age]')];
    const updateAges = () => {
      const n = parseInt(children.value, 10) || 0;
      agesBox.hidden = n === 0;
      ages.forEach((select, i) => {
        const on = i < n;
        select.hidden = !on;
        select.disabled = !on;
      });
    };
    children.addEventListener('change', updateAges);
    updateAges();

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

  // Galleria con lightbox: frecce, tastiera e swipe.
  const dialog = document.querySelector('[data-lightbox-dialog]');
  if (dialog && typeof dialog.showModal === 'function') {
    const img = dialog.querySelector('img');
    const caption = dialog.querySelector('[data-caption]');
    const links = [...document.querySelectorAll('[data-lightbox]')];
    let index = 0;
    const show = (i) => {
      index = (i + links.length) % links.length;
      const link = links[index];
      img.src = link.href;
      img.alt = link.querySelector('img').alt;
      caption.textContent = `${img.alt}  ·  ${index + 1} / ${links.length}`;
      // Precarica la foto successiva.
      new Image().src = links[(index + 1) % links.length].href;
    };
    links.forEach((link, i) =>
      link.addEventListener('click', (e) => {
        e.preventDefault();
        show(i);
        dialog.showModal();
      })
    );
    dialog.querySelector('[data-prev]').addEventListener('click', (e) => { e.stopPropagation(); show(index - 1); });
    dialog.querySelector('[data-next]').addEventListener('click', (e) => { e.stopPropagation(); show(index + 1); });
    img.addEventListener('click', (e) => { e.stopPropagation(); show(index + 1); });
    dialog.addEventListener('click', () => dialog.close());
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });
    let startX = null;
    dialog.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    dialog.addEventListener('touchend', (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
      startX = null;
    });
  }
})();

// Mappa Google: caricata solo quando il visitatore clicca (niente cookie Google prima del consenso).
document.querySelectorAll('[data-map]').forEach((box) => {
  box.querySelector('[data-map-load]').addEventListener('click', () => {
    const f = document.createElement('iframe');
    f.src = box.dataset.map;
    f.title = box.dataset.title;
    f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    f.allowFullscreen = true;
    box.replaceChildren(f);
    box.classList.add('is-loaded');
  });
});

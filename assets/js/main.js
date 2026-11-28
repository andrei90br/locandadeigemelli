// Header, menu mobile, date, barra di prenotazione, moduli (appartamenti e tavolo) e galleria.
(() => {
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Menu mobile: il pulsante viene prima del menu, così Tab entra nelle voci; Esc chiude e torna al pulsante.
  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? toggle.dataset.labelClose : toggle.dataset.labelOpen);
    header.classList.toggle('is-open', open);
    document.body.classList.toggle('no-scroll', open);
  };
  toggle.addEventListener('click', () => setOpen(!isOpen()));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !isOpen()) return;
    const inside = nav.contains(document.activeElement);
    setOpen(false);
    if (inside) toggle.focus();
  });
  document.addEventListener('click', (e) => { if (isOpen() && !header.contains(e.target)) setOpen(false); });

  // ---------- date ----------
  const iso = (d) => d.toISOString().slice(0, 10);
  const today = iso(new Date());
  const nextDay = (v) => { const d = new Date(v + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + 1); return iso(d); };
  const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v || '');
  const weekday = (v) => new Date(v + 'T12:00:00Z').getUTCDay();
  // Formato leggibile per l'email: "dom 10/01/2027".
  const human = (v) => {
    const d = new Date(v + 'T12:00:00Z');
    return `${['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'][d.getUTCDay()]} ${v.slice(8, 10)}/${v.slice(5, 7)}/${v.slice(0, 4)}`;
  };

  const setupDates = (form) => {
    const arrival = form.querySelector('[data-arrival]');
    const departure = form.querySelector('[data-departure]');
    form.querySelectorAll('[data-date]').forEach((input) => {
      input.min = today;
      // Il calendario si apre solo con un clic o un tocco, mai con il Tab da tastiera.
      input.addEventListener('pointerup', () => { try { input.showPicker(); } catch (e) { /* non supportato */ } });
    });
    if (!arrival || !departure) return;
    const sync = () => {
      departure.min = isDate(arrival.value) ? nextDay(arrival.value) : today;
      if (isDate(arrival.value) && isDate(departure.value) && departure.value <= arrival.value) departure.value = nextDay(arrival.value);
    };
    arrival.addEventListener('change', sync);
    sync();
  };

  // ---------- validazione con messaggi nella lingua della pagina ----------
  const msg = (form, key) => form.dataset['msg' + key[0].toUpperCase() + key.slice(1)] || '';
  const fieldError = (form, el) => {
    if (el.disabled || el.hidden) return '';
    const v = el.value.trim();
    if (el.type === 'checkbox') return el.required && !el.checked ? msg(form, 'privacy') : '';
    if (el.required && !v) return msg(form, el.tagName === 'SELECT' ? 'choose' : 'required');
    if (!v) return '';
    if (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return msg(form, 'email');
    if (el.type === 'date') {
      if (!isDate(v) || v < today) return msg(form, 'past');
      if (el.matches('[data-departure]')) {
        const a = form.querySelector('[data-arrival]').value;
        if (isDate(a) && v <= a) return msg(form, 'departure');
      }
      if (form.dataset.closedDay && weekday(v) === Number(form.dataset.closedDay)) return msg(form, 'tuesday');
    }
    return '';
  };
  let uid = 0;
  const showError = (el, text) => {
    const box = el.closest('label.rf-field, label.bb-field, label.rf-check') || el;
    let err = box.nextElementSibling && box.nextElementSibling.matches('.field-error') ? box.nextElementSibling : null;
    if (!text) {
      el.removeAttribute('aria-invalid');
      if (err) err.remove();
      return;
    }
    if (!err) {
      err = document.createElement('p');
      err.className = 'field-error';
      err.id = 'err-' + ++uid;
      box.after(err);
    }
    err.textContent = text;
    el.setAttribute('aria-invalid', 'true');
    el.setAttribute('aria-describedby', err.id);
  };
  const validate = (form) => {
    let first = null;
    form.querySelectorAll('input:not([type="hidden"]):not([name="_honey"]), select, textarea').forEach((el) => {
      const text = fieldError(form, el);
      showError(el, text);
      if (text && !first) first = el;
    });
    if (first) first.focus();
    return !first;
  };
  document.querySelectorAll('[data-validate]').forEach((form) => {
    setupDates(form);
    // Dopo il primo errore, il messaggio sparisce appena il campo è corretto.
    form.addEventListener('change', (e) => { if (e.target.hasAttribute('aria-invalid')) showError(e.target, fieldError(form, e.target)); });
    form.addEventListener('input', (e) => { if (e.target.hasAttribute('aria-invalid')) showError(e.target, fieldError(form, e.target)); });
  });

  document.querySelectorAll('[data-booking-bar]').forEach((bar) => {
    bar.addEventListener('submit', (e) => { if (!validate(bar)) e.preventDefault(); });
  });

  // ---------- moduli inviati con FormSubmit (richiesta appartamenti e tavolo) ----------
  const params = new URLSearchParams(location.search);
  document.querySelectorAll('[data-request-form]').forEach((form) => {
    const key = 'bozza:' + location.pathname + ':' + form.dataset.sentParam;
    const btn = form.querySelector('[type="submit"]');
    const btnText = btn.textContent;
    const fields = () => [...form.elements].filter((el) => el.name && !el.name.startsWith('_') && el.type !== 'hidden' && el.type !== 'checkbox');
    const store = {
      get: () => { try { return JSON.parse(sessionStorage.getItem(key) || 'null'); } catch (e) { return null; } },
      set: (v) => { try { sessionStorage.setItem(key, JSON.stringify(v)); } catch (e) { /* storage non disponibile */ } },
      clear: () => { try { sessionStorage.removeItem(key); } catch (e) { /* storage non disponibile */ } },
    };

    // Richiesta inviata: messaggio di grazie al posto del modulo, letto anche dagli screen reader.
    if (params.has(form.dataset.sentParam)) {
      store.clear();
      const sent = form.parentElement.querySelector('[data-request-sent]');
      sent.hidden = false;
      form.hidden = true;
      document.title = sent.textContent.trim().split(/[.!]/)[0] + ' | ' + document.title;
      sent.focus();
      return;
    }

    const set = (sel, value) => {
      const el = form.querySelector(sel);
      if (!el || value == null || value === '') return;
      if (el.tagName === 'SELECT' && ![...el.options].some((o) => o.value === value || o.text === value)) return;
      el.value = value;
    };
    // Bozza salvata (per esempio tornando indietro dopo un errore), poi i parametri della barra o del link.
    const draft = store.get();
    if (draft) fields().forEach((el) => { if (draft[el.name] != null && !el.value) set(`[name="${el.name}"]`, draft[el.name]); });
    if (isDate(params.get('arrivo'))) set('[data-arrival]', params.get('arrivo'));
    if (isDate(params.get('partenza'))) set('[data-departure]', params.get('partenza'));
    set('[data-adults]', params.get('adulti'));
    set('[data-children]', params.get('bambini'));
    set('[data-apt-select]', params.get('apt'));
    form.addEventListener('input', () => store.set(Object.fromEntries(fields().map((el) => [el.name, el.value]))));

    // Età dei bambini: un campo obbligatorio per ogni bambino indicato.
    const children = form.querySelector('[data-children]');
    const agesBox = form.querySelector('[data-ages]');
    const ages = [...form.querySelectorAll('[data-child-age]')];
    const updateAges = () => {
      if (!children) return;
      const n = parseInt(children.value, 10) || 0;
      agesBox.hidden = n === 0;
      ages.forEach((select, i) => { select.hidden = select.disabled = i >= n; });
    };
    if (children) children.addEventListener('change', updateAges);
    updateAges();

    let sending = false;
    const reset = () => {
      sending = false;
      btn.disabled = false;
      btn.removeAttribute('aria-busy');
      btn.textContent = btnText;
      form.querySelectorAll('[data-fallback]').forEach((x) => x.remove());
      updateAges();
      form.querySelector('[data-arrival]')?.dispatchEvent(new Event('change'));
    };
    // Tornando indietro (anche dalla cache del browser) il modulo torna utilizzabile, con età e date coerenti.
    window.addEventListener('pageshow', reset);

    form.addEventListener('submit', (e) => {
      updateAges();
      if (sending || !validate(form)) { e.preventDefault(); return; }
      // Valori leggibili nell'email: campi lasciati vuoti e periodo del soggiorno.
      form.querySelectorAll('[data-default]').forEach((sel) => {
        if (sel.value) return;
        const h = Object.assign(document.createElement('input'), { type: 'hidden', name: sel.name, value: sel.dataset.default });
        h.dataset.fallback = '';
        sel.after(h);
      });
      const a = form.querySelector('[data-arrival]'), d = form.querySelector('[data-departure]'), stay = form.querySelector('[data-stay-input]');
      if (a && d && stay) {
        const nights = Math.round((new Date(d.value) - new Date(a.value)) / 86400000);
        stay.value = `${human(a.value)} – ${human(d.value)} (${nights} ${nights === 1 ? 'notte' : 'notti'})`;
      }
      const day = form.querySelector('[data-single-date]'), dayOut = form.querySelector('[data-day-input]');
      if (day && dayOut) dayOut.value = human(day.value);
      // Un solo invio: il pulsante si blocca e mostra che l'invio è in corso.
      sending = true;
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      btn.textContent = form.dataset.msgSending;
    });
  });

  // ---------- galleria con lightbox: frecce, tastiera e swipe ----------
  const dialog = document.querySelector('[data-lightbox-dialog]');
  if (dialog && typeof dialog.showModal === 'function') {
    const img = dialog.querySelector('img');
    const caption = dialog.querySelector('[data-caption]');
    const links = [...document.querySelectorAll('[data-lightbox]')];
    let index = 0;
    let label = '';
    img.addEventListener('load', () => { dialog.classList.remove('is-loading'); caption.textContent = label; });
    img.addEventListener('error', () => { dialog.classList.remove('is-loading'); caption.textContent = `${dialog.dataset.imgError} · ${label}`; });
    const show = (i) => {
      index = (i + links.length) % links.length;
      const link = links[index];
      label = `${link.querySelector('img').alt}  ·  ${index + 1} / ${links.length}`;
      dialog.classList.add('is-loading');
      img.alt = link.querySelector('img').alt;
      img.src = link.href;
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
    dialog.querySelector('[data-close]').addEventListener('click', (e) => { e.stopPropagation(); dialog.close(); });
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
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    f.allowFullscreen = true;
    box.replaceChildren(f);
    box.classList.add('is-loaded');
    f.focus();
  });
});

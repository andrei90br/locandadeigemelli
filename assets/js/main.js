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

  // Richiesta appartamenti: preseleziona l'appartamento e mostra la conferma dopo l'invio.
  const aptSelect = document.querySelector('[data-apt-select]');
  document.querySelectorAll('[data-apt]').forEach((link) =>
    link.addEventListener('click', () => { aptSelect.value = link.dataset.apt; })
  );
  if (new URLSearchParams(location.search).get('richiesta') === 'inviata') {
    document.querySelector('[data-request-sent]').hidden = false;
    document.querySelector('[data-request-form]').hidden = true;
    window.addEventListener('load', () => document.getElementById('richiesta').scrollIntoView({ behavior: 'instant' }));
  }
})();

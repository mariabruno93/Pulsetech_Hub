// ─────────────────────────────────────────
//  PULSE TECH HUB — Corporate
//  Minimal interactivity: nav scroll, reveal on scroll, access form.
// ─────────────────────────────────────────

/* Nav scroll state */
(function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile toggle
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');
  const cta    = document.querySelector('.nav-cta');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = links.style.display === 'flex';
      const panel = open ? 'none' : 'flex';
      links.style.display = panel;
      if (cta) cta.style.display = open ? 'none' : 'inline-flex';
      links.style.flexDirection = 'column';
      links.style.position = 'absolute';
      links.style.top = '100%';
      links.style.left = '0';
      links.style.right = '0';
      links.style.background = 'rgba(5, 12, 24, 0.98)';
      links.style.padding = '1.4rem 1.8rem';
      links.style.gap = '1.1rem';
      links.style.borderTop = '1px solid var(--border-soft)';
    });
  }
})();

/* Reveal on scroll */
(function initReveal() {
  const targets = document.querySelectorAll(
    '.hero-inner, .manifesto-inner, .section-head, .capability, .partner-mark, .access-inner, .footer-inner'
  );
  targets.forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i * 40, 240)}ms`;
    io.observe(el);
  });
})();

/* Access form */
(function initAccessForm() {
  const form = document.getElementById('access-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    // Basic validation
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(input => {
      if (!input.value.trim()) { valid = false; input.style.borderBottomColor = '#8A919E'; }
    });
    if (!valid) return;

    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.disabled = true;
    btn.style.opacity = '0.85';
    btn.textContent = 'Request received';

    setTimeout(() => {
      form.reset();
      btn.disabled = false;
      btn.style.opacity = '';
      btn.textContent = original;
    }, 3200);
  });
})();

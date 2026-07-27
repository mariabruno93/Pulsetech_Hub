// ─────────────────────────────────────────
//  PULSE TECH HUB — Corporate
//  Minimal interactivity: hero ambient particles, nav scroll,
//  reveal on scroll, access form.
// ─────────────────────────────────────────

/* Hero ambient particles — silver / cool tones, very low density,
   slow drift. Pauses when the hero scrolls out of view or the tab
   is hidden, so it never burns CPU. */
(function initHeroParticles() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], visible = true, running = true;
  const isMobile = () => window.innerWidth < 768;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const rect = canvas.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function rand(a, b) { return a + Math.random() * (b - a); }

  function seed() {
    const count = isMobile() ? 28 : 60;
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: rand(0, W),
        y: rand(0, H),
        r: rand(0.5, 1.4),
        vx: rand(-0.06, 0.06),
        vy: rand(-0.04, 0.04),
        phase: rand(0, Math.PI * 2),
        speed: rand(0.0008, 0.002),
        // Cool-tone: silver/pale-blue tint, subtle variance
        tint: rand(0, 1) < 0.7 ? 'silver' : 'blue',
      });
    }
  }

  function step() {
    if (!running || !visible) return;
    ctx.clearRect(0, 0, W, H);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.phase += p.speed * 16;

      if (p.x < -5)  p.x = W + 5;
      if (p.x > W + 5) p.x = -5;
      if (p.y < -5)  p.y = H + 5;
      if (p.y > H + 5) p.y = -5;

      const a = 0.18 + 0.32 * Math.abs(Math.sin(p.phase));
      const color = p.tint === 'silver'
        ? `rgba(198,204,212,${a})`
        : `rgba(170,190,215,${a * 0.85})`;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      // Occasional subtle highlight bloom on the brightest particles
      if (p.r > 1.1 && a > 0.42) {
        ctx.fillStyle = `rgba(198,204,212,${(a - 0.4) * 0.2})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    requestAnimationFrame(step);
  }

  function start() {
    if (running) return;
    running = true;
    requestAnimationFrame(step);
  }
  function stop() { running = false; }

  // Pause when the hero scrolls out of view
  const hero = canvas.closest('.hero');
  if (hero && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { visible = e.isIntersecting; });
      if (visible) requestAnimationFrame(step);
    }, { threshold: 0 });
    io.observe(hero);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else { start(); }
  });

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(step);
})();

/* Nav scroll state */
(function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile toggle
  const toggle  = document.querySelector('.nav-toggle');
  const links   = document.querySelector('.nav-links');
  const actions = document.querySelector('.nav-actions');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = links.style.display === 'flex';
      const panel = open ? 'none' : 'flex';
      links.style.display = panel;
      if (actions) actions.style.display = open ? 'none' : 'flex';
      links.style.flexDirection = 'column';
      links.style.position = 'absolute';
      links.style.top = '100%';
      links.style.left = '0';
      links.style.right = '0';
      links.style.background = 'rgba(5, 12, 24, 0.98)';
      links.style.padding = '1.4rem 1.8rem';
      links.style.gap = '1.1rem';
      links.style.borderTop = '1px solid var(--border-soft)';
      if (actions) {
        actions.style.position = 'absolute';
        actions.style.top = 'calc(100% + 9rem)';
        actions.style.left = '0';
        actions.style.right = '0';
        actions.style.background = 'rgba(5, 12, 24, 0.98)';
        actions.style.padding = '0 1.8rem 1.4rem';
        actions.style.gap = '1rem';
        actions.style.flexDirection = 'column';
        actions.style.alignItems = 'stretch';
      }
    });
  }
})();

/* Login form (always-deny) */
(function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(input => {
      if (!input.value.trim()) {
        valid = false;
        input.style.borderBottomColor = 'var(--silver-dim)';
      }
    });
    if (!valid) return;

    // Always treat as "not registered". Hide the form + helper, reveal
    // the rejection panel which links to the Request Access flow.
    form.hidden = true;
    const help = document.querySelector('.login-help');
    if (help) help.hidden = true;
    const message = document.getElementById('login-message');
    if (message) message.hidden = false;
  });
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

/* Access form — posts to FormSubmit AJAX so submissions arrive in the
   configured inbox without leaving the page. If the AJAX call fails
   (network, misconfig, etc.) we fall back to a regular form submit so
   nothing is silently lost. */
(function initAccessForm() {
  const form = document.getElementById('access-form');
  if (!form) return;

  const ENDPOINT = 'https://formsubmit.co/ajax/pulsetechhubllc@gmail.com';

  form.addEventListener('submit', async e => {
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
    btn.textContent = 'Sending…';

    let ok = false;
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form),
      });
      ok = res.ok;
    } catch (_err) {
      ok = false;
    }

    if (ok) {
      btn.textContent = 'Request received';
      form.reset();
    } else {
      btn.textContent = 'Please try again';
    }

    setTimeout(() => {
      btn.disabled = false;
      btn.style.opacity = '';
      btn.textContent = original;
    }, 3200);
  });
})();

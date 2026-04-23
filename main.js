// ─────────────────────────────────────────
//  PULSE TECH HUB — main.js
// ─────────────────────────────────────────

/* ── Circuit Canvas ── */
(function initCircuit() {
  const canvas = document.getElementById('circuit-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, nodes = [], lines = [];

  const RED    = '#ff2200';
  const REDLOW = '#cc1a00';

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildGraph();
  }

  function rand(a, b) { return a + Math.random() * (b - a); }

  function buildGraph() {
    nodes = [];
    lines = [];
    const cols = Math.ceil(W / 120);
    const rows = Math.ceil(H / 120);
    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        nodes.push({
          x: c * 120 + rand(-20, 20),
          y: r * 120 + rand(-20, 20),
          pulse: rand(0, Math.PI * 2),
          speed: rand(0.008, 0.025),
        });
      }
    }
    nodes.forEach((n, i) => {
      const neighbors = nodes
        .map((m, j) => ({ j, d: Math.hypot(m.x - n.x, m.y - n.y) }))
        .filter(({ j, d }) => j !== i && d < 200)
        .sort((a, b) => a.d - b.d)
        .slice(0, 3);
      neighbors.forEach(({ j }) => {
        if (!lines.find(l =>
          (l.a === i && l.b === j) || (l.a === j && l.b === i)
        )) {
          lines.push({ a: i, b: j, offset: rand(0, Math.PI * 2) });
        }
      });
    });
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    const ts = t * 0.001;

    lines.forEach(({ a, b, offset }) => {
      const na = nodes[a], nb = nodes[b];
      const alpha = 0.25 + 0.15 * Math.sin(ts * 0.5 + offset);
      ctx.strokeStyle = `rgba(180,20,0,${alpha})`;
      ctx.lineWidth   = 0.6;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);

      // right-angle circuit routing
      const mx = na.x + (nb.x - na.x) * 0.5;
      ctx.lineTo(mx, na.y);
      ctx.lineTo(mx, nb.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();

      // tiny square junction
      ctx.fillStyle = `rgba(180,20,0,${alpha * 1.5})`;
      ctx.fillRect(mx - 2, na.y - 2, 4, 4);
      ctx.fillRect(mx - 2, nb.y - 2, 4, 4);
    });

    nodes.forEach(n => {
      n.pulse += n.speed;
      const a = 0.4 + 0.4 * Math.abs(Math.sin(n.pulse));
      ctx.fillStyle = `rgba(255,34,0,${a})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 2.5, 0, Math.PI * 2);
      ctx.fill();

      if (Math.abs(Math.sin(n.pulse)) > 0.92) {
        ctx.strokeStyle = `rgba(255,34,0,${a * 0.4})`;
        ctx.lineWidth   = 0.5;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 10 + 8 * Math.abs(Math.sin(n.pulse)), 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(draw);
})();

/* ── Typewriter effect ── */
(function initTyper() {
  const el = document.getElementById('typed');
  const lines = [
    'Tecnología que impulsa tu negocio.',
    'Innovación. Velocidad. Precisión.',
    'Soluciones que nunca dejan de pulsar.',
    'El futuro digital, hoy.',
  ];
  let li = 0, ci = 0, deleting = false;

  function tick() {
    const line = lines[li];
    if (!deleting) {
      el.textContent = line.slice(0, ++ci);
      if (ci === line.length) { deleting = true; setTimeout(tick, 2200); return; }
      setTimeout(tick, 60);
    } else {
      el.textContent = line.slice(0, --ci);
      if (ci === 0) { deleting = false; li = (li + 1) % lines.length; setTimeout(tick, 400); return; }
      setTimeout(tick, 30);
    }
  }
  setTimeout(tick, 800);
})();

/* ── Nav scroll class ── */
(function initNav() {
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });

  // Mobile toggle
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = links.style.display === 'flex';
      links.style.display = open ? 'none' : 'flex';
      links.style.flexDirection = 'column';
      links.style.position = 'absolute';
      links.style.top = '100%';
      links.style.left = '0';
      links.style.right = '0';
      links.style.background = 'rgba(5,5,5,0.98)';
      links.style.padding = '1rem 2rem';
      links.style.gap = '1.2rem';
    });
  }
})();

/* ── Counter animation ── */
(function initCounters() {
  const els = document.querySelectorAll('.stat-num');
  const io  = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el     = e.target;
      const target = +el.dataset.target;
      const dur    = 1600;
      const step   = 16;
      const inc    = target / (dur / step);
      let cur      = 0;
      const t = setInterval(() => {
        cur = Math.min(cur + inc, target);
        el.textContent = Math.round(cur);
        if (cur >= target) clearInterval(t);
      }, step);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  els.forEach(el => io.observe(el));
})();

/* ── Card entrance animation ── */
(function initCards() {
  const cards = document.querySelectorAll('.service-card');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.animation = 'card-appear 0.5s ease forwards';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  cards.forEach((c, i) => {
    c.style.opacity = '0';
    c.style.animationDelay = `${i * 0.08}s`;
    io.observe(c);
  });
})();

/* ── Contact form ── */
(function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    const original = btn.innerHTML;
    btn.innerHTML = '<span class="btn-led"></span><span>SEÑAL ENVIADA</span>';
    btn.style.borderColor = '#00ff88';
    btn.style.color       = '#00ff88';
    setTimeout(() => {
      btn.innerHTML  = original;
      btn.style.borderColor = '';
      btn.style.color       = '';
      form.reset();
    }, 3000);
  });
})();

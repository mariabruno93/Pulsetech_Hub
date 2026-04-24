// ─────────────────────────────────────────
//  PULSE TECH HUB — main.js
//  Heart beating in the void · synapse network
// ─────────────────────────────────────────

const BEAT_MS = 833;          // 72 bpm
const LUB_AT  = 0.10 * BEAT_MS;
const DUB_AT  = 0.32 * BEAT_MS;

/* ── Cosmos: polvo estelar + red de sinapsis ── */
(function initCosmos() {
  const canvas = document.getElementById('cosmos-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, cx, cy, stars = [], nodes = [], lines = [];
  const isMobile = () => window.innerWidth < 768;

  function rand(a, b) { return a + Math.random() * (b - a); }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = W / 2;
    cy = H * 0.42;
    build();
  }

  function build() {
    // Stardust
    const starCount = isMobile() ? 80 : 180;
    stars = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: rand(0, W),
        y: rand(0, H),
        r: rand(0.3, 1.4),
        phase: rand(0, Math.PI * 2),
        speed: rand(0.0003, 0.0012),
        drift: rand(0.02, 0.08),
      });
    }

    // Synapse network: nodes distributed radially around the heart
    const nodeCount = isMobile() ? 32 : 70;
    nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      const angle = rand(0, Math.PI * 2);
      const radius = rand(180, Math.max(W, H) * 0.65);
      const nx = cx + Math.cos(angle) * radius;
      const ny = cy + Math.sin(angle) * radius * 0.8;
      nodes.push({
        x: nx,
        y: ny,
        baseX: nx,
        baseY: ny,
        r: rand(1.2, 2.5),
        dist: Math.hypot(nx - cx, ny - cy),
        phase: rand(0, Math.PI * 2),
        lit: 0,
      });
    }

    // Connect each node to its 2-3 nearest neighbors
    lines = [];
    nodes.forEach((n, i) => {
      const neighbors = nodes
        .map((m, j) => ({ j, d: Math.hypot(m.x - n.x, m.y - n.y) }))
        .filter(({ j, d }) => j !== i && d < (isMobile() ? 180 : 220))
        .sort((a, b) => a.d - b.d)
        .slice(0, isMobile() ? 2 : 3);
      neighbors.forEach(({ j }) => {
        if (!lines.find(l => (l.a === i && l.b === j) || (l.a === j && l.b === i))) {
          lines.push({ a: i, b: j });
        }
      });
    });
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    const beatPhase = (t % BEAT_MS) / BEAT_MS;          // 0 → 1
    // Beat intensity envelope (peaks at LUB, smaller at DUB)
    const lubEnv = Math.exp(-Math.pow((t % BEAT_MS - LUB_AT) / 50, 2));
    const dubEnv = Math.exp(-Math.pow((t % BEAT_MS - DUB_AT) / 60, 2)) * 0.5;
    const beatEnv = Math.max(lubEnv, dubEnv);

    // Pulse propagation radius (grows from center each beat)
    const beatAge = t % BEAT_MS;
    const pulseRadius = (beatAge / BEAT_MS) * Math.max(W, H) * 0.9;

    // ── Stardust ──
    for (const s of stars) {
      s.phase += s.speed * 16;
      s.x += s.drift * Math.sin(s.phase * 0.3) * 0.5;
      if (s.x > W + 5) s.x = -5;
      if (s.x < -5) s.x = W + 5;
      const a = 0.3 + 0.5 * Math.abs(Math.sin(s.phase));
      ctx.fillStyle = `rgba(200,200,255,${a * 0.5})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── Synapse lines ──
    for (const l of lines) {
      const na = nodes[l.a], nb = nodes[l.b];
      const midDist = (na.dist + nb.dist) / 2;
      // Wave front reaches a line when pulseRadius crosses midDist
      const wavePass = Math.exp(-Math.pow((pulseRadius - midDist) / 80, 2));
      const alpha = 0.08 + wavePass * 0.55;
      ctx.strokeStyle = `rgba(255,68,0,${alpha})`;
      ctx.lineWidth = 0.6 + wavePass * 1.2;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();
    }

    // ── Nodes ──
    for (const n of nodes) {
      // Light up when the wave front crosses
      const wavePass = Math.exp(-Math.pow((pulseRadius - n.dist) / 60, 2));
      n.lit = Math.max(n.lit * 0.93, wavePass);
      n.phase += 0.01;

      const baseAlpha = 0.35 + 0.2 * Math.sin(n.phase);
      const litAlpha  = Math.min(1, baseAlpha + n.lit * 0.9);
      const size = n.r * (1 + n.lit * 1.6);

      // Outer glow when lit
      if (n.lit > 0.15) {
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, size * 6);
        grad.addColorStop(0, `rgba(255,68,0,${n.lit * 0.7})`);
        grad.addColorStop(1, 'rgba(255,68,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, size * 6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = `rgba(255,${68 + n.lit * 100},${n.lit * 80},${litAlpha})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Brightness boost on heartbeat
    if (beatEnv > 0.1) {
      ctx.fillStyle = `rgba(255,34,0,${beatEnv * 0.02})`;
      ctx.fillRect(0, 0, W, H);
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(draw);
})();

/* ── Pulse rings emanating from the heart ── */
(function initPulseRings() {
  const canvas = document.getElementById('pulse-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, cx, cy;
  const rings = [];  // active expanding rings
  let lastBeatFired = -1;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = W / 2;
    cy = H * 0.42;
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);

    // Fire a new ring each beat (lub)
    const beatIdx = Math.floor(t / BEAT_MS);
    if (beatIdx !== lastBeatFired) {
      rings.push({ born: beatIdx * BEAT_MS + LUB_AT, type: 'lub' });
      // smaller dub ring
      rings.push({ born: beatIdx * BEAT_MS + DUB_AT, type: 'dub' });
      lastBeatFired = beatIdx;
    }

    const maxR = Math.max(W, H) * 0.8;
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      const age = t - r.born;
      if (age < 0) continue;
      const life = age / (BEAT_MS * 2.5);
      if (life > 1) { rings.splice(i, 1); continue; }
      const radius = 60 + life * maxR;
      const alpha = (1 - life) * (r.type === 'lub' ? 0.35 : 0.18);
      ctx.strokeStyle = `rgba(255,${r.type === 'lub' ? 34 : 100},0,${alpha})`;
      ctx.lineWidth = r.type === 'lub' ? 1.2 : 0.7;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(draw);
})();

/* ── Typewriter: slogan ── */
(function initTyper() {
  const el = document.getElementById('typed');
  if (!el) return;
  const lines = [
    'El latido que mueve tus envíos.',
    'Tu casillero en Miami, tu mundo en LATAM.',
    'Comprá. Nosotros lo traemos.',
    'Cada beat es un paquete en camino.',
  ];
  let li = 0, ci = 0, deleting = false;

  function tick() {
    const line = lines[li];
    if (!deleting) {
      el.textContent = line.slice(0, ++ci);
      if (ci === line.length) { deleting = true; setTimeout(tick, 2400); return; }
      setTimeout(tick, 55);
    } else {
      el.textContent = line.slice(0, --ci);
      if (ci === 0) { deleting = false; li = (li + 1) % lines.length; setTimeout(tick, 400); return; }
      setTimeout(tick, 28);
    }
  }
  setTimeout(tick, 800);
})();

/* ── Nav scroll + mobile toggle ── */
(function initNav() {
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });

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
      links.style.background = 'rgba(3,3,8,0.98)';
      links.style.padding = '1.2rem 2rem';
      links.style.gap = '1.2rem';
    });
  }
})();

/* ── Step / card entrance animation ── */
(function initReveal() {
  const targets = document.querySelectorAll('.service-card, .step');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.animation = 'card-appear 0.55s ease forwards';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  targets.forEach((c, i) => {
    c.style.opacity = '0';
    c.style.animationDelay = `${i * 0.08}s`;
    io.observe(c);
  });
})();

/* ── Contact form (demo) ── */
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

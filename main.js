// ─────────────────────────────────────────
//  PULSE TECH HUB — main.js
//  Heart: 3 beats on load → freeze
//  Synapses: ambient destellos (random sparks)
// ─────────────────────────────────────────

const BEAT_MS        = 833;          // 72 bpm
const INTRO_BEATS    = 3;
const INTRO_DURATION = BEAT_MS * INTRO_BEATS;
const LUB_AT         = 0.10 * BEAT_MS;
const DUB_AT         = 0.32 * BEAT_MS;

let introStart = performance.now();

/* ── Pause rAF when the tab is hidden ── */
function runLoop(step) {
  let running = true;
  function frame(t) {
    if (!running) return;
    step(t);
    requestAnimationFrame(frame);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      running = false;
    } else {
      running = true;
      requestAnimationFrame(frame);
    }
  });
  requestAnimationFrame(frame);
}

/* ── Cosmos: polvo estelar + red de sinapsis con destellos ── */
(function initCosmos() {
  const canvas = document.getElementById('cosmos-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, cx, cy, stars = [], nodes = [], lines = [];
  const isMobile = () => window.innerWidth < 768;

  function rand(a, b) { return a + Math.random() * (b - a); }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
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
    const starCount = isMobile() ? 50 : 120;
    stars = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: rand(0, W),
        y: rand(0, H),
        r: rand(0.3, 1.3),
        phase: rand(0, Math.PI * 2),
        speed: rand(0.0003, 0.001),
      });
    }

    const nodeCount = isMobile() ? 22 : 48;
    nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      const angle  = rand(0, Math.PI * 2);
      const radius = rand(200, Math.max(W, H) * 0.6);
      const nx = cx + Math.cos(angle) * radius;
      const ny = cy + Math.sin(angle) * radius * 0.85;
      nodes.push({
        x: nx,
        y: ny,
        r: rand(1.2, 2.4),
        lit: 0,              // current brightness from destellos
        nextSpark: rand(500, 5000),  // ms until next spark
      });
    }

    lines = [];
    nodes.forEach((n, i) => {
      const neighbors = nodes
        .map((m, j) => ({ j, d: Math.hypot(m.x - n.x, m.y - n.y) }))
        .filter(({ j, d }) => j !== i && d < (isMobile() ? 200 : 240))
        .sort((a, b) => a.d - b.d)
        .slice(0, isMobile() ? 2 : 3);
      neighbors.forEach(({ j }) => {
        if (!lines.find(l => (l.a === i && l.b === j) || (l.a === j && l.b === i))) {
          lines.push({
            a: i,
            b: j,
            glow: 0,          // 0..1, decays each frame
            travel: -1,       // -1 = inactive, 0..1 = position of spark along line
            travelSpeed: 0,
          });
        }
      });
    });
  }

  let lastT = performance.now();

  function step(t) {
    const dt = Math.min(t - lastT, 50);
    lastT = t;
    ctx.clearRect(0, 0, W, H);

    // ── Stardust (siempre ambiente) ──
    for (const s of stars) {
      s.phase += s.speed * dt;
      const a = 0.3 + 0.5 * Math.abs(Math.sin(s.phase));
      ctx.fillStyle = `rgba(200,200,255,${a * 0.5})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── Nodes: generate destellos randomly ──
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      n.nextSpark -= dt;
      if (n.nextSpark <= 0) {
        // Fire a spark at this node and travel along its edges
        n.lit = 1;
        // Find all lines touching this node and launch a traveling spark
        for (const l of lines) {
          if (l.a === i || l.b === i) {
            if (l.travel < 0 || l.travel > 0.9) {
              l.travel = 0;
              l.travelSpeed = rand(0.0015, 0.004);  // per ms
              l.travelFrom = i;
              l.glow = 1;
            }
          }
        }
        n.nextSpark = rand(1500, 7000);
      }
      n.lit *= Math.pow(0.9, dt / 16);    // exponential decay
    }

    // ── Lines: draw with glow + traveling sparks ──
    for (const l of lines) {
      const na = nodes[l.a], nb = nodes[l.b];
      const alpha = 0.06 + l.glow * 0.45;
      ctx.strokeStyle = `rgba(255,68,0,${alpha})`;
      ctx.lineWidth = 0.5 + l.glow * 1.1;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();

      // traveling spark
      if (l.travel >= 0 && l.travel <= 1) {
        const fromA = l.travelFrom === l.a;
        const p = fromA ? l.travel : 1 - l.travel;
        const sx = na.x + (nb.x - na.x) * p;
        const sy = na.y + (nb.y - na.y) * p;
        const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 8);
        grad.addColorStop(0, 'rgba(255,180,100,1)');
        grad.addColorStop(0.4, 'rgba(255,80,0,0.7)');
        grad.addColorStop(1, 'rgba(255,34,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sx, sy, 8, 0, Math.PI * 2);
        ctx.fill();

        l.travel += l.travelSpeed * dt;
        if (l.travel >= 1) {
          // Arrived at the other node → light it and potentially chain
          const target = fromA ? l.b : l.a;
          nodes[target].lit = Math.max(nodes[target].lit, 0.9);
          // 35% chance to chain the spark to another edge of the target
          if (Math.random() < 0.35) {
            for (const l2 of lines) {
              if (l2 === l) continue;
              if ((l2.a === target || l2.b === target) && (l2.travel < 0 || l2.travel > 0.9)) {
                l2.travel = 0;
                l2.travelSpeed = rand(0.0015, 0.004);
                l2.travelFrom = target;
                l2.glow = 1;
                break;
              }
            }
          }
          l.travel = -1;
        }
      }
      l.glow *= Math.pow(0.93, dt / 16);
    }

    // ── Nodes: render after lines ──
    for (const n of nodes) {
      const baseAlpha = 0.35;
      const litAlpha  = Math.min(1, baseAlpha + n.lit * 0.9);
      const size = n.r * (1 + n.lit * 1.8);

      if (n.lit > 0.2) {
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, size * 7);
        grad.addColorStop(0, `rgba(255,120,50,${n.lit * 0.75})`);
        grad.addColorStop(1, 'rgba(255,68,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, size * 7, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = `rgba(255,${80 + n.lit * 120},${n.lit * 80},${litAlpha})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  window.addEventListener('resize', resize);
  resize();
  runLoop(step);
})();

/* ── Pulse rings: only during the intro beats ── */
(function initPulseRings() {
  const canvas = document.getElementById('pulse-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, cx, cy;
  const rings = [];

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
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

  // Seed the intro rings (one lub + one dub per beat, 3 beats)
  function seedRings() {
    for (let i = 0; i < INTRO_BEATS; i++) {
      rings.push({ born: introStart + i * BEAT_MS + LUB_AT, type: 'lub' });
      rings.push({ born: introStart + i * BEAT_MS + DUB_AT, type: 'dub' });
    }
  }

  let seeded = false;
  let finished = false;

  function step(t) {
    if (!seeded) { seedRings(); seeded = true; }
    if (finished) return;

    ctx.clearRect(0, 0, W, H);

    const maxR = Math.max(W, H) * 0.8;
    let activeCount = 0;
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      const age = t - r.born;
      if (age < 0) { activeCount++; continue; }
      const life = age / (BEAT_MS * 2.5);
      if (life > 1) { rings.splice(i, 1); continue; }
      activeCount++;
      const radius = 60 + life * maxR;
      const alpha = (1 - life) * (r.type === 'lub' ? 0.35 : 0.18);
      ctx.strokeStyle = `rgba(255,${r.type === 'lub' ? 34 : 100},0,${alpha})`;
      ctx.lineWidth = r.type === 'lub' ? 1.2 : 0.7;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Once all intro rings have faded, stop drawing entirely
    if (seeded && activeCount === 0 && t > introStart + INTRO_DURATION + BEAT_MS * 3) {
      ctx.clearRect(0, 0, W, H);
      canvas.style.display = 'none';
      finished = true;
    }
  }

  window.addEventListener('resize', resize);
  resize();
  runLoop(step);
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
    if (document.hidden) { setTimeout(tick, 400); return; }
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

/* ── Card / step entrance animation ── */
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

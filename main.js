/* ============================================================
   CYBERPUNK PORTFOLIO — DEV.Tarek Abo Esmaill
   main.js
   ============================================================ */

'use strict';

/* ── 0. THEME SYSTEM ─────────────────────────────────────────
   Default: always Dark Mode on every page load (no persistence).
   Toggles the [data-theme] attribute on <html>.
   Canvas color palettes are defined here so the draw loop can
   read them without querying the DOM on every frame.
   ----------------------------------------------------------- */
const Theme = (function initTheme() {

  const root   = document.documentElement;
  const btn    = document.getElementById('themeToggle');

  /* Always start in light mode */
  root.setAttribute('data-theme', 'light');

  /* Canvas color palettes — keyed by theme name.
     RGB strings match the CSS brand variables exactly:
       --primary   #6d4ce0  → 109, 76, 224
       --secondary #8b6cf0  → 139, 108, 240
       --accent2   #b39dff  → 179, 157, 255              */
  const palettes = {
    dark: {
      gridV : '139,108,240',   /* vertical grid lines   */
      gridH : '109,76,224',    /* horizontal grid lines */
      node  : '179,157,255',   /* pulsing node dots     */
      orb1  : '139,108,240',
      orb2  : '109,76,224',
      orb3  : '91,63,209',
    },
    light: {
      gridV : '139,108,240',   /* keep brand violet     */
      gridH : '109,76,224',    /* keep brand deep violet*/
      node  : '179,157,255',   /* keep brand soft violet*/
      orb1  : '139,108,240',
      orb2  : '109,76,224',
      orb3  : '91,63,209',
    },
  };

  function current() {
    return root.getAttribute('data-theme') || 'dark';
  }

  function palette() {
    return palettes[current()];
  }

  function toggle() {
    const next = current() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
  }

  if (btn) {
    btn.addEventListener('click', toggle);
  }

  return { palette };

})();


/* ── 1. CYBER GRID CANVAS ────────────────────────────────── */
(function initCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, cols, rows;
  const CELL = 60;
  const nodes = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    cols = Math.ceil(W / CELL) + 1;
    rows = Math.ceil(H / CELL) + 1;
    buildNodes();
  }

  function buildNodes() {
    nodes.length = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        nodes.push({
          x: c * CELL,
          y: r * CELL,
          pulse: Math.random(),
          speed: 0.003 + Math.random() * 0.005,
        });
      }
    }
  }

  function draw(ts) {
    ctx.clearRect(0, 0, W, H);

    /* Scroll-based vertical offset */
    const scrollY = window.scrollY * 0.15;

    /* Read the current theme palette on every frame — zero DOM cost */
    const p = Theme.palette();

    /* Grid lines */
    ctx.lineWidth = 0.4;

    /* Vertical lines */
    for (let c = 0; c < cols; c++) {
      const x = c * CELL;
      const alpha = 0.06 + 0.02 * Math.sin(ts * 0.0005 + c * 0.3);
      ctx.strokeStyle = `rgba(${p.gridV},${alpha})`;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }

    /* Horizontal lines */
    for (let r = 0; r < rows; r++) {
      const y = r * CELL - (scrollY % CELL);
      const alpha = 0.06 + 0.02 * Math.sin(ts * 0.0004 + r * 0.25);
      ctx.strokeStyle = `rgba(${p.gridH},${alpha})`;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    /* Pulsing node dots */
    for (const n of nodes) {
      n.pulse += n.speed;
      const alpha = 0.15 + 0.35 * Math.abs(Math.sin(n.pulse));
      const radius = 1.2 + 1.2 * Math.abs(Math.sin(n.pulse));
      ctx.beginPath();
      ctx.arc(n.x, n.y - (scrollY % CELL), radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.node},${alpha})`;
      ctx.fill();
    }

    /* Drifting glow orbs */
    const t = ts * 0.0003;
    const orbs = [
      { x: W * 0.15, y: H * 0.25, r: 220, c: p.orb1, a: 0.07 + 0.03 * Math.sin(t) },
      { x: W * 0.85, y: H * 0.6,  r: 280, c: p.orb2, a: 0.05 + 0.03 * Math.sin(t + 1.5) },
      { x: W * 0.5,  y: H * 0.8,  r: 200, c: p.orb3, a: 0.06 + 0.02 * Math.sin(t + 3) },
    ];
    for (const o of orbs) {
      const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
      grad.addColorStop(0, `rgba(${o.c},${o.a})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(draw);
})();

/* ── 2. NAVBAR ───────────────────────────────────────────── */
(function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const toggle   = document.getElementById('navToggle');
  const linkList = document.getElementById('navLinks');
  const links    = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  function highlightActive() {
    let current = '';

    sections.forEach(sec => {
      const top = sec.getBoundingClientRect().top;
      if (top <= 120) current = sec.id;
    });

    links.forEach(link => {
      link.classList.toggle(
        'active',
        link.getAttribute('href') === `#${current}`
      );
    });
  }

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
    highlightActive();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toggle.addEventListener('click', () => {
    const open = linkList.classList.toggle('open');
    toggle.classList.toggle('open', open);
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      linkList.classList.remove('open');
      toggle.classList.remove('open');
    });
  });

})();


/* ── 3. MOUSE PARALLAX ON AVATAR ─────────────────────────── */
(function initParallax() {
  const avatar = document.getElementById('heroAvatar');
  if (!avatar) return;

  let tX = 0, tY = 0, cX = 0, cY = 0;

  document.addEventListener('mousemove', e => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    tX = (e.clientX - cx) / cx * 12;
    tY = (e.clientY - cy) / cy * 8;
  });

  function lerp(a, b, t) { return a + (b - a) * t; }

  (function loop() {
    cX = lerp(cX, tX, 0.06);
    cY = lerp(cY, tY, 0.06);
    avatar.style.transform = `translate(${cX}px, ${cY}px)`;
    requestAnimationFrame(loop);
  })();
})();


/* ── 4. SCROLL REVEAL ────────────────────────────────────── */
(function initScrollReveal() {
  const els = document.querySelectorAll('.scroll-reveal');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => io.observe(el));
})();


/* ── 5. PROJECT CARD 3-D TILT ────────────────────────────── */
(function initTilt() {
  const cards = document.querySelectorAll('.project-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `
        translateY(-8px)
        rotateX(${-y * 7}deg)
        rotateY(${x * 7}deg)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();


/* ── 6. CONTACT FORM ─────────────────────────────────────── */
(function initForm() {
  const form       = document.getElementById('contactForm');
  if (!form) return;

  const nameEl    = document.getElementById('fname');
  const emailEl   = document.getElementById('femail');
  const subjectEl = document.getElementById('fsubject');
  const msgEl     = document.getElementById('fmessage');
  const btnText   = document.getElementById('btnText');
  const success   = document.getElementById('formSuccess');

  const errEls = {
    fname:    document.getElementById('nameErr'),
    femail:   document.getElementById('emailErr'),
    fsubject: document.getElementById('subjectErr'),
    fmessage: document.getElementById('messageErr'),
  };

  function validate(field) {
    const val = field.value.trim();
    const id  = field.id;
    let msg = '';

    if (!val) {
      msg = 'This field is required.';
    } else if (id === 'femail' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      msg = 'Please enter a valid email address.';
    }

    field.classList.toggle('error', !!msg);
    if (errEls[id]) errEls[id].textContent = msg;
    return !msg;
  }

  /* Live validation on blur */
  [nameEl, emailEl, subjectEl, msgEl].forEach(el => {
    el.addEventListener('blur', () => validate(el));
    el.addEventListener('input', () => {
      if (el.classList.contains('error')) validate(el);
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();

    const valid = [nameEl, emailEl, subjectEl, msgEl]
      .map(validate)
      .every(Boolean);

    if (!valid) return;

    /* Build the WhatsApp message from the form values */
    const message =
      'Name: '    + nameEl.value.trim()    + '\n' +
      'Email: '   + emailEl.value.trim()   + '\n' +
      'Subject: ' + subjectEl.value.trim() + '\n' +
      'Message:\n' + msgEl.value.trim();

    const whatsappUrl =
      'https://wa.me/963952118246?text=' + encodeURIComponent(message);

    /* Prevent duplicate submissions */
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btnText.textContent = 'Opening WhatsApp…';

    /* Open WhatsApp Click-to-Chat in a new tab */
    window.open(whatsappUrl, '_blank');

    /* Brief delay for feedback, then reset */
    setTimeout(() => {
      btn.disabled = false;
      btnText.textContent = 'Send a WhatsApp message';
      form.reset();
      success.classList.add('show');
      setTimeout(() => success.classList.remove('show'), 5000);
    }, 800);
  });
})();


/* ── 7. SMOOTH SCROLL FOR ANCHOR LINKS ───────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 70;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


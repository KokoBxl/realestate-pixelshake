// ═══════════════════════════════════════════════════════════
// PIXELSHAKE — Refonte 2026
// ═══════════════════════════════════════════════════════════

(() => {
  'use strict';

  const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(hover: none), (max-width: 900px)').matches;

  // ─── NAV SCROLLED STATE ───
  const nav = document.getElementById('nav');
  const progress = document.getElementById('progress');
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 20);
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? (y / h) * 100 : 0;
      progress.style.width = p + '%';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ─── MOBILE MENU ───
  const burger = document.getElementById('burger');
  const mob = document.getElementById('mob');
  const mobClose = document.getElementById('mob-close');
  const openMob = () => {
    mob.hidden = false;
    requestAnimationFrame(() => mob.classList.add('is-open'));
    burger.classList.add('active');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };
  const closeMob = () => {
    mob.classList.remove('is-open');
    mob.hidden = true;
    burger.classList.remove('active');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };
  burger?.addEventListener('click', () => {
    burger.classList.contains('active') ? closeMob() : openMob();
  });
  mobClose?.addEventListener('click', closeMob);
  mob?.querySelectorAll('.mob-link').forEach(l => l.addEventListener('click', closeMob));

  // ─── CURSOR ───
  if (!isTouch && !prefersReducedMotion) {
    const cur = document.getElementById('cur');
    const ring = document.getElementById('ring');
    let mx = -100, my = -100, rx = -100, ry = -100;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      cur.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
    });
    const loop = () => {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    loop();

    // Hover states
    const hovers = 'a, button, details summary, [data-magnetic], .bento-card, .work-card, .testi-card, .video-card';
    document.querySelectorAll(hovers).forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cur-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cur-hover'));
    });
  }

  // ─── MAGNETIC BUTTONS ───
  if (!isTouch && !prefersReducedMotion) {
    document.querySelectorAll('[data-magnetic]').forEach(el => {
      const strength = 0.25;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  // ─── TILT CARDS ───
  if (!isTouch && !prefersReducedMotion) {
    document.querySelectorAll('[data-tilt]').forEach(el => {
      const max = 6;
      el.style.transformStyle = 'preserve-3d';
      el.style.willChange = 'transform';
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (py - 0.5) * -max;
        const ry = (px - 0.5) * max;
        el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  // ─── REVEAL ON SCROLL ───
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

  document.querySelectorAll('.reveal, .reveal-text').forEach(el => io.observe(el));

  // Split text into spans for hero lines only (kinetic stagger)
  document.querySelectorAll('.hero-line').forEach(el => {
    if (el.dataset.split) return;
    el.dataset.split = '1';
    const nodes = [...el.childNodes];
    nodes.forEach(n => {
      if (n.nodeType === 3 && n.textContent.trim()) {
        const span = document.createElement('span');
        span.textContent = n.textContent;
        n.replaceWith(span);
      }
    });
  });

  // ─── FAQ / SERVICES — close siblings on open (accordion) ───
  const accordionGroup = (selector) => {
    const items = document.querySelectorAll(selector);
    items.forEach(item => {
      item.addEventListener('toggle', () => {
        if (item.open) {
          items.forEach(other => {
            if (other !== item && other.open) other.open = false;
          });
        }
      });
    });
  };
  accordionGroup('.faq-item');
  // Services: don't force accordion — allow multi-open, keeps first open

  // ─── SMOOTH ANCHOR ───
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });

  // ─── HERO PARALLAX (video subtle zoom on scroll) ───
  if (!prefersReducedMotion) {
    const heroVideo = document.querySelector('.hero-video-iframe');
    if (heroVideo) {
      let ticking = false;
      const updateParallax = () => {
        const y = window.scrollY;
        if (y < window.innerHeight * 1.2) {
          const scale = 1 + Math.min(y / window.innerHeight, 1) * 0.08;
          const opacity = 1 - Math.min(y / window.innerHeight, 1) * 0.4;
          heroVideo.style.transform = `translate(-50%, -50%) scale(${scale})`;
          heroVideo.style.opacity = opacity;
        }
        ticking = false;
      };
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(updateParallax);
          ticking = true;
        }
      }, { passive: true });
    }
  }

  // ─── MARQUEE: pause on hover ───
  const marquee = document.querySelector('.marquee-track');
  if (marquee && !isTouch) {
    marquee.parentElement.addEventListener('mouseenter', () => {
      marquee.style.animationPlayState = 'paused';
    });
    marquee.parentElement.addEventListener('mouseleave', () => {
      marquee.style.animationPlayState = 'running';
    });
  }

  // ─── HIDE FLOAT CTA AT TOP + BOTTOM ───
  const floatCta = document.querySelector('.float-cta');
  if (floatCta) {
    const updateFloat = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const nearBottom = max - y < 200;
      const atTop = y < 300;
      floatCta.style.opacity = (atTop || nearBottom) ? '0' : '1';
      floatCta.style.pointerEvents = (atTop || nearBottom) ? 'none' : 'auto';
    };
    window.addEventListener('scroll', updateFloat, { passive: true });
    updateFloat();
  }

})();

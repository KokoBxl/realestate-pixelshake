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

  // ─── HERO LINE SPLIT (kinetic stagger) ───
  const splitHeroLines = () => {
    document.querySelectorAll('.hero-line').forEach(el => {
      // Reset so we can re-split after lang change
      delete el.dataset.split;
      // Remove previously injected wrapper spans (but keep <em> elements)
      el.childNodes.forEach(n => {
        if (n.nodeType === 1 && n.tagName === 'SPAN' && !n.className) {
          n.replaceWith(n.textContent);
        }
      });
      // Now split text nodes into spans
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
  };
  splitHeroLines();

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

  // ═══════════════════════════════════════════════════════════
  // TRANSLATIONS — FR · NL · EN
  // ═══════════════════════════════════════════════════════════

  const T = {
    fr: {
      // Nav
      'nav.skip':       'Aller au contenu',
      'nav.work':       'Travail',
      'nav.services':   'Services',
      'nav.why':        'Pourquoi',
      'nav.about':      'À propos',
      'nav.cta':        'Prendre contact',
      'nav.mob.city':   'Bruxelles · Belgique',

      // Hero
      'hero.badge':           'Bruxelles · En activité depuis 2009',
      'hero.h1.line1':        'Des images corporate',
      'hero.h1.line2':        'qui font <em>le travail.</em>',
      'hero.sub':             'Spécialiste photo &amp; vidéo pour promoteurs, constructeurs et foncières.<br class="d-br"/>Bruxelles · Belgique · depuis 2009.',
      'hero.btn.work':        'Voir le travail',
      'hero.btn.contact':     'Prendre contact',
      'hero.meta.since.lbl':  'en activité depuis',
      'hero.meta.years.lbl':  'années de terrain',
      'hero.meta.cov.lbl':    'couverture principale',

      // Marquee
      'mq.1': 'Film immobilier',
      'mq.2': 'Reportage chantier',
      'mq.3': 'Vue aérienne',
      'mq.4': 'Vente sur plan',
      'mq.5': 'Timelapse',
      'mq.6': 'Architecture &amp; BTP',
      'mq.7': 'Film corporate',
      'mq.8': 'Drone certifié',

      // Clients
      'clients.label': 'Ils me font confiance',

      // Manifesto
      'manifesto.label':    'Ce que je fais',
      'manifesto.h2':       'Spécialiste immobilier<br/>commercial <em>&amp; industrie.</em>',
      'manifesto.p1':       "Quinze ans de production terrain exclusivement au service de l'immobilier commercial, du BTP et de l'industrie belge.",
      'manifesto.p2':       "Chantiers, actifs en commercialisation, sites industriels, films corporate — avec la rigueur d'un interlocuteur qui comprend vos enjeux sectoriels.",
      'manifesto.signal.k': 'Positionnement',
      'manifesto.signal.p': 'Photographe et filmmaker spécialisé immobilier &amp; industrie à Bruxelles. Quinze ans au côté de promoteurs, constructeurs et industriels belges.',
      'manifesto.signal.link': 'Écrire à Thomas',

      // Pillars
      'pillars.label': 'Prestations',
      'pillars.h2':    'Six types<br/>de <em>production.</em>',
      'bento1.title': 'Film de <em>présentation</em>',
      'bento1.body':  "Présentation d'un projet immobilier, film de quartier, film institutionnel promoteur. Pour convaincre avant même la livraison.",
      'bento1.tag':   'Promoteur · Vente sur plan',
      'bento2.title': 'Reportage <em>photo</em>',
      'bento2.body':  "Reportage photo d'un bien, d'un chantier, d'un quartier. Faire parler un bâtiment sans tricher avec la lumière.",
      'bento2.tag':   'Architecture · Immobilier',
      'bento3.title': 'Film <em>interviews</em>',
      'bento3.body':  "Interviews d'architectes, promoteurs et acteurs du projet. Humaniser un développement immobilier par ceux qui le portent.",
      'bento3.tag':   'Interviews · Corporate',
      'bento4.title': 'Réseaux sociaux &amp; <em>stratégie</em>',
      'bento4.body':  "Formats courts, cadrage vertical, conseils de stratégie. Contenus adaptés à chaque canal pour attirer des acheteurs sur plan.",
      'bento4.tag':   'Social · Digital · Stratégie',
      'bento5.title': 'Drone &amp; <em>aérien</em>',
      'bento5.body':  "Vue du site, du quartier, du contexte urbain. Indispensable pour situer un projet et révéler son échelle réelle.",
      'bento5.tag':   'Drone · Aérien',
      'bento6.title': 'Suivi chantier &amp; <em>timelapse</em>',
      'bento6.body':  "De la première pierre à la livraison. Timelapse, avant/après, archive valorisante pour le promoteur et ses partenaires.",
      'bento6.tag':   'Timelapse · Avant/Après · Long terme',

      // Work
      'work.label': 'Travail récent',
      'work.h2':    'Projets <em>récents.</em>',
      'work.intro': "Une sélection de ce que j'ai produit ces derniers mois pour des entreprises, agences et institutions à Bruxelles et ailleurs.",
      'wc1.tag':   'Reportage industriel',
      'wc1.title': 'Besix — Suivi de chantier',
      'wc1.sub':   'Bruxelles · Photo &amp; vidéo · 2025',
      'wc2.tag':   'Immobilier commercial',
      'wc2.title': 'Immobel — Tour de bureaux',
      'wc2.sub':   'Bruxelles · Architecture',
      'wc3.tag':   'Drone certifié',
      'wc3.title': 'Eiffage — Vue aérienne',
      'wc3.sub':   'Wallonie · Drone 4K',
      'wc4.tag':   'Portraits corporate',
      'wc4.title': 'Comité de direction',
      'wc4.sub':   'Bruxelles · Portraits &amp; équipe',
      'wc5.tag':   'Aftermovie event',
      'wc5.title': 'Convention annuelle',
      'wc5.sub':   'Bruxelles · Reportage &amp; aftermovie',
      'wc6.tag':   'Timelapse',
      'wc6.title': 'AG Real Estate — Timelapse',
      'wc6.sub':   "Bruxelles · De la première pierre à la livraison",

      // Videos
      'videos.label': 'Films',
      'videos.h2':    'En <em>mouvement.</em>',
      'vid1.title': 'Drone &amp; Vues aériennes',
      'vid1.sub':   '4K · Certifié · Autorisations incluses',
      'vid2.title': 'Recrutement — Promoteur immobilier',
      'vid2.sub':   'Corporate · Employer brand · Bruxelles',
      'vid3.title': 'Marque automobile &amp; événement',
      'vid3.sub':   'Brand content · Event · Corporate',
      'vid4.title': 'Toitures industrielles',
      'vid4.sub':   'Reportage · Industrie · Drone',
      'vid5.title': 'Constructeur automobile',
      'vid5.sub':   'Industrie · Brand film',
      'vid6.title': 'Promoteur immobilier — Film de projet',
      'vid6.sub':   'Corporate · Immobilier · Bruxelles',

      // Services
      'svc.label': 'Services',
      'svc.h2':    'Cinq <em>prestations</em><br/>en détail.',
      'svc.intro': 'Une section par type de prestation. Pour qui, pour quoi, comment.',
      'svc1.title': "Film d'entreprise",
      'svc1.tag':   'Corporate · Brand',
      'svc1.p1':    "Un film corporate n'est pas une plaquette animée. C'est l'occasion rare de dire, en 90 secondes ou en 10 minutes, ce que votre entreprise fait réellement — avec le bon angle, le bon rythme, et des images qui tiennent face à ce que voit votre audience ailleurs.",
      'svc1.p2':    "J'accompagne de A à Z : écriture, repérages, tournage, montage, livraison. Pour les productions plus lourdes, je coordonne une équipe de freelances spécialisés.",
      'svc2.title': 'Architecture &amp; immobilier',
      'svc2.tag':   'Foncières · Promoteurs',
      'svc2.p1':    "Bureaux, sites industriels, logistique, biens de prestige. Je photographie des bâtiments pour des foncières, des promoteurs et des architectes depuis plus de dix ans — avec une attention particulière à la lumière naturelle, au cadre juste, et à la cohérence de la série.",
      'svc2.p2':    'Drone inclus quand le site le justifie.',
      'svc3.title': 'Portrait corporate',
      'svc3.tag':   'Équipes &amp; dirigeants',
      'svc3.p1':    "Portraits individuels, portraits d'équipe, portraits dirigeants. L'objectif n'est pas de figer une pose mais de produire une image qui représente vraiment quelqu'un — utilisable en LinkedIn, rapport annuel, site corporate ou communiqué de presse.",
      'svc3.p2':    'Séances en studio, au bureau, ou sur site.',
      'svc4.title': 'Quartier &amp; lancement de projet',
      'svc4.tag':   'Neighbourhood · Vente sur plan',
      'svc4.p1':    "Avant même la première pierre, un projet immobilier se vend sur la promesse d'un cadre de vie. Je produis l'ensemble des visuels qui donnent corps à cette promesse : film de quartier, vues aériennes du site, reportage photo ambiance, contenus réseaux sociaux adaptés à chaque canal.",
      'svc4.p2':    "Une approche intégrée — photo, vidéo, drone, stratégie sociale — pour faire vivre un projet en commercialisation bien avant sa livraison.",
      'svc5.title': 'Drone &amp; aérien',
      'svc5.tag':   'Pilote certifié',
      'svc5.p1':    "Pilote de drone certifié. Plans aériens pour chantiers, sites industriels, biens immobiliers, événements outdoor. Intégrés à une production photo/vidéo ou en prestation dédiée.",

      // Why
      'why.label': 'Pourquoi',
      'why.h2':    'Pourquoi ces<br/>clients <em>reviennent.</em>',
      'why.intro': 'Quatre raisons concrètes. Pas de "valeurs", pas de "mission".',
      'why.1.h': 'Expérience',
      'why.1.p': "Depuis 2009, j'ai produit pour des cabinets d'avocats, des foncières, des agences, des institutions européennes, des organisateurs de conférences. La plupart reviennent. Quelques-uns sont là depuis dix ans.",
      'why.2.h': 'Anticipation',
      'why.2.p': "La moitié d'un bon tournage se joue avant d'arriver. Repérages, lumière, planning, plan B. Vous ne payez pas que le jour J — vous payez l'absence d'imprévus le jour J.",
      'why.3.h': 'Un interlocuteur',
      'why.3.p': "Vous avez un interlocuteur unique du brief à la livraison. Sur les projets qui le demandent, je m'entoure des meilleurs freelances de mon réseau — chef op, cadreur, monteur — plutôt que de tout faire seul.",
      'why.4.h': 'Matériel en propre',
      'why.4.p': "Caméras, optiques, son, lumière, drone : équipement professionnel à jour, en propre. Pas de coût de location caché dans les devis, pas de location improvisée la veille.",
      'why.note': "<strong>Je ne suis pas le moins cher. Je suis ce qu'il faut quand le résultat doit être là.</strong> Sans devoir tout réexpliquer à chaque étape.",

      // About
      'about.label':    'À propos',
      'about.h2':       'Thomas <em>Blairon.</em>',
      'about.p1':       "Je m'appelle Thomas Blairon. Je suis photographe et filmmaker à Bruxelles depuis 2009. J'ai fondé Pixelshake pour travailler avec des entreprises qui comprennent qu'une image bien faite n'est pas un coût, mais un outil.",
      'about.p2':       "Je travaille en solo, renforcé selon les projets par un réseau de freelances spécialisés que j'ai appris à choisir au fil des années. C'est ce qui me permet d'être agile sur les petites productions et rigoureux sur les plus grosses, sans infrastructure lourde à facturer.",
      'about.p3':       "Je ne suis pas le moins cher, je ne suis pas le plus cher. Je suis ce qu'il faut quand vous avez besoin que le résultat soit là, sans devoir tout réexpliquer à chaque étape.",
      'about.p4':       "Basé à Bruxelles, je travaille principalement en Belgique, au Luxembourg et occasionnellement ailleurs en Europe pour des clients récurrents. Je parle français, anglais et néerlandais.",
      'about.fact1.lbl': 'En activité depuis',
      'about.fact2.lbl': 'Basé à',
      'about.fact3.lbl': 'Couverture',
      'about.fact4.lbl': 'Langues',

      // Contact
      'contact.eyebrow':   'Travaillons ensemble',
      'contact.h2':        'Un projet<br/>en <em>tête&nbsp;?</em>',
      'contact.sub':       "Le plus simple est de m'écrire avec quelques lignes sur ce que vous voulez faire. Je reviens vers vous dans la journée.",
      'contact.btn.mail':  'Écrire à Thomas',
      'contact.write.lbl': 'Écrire',
      'contact.call.lbl':  'Appeler',
      'contact.studio.lbl':'Studio',
      'contact.studio.val':'Bruxelles<br/>Belgique',
      'contact.cov.lbl':   'Couverture',
      'contact.cov.val':   'BE · LU<br/>EU sur devis',
      // Form
      'contact.form.name.lbl':    'Nom',
      'contact.form.name.ph':     'Votre nom',
      'contact.form.email.lbl':   'Email',
      'contact.form.company.lbl': 'Entreprise / Projet',
      'contact.form.company.ph':  'Promoteur, foncière, industrie...',
      'contact.form.msg.lbl':     'Message',
      'contact.form.msg.ph':      'Décrivez votre projet en quelques lignes...',
      'contact.form.submit':      'Envoyer le message',
      'contact.form.or':          'ou directement :',
      'contact.form.success':     'Message envoyé — je vous reviens dans la journée.',
      'contact.form.error':       'Erreur d\'envoi. Écrivez directement à <a href="mailto:thomas@pixelshake.be">thomas@pixelshake.be</a>',

      // Footer
      'footer.contact.k': 'Contact',
      'footer.sitemap.k': 'Sitemap',
      'footer.social.k':  'Ailleurs',
      'footer.legal.k':   'Mentions',
      'footer.legal.rights': '© 2026 — Tous droits réservés',
    },

    // ─────────────────────────────────────────────────────────
    nl: {
      // Nav
      'nav.skip':       'Ga naar inhoud',
      'nav.work':       'Werk',
      'nav.services':   'Diensten',
      'nav.why':        'Waarom',
      'nav.about':      'Over mij',
      'nav.cta':        'Contact opnemen',
      'nav.mob.city':   'Brussel · België',

      // Hero
      'hero.badge':           'Brussel · Actief sinds 2009',
      'hero.h1.line1':        'Corporate beelden',
      'hero.h1.line2':        'die <em>het werk doen.</em>',
      'hero.sub':             'Specialist foto &amp; video voor promotors, bouwheren en vastgoedfondsen.<br class="d-br"/>Brussel · België · actief sinds 2009.',
      'hero.btn.work':        'Bekijk het werk',
      'hero.btn.contact':     'Contact opnemen',
      'hero.meta.since.lbl':  'actief sinds',
      'hero.meta.years.lbl':  'jaar ervaring',
      'hero.meta.cov.lbl':    'hoofddekking',

      // Marquee
      'mq.1': 'Vastgoedfilm',
      'mq.2': 'Werfopvolging',
      'mq.3': 'Luchtfoto',
      'mq.4': 'Verkoop op plan',
      'mq.5': 'Timelapse',
      'mq.6': 'Architectuur &amp; Bouw',
      'mq.7': 'Bedrijfsfilm',
      'mq.8': 'Gecertificeerde drone',

      // Clients
      'clients.label': 'Zij vertrouwen mij',

      // Manifesto
      'manifesto.label':    'Wat ik doe',
      'manifesto.h2':       'Specialist vastgoed<br/>commercieel <em>&amp; industrie.</em>',
      'manifesto.p1':       'Vijftien jaar terreinproductie exclusief ten dienste van commercieel vastgoed, bouw en de Belgische industrie.',
      'manifesto.p2':       'Bouwplaatsen, te commercialiseren activa, industriesites, corporate films — met de nauwkeurigheid van een gesprekspartner die uw sectorale uitdagingen begrijpt.',
      'manifesto.signal.k': 'Positionering',
      'manifesto.signal.p': 'Fotograaf en filmmaker gespecialiseerd in vastgoed &amp; industrie in Brussel. Vijftien jaar naast promotors, bouwers en Belgische industriëlen.',
      'manifesto.signal.link': 'Schrijf naar Thomas',

      // Pillars
      'pillars.label': 'Prestaties',
      'pillars.h2':    'Zes types<br/>van <em>productie.</em>',
      'bento1.title': '<em>Presentatie</em>film',
      'bento1.body':  'Presentatie van een vastgoedproject, wijk- of institutionele promotorfilm. Om te overtuigen nog vóór de oplevering.',
      'bento1.tag':   'Promotor · Verkoop op plan',
      'bento2.title': 'Foto<em>reportage</em>',
      'bento2.body':  'Fotoreportage van een pand, werf of wijk. Een gebouw laten spreken zonder te sjoemelen met het licht.',
      'bento2.tag':   'Architectuur · Vastgoed',
      'bento3.title': '<em>Interview</em>film',
      'bento3.body':  'Interviews met architecten, promotors en projectactoren. Een vastgoedontwikkeling vermenselijken via diegenen die haar dragen.',
      'bento3.tag':   'Interviews · Corporate',
      'bento4.title': 'Sociale media &amp; <em>strategie</em>',
      'bento4.body':  'Korte formaten, verticale kadrering, strategisch advies. Inhoud aangepast aan elk kanaal om kopers op plan aan te trekken.',
      'bento4.tag':   'Social · Digital · Strategie',
      'bento5.title': 'Drone &amp; <em>luchtfoto</em>',
      'bento5.body':  'Zicht op de site, de wijk, de stedelijke context. Onmisbaar om een project te situeren en zijn werkelijke schaal te onthullen.',
      'bento5.tag':   'Drone · Luchtfoto',
      'bento6.title': 'Werfopvolging &amp; <em>timelapse</em>',
      'bento6.body':  'Van de eerste steen tot de oplevering. Timelapse, voor/na, waardevolle archivering voor de promotor en zijn partners.',
      'bento6.tag':   'Timelapse · Voor/Na · Lange termijn',

      // Work
      'work.label': 'Recent werk',
      'work.h2':    'Recente <em>projecten.</em>',
      'work.intro': 'Een selectie van wat ik de afgelopen maanden heb geproduceerd voor bedrijven, agentschappen en instellingen in Brussel en elders.',
      'wc1.tag':   'Industrieel reportage',
      'wc1.title': 'Besix — Werfopvolging',
      'wc1.sub':   'Brussel · Foto &amp; video · 2025',
      'wc2.tag':   'Commercieel vastgoed',
      'wc2.title': 'Immobel — Kantoorgebouw',
      'wc2.sub':   'Brussel · Architectuur',
      'wc3.tag':   'Gecertificeerde drone',
      'wc3.title': 'Eiffage — Luchtfoto',
      'wc3.sub':   'Wallonië · Drone 4K',
      'wc4.tag':   'Corporate portretten',
      'wc4.title': 'Directiecomité',
      'wc4.sub':   'Brussel · Portretten &amp; team',
      'wc5.tag':   'Event aftermovie',
      'wc5.title': 'Jaarlijkse conventie',
      'wc5.sub':   'Brussel · Reportage &amp; aftermovie',
      'wc6.tag':   'Timelapse',
      'wc6.title': 'AG Real Estate — Timelapse',
      'wc6.sub':   'Brussel · Van de eerste steen tot oplevering',

      // Videos
      'videos.label': 'Films',
      'videos.h2':    'In <em>beweging.</em>',
      'vid1.title': 'Drone &amp; Luchtopnames',
      'vid1.sub':   '4K · Gecertificeerd · Vergunningen inbegrepen',
      'vid2.title': 'Rekrutering — Vastgoedpromotor',
      'vid2.sub':   'Corporate · Employer brand · Brussel',
      'vid3.title': 'Automerk &amp; evenement',
      'vid3.sub':   'Brand content · Event · Corporate',
      'vid4.title': 'Industriële daken',
      'vid4.sub':   'Reportage · Industrie · Drone',
      'vid5.title': 'Autofabrikant',
      'vid5.sub':   'Industrie · Brand film',
      'vid6.title': 'Vastgoedpromotor — Projectfilm',
      'vid6.sub':   'Corporate · Vastgoed · Brussel',

      // Services
      'svc.label': 'Diensten',
      'svc.h2':    'Vijf <em>diensten</em><br/>in detail.',
      'svc.intro': 'Een sectie per type dienst. Voor wie, waarvoor, hoe.',
      'svc1.title': 'Bedrijfsfilm',
      'svc1.tag':   'Corporate · Brand',
      'svc1.p1':    'Een corporate film is geen geanimeerde brochure. Het is de zeldzame kans om, in 90 seconden of 10 minuten, te zeggen wat uw bedrijf echt doet — met de juiste hoek, het juiste ritme en beelden die standhouden tegenover wat uw publiek elders ziet.',
      'svc1.p2':    'Ik begeleid van A tot Z: schrijven, locatieverkenning, opnames, montage, levering. Voor zwaardere producties coördineer ik een team van gespecialiseerde freelancers.',
      'svc2.title': 'Architectuur &amp; vastgoed',
      'svc2.tag':   'Vastgoedfondsen · Promotors',
      'svc2.p1':    'Kantoren, industriesites, logistiek, prestigieuze panden. Ik fotografeer gebouwen voor vastgoedfondsen, promotors en architecten al meer dan tien jaar — met bijzondere aandacht voor natuurlijk licht, de juiste kadrering en de coherentie van de serie.',
      'svc2.p2':    'Drone inbegrepen wanneer de site dit rechtvaardigt.',
      'svc3.title': 'Corporate portret',
      'svc3.tag':   'Teams &amp; directie',
      'svc3.p1':    'Individuele portretten, teamportretten, directieportretten. Het doel is niet een pose te bevriezen maar een beeld te produceren dat iemand echt representeert — bruikbaar op LinkedIn, jaarverslag, corporate website of persbericht.',
      'svc3.p2':    'Sessies in studio, op kantoor of op locatie.',
      'svc4.title': 'Wijk &amp; projectlancering',
      'svc4.tag':   'Neighbourhood · Verkoop op plan',
      'svc4.p1':    'Nog voor de eerste steen legt een vastgoedproject zichzelf te koop via de belofte van een leefomgeving. Ik produceer al het visuele materiaal dat die belofte concreet maakt: wijkfilm, luchtopnames van de site, sfeerreportage, sociale media-inhoud aangepast aan elk kanaal.',
      'svc4.p2':    'Een geïntegreerde aanpak — foto, video, drone, sociale strategie — om een project in commercialisatie tot leven te brengen, lang voor de oplevering.',
      'svc5.title': 'Drone &amp; luchtfoto',
      'svc5.tag':   'Gecertificeerde piloot',
      'svc5.p1':    'Gecertificeerde dronepiloot. Luchtopnames voor bouwplaatsen, industriesites, vastgoed, buitenevenementen. Geïntegreerd in een foto/videoproductie of als afzonderlijke dienst.',

      // Why
      'why.label': 'Waarom',
      'why.h2':    'Waarom deze<br/>klanten <em>terugkomen.</em>',
      'why.intro': 'Vier concrete redenen. Geen "waarden", geen "missie".',
      'why.1.h': 'Ervaring',
      'why.1.p': 'Sinds 2009 heb ik geproduceerd voor advocatenkantoren, vastgoedfondsen, agentschappen, Europese instellingen, conferentieorganisatoren. De meesten komen terug. Sommigen zijn er al tien jaar.',
      'why.2.h': 'Anticipatie',
      'why.2.p': 'De helft van een goede opname speelt zich af vóór aankomst. Locatieverkenning, licht, planning, plan B. U betaalt niet alleen de dag zelf — u betaalt de afwezigheid van onverwachte dingen op de dag zelf.',
      'why.3.h': 'Één aanspreekpunt',
      'why.3.p': 'U heeft één aanspreekpunt van de briefing tot de levering. Op projecten die dit vereisen, omring ik me met de beste freelancers van mijn netwerk — cameraman, operator, monteur — in plaats van alles alleen te doen.',
      'why.4.h': 'Eigen materiaal',
      'why.4.p': "Camera's, lenzen, geluid, licht, drone: bijgewerkte professionele uitrusting, in eigen bezit. Geen verborgen huurkosten in offertes, geen last-minute huur.",
      'why.note': '<strong>Ik ben niet de goedkoopste. Ik ben wat nodig is wanneer het resultaat er moet zijn.</strong> Zonder alles bij elke stap opnieuw te moeten uitleggen.',

      // About
      'about.label':    'Over mij',
      'about.h2':       'Thomas <em>Blairon.</em>',
      'about.p1':       'Mijn naam is Thomas Blairon. Ik ben fotograaf en filmmaker in Brussel sinds 2009. Ik heb Pixelshake opgericht om te werken met bedrijven die begrijpen dat een goed gemaakt beeld geen kost is, maar een tool.',
      'about.p2':       'Ik werk solo, versterkt naargelang de projecten door een netwerk van gespecialiseerde freelancers die ik door de jaren heb leren kiezen. Dit laat me toe om wendbaar te zijn bij kleine producties en rigoureus bij grotere, zonder zware infrastructuur te factureren.',
      'about.p3':       'Ik ben niet de goedkoopste, ik ben niet de duurste. Ik ben wat nodig is wanneer u het resultaat nodig heeft, zonder alles bij elke stap opnieuw te moeten uitleggen.',
      'about.p4':       'Gevestigd in Brussel, werk ik voornamelijk in België, Luxemburg en af en toe elders in Europa voor vaste klanten. Ik spreek Frans, Engels en Nederlands.',
      'about.fact1.lbl': 'Actief sinds',
      'about.fact2.lbl': 'Gevestigd in',
      'about.fact3.lbl': 'Dekking',
      'about.fact4.lbl': 'Talen',

      // Contact
      'contact.eyebrow':   'Laten we samenwerken',
      'contact.h2':        'Een project<br/>in <em>gedachten&nbsp;?</em>',
      'contact.sub':       'Het eenvoudigste is me te schrijven met een paar regels over wat u wilt doen. Ik kom dezelfde dag terug bij u.',
      'contact.btn.mail':  'Schrijf naar Thomas',
      'contact.write.lbl': 'Schrijven',
      'contact.call.lbl':  'Bellen',
      'contact.studio.lbl':'Studio',
      'contact.studio.val':'Brussel<br/>België',
      'contact.cov.lbl':   'Dekking',
      'contact.cov.val':   'BE · LU<br/>EU op aanvraag',
      // Form
      'contact.form.name.lbl':    'Naam',
      'contact.form.name.ph':     'Uw naam',
      'contact.form.email.lbl':   'E-mail',
      'contact.form.company.lbl': 'Bedrijf / Project',
      'contact.form.company.ph':  'Promotor, vastgoedfonds, industrie...',
      'contact.form.msg.lbl':     'Bericht',
      'contact.form.msg.ph':      'Beschrijf uw project in een paar regels...',
      'contact.form.submit':      'Bericht verzenden',
      'contact.form.or':          'of rechtstreeks :',
      'contact.form.success':     'Bericht verzonden — ik kom dezelfde dag bij u terug.',
      'contact.form.error':       'Verzendfout. Schrijf rechtstreeks naar <a href="mailto:thomas@pixelshake.be">thomas@pixelshake.be</a>',

      // Footer
      'footer.contact.k': 'Contact',
      'footer.sitemap.k': 'Sitemap',
      'footer.social.k':  'Elders',
      'footer.legal.k':   'Juridisch',
      'footer.legal.rights': '© 2026 — Alle rechten voorbehouden',
    },

    // ─────────────────────────────────────────────────────────
    en: {
      // Nav
      'nav.skip':       'Skip to content',
      'nav.work':       'Work',
      'nav.services':   'Services',
      'nav.why':        'Why',
      'nav.about':      'About',
      'nav.cta':        'Get in touch',
      'nav.mob.city':   'Brussels · Belgium',

      // Hero
      'hero.badge':           'Brussels · Active since 2009',
      'hero.h1.line1':        'Corporate images',
      'hero.h1.line2':        'that <em>do the work.</em>',
      'hero.sub':             'Specialist in photo &amp; video for developers, builders and real estate funds.<br class="d-br"/>Brussels · Belgium · since 2009.',
      'hero.btn.work':        'See the work',
      'hero.btn.contact':     'Get in touch',
      'hero.meta.since.lbl':  'active since',
      'hero.meta.years.lbl':  'years in the field',
      'hero.meta.cov.lbl':    'main coverage',

      // Marquee
      'mq.1': 'Real estate film',
      'mq.2': 'Site monitoring',
      'mq.3': 'Aerial view',
      'mq.4': 'Off-plan sales',
      'mq.5': 'Timelapse',
      'mq.6': 'Architecture &amp; Construction',
      'mq.7': 'Corporate film',
      'mq.8': 'Certified drone',

      // Clients
      'clients.label': 'They trust me',

      // Manifesto
      'manifesto.label':    'What I do',
      'manifesto.h2':       'Specialist in commercial<br/>real estate <em>&amp; industry.</em>',
      'manifesto.p1':       "Fifteen years of on-site production exclusively serving commercial real estate, construction and the Belgian industry.",
      'manifesto.p2':       "Construction sites, assets under commercialisation, industrial sites, corporate films — with the rigour of someone who understands your sector's challenges.",
      'manifesto.signal.k': 'Positioning',
      'manifesto.signal.p': 'Photographer and filmmaker specialised in real estate &amp; industry in Brussels. Fifteen years alongside Belgian developers, builders and industrialists.',
      'manifesto.signal.link': 'Write to Thomas',

      // Pillars
      'pillars.label': 'Services',
      'pillars.h2':    'Six types<br/>of <em>production.</em>',
      'bento1.title': '<em>Presentation</em> film',
      'bento1.body':  'Presentation of a real estate project, neighbourhood film, institutional developer film. To convince even before delivery.',
      'bento1.tag':   'Developer · Off-plan sales',
      'bento2.title': 'Photo <em>reportage</em>',
      'bento2.body':  'Photo reportage of a property, construction site or neighbourhood. Making a building speak without cheating with the light.',
      'bento2.tag':   'Architecture · Real estate',
      'bento3.title': '<em>Interview</em> film',
      'bento3.body':  'Interviews with architects, developers and project stakeholders. Humanising a real estate development through those who carry it.',
      'bento3.tag':   'Interviews · Corporate',
      'bento4.title': 'Social media &amp; <em>strategy</em>',
      'bento4.body':  'Short formats, vertical framing, strategy advice. Content tailored to each channel to attract off-plan buyers.',
      'bento4.tag':   'Social · Digital · Strategy',
      'bento5.title': 'Drone &amp; <em>aerial</em>',
      'bento5.body':  'View of the site, neighbourhood, urban context. Essential to locate a project and reveal its true scale.',
      'bento5.tag':   'Drone · Aerial',
      'bento6.title': 'Site monitoring &amp; <em>timelapse</em>',
      'bento6.body':  'From the first stone to delivery. Timelapse, before/after, valuable archive for the developer and its partners.',
      'bento6.tag':   'Timelapse · Before/After · Long term',

      // Work
      'work.label': 'Recent work',
      'work.h2':    'Recent <em>projects.</em>',
      'work.intro': "A selection of what I've produced in recent months for companies, agencies and institutions in Brussels and beyond.",
      'wc1.tag':   'Industrial reportage',
      'wc1.title': 'Besix — Site monitoring',
      'wc1.sub':   'Brussels · Photo &amp; video · 2025',
      'wc2.tag':   'Commercial real estate',
      'wc2.title': 'Immobel — Office tower',
      'wc2.sub':   'Brussels · Architecture',
      'wc3.tag':   'Certified drone',
      'wc3.title': 'Eiffage — Aerial view',
      'wc3.sub':   'Wallonia · 4K drone',
      'wc4.tag':   'Corporate portraits',
      'wc4.title': 'Board of directors',
      'wc4.sub':   'Brussels · Portraits &amp; team',
      'wc5.tag':   'Event aftermovie',
      'wc5.title': 'Annual convention',
      'wc5.sub':   'Brussels · Reportage &amp; aftermovie',
      'wc6.tag':   'Timelapse',
      'wc6.title': 'AG Real Estate — Timelapse',
      'wc6.sub':   'Brussels · From the first stone to delivery',

      // Videos
      'videos.label': 'Films',
      'videos.h2':    'In <em>motion.</em>',
      'vid1.title': 'Drone &amp; Aerial shots',
      'vid1.sub':   '4K · Certified · Permits included',
      'vid2.title': 'Recruitment — Real estate developer',
      'vid2.sub':   'Corporate · Employer brand · Brussels',
      'vid3.title': 'Automotive brand &amp; event',
      'vid3.sub':   'Brand content · Event · Corporate',
      'vid4.title': 'Industrial roofing',
      'vid4.sub':   'Reportage · Industry · Drone',
      'vid5.title': 'Car manufacturer',
      'vid5.sub':   'Industry · Brand film',
      'vid6.title': 'Real estate developer — Project film',
      'vid6.sub':   'Corporate · Real estate · Brussels',

      // Services
      'svc.label': 'Services',
      'svc.h2':    'Five <em>services</em><br/>in detail.',
      'svc.intro': 'One section per service type. For whom, for what, how.',
      'svc1.title': 'Corporate film',
      'svc1.tag':   'Corporate · Brand',
      'svc1.p1':    "A corporate film is not an animated brochure. It's the rare opportunity to say, in 90 seconds or 10 minutes, what your company really does — with the right angle, the right rhythm, and images that hold up against what your audience sees elsewhere.",
      'svc1.p2':    'I accompany from A to Z: writing, scouting, shooting, editing, delivery. For heavier productions, I coordinate a team of specialist freelancers.',
      'svc2.title': 'Architecture &amp; real estate',
      'svc2.tag':   'Real estate funds · Developers',
      'svc2.p1':    'Offices, industrial sites, logistics, prestige properties. I photograph buildings for real estate funds, developers and architects for over ten years — with particular attention to natural light, the right framing, and the coherence of the series.',
      'svc2.p2':    'Drone included when the site warrants it.',
      'svc3.title': 'Corporate portrait',
      'svc3.tag':   'Teams &amp; executives',
      'svc3.p1':    "Individual portraits, team portraits, executive portraits. The goal is not to freeze a pose but to produce an image that truly represents someone — usable on LinkedIn, annual report, corporate website or press release.",
      'svc3.p2':    'Sessions in studio, at the office, or on site.',
      'svc4.title': 'Neighbourhood &amp; project launch',
      'svc4.tag':   'Neighbourhood · Off-plan sales',
      'svc4.p1':    "Before the first stone is laid, a real estate project sells on the promise of a lifestyle. I produce all the visuals that give substance to that promise: neighbourhood film, aerial views of the site, atmospheric photo reportage, social media content tailored to each channel.",
      'svc4.p2':    "An integrated approach — photo, video, drone, social strategy — to bring a project to life during its commercialisation, well before delivery.",
      'svc5.title': 'Drone &amp; aerial',
      'svc5.tag':   'Certified pilot',
      'svc5.p1':    'Certified drone pilot. Aerial shots for construction sites, industrial sites, real estate, outdoor events. Integrated into a photo/video production or as a dedicated service.',

      // Why
      'why.label': 'Why',
      'why.h2':    'Why these<br/>clients <em>come back.</em>',
      'why.intro': 'Four concrete reasons. No "values", no "mission".',
      'why.1.h': 'Experience',
      'why.1.p': "Since 2009, I've produced for law firms, real estate funds, agencies, European institutions, conference organisers. Most come back. Some have been here for ten years.",
      'why.2.h': 'Anticipation',
      'why.2.p': "Half of a good shoot happens before arriving. Scouting, light, planning, plan B. You don't just pay for the day — you pay for the absence of surprises on the day.",
      'why.3.h': 'One contact person',
      'why.3.p': "You have one point of contact from brief to delivery. On projects that require it, I surround myself with the best freelancers in my network — DoP, camera operator, editor — rather than doing everything alone.",
      'why.4.h': 'Own equipment',
      'why.4.p': "Cameras, lenses, sound, light, drone: up-to-date professional equipment, owned outright. No hidden rental costs in quotes, no last-minute rental.",
      'why.note': "<strong>I'm not the cheapest. I'm what's needed when the result has to be there.</strong> Without having to re-explain everything at every step.",

      // About
      'about.label':    'About',
      'about.h2':       'Thomas <em>Blairon.</em>',
      'about.p1':       "My name is Thomas Blairon. I'm a photographer and filmmaker in Brussels since 2009. I founded Pixelshake to work with companies that understand that a well-made image is not a cost, but a tool.",
      'about.p2':       "I work solo, reinforced on projects by a network of specialist freelancers I've learned to choose over the years. This allows me to be agile on small productions and rigorous on larger ones, without heavy infrastructure to bill.",
      'about.p3':       "I'm not the cheapest, I'm not the most expensive. I'm what's needed when you need the result to be there, without having to re-explain everything at every step.",
      'about.p4':       'Based in Brussels, I work mainly in Belgium, Luxembourg and occasionally elsewhere in Europe for recurring clients. I speak French, English and Dutch.',
      'about.fact1.lbl': 'Active since',
      'about.fact2.lbl': 'Based in',
      'about.fact3.lbl': 'Coverage',
      'about.fact4.lbl': 'Languages',

      // Contact
      'contact.eyebrow':   "Let's work together",
      'contact.h2':        'A project<br/>in <em>mind&nbsp;?</em>',
      'contact.sub':       "The simplest thing is to write to me with a few lines about what you want to do. I'll get back to you the same day.",
      'contact.btn.mail':  'Write to Thomas',
      'contact.write.lbl': 'Write',
      'contact.call.lbl':  'Call',
      'contact.studio.lbl':'Studio',
      'contact.studio.val':'Brussels<br/>Belgium',
      'contact.cov.lbl':   'Coverage',
      'contact.cov.val':   'BE · LU<br/>EU on quote',
      // Form
      'contact.form.name.lbl':    'Name',
      'contact.form.name.ph':     'Your name',
      'contact.form.email.lbl':   'Email',
      'contact.form.company.lbl': 'Company / Project',
      'contact.form.company.ph':  'Developer, real estate fund, industry...',
      'contact.form.msg.lbl':     'Message',
      'contact.form.msg.ph':      'Describe your project in a few lines...',
      'contact.form.submit':      'Send message',
      'contact.form.or':          'or directly:',
      'contact.form.success':     "Message sent — I'll get back to you today.",
      'contact.form.error':       'Send error. Write directly to <a href="mailto:thomas@pixelshake.be">thomas@pixelshake.be</a>',

      // Footer
      'footer.contact.k': 'Contact',
      'footer.sitemap.k': 'Sitemap',
      'footer.social.k':  'Elsewhere',
      'footer.legal.k':   'Legal',
      'footer.legal.rights': '© 2026 — All rights reserved',
    }
  };

  // ─── APPLY LANGUAGE ───
  const applyLang = (lang) => {
    if (!T[lang]) return;
    const dict = T[lang];

    // Update all translatable elements (innerHTML)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.dataset.i18nHtml;
      if (dict[key] !== undefined) el.innerHTML = dict[key];
    });

    // Update placeholder text
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      if (dict[key] !== undefined) el.placeholder = dict[key];
    });

    // Re-split hero lines after innerHTML update (kinetic animation)
    splitHeroLines();

    // Update <html lang> attribute
    document.documentElement.lang = lang;

    // Sync all lang buttons (desktop + mobile)
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const active = btn.dataset.lang === lang;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    // Persist
    localStorage.setItem('ps_lang', lang);
  };

  // ─── LANG BUTTON CLICK ───
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => applyLang(btn.dataset.lang));
  });

  // ─── INIT: restore saved language ───
  const savedLang = localStorage.getItem('ps_lang') || 'fr';
  if (savedLang !== 'fr') applyLang(savedLang);
  // If 'fr', HTML is already correct — just sync button state
  else {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const active = btn.dataset.lang === 'fr';
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  // ─── CONTACT FORM — Netlify Forms AJAX ───
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');
  const formError   = document.getElementById('form-error');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('.form-submit');
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;
      formSuccess.hidden = true;
      formError.hidden   = true;

      try {
        const data = new FormData(contactForm);
        const body = new URLSearchParams(data).toString();

        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body,
        });

        if (res.ok) {
          formSuccess.hidden = false;
          contactForm.reset();
          formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          formError.hidden = false;
        }
      } catch (_) {
        formError.hidden = false;
      } finally {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
      }
    });
  }

})();

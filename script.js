(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  const STORAGE_KEY = 'we11-lang';
  let currentLang = localStorage.getItem(STORAGE_KEY) || 'en';
  const FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)');

  /* ── i18n ── */
  function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const value = translations[lang][key];
      if (value === undefined) return;

      if (el.dataset.i18nSplit === 'words') {
        el.innerHTML = value
          .split(/\s+/)
          .filter(Boolean)
          .map((word) => `<span class="hero__word">${word}</span>`)
          .join(' ');
        return;
      }

      el.textContent = value;
    });

    document.querySelectorAll('.lang-switch__option').forEach((opt) => {
      opt.classList.toggle('lang-switch__option--active', opt.dataset.lang === lang);
    });
  }

  function initLanguage() {
    const switcher = document.getElementById('langSwitch');
    if (!switcher) return;

    switcher.addEventListener('click', (e) => {
      const target = e.target.closest('[data-lang]');
      if (!target) return;
      const lang = target.dataset.lang;
      if (lang && lang !== currentLang) {
        setLanguage(lang);
      }
    });

    setLanguage(currentLang);
  }

  /* ── Hero animations ── */
  function initHero() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.from('.hero__status', { y: 24, opacity: 0, duration: 0.7 })
      .from(
        '.hero__title-line--brand .hero__word',
        { y: '110%', opacity: 0, duration: 0.85, stagger: 0.1 },
        '-=0.35'
      )
      .from(
        '.hero__title-line--accent .hero__word, .hero__title-line:not(.hero__title-line--brand):not(.hero__title-line--accent) .hero__word',
        {
          y: 28,
          opacity: 0,
          filter: 'blur(8px)',
          duration: 0.8,
          stagger: 0.12,
        },
        '-=0.55'
      )
      .from('.hero__subtitle', { y: 20, opacity: 0, duration: 0.7 }, '-=0.35')
      .from('.hero__facts', { y: 16, opacity: 0, duration: 0.65 }, '-=0.45')
      .from('.hero__actions .btn', { y: 16, opacity: 0, duration: 0.6, stagger: 0.1 }, '-=0.3')
      .from('.hero__scroll', { opacity: 0, duration: 0.5 }, '-=0.2');

    gsap.to('.hero__orb--light', {
      y: 120,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.2,
        markers: false,
      },
    });

    gsap.to('.hero__orb--shade', {
      y: -80,
      x: 40,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
        markers: false,
      },
    });

    gsap.to('.hero__grid', {
      y: 60,
      opacity: 0.3,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
        markers: false,
      },
    });
  }

  /* ── Section scroll reveals ── */
  function initSectionReveals() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.querySelectorAll('.section-reveal').forEach((section) => {
      const header = section.querySelector('.section-header');
      const cards = section.querySelectorAll('.card');
      const skills = section.querySelectorAll('.skill-item');

      if (reduced) {
        gsap.set([header, ...cards, ...skills], { opacity: 1, y: 0 });
        return;
      }

      gsap.set(header, { opacity: 0, y: 36 });
      if (cards.length) gsap.set(cards, { opacity: 0, y: 36 });
      if (skills.length) gsap.set(skills, { opacity: 0, y: 24 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          toggleActions: 'play none none none',
          markers: false,
        },
      });

      tl.to(header, {
        opacity: 1,
        y: 0,
        duration: 0.75,
        ease: 'power3.out',
      });

      if (cards.length) {
        tl.to(
          cards,
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power3.out',
          },
          '-=0.45'
        );
      }

      if (skills.length) {
        tl.to(
          skills,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power3.out',
          },
          '-=0.4'
        );
      }
    });
  }

  /* ── Card tilt ── */
  function initCardTilt() {
    if (!FINE_POINTER.matches) return;

    document.querySelectorAll('.card--tilt').forEach((card) => {
      let ticking = false;

      card.addEventListener('mousemove', (e) => {
        if (ticking) return;
        ticking = true;

        requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          card.style.setProperty('--tilt-x', `${(y * -5).toFixed(2)}deg`);
          card.style.setProperty('--tilt-y', `${(x * 5).toFixed(2)}deg`);
          ticking = false;
        });
      });

      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
        card.classList.remove('card--tilt-active');
      });

      card.addEventListener('mouseenter', () => {
        card.classList.add('card--tilt-active');
      });
    });
  }

  /* ── Magnetic buttons ── */
  function initMagnetic() {
    if (!FINE_POINTER.matches) return;

    document.querySelectorAll('.magnetic').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(el, {
          x: x * 0.2,
          y: y * 0.2,
          duration: 0.35,
          ease: 'power2.out',
        });
      });

      el.addEventListener('mouseleave', () => {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.5)',
        });
      });
    });
  }

  /* ── Custom cursor ── */
  function initCustomCursor() {
    if (!FINE_POINTER.matches) return;

    const cursor = document.querySelector('.cursor');
    if (!cursor) return;

    document.body.classList.add('has-custom-cursor');

    gsap.set(cursor, { xPercent: -50, yPercent: -50, x: window.innerWidth / 2, y: window.innerHeight / 2 });

    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3.out' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3.out' });

    window.addEventListener('mousemove', (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
    });

    const hoverTargets = 'a, button, .card--tilt, .lang-switch, .btn, .header__link';
    document.querySelectorAll(hoverTargets).forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('cursor--hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('cursor--hover'));
    });

    document.addEventListener('mouseleave', () => cursor.classList.remove('cursor--visible'));
    document.addEventListener('mouseenter', () => cursor.classList.add('cursor--visible'));
    cursor.classList.add('cursor--visible');
  }

  /* ── Header scroll state ── */
  function initHeader() {
    const header = document.querySelector('.header');
    if (!header) return;

    ScrollTrigger.create({
      start: 'top -80',
      markers: false,
      onUpdate: (self) => {
        header.style.borderBottomColor =
          self.scroll() > 40 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.08)';
      },
    });
  }

  /* ── Boot ── */
  function init() {
    initLanguage();
    initHero();
    initSectionReveals();
    initCardTilt();
    initMagnetic();
    initCustomCursor();
    initHeader();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

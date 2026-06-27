(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  const STORAGE_KEY = 'we11-lang';
  let currentLang = localStorage.getItem(STORAGE_KEY) || 'en';
  let activeTab = 'bots';
  let panelTween = null;

  /* ── i18n ── */
  function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const value = translations[lang][key];
      if (value !== undefined) {
        el.textContent = value;
      }
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

    tl.from('.hero__badge', { y: 24, opacity: 0, duration: 0.7 })
      .from(
        '.hero__title-line .hero__word',
        { y: '110%', opacity: 0, duration: 0.85, stagger: 0.12 },
        '-=0.35'
      )
      .from('.hero__subtitle', { y: 20, opacity: 0, duration: 0.7 }, '-=0.45')
      .from('.hero__actions .btn', { y: 16, opacity: 0, duration: 0.6, stagger: 0.1 }, '-=0.4')
      .from('.hero__scroll', { opacity: 0, duration: 0.5 }, '-=0.2');

    gsap.to('.hero__orb--yellow', {
      y: 120,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.2,
      },
    });

    gsap.to('.hero__orb--red', {
      y: -80,
      x: 40,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
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
      },
    });
  }

  /* ── Scroll reveals ── */
  function initReveals(scope) {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targets = scope
      ? scope.querySelectorAll('.reveal:not(.revealed)')
      : document.querySelectorAll('.reveal:not(.revealed)');

    if (reduced) {
      targets.forEach((el) => {
        el.classList.add('revealed');
        gsap.set(el, { clearProps: 'all' });
      });
      return;
    }

    targets.forEach((el) => {
      el.classList.add('revealed');
      gsap.fromTo(
        el,
        { y: 48, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    });
  }

  /* ── Tab switching ── */
  function switchTab(tabId) {
    if (tabId === activeTab) return;

    const prevPanel = document.querySelector(`.panel[data-panel="${activeTab}"]`);
    const nextPanel = document.querySelector(`.panel[data-panel="${tabId}"]`);
    if (!prevPanel || !nextPanel) return;

    document.querySelectorAll('.tabs__btn').forEach((btn) => {
      const isActive = btn.dataset.tab === tabId;
      btn.classList.toggle('tabs__btn--active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    if (panelTween) panelTween.kill();

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      prevPanel.hidden = true;
      prevPanel.classList.remove('panel--active');
      nextPanel.hidden = false;
      nextPanel.classList.add('panel--active');
      activeTab = tabId;
      initReveals(nextPanel);
      return;
    }

    panelTween = gsap.timeline({
      onComplete: () => {
        prevPanel.hidden = true;
        activeTab = tabId;
        initReveals(nextPanel);
      },
    });

    panelTween
      .to(prevPanel, {
        opacity: 0,
        y: -16,
        duration: 0.28,
        ease: 'power2.in',
        onComplete: () => {
          prevPanel.classList.remove('panel--active');
          nextPanel.hidden = false;
          nextPanel.classList.add('panel--active');
          gsap.set(nextPanel, { opacity: 0, y: 20 });
        },
      })
      .to(nextPanel, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'power3.out',
      });
  }

  function initTabs() {
    document.querySelectorAll('.tabs__btn').forEach((btn) => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
  }

  /* ── Magnetic buttons ── */
  function initMagnetic() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    document.querySelectorAll('.magnetic').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(el, {
          x: x * 0.25,
          y: y * 0.25,
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

  /* ── Cursor glow ── */
  function initCursorGlow() {
    const glow = document.querySelector('.cursor-glow');
    if (!glow || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    window.addEventListener('mousemove', (e) => {
      gsap.to(glow, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.6,
        ease: 'power2.out',
      });
    });
  }

  /* ── Header scroll state ── */
  function initHeader() {
    const header = document.querySelector('.header');
    if (!header) return;

    ScrollTrigger.create({
      start: 'top -80',
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
    initReveals();
    initTabs();
    initMagnetic();
    initCursorGlow();
    initHeader();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

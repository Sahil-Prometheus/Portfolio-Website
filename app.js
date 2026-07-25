/* ============================================================
   Sahil Gohel Portfolio — Motion System
   Lenis smooth scroll + GSAP ScrollTrigger + custom cursor +
   hero load sequence + staggered reveals + sticky header
   ============================================================ */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  var root = document.documentElement;

  if (prefersReducedMotion) {
    root.classList.add('reduced-motion');
    root.classList.add('no-cursor');
  }
  if (isTouch) {
    root.classList.add('no-cursor');
  }

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- helpers: text splitting ---------------- */
  function splitToWords(el) {
    if (!el) return [];
    var walker = Array.prototype.slice.call(el.childNodes);

    el.innerHTML = '';
    walker.forEach(function (node) {
      if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') {
        el.appendChild(document.createElement('br'));
        return;
      }
      var text = node.textContent || '';
      var words = text.split(/(\s+)/).filter(function (w) { return w.length; });
      words.forEach(function (w) {
        if (/^\s+$/.test(w)) {
          el.appendChild(document.createTextNode(w));
          return;
        }
        var span = document.createElement('span');
        span.className = 'split-word';
        span.style.display = 'inline-block';
        span.style.opacity = '0';
        span.style.clipPath = 'inset(0 0 100% 0)';
        span.textContent = w;
        el.appendChild(span);
      });
    });
    return Array.prototype.slice.call(el.querySelectorAll('.split-word'));
  }

  /* ============================================================
     LENIS SMOOTH SCROLL
     ============================================================ */
  var lenis = null;
  if (!prefersReducedMotion && window.Lenis) {
    lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });
    window.__lenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    if (window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }

    // Anchor links integrate with Lenis
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length > 1) {
          var target = document.querySelector(id);
          if (target) {
            e.preventDefault();
            lenis.scrollTo(target, { offset: -40, duration: 1.4 });
          }
        }
      });
    });
  }

  /* ============================================================
     CUSTOM CURSOR
     ============================================================ */
  if (!prefersReducedMotion && !isTouch) {
    var dot = document.getElementById('cursor-dot');
    var ring = document.getElementById('cursor-ring');
    if (dot && ring) {
    var mx = window.innerWidth / 2,
      my = window.innerHeight / 2;
    var rx = mx,
      ry = my;

    window.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
    });

    function cursorLoop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      requestAnimationFrame(cursorLoop);
    }
    requestAnimationFrame(cursorLoop);

    document.querySelectorAll('[data-cursor="hover"]').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        ring.classList.add('is-hover');
      });
      el.addEventListener('mouseleave', function () {
        ring.classList.remove('is-hover');
      });
    });
    document.querySelectorAll('[data-cursor="text"]').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        ring.classList.add('is-text');
      });
      el.addEventListener('mouseleave', function () {
        ring.classList.remove('is-text');
      });
    });

    document.addEventListener('mouseleave', function () {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', function () {
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    });
    }
  }

  /* ============================================================
     HERO LOAD SEQUENCE
     ============================================================ */
  function runHeroSequence() {
    var heroPhoto = document.getElementById('hero-photo');
    var heroName = document.getElementById('hero-name');
    var heroLabel = document.getElementById('hero-label');
    var heroTagline = document.getElementById('hero-tagline');
    var heroStatement = document.getElementById('hero-statement');
    var heroBottom = document.querySelector('.hero-bottom');

    if (!heroPhoto || !heroName) return;

    if (prefersReducedMotion) {
      heroPhoto.style.opacity = '1';
      heroPhoto.style.transform = 'scale(1)';
      heroName.style.opacity = '1';
      heroName.style.filter = 'blur(0)';
      return;
    }

    if (!window.gsap) {
      heroPhoto.style.opacity = '1';
      heroPhoto.style.transform = 'scale(1)';
      heroName.style.opacity = '1';
      heroName.style.filter = 'blur(0)';
      return;
    }

    var labelWords = heroLabel ? splitToWords(heroLabel) : [];
    var taglineWords = heroTagline ? splitToWords(heroTagline) : [];
    var statementWords = heroStatement ? splitToWords(heroStatement) : [];

    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // 1. background/photo reveal — zoom-out + fade, ~1.2s
    tl.to(heroPhoto, { opacity: 1, duration: 1.2, ease: 'power2.out' }, 0.1);
    tl.to(heroPhoto, { scale: 1, duration: 1.4, ease: 'power3.out' }, 0.1);

    // 2. name: blur-to-sharp + fade
    tl.to(heroName, { opacity: 1, filter: 'blur(0px)', duration: 1.1, ease: 'power2.out' }, 0.35);

    // 3. staggered text — label, tagline, statement (opacity + clip-path, one-time load so transform ok too)
    if (labelWords.length) {
      tl.to(labelWords, {
        opacity: 1,
        clipPath: 'inset(0 0 0% 0)',
        duration: 0.7,
        stagger: 0.03,
      }, 0.15);
    }
    if (taglineWords.length) {
      tl.to(taglineWords, {
        opacity: 1,
        clipPath: 'inset(0 0 0% 0)',
        duration: 0.7,
        stagger: 0.02,
      }, 0.55);
    }
    if (statementWords.length) {
      tl.to(statementWords, {
        opacity: 1,
        clipPath: 'inset(0 0 0% 0)',
        duration: 0.6,
        stagger: 0.02,
      }, 0.8);
    }

    // hero bottom bar fade
    if (heroBottom) {
      tl.from(heroBottom, { opacity: 0, y: 12, duration: 0.7 }, 0.9);
    }
  }

  /* ============================================================
     HERO SCROLL-ZOOM (pinned, scrubbed camera push-through)
     ============================================================ */
  function initHeroZoom() {
    var zoomEl = document.getElementById('hero-zoom');
    var hero = document.querySelector('.hero');
    if (!zoomEl || !hero) return;

    if (prefersReducedMotion || !window.gsap || !window.ScrollTrigger) {
      // Static fallback: no pin, no scale — just a normal section in flow.
      zoomEl.style.transform = 'none';
      zoomEl.style.opacity = '1';
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    gsap.to(zoomEl, {
      scale: 8,
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: '+=100%', // ~1 viewport height of scroll
        scrub: true,
        pin: hero,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
  }

  /* ============================================================
     WORK WHEEL — circular revolving project gallery
     Cards positioned via rotate()+translateY(radius)+counter-rotate.
     Rotation driven by scroll (ScrollTrigger scrub, pinned) and by
     pointer drag with inertia + gentle snap-to-card on release.
     ============================================================ */
  function initWorkWheel() {
    var wheel = document.getElementById('work-wheel');
    var stage = document.getElementById('work-wheel-stage');
    var hint = document.getElementById('work-wheel-hint');
    if (!wheel || !stage) return;

    var items = Array.prototype.slice.call(stage.querySelectorAll('.ww-item'));
    var count = items.length;
    if (!count) return;

    var step = 360 / count;
    var totalSweep = (count - 1) * step;

    if (prefersReducedMotion) {
      // Flat, static, horizontally-scrollable strip — handled entirely by CSS.
      return;
    }

    if (hint) {
      setTimeout(function () { hint.classList.add('is-visible'); }, 400);
    }

    var cards = items.map(function (item) { return item.querySelector('.ww-card'); });

    var scrollRotationDeg = 0;
    var dragOffsetDeg = 0;
    var isDragging = false;
    var startX = 0;
    var startDragOffset = 0;
    var lastX = 0;
    var lastT = 0;
    var velocity = 0;
    var dragState = { val: 0 };

    function getRadius() {
      var h = wheel.clientHeight;
      var w = wheel.clientWidth;
      return Math.min(h * 0.66, w * 0.62);
    }

    function render() {
      var h = wheel.clientHeight;
      var radius = getRadius();
      var focusY = h * 0.46; // where the focused card's centre should sit
      var centerOffset = focusY + radius; // circle centre, pushed below the container
      var totalRotation = scrollRotationDeg + dragOffsetDeg;

      items.forEach(function (item, i) {
        var card = cards[i];
        if (!card) return;

        var angleDeg = i * step - totalRotation;
        // Normalize to shortest signed distance from focus (0deg / top of circle)
        var normalized = ((angleDeg % 360) + 540) % 360 - 180;

        item.style.transform =
          'translateY(' + centerOffset + 'px) rotate(' + angleDeg + 'deg) translateY(-' + radius + 'px) rotate(' + (-angleDeg) + 'deg)';

        var absDeg = Math.abs(normalized);
        var t = Math.min(absDeg / 100, 1); // falloff window: 100deg from focus
        var eased = 1 - Math.pow(1 - t, 2); // ease-out falloff
        var scale = 1 - eased * 0.48; // 1 -> 0.52
        var opacity = 1 - eased * 0.85; // 1 -> 0.15
        var z = Math.round((1 - t) * 100);

        card.style.setProperty('--ww-scale', scale.toFixed(3));
        card.style.setProperty('--ww-opacity', opacity.toFixed(3));
        card.style.zIndex = z;

        // Use inert attribute for better accessibility - auto-blurs, removes from tab order, hides from AT
        if (t > 0.88) {
          card.inert = true;
        } else {
          card.inert = false;
        }
      });
    }

    render();
    window.addEventListener('resize', render);

    /* ---- Scroll-driven rotation (pinned + scrubbed) ---- */
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);

      ScrollTrigger.create({
        trigger: wheel,
        start: 'top top',
        end: '+=140%',
        scrub: true,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          scrollRotationDeg = self.progress * totalSweep;
          render();
        },
      });
    }

    /* ---- Drag-to-rotate with inertia + gentle snap ---- */
    function clamp(v, min, max) {
      return Math.max(min, Math.min(max, v));
    }

    function onPointerDown(e) {
      isDragging = true;
      wheel.classList.add('is-dragging');
      try { wheel.setPointerCapture(e.pointerId); } catch (err) {}
      startX = e.clientX;
      startDragOffset = dragOffsetDeg;
      lastX = e.clientX;
      lastT = performance.now();
      velocity = 0;
      if (window.gsap) gsap.killTweensOf(dragState);
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      var radius = getRadius();
      var dx = e.clientX - startX;
      // deg per px scales with radius so drag feel stays consistent across breakpoints
      var sensitivity = 5400 / Math.max(radius, 120);
      dragOffsetDeg = startDragOffset - dx * (sensitivity / 100);

      var now = performance.now();
      var dt = now - lastT;
      if (dt > 0) {
        velocity = (-(e.clientX - lastX) * (sensitivity / 100)) / (dt / 1000);
      }
      lastX = e.clientX;
      lastT = now;
      render();
    }

    function endDrag() {
      if (!isDragging) return;
      isDragging = false;
      wheel.classList.remove('is-dragging');

      var flingDistance = clamp(velocity * 0.2, -260, 260);
      var provisional = dragOffsetDeg + flingDistance;
      var combined = scrollRotationDeg + provisional;
      var nearest = Math.round(combined / step) * step;
      var targetDragOffset = nearest - scrollRotationDeg;

      if (window.gsap) {
        dragState.val = dragOffsetDeg;
        gsap.to(dragState, {
          val: targetDragOffset,
          duration: 0.9,
          ease: 'power3.out',
          onUpdate: function () {
            dragOffsetDeg = dragState.val;
            render();
          },
        });
      } else {
        dragOffsetDeg = targetDragOffset;
        render();
      }
    }

    wheel.addEventListener('pointerdown', onPointerDown);
    wheel.addEventListener('pointermove', onPointerMove);
    wheel.addEventListener('pointerup', endDrag);
    wheel.addEventListener('pointercancel', endDrag);
    wheel.addEventListener('pointerleave', function () { if (isDragging) endDrag(); });
  }

  /* ============================================================
     SCROLL REVEALS (GSAP ScrollTrigger, Lenis-driven)
     ============================================================ */
  function initScrollReveals() {
    var revealEls = document.querySelectorAll('.reveal');

    if (prefersReducedMotion || !window.gsap || !window.ScrollTrigger) {
      revealEls.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    revealEls.forEach(function (el) {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        onEnter: function () {
          el.classList.add('is-visible');
        },
        once: true,
      });
    });

    // Work-card stagger: 100ms delay between each
    var worksList = document.getElementById('works-list');
    var cards = worksList ? worksList.querySelectorAll('.work-card') : [];
    if (worksList && cards.length) {
      ScrollTrigger.create({
        trigger: worksList,
        start: 'top 80%',
        once: true,
        onEnter: function () {
          gsap.to(cards, {
            opacity: 1,
            duration: 0.01,
          });
          cards.forEach(function (card, i) {
            card.classList.add('is-visible');
            gsap.fromTo(
              card,
              { clipPath: 'inset(0 0 40% 0)', opacity: 0 },
              { clipPath: 'inset(0 0 0% 0)', opacity: 1, duration: 0.8, delay: i * 0.1, ease: 'power3.out' }
            );
          });
        },
      });
    }

    // Note: the old subtle hero-photo parallax was removed — superseded by
    // the pinned scroll-zoom in initHeroZoom(), which already drives all
    // hero motion via #hero-zoom's scale/opacity scrub.

    // Showcase visibility trigger for image reveal
    var showcase = document.querySelector('.showcase');
    if (showcase) {
      ScrollTrigger.create({
        trigger: showcase,
        start: 'top 70%',
        once: true,
        onEnter: function () {
          showcase.classList.add('is-visible');
        },
      });
    }

    // Footer counter — count up project count on reveal
    /*var siteFooter = document.querySelector('.site-footer');
    var footerCounter = document.getElementById('footer-counter');
    if (siteFooter && footerCounter) {
      ScrollTrigger.create({
        trigger: siteFooter,
        start: 'top 90%',
        once: true,
        onEnter: function () {
          var obj = { val: 0 };
          gsap.to(obj, {
            val: 5,
            duration: 1.2,
            ease: 'power2.out',
            onUpdate: function () {
              footerCounter.textContent = '(' + Math.round(obj.val) + ')';
            },
          });
        },
      });
    }*/
  }

  /* ============================================================
     SECTION INDEX — fixed right-side scrollspy nav
     ============================================================ */
  function initSectionNav() {
    var navItems = Array.prototype.slice.call(document.querySelectorAll('.section-nav-item'));
    if (!navItems.length) return;

    var entries = navItems
      .map(function (item) {
        var section = document.getElementById(item.getAttribute('data-section'));
        return section ? { item: item, section: section, dot: item.querySelector('.section-nav-dot') } : null;
      })
      .filter(Boolean);

    if (!entries.length) return;

    var currentActive = 0;

    function setActive(index) {
      if (index === currentActive) return;
      currentActive = index;
      paintDots();
      entries.forEach(function (entry, i) {
        entry.item.classList.toggle('is-active', i === index);
      });
    }

    // Reads live theme colors from CSS variables so dots stay correct
    // after a light/dark toggle (GSAP sets inline styles that would
    // otherwise go stale when the underlying variables change).
    function paintDots() {
      var rootStyle = getComputedStyle(document.documentElement);
      var activeColor = rootStyle.getPropertyValue('--accent-2').trim();
      var inactiveColor = rootStyle.getPropertyValue('--border').trim();
      entries.forEach(function (entry, i) {
        if (!entry.dot) return;
        var isActive = i === currentActive;
        if (window.gsap) {
          gsap.to(entry.dot, {
            scale: isActive ? 1.6 : 1,
            backgroundColor: isActive ? activeColor : inactiveColor,
            duration: 0.45,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        }
      });
    }

    window.__refreshSectionNavColors = paintDots;

    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      var triggers = entries.map(function (entry, i) {
        var config = {
          trigger: entry.section,
          start: 'top 75%',
          onEnter: function () { setActive(i); },
          onEnterBack: function () { setActive(i); },
        };
        if (i < entries.length - 1) {
          config.endTrigger = entries[i + 1].section;
          config.end = 'top 75%';
        } else {
          config.endTrigger = document.body;
          config.end = 'bottom bottom';
        }
        return ScrollTrigger.create(config);
      });
      ScrollTrigger.refresh();

      // Creation/refresh can fire spurious onEnter/onEnterBack callbacks out
      // of order; force the correct active item based on real scroll position.
      var scrollY = window.scrollY || window.pageYOffset || 0;
      var initialIndex = 0;
      for (var i = triggers.length - 1; i >= 0; i--) {
        if (scrollY >= triggers[i].start) {
          initialIndex = i;
          break;
        }
      }
      currentActive = -1;
      setActive(initialIndex);
    } else if (window.IntersectionObserver) {
      var observer = new IntersectionObserver(
        function (obsEntries) {
          obsEntries.forEach(function (obsEntry) {
            if (obsEntry.isIntersecting) {
              var idx = entries.findIndex(function (e) { return e.section === obsEntry.target; });
              if (idx > -1) setActive(idx);
            }
          });
        },
        { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
      );
      entries.forEach(function (entry) { observer.observe(entry.section); });
    }
  }

  /* ============================================================
     STICKY HEADER — hide on scroll down, show on scroll up
     ============================================================ */
  function initHeaderScroll() {
    var header = document.getElementById('site-header');
    if (!header) return;
    var lastY = window.scrollY;
    var ticking = false;

    function update() {
      var y = window.scrollY;
      if (y > 40) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
      if (y > lastY && y > 160) {
        header.classList.add('is-hidden');
      } else {
        header.classList.remove('is-hidden');
      }
      lastY = y;
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    if (lenis) {
      lenis.on('scroll', onScroll);
    } else {
      window.addEventListener('scroll', onScroll, { passive: true });
    }
  }

  /* ============================================================
     THEME TOGGLE — light/dark switch with cookie persistence + prefers-color-scheme
     ============================================================ */
  function initThemeToggle() {
    var root = document.documentElement;
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;

    var COOKIE_KEY = 'sg-theme';

    // Cookie-based persistence (not browser storage APIs) so the choice
    // survives a reload even inside a sandboxed preview context.
    function readThemeCookie() {
      var match = document.cookie.match('(?:^|; )' + COOKIE_KEY + '=([^;]+)');
      return match ? decodeURIComponent(match[1]) : null;
    }

    function writeThemeCookie(value) {
      var expires = new Date(Date.now() + 400 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = COOKIE_KEY + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/; SameSite=Lax';
    }

    function syncButtonState(theme) {
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    }

    function applyTheme(theme) {
      root.setAttribute('data-theme', theme);
      syncButtonState(theme);
      try {
        writeThemeCookie(theme);
      } catch (e) {
        /* cookie write blocked — theme still applies for this session */
      }
      if (window.__refreshSectionNavColors) window.__refreshSectionNavColors();
    }

    // The inline bootstrap script in <head> already set data-theme before
    // first paint (avoids flash-of-wrong-theme) — just sync the button's
    // aria state to match whatever it picked.
    syncButtonState(root.getAttribute('data-theme') || 'dark');

    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      if (window.gsap && !prefersReducedMotion) {
        gsap.fromTo(btn, { rotate: 0 }, { rotate: next === 'dark' ? -180 : 180, duration: 0.5, ease: 'back.out(1.8)' });
      }
    });

    // Keep in sync if the user changes their OS-level theme while on the
    // page and hasn't explicitly overridden it via the toggle.
    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: light)');
      var onSchemeChange = function (e) {
        var stored = null;
        try { stored = readThemeCookie(); } catch (err) {}
        if (stored === 'light' || stored === 'dark') return; // explicit user choice wins
        applyTheme(e.matches ? 'light' : 'dark');
      };
      if (mq.addEventListener) mq.addEventListener('change', onSchemeChange);
      else if (mq.addListener) mq.addListener(onSchemeChange);
    }
  }

  /* ---------------- boot ---------------- */
  window.addEventListener('load', function () {
    runHeroSequence();
    initHeroZoom();
    initWorkWheel();
    initScrollReveals();
    initHeaderScroll();
    initSectionNav();
    initThemeToggle();
    initModal();
  });

  // Fallback in case 'load' already fired or is slow
  if (document.readyState === 'complete') {
    runHeroSequence();
    initHeroZoom();
    initWorkWheel();
    initScrollReveals();
    initHeaderScroll();
    initSectionNav();
    initThemeToggle();
  }

  /* ---------------- MODAL FUNCTIONALITY ---------------- */
  function initModal() {
    var modalOverlay = document.getElementById('modal-overlay');
    var modalContainer = document.getElementById('modal-container');
    var modalClose = document.getElementById('modal-close');
    var modalContent = document.getElementById('modal-content');

    if (!modalOverlay || !modalClose) return;

    // Open modal on click
    document.querySelectorAll('.modal-trigger').forEach(function(trigger) {
      trigger.addEventListener('click', function(e) {
        e.preventDefault();
        var caseStudyId = this.getAttribute('data-modal');
        openModal(caseStudyId);
      });
    });

    // Close modal on close button click
    if (modalClose) {
      modalClose.addEventListener('click', function() {
        closeModal();
      });
    }

    // Close modal on overlay click
    modalOverlay.addEventListener('click', function(e) {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
  }

  function openModal(caseStudyId) {
    var modalOverlay = document.getElementById('modal-overlay');
    var modalContainer = document.getElementById('modal-container');
    var modalContent = document.getElementById('modal-content');

    if (!modalOverlay || !modalContent) return;

    // Fetch content based on case study ID (placeholder for now)
    var caseStudyData = getCaseStudyData(caseStudyId);
    
    // Populate modal with data
    modalContent.innerHTML = 
      '<h2>' + caseStudyData.title + '</h2>' +
      '<p class="modal-client">' + caseStudyData.client + '</p>' +
      '<div class="modal-desc">' + caseStudyData.description + '</div>' +
      '<div class="modal-details">' +
        caseStudyData.details.map(function(detail) {
          return '<div class="modal-detail-item"><div class="modal-detail-label">' + detail.label + '</div><div class="modal-detail-text">' + detail.text + '</div></div>';
        }).join('') +
      '</div>';

    // GSAP animation to open modal
    gsap.to(modalOverlay, {
      opacity: 1,
      visibility: 'visible',
      duration: 0.3,
      ease: 'power2.out'
    });

    gsap.fromTo(modalContainer, 
      { y: 50, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.2)' }
    );

    // Disable body scroll
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    var modalOverlay = document.getElementById('modal-overlay');
    var modalContainer = document.getElementById('modal-container');

    if (!modalOverlay) return;

    // GSAP animation to close modal
    gsap.to(modalOverlay, {
      opacity: 0,
      visibility: 'hidden',
      duration: 0.3,
      ease: 'power2.in'
    });

    gsap.to(modalContainer, {
      y: 50,
      opacity: 0,
      scale: 0.9,
      duration: 0.3,
      ease: 'power2.in'
    });

    // Re-enable body scroll
    setTimeout(function() {
      document.body.style.overflow = '';
    }, 300);
  }

  function getCaseStudyData(caseStudyId) {
    // Placeholder data - replace with actual content later
    var caseStudies = {
      'work-1': {
        title: 'Conversational AI for brand insights',
        client: 'Global FMCG Leader &middot; Implementation Lead',
        description: '<p>Rolled out a conversational AI pilot integrating brand tracker, panel, ad spend, and sales data — letting insights teams query years of data in plain language instead of waiting in an analyst queue. Led the full cycle: demos, client feedback loops, iterative product improvement.</p>',
        details: [
          { label: 'Year', text: '2025' },
          { label: 'Role', text: 'Implementation Lead' },
          { label: 'Tools', text: 'LLM APIs, RAG, Figma' }
        ]
      },
      'work-2': {
        title: 'Connected insights ecosystem',
        client: 'Fortune 50 Client &middot; Analytics Engagement Lead',
        description: '<p>Designed a unified decision layer connecting brand tracker, consumer panel, Nielsen, ad spend, and CSAT data into one set of dashboards — replacing fragmented, duplicated reporting with a single view.</p>',
        details: [
          { label: 'Year', text: '2024' },
          { label: 'Role', text: 'Analytics Engagement Lead' },
          { label: 'Impact', text: '$250K in annual cost savings' }
        ]
      },
      'work-3': {
        title: 'Hyper-personalised SKU recommendations',
        client: 'Global FMCG Giant &middot; Data Scientist',
        description: '<p>Built SKU-level recommendation models personalised to individual retailers, turning portfolio data into store-ready sell-in stories.</p>',
        details: [
          { label: 'Year', text: '2022' },
          { label: 'Role', text: 'Data Scientist' },
          { label: 'Impact', text: 'Drove measurable retailer uptake' }
        ]
      },
      'work-4': {
        title: 'Marketing mix models for luxury beauty',
        client: 'Luxury Beauty Retailer &middot; Marketing Analytics Lead',
        description: '<p>Developed MMM models quantifying the revenue contribution of each channel, giving the brand an evidence base for budget allocation.</p>',
        details: [
          { label: 'Year', text: '2020' },
          { label: 'Role', text: 'Marketing Analytics Lead' },
          { label: 'Impact', text: 'Optimised multi-channel marketing spend' }
        ]
      },
      'work-5': {
        title: 'NLP-driven NPS analysis',
        client: 'Leading Life Insurance Provider &middot; Text Analytics Lead',
        description: '<p>Identified the drivers behind NPS movement from open-text feedback at scale. Designed NLP analysis over customer verbatims to isolate what actually moved satisfaction.</p>',
        details: [
          { label: 'Year', text: '2019' },
          { label: 'Role', text: 'Text Analytics Lead' },
          { label: 'Tools', text: 'NLP, Python, Scikit-learn' }
        ]
      }
    };

    return caseStudies[caseStudyId] || {
      title: 'Case Study',
      client: '',
      description: '<p>Details coming soon.</p>',
      details: []
    };
  }
})();

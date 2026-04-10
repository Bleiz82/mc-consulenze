/* ============================================================
   M&C Elaborazioni e Consulenze — main.js V4 Premium
   Vanilla JS + GSAP 3.12 + ScrollTrigger + Lenis
   ============================================================ */
(function () {
  'use strict';

  if('scrollRestoration' in history) history.scrollRestoration='manual';

  var FRAME_COUNT = 141;
  var FRAME_PATH = 'img/hero-frames/frame-';
  var FRAME_EXT = '.webp';
  var PRELOAD_BATCH = 10;
  var OVERLAY_SHOW = 0.75;
  var OVERLAY_HIDE = 0.97;

  window.addEventListener('load', function () {
    setTimeout(init, 120);
  });

  function init() {
    console.log('[MC] init V4 start');
    initHeader();
    initHamburger();
    initHeroCanvas();
    initCounters();
    initFAQ();
    initGSAPAnimations();
    initMagneticButtons();
    initTiltCards();
    initParallaxTeam();
    initScrollProgress();
    initCursorFollower();
    initParallaxLayers();
    initImageWipeReveal();
    initKeywordHighlight();
    initTextRevealAnimations();
    initHeadingLineReveal();
    setTimeout(initChatbot, 500);
    console.log('[MC] init V4 complete');
  }

  function initLenis() {
    if (typeof Lenis === 'undefined') { console.warn('[MC] Lenis non trovato'); return; }
    var lenis = new Lenis({ duration: 1.2, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true, smoothTouch: false });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var target = document.querySelector(this.getAttribute('href'));
        if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: -80 }); }
      });
    });
    console.log('[MC] Lenis OK');
  }

  function initHeader() {
    var header = document.getElementById('site-header');
    var hero = document.getElementById('hero');
    if (!header || !hero) return;
    function onScroll() {
      var heroBottom = hero.offsetTop + hero.offsetHeight;
      var scrollY = window.scrollY || window.pageYOffset;
      if (scrollY > heroBottom - window.innerHeight * 0.5) { header.classList.add('scrolled'); } else { header.classList.remove('scrolled'); }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    console.log('[MC] Header OK');
  }

  function initHamburger() {
    var btn = document.getElementById('hamburger');
    var nav = document.getElementById('nav-links');
    if (!btn || !nav) return;
    btn.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('open');
      btn.classList.toggle('active');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open'); btn.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false'); document.body.style.overflow = '';
      });
    });
    console.log('[MC] Hamburger OK');
  }

  function initHeroCanvas() {
    var canvas = document.getElementById('hero-canvas');
    var overlay = document.getElementById('hero-overlay');
    if (!canvas) { console.warn('[MC] Canvas non trovato'); return; }
    var ctx = canvas.getContext('2d');
    var frames = [];
    var currentFrame = 0;
    var loadedCount = 0;
    var firstDrawDone = false;
    function pad(n) { return String(n).padStart(4, '0'); }
    function frameURL(i) { return FRAME_PATH + pad(i + 1) + FRAME_EXT; }
    function resize() {
      canvas.width = window.innerWidth; canvas.height = window.innerHeight;
      requestAnimationFrame(function(){ drawFrame(currentFrame); });
    }
    function drawFrame(idx) {
      var img = frames[idx];
      if (!img || !img.complete || !img.naturalWidth) return;
      var cw = canvas.width, ch = canvas.height, iw = img.naturalWidth, ih = img.naturalHeight;
      var canvasRatio = cw / ch, imgRatio = iw / ih;
      var dw, dh, dx, dy;
      if (imgRatio > canvasRatio) { dh = ch; dw = dh * imgRatio; dx = (cw - dw) / 2; dy = 0; }
      else { dw = cw; dh = dw / imgRatio; dx = 0; dy = (ch - dh) / 2; }
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, dw, dh);
    }
    function preloadBatch(start, end) {
      for (var i = start; i < end && i < FRAME_COUNT; i++) {
        (function (index) {
          var img = new Image(); img.src = frameURL(index);
          img.onload = function () {
            loadedCount++;
            if (!firstDrawDone && index === 0) { firstDrawDone = true; resize(); }
          };
          frames[index] = img;
        })(i);
      }
    }
    preloadBatch(0, PRELOAD_BATCH);
    setTimeout(function () { preloadBatch(PRELOAD_BATCH, FRAME_COUNT); }, 3000);
    window.addEventListener('resize', resize);
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.create({
        trigger: '#hero', start: 'top top', end: 'bottom bottom', scrub: 0.3,
        onUpdate: function (self) {
          var progress = self.progress;
          var frameIndex = Math.min(FRAME_COUNT - 1, Math.floor(progress * FRAME_COUNT));
          if (frameIndex !== currentFrame) { currentFrame = frameIndex; drawFrame(currentFrame); }
          if (overlay) {
            if (progress >= OVERLAY_SHOW && progress <= OVERLAY_HIDE) { overlay.classList.add('visible'); }
            else { overlay.classList.remove('visible'); }
          }
        }
      });
      console.log('[MC] Hero Canvas + ScrollTrigger OK');
    } else {
      resize();
      if (overlay) overlay.classList.add('visible');
      console.warn('[MC] GSAP non disponibile, hero statico');
    }
  }

  function initCounters() {
    var statsSection = document.getElementById('stats');
    var numbers = document.querySelectorAll('.stat-number');
    if (!statsSection || !numbers.length) return;
    var fired = false;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !fired) { fired = true; animateAllCounters(numbers); observer.disconnect(); }
      });
    }, { threshold: 0.3 });
    observer.observe(statsSection);
    console.log('[MC] Counters observer OK');
  }

  function animateAllCounters(elements) {
    elements.forEach(function (el) {
      var target = parseInt(el.getAttribute('data-target'), 10);
      if (isNaN(target)) return;
      var suffix = el.getAttribute('data-suffix') || '';
      var duration = 2200, startTime = null;
      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var elapsed = timestamp - startTime;
        var progress = Math.min(elapsed / duration, 1);
        var eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        var current = Math.round(eased * target);
        el.textContent = current + suffix;
        if (progress < 1) { requestAnimationFrame(step); }
        else { el.textContent = target + suffix; el.classList.add('glow'); createParticles(el); setTimeout(function () { el.classList.remove('glow'); }, 1200); }
      }
      requestAnimationFrame(step);
    });
    console.log('[MC] Counters animati');
  }

  function initFAQ() {
    var items = document.querySelectorAll('.faq-item');
    if (!items.length) return;
    items.forEach(function (item) {
      var btn = item.querySelector('.faq-question');
      if (!btn) return;
      btn.addEventListener('click', function () {
        var isOpen = item.classList.contains('open') || item.classList.contains('active');
        items.forEach(function (other) {
          other.classList.remove('open'); other.classList.remove('active');
          var otherBtn = other.querySelector('.faq-question');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) { item.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
      });
    });
    console.log('[MC] FAQ OK');
  }

  function initGSAPAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') { console.warn('[MC] GSAP non disponibile, fallback visibilita'); showAllElements(); return; }
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('[data-reveal]').forEach(function (el) { gsap.fromTo(el, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' } }); });
    gsap.utils.toArray('.reveal-left').forEach(function (el) { gsap.fromTo(el, { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' } }); });
    gsap.utils.toArray('.reveal-right').forEach(function (el) { gsap.fromTo(el, { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' } }); });
    gsap.utils.toArray('.clip-reveal').forEach(function (el) { gsap.fromTo(el, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'power4.out', scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none none' } }); });
    var serviceCards = gsap.utils.toArray('.service-card');
    if (serviceCards.length) { gsap.fromTo(serviceCards, { opacity: 0, y: 50, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: '.services-grid', start: 'top 80%', toggleActions: 'play none none none' } }); }
    var whyCards = gsap.utils.toArray('.why-card');
    if (whyCards.length) { gsap.fromTo(whyCards, { opacity: 0, y: 40, rotateX: 10 }, { opacity: 1, y: 0, rotateX: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.why-grid', start: 'top 80%', toggleActions: 'play none none none' } }); }
    var caseCards = gsap.utils.toArray('.case-card');
    if (caseCards.length) { gsap.fromTo(caseCards, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out', scrollTrigger: { trigger: '.cases-grid', start: 'top 80%', toggleActions: 'play none none none' } }); }
    var blogCards = gsap.utils.toArray('.blog-card');
    if (blogCards.length) { gsap.fromTo(blogCards, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: '.blog-grid', start: 'top 80%', toggleActions: 'play none none none' } }); }
    var methodSteps = gsap.utils.toArray('.method-step');
    var progressBar = document.querySelector('.method-progress-bar');
    if (methodSteps.length) {
      methodSteps.forEach(function (step) {
        ScrollTrigger.create({ trigger: step, start: 'top 75%', onEnter: function () {
          step.classList.add('active');
          gsap.fromTo(step, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' });
          if (progressBar) {
            var stepRect = step.getBoundingClientRect();
            var timelineRect = step.parentElement.getBoundingClientRect();
            var targetHeight = (stepRect.top - timelineRect.top) + stepRect.height / 2;
            gsap.to(progressBar, { height: targetHeight, duration: 0.6, ease: 'power2.out' });
          }
        }});
      });
    }
    gsap.utils.toArray('.divider-line').forEach(function (line) { gsap.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: line, start: 'top 90%', toggleActions: 'play none none none' } }); });
    var ctaSection = document.getElementById('cta-finale');
    if (ctaSection) { gsap.fromTo(ctaSection.querySelectorAll('.cta-content > *'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out', scrollTrigger: { trigger: ctaSection, start: 'top 75%', toggleActions: 'play none none none' } }); }
    var footer = document.getElementById('footer');
    if (footer) { gsap.fromTo(footer, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: footer, start: 'top 90%', toggleActions: 'play none none none' } }); }
    var statItems = gsap.utils.toArray('.stat-item');
    if (statItems.length) { gsap.fromTo(statItems, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.7)', scrollTrigger: { trigger: '#stats', start: 'top 80%', toggleActions: 'play none none none' } }); }
    var innovSection = document.getElementById('innovazione');
    if (innovSection) {
      gsap.fromTo(innovSection.querySelectorAll('.reveal-left'), { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 1, stagger: 0.15, ease: 'power3.out', scrollTrigger: { trigger: innovSection, start: 'top 75%', toggleActions: 'play none none none' } });
      gsap.fromTo(innovSection.querySelectorAll('.reveal-right'), { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: innovSection, start: 'top 75%', toggleActions: 'play none none none' } });
    }
    gsap.utils.toArray('.method-step img').forEach(function(img) { gsap.fromTo(img, { opacity: 0, scale: 0.7, rotate: -5 }, { opacity: 1, scale: 1, rotate: 0, duration: 0.8, ease: 'back.out(1.7)', scrollTrigger: { trigger: img, start: 'top 85%', toggleActions: 'play none none none' } }); });
    gsap.utils.toArray('.case-card img').forEach(function(img) { gsap.fromTo(img, { opacity: 0, y: -20, scale: 0.8 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: img, start: 'top 85%', toggleActions: 'play none none none' } }); });
    gsap.utils.toArray('.case-result').forEach(function(el) { gsap.fromTo(el, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(2)', scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' } }); });
    var innovImages = gsap.utils.toArray('#innovazione .about-visual img');
    if (innovImages.length) { gsap.fromTo(innovImages, { opacity: 0, y: 40, rotate: 3 }, { opacity: 1, y: 0, rotate: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out', scrollTrigger: { trigger: '#innovazione .about-visual', start: 'top 80%', toggleActions: 'play none none none' } }); }
    console.log('[MC] GSAP Animations OK');
  }

  function showAllElements() {
    var selectors = ['[data-reveal]', '.reveal-left', '.reveal-right', '.clip-reveal', '.service-card', '.why-card', '.case-card', '.blog-card', '.method-step', '.stat-item', '#innovazione .reveal-left', '#innovazione .reveal-right'];
    selectors.forEach(function (sel) { document.querySelectorAll(sel).forEach(function (el) { el.style.opacity = '1'; el.style.transform = 'none'; el.style.clipPath = 'none'; }); });
    document.querySelectorAll('.method-step').forEach(function (s) { s.classList.add('active'); });
  }

  function initMagneticButtons() {
    if (window.innerWidth < 769) return;
    var buttons = document.querySelectorAll('.btn-magnetic, .btn-primary, .btn-hero, .btn-outline, .nav-cta');
    if (!buttons.length) return;
    buttons.forEach(function (btn) {
      var strength = 0.3;
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = 'translate(' + (x * strength) + 'px, ' + (y * strength) + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = 'translate(0px, 0px)'; });
    });
    console.log('[MC] Magnetic buttons OK');
  }

  function initTiltCards() {
    var cards = document.querySelectorAll('.tilt-card');
    if (!cards.length) return;
    cards.forEach(function (card) {
      var maxTilt = 6;
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width;
        var y = (e.clientY - rect.top) / rect.height;
        var tiltX = (0.5 - y) * maxTilt, tiltY = (x - 0.5) * maxTilt;
        card.style.transform = 'perspective(800px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg) translateY(-4px)';
      });
      card.addEventListener('mouseleave', function () { card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)'; });
    });
    console.log('[MC] Tilt cards OK');
  }

  function initParallaxTeam() {
    var cards = document.querySelectorAll('.team-photo-card');
    if (!cards.length) return;
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      cards.forEach(function (card, i) {
        var direction = i % 2 === 0 ? -40 : 40;
        gsap.fromTo(card, { y: direction }, { y: -direction, ease: 'none', scrollTrigger: { trigger: card.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
      });
      console.log('[MC] Parallax team OK');
    }
  }

  function initScrollProgress() {
    var bar = document.createElement('div');
    bar.id = 'scroll-progress';
    bar.style.cssText = 'position:fixed;top:0;left:0;height:3px;width:0%;background:linear-gradient(90deg,#46b9ea,#7dd3fc);z-index:9999;pointer-events:none;box-shadow:0 0 10px rgba(70,185,234,0.5);';
    document.body.appendChild(bar);
    window.addEventListener('scroll', function () {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (scrollTop / docHeight) * 100 + '%';
    }, { passive: true });
    console.log('[MC] Scroll Progress OK');
  }

  function initCursorFollower() {
    if (window.innerWidth < 769 || 'ontouchstart' in window) return;
    var cursor = document.createElement('div');
    cursor.id = 'cursor-follower';
    cursor.style.cssText = 'position:fixed;top:0;left:0;width:20px;height:20px;border-radius:50%;border:2px solid #46b9ea;pointer-events:none;z-index:9998;mix-blend-mode:difference;transform:translate(-50%,-50%);transition:width 0.3s,height 0.3s,background 0.3s;';
    document.body.appendChild(cursor);
    var mouseX = 0, mouseY = 0, curX = 0, curY = 0;
    document.addEventListener('mousemove', function (e) { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });
    function animate() { curX += (mouseX - curX) * 0.15; curY += (mouseY - curY) * 0.15; cursor.style.left = curX + 'px'; cursor.style.top = curY + 'px'; requestAnimationFrame(animate); }
    animate();
    var items = document.querySelectorAll('a, button, .service-card, .why-card, .case-card, .blog-card, .chatbot-fab');
    items.forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.style.width = '50px'; cursor.style.height = '50px'; cursor.style.background = 'rgba(70,185,234,0.15)'; cursor.style.borderColor = '#7dd3fc'; });
      el.addEventListener('mouseleave', function () { cursor.style.width = '20px'; cursor.style.height = '20px'; cursor.style.background = 'transparent'; cursor.style.borderColor = '#46b9ea'; });
    });
    console.log('[MC] Cursor Follower OK');
  }

  function createParticles(el) {
    var rect = el.getBoundingClientRect();
    var centerX = rect.left + rect.width / 2, centerY = rect.top + rect.height / 2;
    for (var i = 0; i < 12; i++) {
      var particle = document.createElement('div');
      particle.style.cssText = 'position:fixed;width:4px;height:4px;border-radius:50%;background:#46b9ea;pointer-events:none;z-index:9999;';
      particle.style.left = centerX + 'px'; particle.style.top = centerY + 'px';
      document.body.appendChild(particle);
      var angle = (Math.PI * 2 / 12) * i;
      var distance = 40 + Math.random() * 30;
      var tx = Math.cos(angle) * distance, ty = Math.sin(angle) * distance;
      if (typeof gsap !== 'undefined') {
        gsap.to(particle, { x: tx, y: ty, opacity: 0, scale: 0, duration: 0.8 + Math.random() * 0.4, ease: 'power2.out', onComplete: function () { if (particle.parentNode) particle.parentNode.removeChild(particle); } });
      } else { setTimeout(function () { if (particle.parentNode) particle.parentNode.removeChild(particle); }, 1000); }
    }
  }

  function initParallaxLayers() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (window.innerWidth < 769) return;
    document.querySelectorAll('.team-photo-card').forEach(function (card, i) {
      var dir = i % 2 === 0 ? -40 : 40;
      gsap.fromTo(card, { y: dir }, { y: -dir, ease: 'none', scrollTrigger: { trigger: card.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
    });
    document.querySelectorAll('.about-float-element').forEach(function (el, i) {
      gsap.to(el, { y: i % 2 === 0 ? -30 : 30, x: i % 2 === 0 ? 15 : -15, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1 } });
    });
    document.querySelectorAll('.service-icon').forEach(function (icon) { gsap.to(icon, { y: -10, ease: 'none', scrollTrigger: { trigger: icon, start: 'top bottom', end: 'bottom top', scrub: 1.5 } }); });
    document.querySelectorAll('.why-icon').forEach(function (icon) { gsap.fromTo(icon, { rotate: -10 }, { rotate: 10, ease: 'none', scrollTrigger: { trigger: icon, start: 'top bottom', end: 'bottom top', scrub: 1.5 } }); });
    console.log('[MC] Parallax Layers OK');
  }

  function initImageWipeReveal() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    var images = document.querySelectorAll('.method-step img, .case-card img, #innovazione img');
    images.forEach(function (img) {
      gsap.set(img, { clipPath: 'inset(0 100% 0 0)' });
      gsap.to(img, { clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'power4.out', scrollTrigger: { trigger: img, start: 'top 85%', toggleActions: 'play none none none' } });
    });
    console.log('[MC] Image Wipe Reveal OK');
  }

  function initKeywordHighlight() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    var keywords = document.querySelectorAll('.about-text strong');
    keywords.forEach(function (kw) {
      gsap.fromTo(kw, { color: 'inherit', textShadow: 'none' }, { color: '#46b9ea', textShadow: '0 0 20px rgba(70,185,234,0.4)', duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: kw, start: 'top 80%', toggleActions: 'play none none none' } });
    });
    console.log('[MC] Keyword Highlight OK');
  }

  function initChatbot() {
    var fab = document.getElementById('mc-agent');
    if (!fab) return;

    var chatBox = document.createElement('div');
    chatBox.id = 'mc-chatbox';
    chatBox.style.cssText = 'position:fixed;bottom:96px;right:24px;width:360px;max-height:480px;background:#ffffff;border:1px solid rgba(70,185,234,0.2);border-radius:16px;box-shadow:0 16px 60px rgba(0,0,0,0.15);z-index:999;display:none;flex-direction:column;overflow:hidden;';
    chatBox.innerHTML = '<div style="background:linear-gradient(135deg,#46b9ea,#3a9fd4);padding:16px 20px;display:flex;align-items:center;justify-content:space-between;">' +
      '<div style="display:flex;align-items:center;gap:10px;">' +
      '<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#46b9ea,#3a9fd4);display:flex;align-items:center;justify-content:center;">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="#0f1a2c"/></svg></div>' +
      '<div><div style="color:#fff;font-family:Poppins,sans-serif;font-weight:700;font-size:0.9rem;">Assistente M&C</div>' +
      '<div style="color:rgba(255,255,255,0.8);font-size:0.7rem;">Online</div></div></div>' +
      '<button id="mc-chat-close" style="background:none;border:none;color:rgba(255,255,255,0.8);font-size:1.4rem;cursor:pointer;padding:4px;">&times;</button></div>' +
      '<div id="mc-chat-messages" style="flex:1;padding:20px;overflow-y:auto;display:flex;flex-direction:column;gap:12px;min-height:280px;">' +
      '<div style="background:#f0f4f8;padding:12px 16px;border-radius:12px 12px 12px 0;max-width:85%;font-size:0.9rem;color:#3a3f4b;line-height:1.6;">' +
      'Ciao! Sono l\'assistente virtuale di M&C Elaborazioni. Come posso aiutarti? Puoi chiedermi informazioni sui nostri servizi, orari o come prenotare una consulenza gratuita.</div></div>' +
      '<div style="padding:12px 16px;border-top:1px solid rgba(70,185,234,0.15);display:flex;gap:8px;">' +
      '<input id="mc-chat-input" type="text" placeholder="Scrivi un messaggio..." style="flex:1;background:#f7f8fc;border:1px solid rgba(70,185,234,0.25);border-radius:24px;padding:10px 16px;color:#3a3f4b;font-size:0.85rem;outline:none;font-family:Inter,sans-serif;">' +
      '<button id="mc-chat-send" style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#46b9ea,#3a9fd4);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="#0f1a2c" stroke-width="2" stroke-linecap="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="#0f1a2c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>';

    document.body.appendChild(chatBox);

    var CF_URL = 'https://us-central1-gen-lang-client-0177996578.cloudfunctions.net/chatPublic';
    var isOpen = false;

    fab.addEventListener('click', function () {
      isOpen = !isOpen;
      chatBox.style.display = isOpen ? 'flex' : 'none';
    });

    document.getElementById('mc-chat-close').addEventListener('click', function () {
      isOpen = false;
      chatBox.style.display = 'none';
    });

    var input = document.getElementById('mc-chat-input');
    var sendBtn = document.getElementById('mc-chat-send');
    var messages = document.getElementById('mc-chat-messages');

    function addMessage(text, isUser) {
      var msg = document.createElement('div');
      msg.style.cssText = isUser
        ? 'background:linear-gradient(135deg,#46b9ea,#3a9fd4);padding:12px 16px;border-radius:12px 12px 0 12px;max-width:85%;align-self:flex-end;font-size:0.9rem;color:#0f1a2c;font-weight:500;line-height:1.6;'
        : 'background:#f0f4f8;padding:12px 16px;border-radius:12px 12px 12px 0;max-width:85%;font-size:0.9rem;color:#3a3f4b;line-height:1.6;';
      msg.textContent = text;
      messages.appendChild(msg);
      messages.scrollTop = messages.scrollHeight;
      return msg;
    }

    function addTypingIndicator() {
      var typing = document.createElement('div');
      typing.id = 'mc-typing';
      typing.style.cssText = 'background:#f0f4f8;padding:12px 16px;border-radius:12px 12px 12px 0;max-width:60px;font-size:0.9rem;color:#3a3f4b;line-height:1.6;';
      typing.innerHTML = '<span style="display:inline-flex;gap:4px;align-items:center;">' +
        '<span style="width:6px;height:6px;border-radius:50%;background:#46b9ea;animation:mc-bounce 1s infinite 0s;display:inline-block;"></span>' +
        '<span style="width:6px;height:6px;border-radius:50%;background:#46b9ea;animation:mc-bounce 1s infinite 0.2s;display:inline-block;"></span>' +
        '<span style="width:6px;height:6px;border-radius:50%;background:#46b9ea;animation:mc-bounce 1s infinite 0.4s;display:inline-block;"></span>' +
        '</span>';
      messages.appendChild(typing);
      messages.scrollTop = messages.scrollHeight;
      if (!document.getElementById('mc-bounce-style')) {
        var style = document.createElement('style');
        style.id = 'mc-bounce-style';
        style.textContent = '@keyframes mc-bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}';
        document.head.appendChild(style);
      }
    }

    function removeTypingIndicator() {
      var t = document.getElementById('mc-typing');
      if (t) t.parentNode.removeChild(t);
    }

    function getFallbackResponse(text) {
      var t = text.toLowerCase();
      if (t.indexOf('orari') > -1 || t.indexOf('aperti') > -1) return 'I nostri orari sono: Lunedì–Venerdì 09:00–13:00 e 15:00–18:30.';
      if (t.indexOf('dove') > -1 || t.indexOf('indirizzo') > -1) return 'Ci trovi in Via G. Brodolini 12, 09040 Senorbì (SU).';
      if (t.indexOf('telefon') > -1 || t.indexOf('chiama') > -1) return 'Chiamaci al +39 393 990 7903 o scrivi a info@mcelaborazioni.it';
      if (t.indexOf('gratuit') > -1 || t.indexOf('costo') > -1) return 'Il primo incontro è sempre gratuito e senza impegno!';
      return 'Per una risposta dettagliata contattaci al +39 393 990 7903 o via email a info@mcelaborazioni.it. Il primo incontro è sempre gratuito!';
    }

    function sendMessage() {
      var text = input.value.trim();
      if (!text) return;
      addMessage(text, true);
      input.value = '';
      addTypingIndicator();
      fetch(CF_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        removeTypingIndicator();
        addMessage(data.reply || data.message || 'Risposta ricevuta.', false);
      })
      .catch(function () {
        removeTypingIndicator();
        addMessage(getFallbackResponse(text), false);
      });
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') sendMessage();
    });

    console.log('[MC] Chatbot AI OK');
  }

  function initTextRevealAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    document.querySelectorAll('h2').forEach(function(h2) {
      if (h2.closest('.hero-overlay')) return;
      var words = h2.textContent.trim().split(/\s+/);
      h2.innerHTML = words.map(function(w) { return '<span class="word-reveal" style="display:inline-block;overflow:hidden;"><span class="word-inner" style="display:inline-block;">' + w + '</span></span>'; }).join(' ');
      gsap.fromTo(h2.querySelectorAll('.word-inner'), { y: '110%', opacity: 0 }, { y: '0%', opacity: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: h2, start: 'top 85%', toggleActions: 'play none none none' } });
    });
    document.querySelectorAll('.section-services p, .section-about p, .section-why p, .section-method p, .section-cases p, .section-innovation p, .section-cta p, .service-row-text p, .process-card p, .faq-answer p').forEach(function(p) {
      if (p.closest('#faq') || p.closest('#faq-servizi') || p.closest('.section-faq')) return;
      gsap.fromTo(p, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: p, start: 'top 90%', toggleActions: 'play none none none' } });
    });
    document.querySelectorAll('.service-row-features li, .service-card p').forEach(function(li, i) {
      if (li.closest('#faq') || li.closest('#faq-servizi') || li.closest('.section-faq')) return;
      gsap.fromTo(li, { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, delay: i * 0.05, ease: 'power2.out', scrollTrigger: { trigger: li, start: 'top 92%', toggleActions: 'play none none none' } });
    });
    document.querySelectorAll('.hero-badge, .service-row-number, .process-number').forEach(function(badge) {
      if (badge.closest('#faq') || badge.closest('#faq-servizi') || badge.closest('.section-faq')) return;
      gsap.fromTo(badge, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)', scrollTrigger: { trigger: badge, start: 'top 88%', toggleActions: 'play none none none' } });
    });
    document.querySelectorAll('.btn-primary, .btn-hero, .btn-outline').forEach(function(btn) {
      if (btn.closest('#faq') || btn.closest('#faq-servizi') || btn.closest('.section-faq')) return;
      gsap.fromTo(btn, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: btn, start: 'top 92%', toggleActions: 'play none none none' } });
    });
    console.log('[MC] Text Reveal Animations OK');
  }

  function initHeadingLineReveal() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    document.querySelectorAll('h2').forEach(function(h2) {
      if (h2.closest('.hero-overlay')) return;
      var line = document.createElement('div');
      line.style.cssText = 'height:3px;background:linear-gradient(90deg,#46b9ea,#7dd3fc);margin-top:8px;border-radius:2px;transform-origin:left;transform:scaleX(0);';
      h2.appendChild(line);
      gsap.to(line, { scaleX: 1, duration: 0.8, delay: 0.4, ease: 'power3.out', scrollTrigger: { trigger: h2, start: 'top 85%', toggleActions: 'play none none none' } });
    });
    console.log('[MC] Heading Line Reveal OK');
  }

})();

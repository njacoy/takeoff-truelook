/* ==========================================================================
   TrueLook — Homepage Option 1 prototype
   Vanilla JS, no dependencies. Everything fails open: content is fully
   legible and reachable without JS; this layer only adds behavior.
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------------------------------------------------- header scroll state */
  var header = $('#site-header');
  if (header) {
    var lastStuck = false;
    var onScroll = function () {
      var stuck = window.scrollY > 40;
      if (stuck !== lastStuck) {
        lastStuck = stuck;
        header.classList.toggle('is-stuck', stuck);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------------------ mobile menu */
  var burger = $('.nav__burger');
  var mobnav = $('#mobile-menu');
  if (burger && mobnav) {
    var setMenu = function (open) {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      mobnav.hidden = !open;
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    mobnav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !mobnav.hidden) setMenu(false);
    });
  }

  /* -------------------------------------------------------- scroll reveals */
  if ('IntersectionObserver' in window) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });
    $$('[data-reveal]').forEach(function (el) { revealIO.observe(el); });
  } else {
    $$('[data-reveal]').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ------------------------------------------------------------ hero clock */
  var clock = $('#hero-clock');
  if (clock) {
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var tick = function () {
      var d = new Date();
      clock.textContent =
        pad(d.getMonth() + 1) + '.' + pad(d.getDate()) + '.' + d.getFullYear() +
        ' / ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ------------------------------------------- capabilities accordion */
  var capSection = $('#capabilities');
  var capGrid = $('#cap-grid');
  if (capSection && capGrid) {
    var rows = $$('.cap-row', capGrid);
    var slides = $$('[data-cap-slide]', capGrid);
    var rail = $$('.rail-st', capGrid);
    var railEl = $('.cap__rail', capGrid);
    var current = 0;
    // Manual interaction stops auto-play until the next page load.
    var autoOff = false;

    /* Rail stations track their row's real position, so the open item pushes
       the numbers below it down the ruler. A short rAF loop follows the
       expand/collapse transition so the stations ride along with it. */
    var syncRail = function () {
      if (!railEl || !railEl.offsetParent) return; // hidden below 1024px
      var railTop = railEl.getBoundingClientRect().top;
      rows.forEach(function (row, j) {
        var st = rail[j];
        if (!st) return;
        var b = $('.cap-row__btn', row).getBoundingClientRect();
        st.style.top = (b.top - railTop + b.height / 2 - st.offsetHeight / 2) + 'px';
      });
    };
    var syncUntil = 0;
    var syncLoop = function () {
      syncRail();
      if (performance.now() < syncUntil) requestAnimationFrame(syncLoop);
    };
    var kickSync = function () {
      syncUntil = performance.now() + 650; // covers the 420ms row transition
      requestAnimationFrame(syncLoop);
      // rAF can be throttled (background tab); guarantee a settled final pass
      setTimeout(syncRail, 500);
      setTimeout(syncRail, 900);
    };
    if (railEl) {
      railEl.classList.add('is-tracking');
      kickSync();
      window.addEventListener('resize', kickSync);
      window.addEventListener('load', syncRail);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncRail);
      // authoritative settle signal: the row body's expand/collapse finished
      rows.forEach(function (row) {
        $('.cap-row__body', row).addEventListener('transitionend', syncRail);
      });
    }

    var activate = function (i, manual) {
      if (manual) {
        autoOff = true;
        capGrid.classList.remove('is-auto');
      }
      current = i;
      rows.forEach(function (row, j) {
        var active = j === i;
        row.classList.toggle('is-active', active);
        $('.cap-row__btn', row).setAttribute('aria-expanded', String(active));
      });
      slides.forEach(function (s, j) { s.classList.toggle('is-active', j === i); });
      rail.forEach(function (st, j) { st.classList.toggle('is-active', j === i); });
      kickSync();
      if (!autoOff) restartProgress();
    };

    var restartProgress = function () {
      // retrigger the CSS fill animation on the newly active row
      var prog = $('.cap-row.is-active .cap-row__progress', capGrid);
      if (!prog) return;
      prog.style.animation = 'none';
      void prog.offsetHeight;
      prog.style.animation = '';
    };

    rows.forEach(function (row, i) {
      $('.cap-row__btn', row).addEventListener('click', function () {
        if (row.classList.contains('is-active')) {
          // the ✕ collapses the open item (media keeps the last slide)
          autoOff = true;
          capGrid.classList.remove('is-auto');
          row.classList.remove('is-active');
          $('.cap-row__btn', row).setAttribute('aria-expanded', 'false');
          rail.forEach(function (st) { st.classList.remove('is-active'); });
          kickSync();
          return;
        }
        activate(i, true);
      });
    });
    rail.forEach(function (st, i) {
      st.addEventListener('click', function () { activate(i, true); });
    });

    // advance when the active row's progress rule finishes filling
    capGrid.addEventListener('animationend', function (e) {
      if (e.target.classList.contains('cap-row__progress') && capGrid.classList.contains('is-auto')) {
        activate((current + 1) % rows.length, false);
      }
    });

    // start auto-play only when the section is on screen; pause when it leaves
    if (!autoOff && !reducedMotion.matches && 'IntersectionObserver' in window) {
      var capStarted = false;
      var capIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          capSection.classList.toggle('is-offscreen', !entry.isIntersecting);
          if (entry.isIntersecting && !capStarted && !autoOff) {
            capStarted = true;
            capGrid.classList.add('is-auto');
            restartProgress();
          }
        });
      }, { threshold: 0.3 });
      capIO.observe(capSection);
    }
  }

  /* ---------------------------------------------------------- hw carousel */
  var track = $('#hw-track');
  if (track) {
    var hwSlides = $$('.hw-slide', track);
    var dots = $$('.hw-dot');
    var arrows = $$('.hw-arrow');
    var slideIndex = 0;

    var slideStep = function () {
      return hwSlides.length > 1
        ? hwSlides[1].offsetLeft - hwSlides[0].offsetLeft
        : track.clientWidth;
    };
    var goTo = function (i) {
      i = Math.max(0, Math.min(hwSlides.length - 1, i));
      track.scrollTo({
        left: i * slideStep(),
        behavior: reducedMotion.matches ? 'auto' : 'smooth'
      });
    };
    var sync = function () {
      var i = Math.round(track.scrollLeft / slideStep());
      i = Math.max(0, Math.min(hwSlides.length - 1, i));
      if (i === slideIndex) return;
      slideIndex = i;
      hwSlides.forEach(function (s, j) { s.classList.toggle('is-active', j === i); });
      dots.forEach(function (d, j) {
        if (j === i) { d.setAttribute('aria-current', 'true'); }
        else { d.removeAttribute('aria-current'); }
      });
      arrows[0].disabled = i === 0;
      arrows[1].disabled = i === hwSlides.length - 1;
    };

    var raf = null;
    track.addEventListener('scroll', function () {
      if (raf) return;
      raf = requestAnimationFrame(function () { raf = null; sync(); });
    }, { passive: true });

    arrows.forEach(function (btn) {
      btn.addEventListener('click', function () {
        goTo(slideIndex + Number(btn.dataset.dir));
      });
    });
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () { goTo(Number(dot.dataset.dot)); });
    });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(slideIndex + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(slideIndex - 1); }
    });
  }

  /* ------------------------------------------------------------ video modal */
  var modal = $('#video-modal');
  if (modal && typeof modal.showModal === 'function') {
    var video = $('video', modal);
    $$('[data-modal-open]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        // lazy: only attach the video source on first open
        if (video && !video.src && video.dataset.videoSrc) {
          video.src = video.dataset.videoSrc;
        }
        modal.showModal();
      });
    });
    $('[data-modal-close]', modal).addEventListener('click', function () {
      modal.close();
    });
    // click on the backdrop closes (Esc is native to <dialog>)
    modal.addEventListener('click', function (e) {
      if (e.target === modal) modal.close();
    });
    modal.addEventListener('close', function () {
      if (video) video.pause();
    });
  }

  /* --------------------------------- filmstrips + center frame scrub */
  /* Pin + scrub, vanilla. One scroll clock drives three rails: the two edge
     filmstrips stream linearly in opposite directions (atmosphere), while the
     center "main frame" advances through the featured products with a snap
     dwell at each one. */
  var wgal = $('#cameras-gallery');
  if (wgal) {
    var leftRail = $('[data-rail="left"]', wgal);
    var rightRail = $('[data-rail="right"]', wgal);
    var lensWin = $('.wgal__lenswin', wgal);
    var lensRail = $('.wgal__lensrail', wgal);
    var featureCount = $$('.wgal__slide', wgal).length;
    var narrow = window.matchMedia('(max-width: 1023px)');
    if (reducedMotion.matches || narrow.matches) {
      wgal.classList.add('is-static');
    } else {
      var stripTravel = 0, leftStart = 0, rightStart = 0, featureTravel = 0, dist = 0;
      var wsize = function () {
        var tileW = leftRail.firstElementChild.offsetWidth;
        var tileGap = parseFloat(getComputedStyle(leftRail).columnGap) || 0;
        var tiles = leftRail.children.length;
        stripTravel = (tiles - 1) * (tileW + tileGap);       // full strip passes by p=1
        // L01 tucked behind the frame at rest (the "passed" products). The +gap
        // offset makes L01 finish flush at the frame's left edge exactly on the
        // step boundary: the strip moves one tile-PITCH (tileW+gap) per center
        // step, but a tile only travels its own WIDTH to go hidden->flush, so
        // the gap accounts for the difference. The offset is hidden at rest.
        leftStart = leftRail.parentElement.clientWidth + tileGap;
        // right rail offset back one tile so R01 (== the centered product 01)
        // sits hidden behind the frame and R02 is the first visible upcoming
        // tile; -tileW makes R02 finish fully out (into the frame) exactly on
        // the step boundary, mirroring the left
        rightStart = -tileW;
        var fw = lensWin.clientWidth;
        var lensGap = parseFloat(getComputedStyle(lensRail).columnGap) || 0;
        wgal.style.setProperty('--featurew', fw + 'px');     // feature slides fill the frame
        featureTravel = (featureCount - 1) * (fw + lensGap);
        dist = Math.round(window.innerHeight * 2.6);          // pin scroll distance
        wgal.style.height = (window.innerHeight + dist) + 'px';
      };
      // snap easing on the SHARED progress: dwell on each product, then a quick
      // traverse to the next. Because the same eased value drives all three
      // rails, they stay locked 1:1 — and at every step boundary the easing
      // passes through the exact keyframe (e=0), so "product fully out == strip
      // tile fully in" still lands precisely. Snap lives between the steps only.
      var steps = featureCount - 1;
      var snap = function (p) {
        var s = p * steps;
        var k = Math.min(steps - 1, Math.floor(s));
        var f = s - k;                       // 0..1 within the current step
        var a = 0.22;                        // dwell fraction at each end
        var e;
        if (f <= a) e = 0;
        else if (f >= 1 - a) e = 1;
        else { var t = (f - a) / (1 - 2 * a); e = t * t * (3 - 2 * t); }
        return steps > 0 ? (k + e) / steps : 0;
      };
      var wscrub = function () {
        var p = dist > 0 ? Math.min(1, Math.max(0, -wgal.getBoundingClientRect().top / dist)) : 0;
        var pe = snap(p);                    // one eased clock for every rail
        // left = "passed" filmstrip emerging leftward; right = "upcoming" tiles
        // feeding in from the right; center = featured product. All on pe.
        leftRail.style.transform = 'translate3d(' + (leftStart - pe * stripTravel) + 'px, 0, 0)';
        rightRail.style.transform = 'translate3d(' + (rightStart - pe * stripTravel) + 'px, 0, 0)';
        lensRail.style.transform = 'translate3d(' + (-pe * featureTravel) + 'px, 0, 0)';
      };
      var wraf = null;
      window.addEventListener('scroll', function () {
        if (wraf) return;
        wraf = requestAnimationFrame(function () { wraf = null; wscrub(); });
      }, { passive: true });
      window.addEventListener('resize', function () { wsize(); wscrub(); });
      window.addEventListener('load', function () { wsize(); wscrub(); });
      wsize();
      wscrub();
    }
  }

  /* --------------------------------------- per-letter headline reveal */
  /* Masked rise on the gallery headline as it enters. Words stay intact
     (nowrap wrappers) so wrapping is unaffected; AT reads the aria-label. */
  var lettersEl = $('[data-letters]');
  if (lettersEl && !reducedMotion.matches && 'IntersectionObserver' in window) {
    var fullText = lettersEl.textContent;
    lettersEl.setAttribute('aria-label', fullText);
    lettersEl.textContent = '';
    var charIdx = 0;
    fullText.split(' ').forEach(function (word, wi, arr) {
      var w = document.createElement('span');
      w.className = 'ltw';
      for (var k = 0; k < word.length; k++) {
        var outer = document.createElement('span');
        outer.className = 'lt';
        var inner = document.createElement('span');
        inner.textContent = word.charAt(k);
        inner.style.transitionDelay = (charIdx * 20) + 'ms';
        outer.appendChild(inner);
        w.appendChild(outer);
        charIdx++;
      }
      lettersEl.appendChild(w);
      if (wi < arr.length - 1) lettersEl.appendChild(document.createTextNode(' '));
    });
    var lettersIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          lettersEl.classList.add('is-in');
          lettersIO.disconnect();
        }
      });
    }, { threshold: 0.4 });
    lettersIO.observe(lettersEl);
  }

  /* ----------------------------------------------------- active cam switch */
  var camswitch = $('.camswitch');
  if (camswitch) {
    var camId = $('#cam-active-id');
    var cams = $$('.camswitch__cam', camswitch);
    cams.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.classList.contains('is-active')) return;
        cams.forEach(function (b) {
          b.classList.remove('is-active');
          b.removeAttribute('aria-pressed');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');
        if (camId) camId.textContent = btn.dataset.cam; // flip the active feed readout
      });
    });
  }
})();

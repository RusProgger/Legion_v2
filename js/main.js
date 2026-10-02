/* ============================================================
   Legion — все интеракции в одном файле (ванильный JS)
   preloader · header · burger · активное меню · reveal ·
   parallax · слайдер · корзина-заглушка · год в футере
   ============================================================ */

(function () {
    'use strict';

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var $ = function (s, c) { return (c || document).querySelector(s); };
    var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

    /* ---------- Год в футере ---------- */
    var yearEl = $('#year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------- Preloader ---------- */
    var preloader = $('#preloader');
    var hidePreloader = function () {
        if (!preloader) return;
        preloader.classList.add('is-done');
        setTimeout(function () { preloader.remove(); }, 600);
    };
    // фолбэк, если load не сработает
    var t = setTimeout(hidePreloader, 4000);
    window.addEventListener('load', function () {
        clearTimeout(t);
        setTimeout(hidePreloader, 250);
    });

    /* ---------- Header + активное меню ---------- */
    var header = $('#header');
    var navLinks = $$('.nav__link');

    var onScroll = function () {
        if (header) header.classList.toggle('is-scrolled', window.scrollY > 40);

        // подсветка текущей секции
        var pos = window.scrollY + window.innerHeight * 0.35;
        var current = '#home';
        $$('main section[id]').forEach(function (sec) {
            if (pos >= sec.offsetTop) current = '#' + sec.id;
        });
        navLinks.forEach(function (l) {
            l.classList.toggle('is-active', l.getAttribute('href') === current);
        });
    };

    /* ---------- Burger ---------- */
    var burger = $('#burger');
    var nav = $('#nav');
    var closeMenu = function () {
        nav.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    };
    var openMenu = function () {
        nav.classList.add('is-open');
        burger.classList.add('is-open');
        burger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden'; // блокируем скролл фона
    };

    burger.addEventListener('click', function () {
        if (nav.classList.contains('is-open')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // закрытие по клику вне меню
    document.addEventListener('click', function (e) {
        if (!nav.classList.contains('is-open')) return;
        if (nav.contains(e.target) || burger.contains(e.target)) return;
        closeMenu();
    });

    // закрытие по Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
    });

    navLinks.forEach(function (l) {
        l.addEventListener('click', closeMenu);
    });

    /* ---------- Reveal при скролле ---------- */
    var revealEls = $$('[data-reveal]');
    var reveal = function () {
        revealEls.forEach(function (el) {
            var r = el.getBoundingClientRect();
            if (r.top < window.innerHeight * 0.92) el.classList.add('is-in');
        });
    };

    if (reduced || !revealEls.length) {
        revealEls.forEach(function (el) { el.classList.add('is-in'); });
    } else if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) {
                    en.target.classList.add('is-in');
                    io.unobserve(en.target);
                }
            });
        }, { threshold: 0.12 });
        revealEls.forEach(function (el) { io.observe(el); });
    } else {
        reveal();
    }

    /* ---------- Параллакс hero ---------- */
    var heroBg = $('[data-parallax]');
    if (heroBg && !reduced) {
        var taf = 0;
        var parallax = function () {
            var y = window.scrollY;
            if (y < window.innerHeight * 1.2) {
                heroBg.style.transform = 'translateY(' + y * 0.18 + 'px)';
            }
        };
        window.addEventListener('scroll', function () {
            cancelAnimationFrame(taf);
            taf = requestAnimationFrame(parallax);
        }, { passive: true });
    }

    /* ---------- Слайдер ---------- */
    var track = $('#sliderTrack');
    var dotsWrap = $('#dots');
    var prevBtn = $('#prevBtn');
    var nextBtn = $('#nextBtn');

    if (track && dotsWrap) {
        var slides = $$('.product', track);
        var index = 0;

        var perView = function () {
            var w = window.innerWidth;
            if (w <= 460) return 1;
            if (w <= 700) return 2;
            if (w <= 1000) return 3;
            return 4;
        };

        var maxIndex = function (n) {
            return Math.max(0, slides.length - n);
        };

        var buildDots = function () {
            dotsWrap.innerHTML = '';
            var n = perView();
            var count = maxIndex(n) + 1;
            index = Math.min(index, count - 1);
            for (var i = 0; i < count; i++) {
                var d = document.createElement('button');
                d.type = 'button';
                d.className = 'slider__dot' + (i === index ? ' is-active' : '');
                d.setAttribute('aria-label', 'Slide ' + (i + 1));
                (function (idx) {
                    d.addEventListener('click', function () { go(idx); });
                })(i);
                dotsWrap.appendChild(d);
            }
        };

        var go = function (i) {
            var n = perView();
            var m = maxIndex(n);
            index = Math.max(0, Math.min(i, m));
            var gap = 20; // px, из CSS
            var w = slides[0].getBoundingClientRect().width;
            track.style.transform = 'translateX(' + -(index * (w + gap)) + 'px)';
            $$('.slider__dot', dotsWrap).forEach(function (d, di) {
                d.classList.toggle('is-active', di === index);
            });
        };

        var refresh = function () {
            buildDots();
            go(index);
        };

        buildDots();
        go(0);

        prevBtn.addEventListener('click', function () { go(index - 1); });
        nextBtn.addEventListener('click', function () { go(index + 1); });

        var rtime;
        window.addEventListener('resize', function () {
            clearTimeout(rtime);
            rtime = setTimeout(function () {
                track.classList.add('no-anim');
                refresh();
                requestAnimationFrame(function () {
                    track.classList.remove('no-anim');
                });
            }, 150);
        });
    }

    /* ---------- «Корзина» — заглушка ---------- */
    $$('.add-cart').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var original = btn.textContent;
            btn.textContent = '✓ Added';
            btn.disabled = true;
            setTimeout(function () {
                btn.textContent = original;
                btn.disabled = false;
            }, 1500);
        });
    });

    /* ---------- Слушатели ---------- */
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { if (window.innerWidth > 860) closeMenu(); });
    onScroll();
})();
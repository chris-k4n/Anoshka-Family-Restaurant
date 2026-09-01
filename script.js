(function () {
  'use strict';

  /* ============================================================
     ANOSHKA — MAIN JAVASCRIPT
     ============================================================ */

  var WHATSAPP_NUMBER = '9823625416';

  /* ---------- Header + scroll progress ---------- */

  var header = document.getElementById('site-header');
  // var scrollProgress = document.getElementById('scroll-progress');

  /* Cache section offsets instead of reading getBoundingClientRect() on
     every single scroll event — that forces a synchronous layout each
     time and is the main cause of scroll jank. We only recompute this
     when the page loads or resizes, not on every scroll tick. */
  var navLinks = document.querySelectorAll('.main-nav .nav-link');
  var allNavLinks = document.querySelectorAll('.nav-link');
  var cachedSections = [];

  function cacheSectionOffsets() {
    var sectionMap = {};

    Array.prototype.forEach.call(navLinks, function (link) {
      var href = link.getAttribute('href');

      if (!href || href.charAt(0) !== '#') {
        return;
      }

      var id = href.substring(1);
      var el = document.getElementById(id);

      if (el && !sectionMap[id]) {
        sectionMap[id] = el;
      }
    });

    cachedSections = Object.keys(sectionMap)
      .map(function (id) {
        return { id: id, top: sectionMap[id].offsetTop };
      })
      .sort(function (a, b) { return a.top - b.top; });
  }

  function updateActiveNav(scrollY) {
    if (!cachedSections.length) return;

    var scrollPos = scrollY + 140;
    var currentId = cachedSections[0].id;

    cachedSections.forEach(function (s) {
      if (s.top <= scrollPos) {
        currentId = s.id;
      }
    });

    allNavLinks.forEach(function (link) {
      link.classList.toggle(
        'active',
        link.getAttribute('href') === '#' + currentId
      );
    });
  }

  /* Precompute the scrollable height once per scroll batch instead of
     forcing layout (scrollHeight/clientHeight) on every tick. */
  var docHeight = 0;
  function cacheDocHeight() {
    var doc = document.documentElement;
    docHeight = doc.scrollHeight - doc.clientHeight;
  }

  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;

    window.requestAnimationFrame(function () {
      var scrollY = window.scrollY;

      if (header) {
        header.classList.toggle('is-scrolled', scrollY > 40);
      }

      // if (scrollProgress) {
      //   var percentage = docHeight > 0 ? scrollY / docHeight : 0;
      //   /* transform: scaleX() is compositor-only (no layout/paint),
      //      unlike animating `width`, which is far cheaper on every
      //      scroll frame and avoids the smeared/blurred bar some
      //      browsers render when a fixed element's width changes
      //      continuously behind a backdrop-filter blur. */
      //   scrollProgress.style.transform =
      //     'scaleX(' + percentage + ')';
      // }

      updateActiveNav(scrollY);

      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () {
    cacheSectionOffsets();
    cacheDocHeight();
  }, { passive: true });

  cacheSectionOffsets();
  cacheDocHeight();

  /* Images loading in below the fold can change section offsets/page
     height after we've already cached them, so re-cache once everything
     (including images) has finished loading. */
  window.addEventListener('load', function () {
    cacheSectionOffsets();
    cacheDocHeight();
  });

  /* ---------- Mobile menu ---------- */

  var hamburger =
    document.getElementById('hamburger');

  var mobileNav =
    document.getElementById('mobile-nav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener(
      'click',
      function () {
        var isOpen =
          mobileNav.classList.toggle('is-open');

        hamburger.classList.toggle(
          'is-open',
          isOpen
        );

        hamburger.setAttribute(
          'aria-expanded',
          isOpen ? 'true' : 'false'
        );

        document.body.style.overflow =
          isOpen ? 'hidden' : '';
      }
    );

    mobileNav
      .querySelectorAll('a')
      .forEach(function (link) {
        link.addEventListener(
          'click',
          function () {
            mobileNav.classList.remove(
              'is-open'
            );

            hamburger.classList.remove(
              'is-open'
            );

            hamburger.setAttribute(
              'aria-expanded',
              'false'
            );

            document.body.style.overflow = '';
          }
        );
      });
  }

  /* ---------- Scroll reveal ---------- */

  var revealElements =
    document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var revealObserver =
      new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add(
                'is-visible'
              );

              revealObserver.unobserve(
                entry.target
              );
            }
          });
        },
        {
          threshold: 0.15
        }
      );

    revealElements.forEach(function (element) {
      revealObserver.observe(element);
    });

  } else {
    revealElements.forEach(function (element) {
      element.classList.add('is-visible');
    });
  }

  /* ---------- Menu tabs ---------- */

  var tabs =
    document.querySelectorAll('.menu-tab');

  var panels =
    document.querySelectorAll('.menu-panel');

  tabs.forEach(function (tab) {
    tab.addEventListener(
      'click',
      function () {

        tabs.forEach(function (item) {
          item.classList.remove('active');

          item.setAttribute(
            'aria-selected',
            'false'
          );
        });

        panels.forEach(function (panel) {
          panel.classList.remove('active');
        });

        tab.classList.add('active');

        tab.setAttribute(
          'aria-selected',
          'true'
        );

        var target =
          document.getElementById(
            'tab-' + tab.dataset.tab
          );

        if (target) {
          target.classList.add('active');
          target.classList.remove('expanded');
        }

        if (toggleBtn) {
          toggleBtn.textContent = 'Show More';
          toggleBtn.setAttribute('aria-expanded', 'false');
        }
      }
    );
  });

  /* ---------- Menu show more / less ---------- */

  var toggleBtn = document.querySelector('.menu-toggle');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      var activePanel = document.querySelector('.menu-panel.active');
      if (!activePanel) return;

      var isExpanded = activePanel.classList.toggle('expanded');
      toggleBtn.textContent = isExpanded ? 'Show Less' : 'Show More';
      toggleBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    });
  }

  /* ---------- Enquiry form → WhatsApp ---------- */

  var form =
    document.getElementById('enquiry-form');

  var formStatus =
    document.getElementById('form-status');

  if (form) {
    form.addEventListener(
      'submit',
      function (event) {
        event.preventDefault();

        var data =
          new FormData(form);

        var message = [
          'New enquiry from Anoshka',
          'Name: ' +
            (data.get('name') || '-'),
          'Phone: ' +
            (data.get('phone') || '-'),
          'Email: ' +
            (data.get('email') || '-'),
          'Date: ' +
            (data.get('date') || '-'),
          'Guests: ' +
            (data.get('guests') || '-'),
          'Enquiry Type: ' +
            (data.get('type') || '-'),
          'Message: ' +
            (data.get('message') || '-')
        ].join('\n');

        var whatsappURL =
          'https://wa.me/' +
          WHATSAPP_NUMBER +
          '?text=' +
          encodeURIComponent(message);

        if (formStatus) {
          formStatus.textContent =
            'Opening WhatsApp with your enquiry…';
        }

        window.open(
          whatsappURL,
          '_blank',
          'noopener'
        );

        form.reset();
      }
    );
  }

  /* ---------- WhatsApp buttons ---------- */

  function createWhatsAppLink(message) {
    return (
      'https://wa.me/' +
      WHATSAPP_NUMBER +
      (
        message
          ? '?text=' +
            encodeURIComponent(message)
          : ''
      )
    );
  }

  var whatsappTargets = [
    'reserve-whatsapp',
    'contact-whatsapp',
    'footer-whatsapp'
  ];

  whatsappTargets.forEach(function (id) {
    var element =
      document.getElementById(id);

    if (element) {
      element.href =
        createWhatsAppLink(
          "Hi Anoshka, I'd like to enquire about a table."
        );
    }
  });

  /* ---------- Reviews cycling ---------- */

  var reviewsGrid = document.querySelector('.reviews-grid');
  var reviewCards = reviewsGrid ? reviewsGrid.querySelectorAll('.review-card') : [];
  var dotsContainer = document.querySelector('.reviews-dots');
  var REVIEWS_PER_PAGE = 4;

  /* Build the page-dot controls to match however many review cards actually
     exist, instead of a hardcoded count. This makes sure every review is
     reachable even if cards are added or removed later. */
  var totalPages = reviewCards.length
    ? Math.ceil(reviewCards.length / REVIEWS_PER_PAGE)
    : 0;

  if (dotsContainer && totalPages > 0) {
    dotsContainer.innerHTML = '';

    for (var p = 0; p < totalPages; p++) {
      var dot = document.createElement('button');
      var rangeStart = p * REVIEWS_PER_PAGE + 1;
      var rangeEnd = Math.min((p + 1) * REVIEWS_PER_PAGE, reviewCards.length);

      dot.className = 'dot' + (p === 0 ? ' active' : '');
      dot.dataset.page = String(p);
      dot.setAttribute(
        'aria-label',
        'Show reviews ' + rangeStart + '–' + rangeEnd
      );

      dotsContainer.appendChild(dot);
    }
  }

  var dots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : [];
  var currentPage = 0;
  var autoCycleInterval = null;
  var CYCLE_MS = 5000;

  function showPage(page) {
    currentPage = page;
    reviewsGrid.style.opacity = '0';
    setTimeout(function () {
      reviewCards.forEach(function (card, i) {
        if (Math.floor(i / REVIEWS_PER_PAGE) === page) {
          card.classList.remove('review-hidden');
        } else {
          card.classList.add('review-hidden');
        }
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === page);
      });
      reviewsGrid.style.opacity = '1';
    }, 350);
  }

  function nextPage() {
    showPage((currentPage + 1) % totalPages);
  }

  function startAutoCycle() {
    stopAutoCycle();
    autoCycleInterval = setInterval(nextPage, CYCLE_MS);
  }

  function stopAutoCycle() {
    if (autoCycleInterval) {
      clearInterval(autoCycleInterval);
      autoCycleInterval = null;
    }
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showPage(parseInt(dot.dataset.page, 10));
      startAutoCycle();
    });
  });

  if (reviewCards.length) {
    showPage(0);
    startAutoCycle();
  }

  /* ---------- Footer year ---------- */

  var year =
    document.getElementById('year');

  if (year) {
    year.textContent =
      new Date().getFullYear();
  }

  /* ---------- Run once on load ---------- */

  onScroll();

})();








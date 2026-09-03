(function () {
  'use strict';

  /* ============================================================
     ANOSHKA RESTAURANT — CORE JAVASCRIPT & MICRO-INTERACTIONS
     ============================================================ */

  var WHATSAPP_NUMBER = '9823625416';

  /* ---------- Header & Active Navigation on Scroll ---------- */
  var header = document.getElementById('site-header');
  var navLinks = document.querySelectorAll('.main-nav .nav-link');
  var allNavLinks = document.querySelectorAll('.nav-link');
  var cachedSections = [];

  function cacheSectionOffsets() {
    var sectionMap = {};
    Array.prototype.forEach.call(navLinks, function (link) {
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) !== '#') return;
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
    var scrollPos = scrollY + 180;
    var currentId = cachedSections[0].id;

    cachedSections.forEach(function (s) {
      if (s.top <= scrollPos) {
        currentId = s.id;
      }
    });

    allNavLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
    });
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
      updateActiveNav(scrollY);
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', cacheSectionOffsets, { passive: true });
  window.addEventListener('load', cacheSectionOffsets);
  cacheSectionOffsets();

  /* ---------- Hero Image Slider Carousel ---------- */
  var heroSlider = document.getElementById('hero-slider');
  var heroSlides = heroSlider ? heroSlider.querySelectorAll('.hero-slide') : [];
  var heroDots = document.querySelectorAll('.hero-dot');
  var currentHeroSlide = 0;
  var heroInterval = null;
  var HERO_CYCLE_MS = 4000;

  function showHeroSlide(index) {
    if (!heroSlides.length) return;
    currentHeroSlide = (index + heroSlides.length) % heroSlides.length;

    heroSlides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === currentHeroSlide);
    });

    heroDots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === currentHeroSlide);
    });
  }

  function nextHeroSlide() {
    showHeroSlide(currentHeroSlide + 1);
  }

  function startHeroAutoPlay() {
    stopHeroAutoPlay();
    if (heroSlides.length > 1) {
      heroInterval = setInterval(nextHeroSlide, HERO_CYCLE_MS);
    }
  }

  function stopHeroAutoPlay() {
    if (heroInterval) {
      clearInterval(heroInterval);
      heroInterval = null;
    }
  }

  heroDots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var target = parseInt(dot.dataset.slide, 10);
      if (!isNaN(target)) {
        showHeroSlide(target);
        startHeroAutoPlay();
      }
    });
  });

  var heroSection = document.getElementById('home');
  // hover pausing removed to ensure hero consistently cycles through images

  if (heroSlides.length) {
    showHeroSlide(0);
    startHeroAutoPlay();
  }

  /* ---------- Mobile Navigation Drawer ---------- */
  var hamburger = document.getElementById('hamburger');
  var mobileNav = document.getElementById('mobile-nav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      hamburger.classList.toggle('is-open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('is-open');
        hamburger.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- Scroll Reveal Animations ---------- */
  var revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealElements.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealElements.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Menu Tabs & Expand Toggle ---------- */
  var menuTabs = document.querySelectorAll('.menu-tab');
  var menuPanels = document.querySelectorAll('.menu-panel');
  var menuToggleBtn = document.getElementById('menu-toggle-btn');

  function collapseAllPanels() {
    menuPanels.forEach(function (p) {
      p.classList.remove('active', 'expanded');
    });
    if (menuToggleBtn) {
      menuToggleBtn.textContent = 'Show More';
      menuToggleBtn.classList.remove('is-expanded');
      menuToggleBtn.setAttribute('aria-expanded', 'false');
    }
  }

  menuTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      menuTabs.forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });

      collapseAllPanels();

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      var target = document.getElementById('tab-' + tab.dataset.tab);
      if (target) {
        target.classList.add('active');
        if (menuToggleBtn) {
          menuToggleBtn.style.display = target.querySelector('.menu-extra') ? '' : 'none';
        }
      }
    });
  });

  if (menuToggleBtn) {
    menuToggleBtn.addEventListener('click', function () {
      var activePanel = document.querySelector('.menu-panel.active');
      if (!activePanel) return;

      /* Toggle expanded: no max-height, just add/remove .expanded class.
         CSS handles display:none -> display:block on .menu-extra children
         with a GPU-only animation. Zero layout reflow. */
      var isExpanded = activePanel.classList.toggle('expanded');
      menuToggleBtn.classList.toggle('is-expanded', isExpanded);
      menuToggleBtn.textContent = isExpanded ? 'Show Less' : 'Show More';
      menuToggleBtn.setAttribute('aria-expanded', String(isExpanded));
    });
  }

  /* ---------- Gallery: Show More / Show Less Toggle ---------- */
  var galleryToggleBtn = document.getElementById('gallery-toggle-btn');
  var galleryGrid = document.querySelector('.gallery-grid');

  if (galleryToggleBtn && galleryGrid) {
    galleryToggleBtn.addEventListener('click', function () {
      var isExpanded = galleryGrid.classList.toggle('expanded');
      galleryToggleBtn.classList.toggle('is-expanded', isExpanded);
      galleryToggleBtn.textContent = isExpanded ? 'Show Less Photos' : 'Show More Photos';
      galleryToggleBtn.setAttribute('aria-expanded', String(isExpanded));

      if (!isExpanded) {
        document.getElementById('gallery').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  /* ---------- Google Reviews: Continuous Infinite Marquee ---------- */
  var REVIEWS_DATA = [
    {
      name: "Celroy Fernandes",
      avatar: "CF",
      status: "Local Guide · Verified Guest",
      text: "The best... outstanding food, great drinks, soothing music and great atmosphere. The owners are so down to earth. The service and staff are so good ❤️ I give it a 10/10."
    },
    {
      name: "Domingo Cardozo",
      avatar: "DC",
      status: "Verified Guest",
      text: "I visited this place recently loved the atmosphere, authentic Goan food and very friendly staff. The seafood freshness was remarkable and the cocktails were masterfully prepared."
    },
    {
      name: "Shruti Pereira",
      avatar: "SP",
      status: "Local Guide",
      text: "Very tasty food and good place if you have kids. There's a small playground where the kids can play. Reasonable pricing, generous portions and great family ambience!"
    },
    {
      name: "Krishna Kumar Yadav",
      avatar: "KY",
      status: "Verified Diner",
      text: "Very good atmosphere and quick service. The butter garlic prawns were amazing and the pepper garlic tongue was delicious... will definitely visit again whenever in South Goa!"
    },
    {
      name: "Rio Fernandes",
      avatar: "RF",
      status: "Local Guide",
      text: "We visited with our family and it didn’t disappoint. Food was delicious, especially the tongue pepper garlic. Urak was very good and the steaks were cooked to perfection!"
    },
    {
      name: "Noel Dmello",
      avatar: "ND",
      status: "Verified Diner",
      text: "Always loved this place. I dine here every time I'm on a trip to Goa. Great quality and quantity at nominal charges. Extremely tourist-friendly and ideal for family gatherings."
    },
    {
      name: "Dara",
      avatar: "DA",
      status: "Local Guide",
      text: "This is my favourite restaurant in Goa. Their curries, Xacuti, and Recheado masala are distinctly flavourful and just too good. Cannot recommend it enough!"
    },
    {
      name: "Mark Fernandes",
      avatar: "MF",
      status: "Verified Guest",
      text: "Located in the heart of Margao, peaceful vibe with lush surroundings. The Chilly Fry and Tongue Garlic Roast is a must try. Exceptional hospitality by the management team."
    },
    {
      name: "Alisha Souza",
      avatar: "AS",
      status: "Verified Guest",
      text: "The Rava Fried Fish was crisp on the outside, juicy inside. Ambience under the fairy lights in the evening makes it the perfect dinner spot in Pajifond!"
    },
    {
      name: "Kevin Rodrigues",
      avatar: "KR",
      status: "Local Guide",
      text: "Authentic Goan Sol Kadi and Crab Xacuti. The staff treated us like royalty. Easily one of the top fine dining spots in South Goa."
    },
    {
      name: "Sneha Prabhu",
      avatar: "SP",
      status: "Verified Diner",
      text: "Great place for corporate team dinners. Prompt service, great cocktail menu, and the Goan Fish Thali is simply unforgettable."
    },
    {
      name: "Rahul Varma",
      avatar: "RV",
      status: "Verified Guest",
      text: "Dined here on our anniversary trip. The romantic candlelight atmosphere paired with fresh lobster and wine made our night so special."
    },
    {
      name: "Joseph D'Silva",
      avatar: "JD",
      status: "Local Guide",
      text: "Exceptional Pork Vindaloo and Beef Roast. Generous portions, reasonable prices, and genuine Goan warmth. Will return soon!"
    },
    {
      name: "Ananya Roy",
      avatar: "AR",
      status: "Verified Guest",
      text: "Loved the outdoor seating vibe! The Butter Garlic Squid and Sangria were 10/10. Quick service even on busy weekend nights."
    },
    {
      name: "Jason Pinto",
      avatar: "JP",
      status: "Local Guide",
      text: "A gem in Margao. From starters to dessert (the Bebinca was delicious), everything was prepared with authentic coastal flavors."
    }
  ];

  var marqueeContent = document.getElementById('marquee-content');
  if (marqueeContent) {
    // Render 2 sets of review items to create a seamless infinite loop animation
    var doubleReviews = REVIEWS_DATA.concat(REVIEWS_DATA);
    var html = '';

    doubleReviews.forEach(function (r) {
      html += [
        '<div class="review-card marquee-card">',
        '  <div class="review-top">',
        '    <div class="google-badge-small">',
        '      <svg viewBox="0 0 24 24" width="16" height="16">',
        '        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>',
        '        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>',
        '        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>',
        '        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>',
        '      </svg>',
        '      <span>Google Review</span>',
        '    </div>',
        '    <span class="stars">★★★★★</span>',
        '  </div>',
        '  <p class="review-text">' + r.text + '</p>',
        '  <div class="reviewer">',
        '    <div class="reviewer-avatar">' + r.avatar + '</div>',
        '    <div class="reviewer-meta">',
        '      <span class="reviewer-name">' + r.name + '</span>',
        '      <span class="reviewer-verified">' + r.status + '</span>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');
    });

    marqueeContent.innerHTML = html;

    // Smooth JS requestAnimationFrame Continuous Motion (Right to Left)
    var marqueeWrapper = document.getElementById('reviews-marquee-wrapper');
    var scrollPos = 0;
    var speed = 0.5; // Smooth readable speed (~60px/sec right to left)
    var isPaused = false;

    if (marqueeWrapper) {
      marqueeWrapper.addEventListener('mouseenter', function () { isPaused = true; });
      marqueeWrapper.addEventListener('mouseleave', function () { isPaused = false; });
      marqueeWrapper.addEventListener('touchstart', function () { isPaused = true; }, { passive: true });
      marqueeWrapper.addEventListener('touchend', function () { isPaused = false; }, { passive: true });
    }

    function animateMarquee() {
      if (!isPaused) {
        scrollPos += speed;
        // Total width of half the cards (15 cards) including gaps
        var singleTrackWidth = marqueeContent.scrollWidth / 2;
        if (singleTrackWidth > 0 && scrollPos >= singleTrackWidth) {
          scrollPos -= singleTrackWidth;
        }
        marqueeContent.style.transform = 'translate3d(-' + scrollPos.toFixed(2) + 'px, 0, 0)';
      }
      requestAnimationFrame(animateMarquee);
    }

    // Start requestAnimationFrame continuous animation
    requestAnimationFrame(function () {
      requestAnimationFrame(animateMarquee);
    });
  }

  // /* ---------- Live Restaurant Open / Closed Status Indicator ---------- */
  // function updateLiveOperatingStatus() {
  //   var statusEl = document.getElementById('live-open-status');
  //   if (!statusEl) return;

  //   // Operating hours: 12:00 to 16:00 (Lunch) & 19:00 to 23:45 (Dinner)
  //   var now = new Date();
  //   var currentHour = now.getHours();
  //   var currentMin = now.getMinutes();
  //   var totalMins = currentHour * 60 + currentMin;

  //   var lunchStart = 12 * 60;        // 12:00 PM
  //   var lunchEnd = 16 * 60;          // 4:00 PM
  //   var dinnerStart = 19 * 60;       // 7:00 PM
  //   var dinnerEnd = 23 * 60 + 45;    // 11:45 PM

  //   var isOpen = (totalMins >= lunchStart && totalMins < lunchEnd) || (totalMins >= dinnerStart && totalMins <= dinnerEnd);

  //   if (isOpen) {
  //     statusEl.textContent = '● Open Now · Serving Delicious Food';
  //     statusEl.style.background = 'linear-gradient(135deg, #10b981, #059669)';
  //     statusEl.style.color = '#ffffff';
  //   } else {
  //     statusEl.textContent = '● Open Today · Next: 12:00 PM / 7:00 PM';
  //   }
  // }

  // updateLiveOperatingStatus();

  /* ---------- Enquiry Form -> WhatsApp ---------- */
  var enquiryForm = document.getElementById('enquiry-form');
  var formStatus = document.getElementById('form-status');

  if (enquiryForm) {
    enquiryForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(enquiryForm);
      var name = data.get('name') || 'Guest';
      var phone = data.get('phone') || '-';
      var email = data.get('email') || '-';
      var date = data.get('date') || '-';
      var guests = data.get('guests') || '-';
      var type = data.get('type') || 'Table Reservation';
      var message = data.get('message') || 'No special requests';

      var whatsappText = [
        '✨ *New Enquiry from Anoshka Website* ✨',
        '---------------------------------------',
        '*Name:* ' + name,
        '*Phone:* ' + phone,
        '*Email:* ' + email,
        '*Occasion:* ' + type,
        '*Date:* ' + date,
        '*Guests:* ' + guests,
        '*Notes:* ' + message,
        '---------------------------------------'
      ].join('\n');

      var whatsappUrl = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(whatsappText);

      if (formStatus) {
        formStatus.textContent = 'Opening WhatsApp to send your enquiry…';
      }

      window.open(whatsappUrl, '_blank', 'noopener');
      enquiryForm.reset();
    });
  }



  /* ---------- Dynamic Footer Year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Initial trigger
  onScroll();
})();

// MAISON LUNE — interactions, animations, mobile responsive
(function () {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const ce = (tag, attrs = {}, html = '') => {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'class') el.className = v;
      else if (k === 'style') el.style.cssText = v;
      else el.setAttribute(k, v);
    });
    if (html) el.innerHTML = html;
    return el;
  };

  // ---------- Toast ----------
  let toastEl;
  function toast(msg) {
    if (!toastEl) {
      toastEl = ce('div', { class: 'toast' });
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = `<span class="check">✓</span> ${msg}`;
    toastEl.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toastEl.classList.remove('show'), 2400);
  }
  window.MAISONLUNE_toast = toast;

  // ---------- Scrim ----------
  let scrim;
  function getScrim() {
    if (!scrim) {
      scrim = ce('div', { class: 'scrim' });
      document.body.appendChild(scrim);
      scrim.addEventListener('click', closeAllOverlays);
    }
    return scrim;
  }
  function showScrim() { getScrim().classList.add('show'); }
  function hideScrim() { getScrim().classList.remove('show'); }
  function closeAllOverlays() {
    $$('.mobile-menu, .search-overlay, .filter-drawer').forEach(el => el.classList.remove('open'));
    $$('.modal-backdrop').forEach(el => el.classList.remove('show'));
    hideScrim();
    document.body.style.overflow = '';
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAllOverlays(); });

  // ---------- Mobile menu ----------
  function buildMobileMenu() {
    if ($('.mobile-menu')) return;
    const menu = ce('aside', { class: 'mobile-menu', 'aria-hidden': 'true' });
    menu.innerHTML = `
      <button class="close" aria-label="Close menu">✕</button>
      <span class="group-label">Shop</span>
      <a href="dresses.html?cat=new">New Arrivals</a>
      <a href="dresses.html?cat=dresses">Dresses</a>
      <a href="dresses.html?cat=tops">Tops</a>
      <a href="dresses.html?cat=bottoms">Bottoms</a>
      <a href="dresses.html?cat=accessories">Accessories</a>
      <a href="dresses.html?cat=best-sellers">Best Sellers</a>
      <span class="group-label">Account</span>
      <a href="#" data-action="account">Sign in</a>
      <a href="#" data-action="wishlist">Wishlist</a>
      <a href="cart.html">Bag</a>
      <span class="group-label">Country / Region</span>
      <a href="#" data-action="region" style="font-size:14px; font-family:Inter;">United States (USD)</a>
    `;
    document.body.appendChild(menu);
    menu.querySelector('.close').addEventListener('click', closeAllOverlays);
  }

  function buildMobileToggle() {
    const headerInner = $('.header .header-inner');
    if (!headerInner || headerInner.querySelector('.mobile-toggle')) return;
    const existingMenu = headerInner.querySelector('button[aria-label="Menu"], button.icon-btn:first-child');
    if (existingMenu && !existingMenu.querySelector('svg circle')) {
      existingMenu.classList.add('mobile-toggle');
      existingMenu.setAttribute('aria-label', 'Open menu');
      if (!existingMenu.dataset.menuBound) {
        existingMenu.dataset.menuBound = '1';
        existingMenu.addEventListener('click', () => {
          buildMobileMenu();
          $('.mobile-menu').classList.add('open');
          showScrim();
          document.body.style.overflow = 'hidden';
        });
      }
      return;
    }
    const btn = ce('button', { class: 'mobile-toggle', 'aria-label': 'Open menu' });
    btn.innerHTML = '<svg class="icon" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="1.4" width="20" height="20"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
    headerInner.prepend(btn);
    btn.addEventListener('click', () => {
      buildMobileMenu();
      $('.mobile-menu').classList.add('open');
      showScrim();
      document.body.style.overflow = 'hidden';
    });
  }

  // ---------- Search overlay ----------
  function buildSearch() {
    if ($('.search-overlay')) return;
    const sov = ce('div', { class: 'search-overlay', role: 'dialog' });
    sov.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; max-width:720px; margin:0 auto;">
        <span style="font-family:'Cormorant Garamond',serif; font-size:18px; letter-spacing:.3em;">MAISON LUNE</span>
        <button class="close-search" aria-label="Close search">✕</button>
      </div>
      <form onsubmit="event.preventDefault();">
        <input type="text" placeholder="Search dresses, tops, accessories…" />
        <button type="submit" class="icon-btn"><svg class="icon" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="1.4"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></button>
      </form>
      <div class="suggestions">
        <span class="chip">Linen Dress</span>
        <span class="chip">Cutout Dress</span>
        <span class="chip">Wide Leg Pant</span>
        <span class="chip">Gold Hoops</span>
        <span class="chip">Resort</span>
        <span class="chip">Best Sellers</span>
      </div>
    `;
    document.body.appendChild(sov);
    sov.querySelector('.close-search').addEventListener('click', closeAllOverlays);
    sov.querySelector('form').addEventListener('submit', e => {
      e.preventDefault();
      const term = sov.querySelector('input').value.trim();
      if (!term) {
        toast('Enter a search term');
        return;
      }
      window.location.href = `dresses.html?search=${encodeURIComponent(term)}`;
    });
    sov.querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => {
      sov.querySelector('input').value = c.textContent.trim();
      sov.querySelector('input').focus();
    }));
  }

  function bindSearch() {
    $$('button.icon-btn, .icon-btn[aria-label="Search"]').forEach(btn => {
      const href = btn.getAttribute('href');
      const text = (btn.getAttribute('aria-label') || btn.textContent || '').trim().toLowerCase();
      if (href || text === 'open menu' || text === 'menu') return;
      if (!btn.querySelector('svg circle')) return;
      btn.setAttribute('aria-label', 'Search');
      btn.addEventListener('click', () => {
        buildSearch();
        $('.search-overlay').classList.add('open');
        showScrim();
        setTimeout(() => $('.search-overlay input') && $('.search-overlay input').focus(), 200);
      });
    });
  }

  // ---------- Newsletter modal ----------
  function buildNewsletter() {
    if (sessionStorage.getItem('maisonlune_news_dismissed')) return;
    if ($('.modal-backdrop.news')) return;
    const m = ce('div', { class: 'modal-backdrop news' });
    m.innerHTML = `
      <div class="modal" role="dialog" aria-label="Newsletter signup">
        <button class="close-modal" aria-label="Close">✕</button>
        <div class="visual"><img src="assets/img/coastal-edit.png" alt=""></div>
        <div class="body">
          <h3>10% off your<br/>first order</h3>
          <p>Join our list for early access, style tips, and exclusive offers — straight to your inbox.</p>
          <form>
            <input class="input" type="email" required placeholder="Enter your email"/>
            <button class="btn btn-block" type="submit">Get my code</button>
          </form>
          <p class="skip">No thanks, continue shopping</p>
        </div>
      </div>
    `;
    document.body.appendChild(m);
    const close = () => {
      m.classList.remove('show');
      document.body.style.overflow = '';
      sessionStorage.setItem('maisonlune_news_dismissed', '1');
    };
    m.querySelector('.close-modal').addEventListener('click', close);
    m.querySelector('.skip').addEventListener('click', close);
    m.addEventListener('click', e => { if (e.target === m) close(); });
    m.querySelector('form').addEventListener('submit', e => {
      e.preventDefault();
      close();
      toast('Welcome — check your inbox');
    });
    let triggered = false;
    const trigger = () => {
      if (triggered || sessionStorage.getItem('maisonlune_news_dismissed')) return;
      triggered = true;
      m.classList.add('show');
      document.body.style.overflow = 'hidden';
    };
    setTimeout(trigger, 30000);
    window.addEventListener('scroll', () => { if (window.scrollY > 1800) trigger(); }, { passive: true });
  }

  // ---------- Reveal on scroll ----------
  function autoReveal() {
    const targets = [
      '.section', '.product-card', '.look-bundle', '.cart-row',
      '.summary-card', '.reviews', '.looks .look', '.ugc-grid .tile',
      '.ugc-row .item', '.trust-band', '.subscribe-band', '.listing-hero .copy',
      '.pdp-info', '.pdp-main', '.checkout > div'
    ];
    targets.forEach(sel => $$(sel).forEach((el, i) => {
      if (!el.hasAttribute('data-reveal')) {
        el.setAttribute('data-reveal', '');
        if (i % 4) el.setAttribute('data-reveal-delay', String(i % 4));
      }
    }));
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    $$('[data-reveal]').forEach(el => io.observe(el));
  }

  // ---------- Header shadow on scroll ----------
  function bindHeader() {
    const header = $('.header');
    if (!header) return;
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ---------- Hero slider ----------
  function bindHeroSlider() {
    const dots = $$('.hero-dots i');
    const hero = $('.hero');
    if (!dots.length || !hero) return;
    const bg = hero.querySelector('img.bg');
    if (!bg) return;
    const slides = ['assets/img/banner-distinct-1.png', 'assets/img/banner-distinct-2.png', 'assets/img/banner-distinct-3.png'];
    let i = 0, timer;
    bg.style.transition = 'opacity .6s ease';
    const show = (idx) => {
      i = (idx + slides.length) % slides.length;
      bg.style.opacity = '0';
      setTimeout(() => { bg.src = slides[i]; bg.style.opacity = '1'; }, 350);
      dots.forEach((d, di) => d.classList.toggle('active', di === i));
    };
    dots.forEach((d, di) => d.addEventListener('click', () => { show(di); reset(); }));
    const reset = () => { clearInterval(timer); timer = setInterval(() => show(i + 1), 6000); };
    reset();
  }

  // ---------- Hearts (wishlist) ----------
  function bindHearts() {
    $$('.heart-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault(); e.stopPropagation();
        btn.classList.toggle('active');
        toast(btn.classList.contains('active') ? 'Added to wishlist' : 'Removed from wishlist');
      });
    });
  }

  // ---------- Bag bump ----------
  function bumpBag(inc = 1) {
    const bag = $('.icon-btn[aria-label="Bag"]');
    if (!bag) return;
    bag.classList.remove('bump'); void bag.offsetWidth; bag.classList.add('bump');
    const badge = bag.querySelector('.badge');
    if (badge) badge.textContent = String(parseInt(badge.textContent || '0', 10) + inc);
  }

  // ---------- Add to bag ----------
  function bindAddToBag() {
    $$('a.btn, button.btn').forEach(b => {
      const txt = (b.textContent || '').trim().toLowerCase();
      if (!/^(add to bag|add all to bag)/.test(txt)) return;
      b.addEventListener('click', e => {
        if (b.tagName === 'A' && b.getAttribute('href') === 'cart.html') {
          e.preventDefault();
          bumpBag();
          toast('Added to bag');
          setTimeout(() => { window.location.href = 'cart.html'; }, 800);
        } else {
          e.preventDefault();
          bumpBag();
          toast('Added to bag');
        }
      });
    });
  }

  // ---------- PDP gallery ----------
  function bindGallery() {
    const main = $('.pdp-main img');
    const thumbs = $$('.thumb-rail .thumb');
    if (!main || !thumbs.length) return;
    main.style.transition = 'opacity .3s ease';
    thumbs.forEach(t => t.addEventListener('click', () => {
      thumbs.forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      const img = t.querySelector('img');
      if (img) {
        main.style.opacity = '0';
        setTimeout(() => { main.src = img.src; main.style.opacity = '1'; }, 200);
      }
    }));
  }

  // ---------- Controls ----------
  function bindControls() {
    $$('.size-grid').forEach(grid => {
      grid.addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        e.preventDefault();
        grid.querySelectorAll('button').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        const label = grid.closest('div') && grid.closest('div').querySelector('.label span');
        if (label) label.textContent = b.textContent.trim();
        updateStickySelection();
      });
    });
    $$('.color-row').forEach(row => {
      row.addEventListener('click', e => {
        const s = e.target.closest('.swatch'); if (!s) return;
        row.querySelectorAll('.swatch').forEach(x => x.classList.remove('active'));
        s.classList.add('active');
        const color = Array.from(s.classList).find(c => !['swatch', 'lg', 'active'].includes(c));
        const label = row.closest('div') && row.closest('div').querySelector('.label span');
        if (label && color) label.textContent = color.charAt(0).toUpperCase() + color.slice(1);
        updateStickySelection();
      });
    });
    $$('.qty').forEach(q => {
      const input = q.querySelector('input');
      q.querySelectorAll('button').forEach((btn, i) => {
        btn.addEventListener('click', e => {
          e.preventDefault();
          let v = parseInt(input.value || '1', 10);
          v = i === 0 ? Math.max(1, v - 1) : v + 1;
          input.value = v;
          updateCartSummary();
        });
      });
    });
    $$('.gl-tabs').forEach(tabs => {
      tabs.addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        tabs.querySelectorAll('button').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        toast(b.textContent.trim().toLowerCase().includes('login') ? 'Login selected' : 'Guest checkout selected');
      });
    });
    $$('[data-radio-group]').forEach(group => {
      group.addEventListener('click', e => {
        const block = e.target.closest('.radio-block'); if (!block) return;
        group.querySelectorAll('.radio-block').forEach(x => x.classList.remove('active'));
        block.classList.add('active');
        const cardForm = group.querySelector('.card-form');
        if (cardForm) cardForm.style.display = block.dataset.method === 'card' ? 'block' : 'none';
        updateShippingSummary(block);
      });
    });

    // Accordion
    const panels = {
      'Details & Care': 'Crafted from a signature 92% Modal / 8% Elastane blend for a soft, second-skin feel. Machine wash cold, hang to dry flat.',
      'Fit & Sizing': 'Model is 5\'9" wearing size S. True to size, body-skimming silhouette. Length: 42" / 107 cm.',
      'Shipping & Returns': 'Free worldwide shipping on orders over $150. 30-day easy returns. Duties and taxes calculated at checkout.'
    };
    $$('.accordion').forEach(accordion => {
      const rows = $$('.row', accordion);
      rows.forEach(row => {
        const label = (row.firstChild ? row.firstChild.textContent : '').trim();
        const originalNext = row.nextElementSibling;
        if (!originalNext || !originalNext.classList.contains('panel')) {
          const panel = ce('div', { class: 'panel' });
          panel.innerHTML = `<div class="panel-inner">${panels[label] || 'Details available soon.'}</div>`;
          const nextRow = rows[rows.indexOf(row) + 1];
          accordion.insertBefore(panel, nextRow || null);
        }
        const last = row.lastElementChild;
        if (last && last.tagName === 'SPAN' && !last.classList.contains('plus')) last.classList.add('plus');
        row.addEventListener('click', () => {
          const panel = row.nextElementSibling;
          const open = row.classList.toggle('open');
          if (panel && panel.classList.contains('panel')) {
            panel.style.maxHeight = open ? panel.scrollHeight + 'px' : '0px';
          }
        });
      });
    });
  }

  function updateStickySelection() {
    const sticky = $('.sticky-add .sub');
    if (!sticky) return;
    const color = $('.color-row .swatch.active');
    const size = $('.size-grid button.active');
    const colorName = color ? Array.from(color.classList).find(c => !['swatch', 'lg', 'active'].includes(c)) : '';
    const formattedColor = colorName ? colorName.charAt(0).toUpperCase() + colorName.slice(1) : 'Sand';
    sticky.textContent = `${formattedColor} / ${size ? size.textContent.trim() : 'M'}`;
  }

  function updateCartSummary() {
    const rows = $$('.cart-row');
    if (!rows.length) return;
    let subtotal = 0;
    let count = 0;
    rows.forEach(row => {
      const priceText = row.querySelector('.price') ? row.querySelector('.price').textContent : '$0';
      const qtyInput = row.querySelector('.qty input');
      const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
      const qty = parseInt(qtyInput ? qtyInput.value : '1', 10) || 1;
      subtotal += price * qty;
      count += qty;
    });
    const summaryRows = $$('.summary-card .summary-row');
    const subtotalRow = summaryRows.find(row => row.textContent.includes('Subtotal'));
    const totalRow = $('.summary-card .summary-row.total');
    if (subtotalRow) {
      subtotalRow.firstElementChild.textContent = `Subtotal (${count} ${count === 1 ? 'item' : 'items'})`;
      subtotalRow.lastElementChild.textContent = `$${subtotal.toFixed(2)}`;
    }
    if (totalRow) totalRow.lastElementChild.textContent = `$${subtotal.toFixed(2)} USD`;
    const bagCount = document.querySelector('h1 span');
    if (bagCount && bagCount.textContent.includes('(')) bagCount.textContent = `(${count})`;
    $$('.badge').forEach(badge => { badge.textContent = String(count); });
  }

  function updateShippingSummary(block) {
    if (!block || !block.dataset.shipping) return;
    const shipping = parseFloat(block.dataset.shipping) || 0;
    const summaryRows = $$('.summary-card .summary-row');
    const shippingRow = summaryRows.find(row => row.firstElementChild && row.firstElementChild.textContent.trim() === 'Shipping');
    const totalRow = $('.summary-card .summary-row.total');
    const subtotalRow = summaryRows.find(row => row.firstElementChild && row.firstElementChild.textContent.includes('Subtotal'));
    const subtotal = subtotalRow ? parseFloat(subtotalRow.lastElementChild.textContent.replace(/[^0-9.]/g, '')) || 0 : 366;
    if (shippingRow) shippingRow.lastElementChild.textContent = shipping ? `$${shipping.toFixed(2)}` : 'FREE';
    if (totalRow) totalRow.lastElementChild.textContent = `$${(subtotal + shipping).toFixed(2)} USD`;
    toast(shipping ? `Shipping updated: $${shipping.toFixed(2)}` : 'Free shipping selected');
  }

  // ---------- Filter chips & drawer ----------
  function bindFilters() {
    $$('.filter-bar .chip').forEach(c => {
      c.addEventListener('click', e => {
        e.stopPropagation();
        const t = c.textContent.trim().toLowerCase();
        if (['filters', 'size', 'color', 'price', 'style', 'availability'].some(label => t.startsWith(label))) {
          openFilterDropdown(c, t.replace(/[^a-z]/g, ''));
        }
        else if (t.startsWith('sort by')) {
          openFilterDropdown(c, 'sort');
        } else if (t === 'usd') {
          openFilterDropdown(c, 'currency');
        } else {
          c.classList.toggle('active');
          toast(c.classList.contains('active') ? `${c.textContent.trim()} filter on` : `${c.textContent.trim()} filter off`);
        }
      });
    });
    // Active filter chip dismiss (the row right below filter bar)
    $$('.active-filters .chip.active').forEach(chip => {
      chip.addEventListener('click', () => {
        chip.style.transition = 'opacity .25s, transform .25s';
        chip.style.opacity = '0';
        chip.style.transform = 'scale(.9)';
        setTimeout(() => chip.remove(), 250);
      });
    });
    $$('a, button, span').forEach(el => {
      if ((el.textContent || '').trim().toLowerCase() !== 'clear all') return;
      el.style.cursor = 'pointer';
      el.addEventListener('click', e => {
        e.preventDefault();
        $$('.active-filters .chip.active').forEach(chip => chip.remove());
        $$('.filter-bar .chip.active').forEach(chip => chip.classList.remove('active'));
        toast('Filters cleared');
      });
    });
    document.addEventListener('click', e => {
      if (!e.target.closest('.filter-dropdown') && !e.target.closest('.filter-bar .chip')) closeFilterDropdown();
    });
  }

  const filterOptions = {
    filters: ['All filters'],
    size: ['XS', 'S', 'M', 'L', 'XL'],
    color: ['Sand', 'Oat', 'Cocoa', 'Espresso', 'Ivory'],
    price: ['Under $100', '$100–$200', '$200+'],
    style: ['Linen', 'Cutout', 'Mini', 'Maxi', 'Resort'],
    availability: ['In stock', 'Best Seller', 'New'],
    sort: ['Featured', 'Newest', 'Price Low–High', 'Price High–Low'],
    currency: ['USD', 'EUR', 'GBP', 'JPY']
  };

  function closeFilterDropdown() {
    const dropdown = $('.filter-dropdown');
    if (dropdown) dropdown.remove();
  }

  function openFilterDropdown(trigger, group) {
    closeFilterDropdown();
    if (group === 'filters') {
      openFilterDrawer();
      return;
    }
    const options = filterOptions[group];
    if (!options) return;
    const dropdown = ce('div', { class: 'filter-dropdown' });
    dropdown.innerHTML = options.map(option => `<button type="button">${option}</button>`).join('');
    document.body.appendChild(dropdown);
    const rect = trigger.getBoundingClientRect();
    dropdown.style.left = `${Math.min(rect.left + window.scrollX, window.scrollX + window.innerWidth - 260)}px`;
    dropdown.style.top = `${rect.bottom + window.scrollY + 8}px`;
    dropdown.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', () => {
        const value = button.textContent.trim();
        if (group === 'sort') {
          trigger.textContent = `Sort by: ${value}`;
        } else if (group === 'currency') {
          trigger.textContent = value;
        } else {
          trigger.classList.add('active');
          addActiveFilter(value);
        }
        closeFilterDropdown();
      });
    });
  }

  function addActiveFilter(value) {
    const activeRow = $('.active-filters');
    if (!activeRow) return;
    const existing = $$('.chip.active', activeRow).find(chip => chip.textContent.replace('✕', '').trim() === value);
    if (existing) return;
    const chip = ce('span', { class: 'chip active' }, `${value} ✕`);
    chip.addEventListener('click', () => chip.remove());
    activeRow.insertBefore(chip, activeRow.querySelector('[data-clear-filters]'));
  }

  function openFilterDrawer(focusGroup = '') {
    let drawer = $('.filter-drawer');
    if (!drawer) {
      drawer = ce('aside', { class: 'filter-drawer' });
      drawer.innerHTML = `
        <header><h3>Filters</h3><button class="close-search" aria-label="Close">✕</button></header>
        <div class="body">
          <div class="group" data-group="size"><h4>Size</h4><div class="opts">
            <span class="chip">XS</span><span class="chip">S</span><span class="chip active">M</span>
            <span class="chip">L</span><span class="chip">XL</span></div></div>
          <div class="group" data-group="color"><h4>Color</h4><div class="opts">
            <span class="chip active">Sand</span><span class="chip">Oat</span>
            <span class="chip">Cocoa</span><span class="chip">Espresso</span>
            <span class="chip">Ivory</span></div></div>
          <div class="group" data-group="price"><h4>Price</h4><div class="opts">
            <span class="chip">Under $100</span><span class="chip active">$100–$200</span>
            <span class="chip">$200+</span></div></div>
          <div class="group" data-group="style"><h4>Style</h4><div class="opts">
            <span class="chip">Linen</span><span class="chip">Cutout</span>
            <span class="chip">Mini</span><span class="chip">Maxi</span>
            <span class="chip">Resort</span></div></div>
          <div class="group" data-group="availability"><h4>Availability</h4><div class="opts">
            <span class="chip">In stock</span><span class="chip">Best Seller</span>
            <span class="chip">New</span></div></div>
        </div>
        <footer>
          <button class="btn btn-light">Clear all</button>
          <button class="btn">Show 142 items</button>
        </footer>
      `;
      document.body.appendChild(drawer);
      drawer.querySelector('.close-search').addEventListener('click', closeAllOverlays);
      drawer.querySelector('footer .btn:not(.btn-light)').addEventListener('click', closeAllOverlays);
      drawer.querySelector('footer .btn-light').addEventListener('click', () => {
        drawer.querySelectorAll('.opts .chip.active').forEach(x => x.classList.remove('active'));
        $$('.filter-bar .chip.active').forEach(chip => chip.classList.remove('active'));
        $$('.active-filters .chip.active').forEach(chip => chip.remove());
        toast('Filters cleared');
      });
      drawer.querySelectorAll('.opts .chip').forEach(c => c.addEventListener('click', () => {
        c.classList.toggle('active');
        if (c.classList.contains('active')) addActiveFilter(c.textContent.trim());
        toast(c.classList.contains('active') ? `${c.textContent.trim()} filter on` : `${c.textContent.trim()} filter off`);
      }));
    }
    drawer.classList.add('open');
    showScrim();
    document.body.style.overflow = 'hidden';
    if (focusGroup && focusGroup !== 'filters') {
      const group = drawer.querySelector(`[data-group="${focusGroup}"]`);
      if (group) {
        group.scrollIntoView({ block: 'start' });
        group.classList.add('focus');
        clearTimeout(group._focusTimer);
        group._focusTimer = setTimeout(() => group.classList.remove('focus'), 900);
      }
    }
  }

  // ---------- Cart row actions ----------
  function bindCartRowActions() {
    $$('.cart-row').forEach(row => {
      row.querySelectorAll('a').forEach(a => {
        const txt = a.textContent.trim().toLowerCase();
        if (txt.includes('remove')) {
          a.style.cursor = 'pointer';
          a.addEventListener('click', e => {
            e.preventDefault();
            row.style.transition = 'opacity .3s, transform .3s, max-height .4s, padding .4s';
            row.style.maxHeight = row.offsetHeight + 'px';
            requestAnimationFrame(() => {
              row.style.opacity = '0';
              row.style.transform = 'translateX(-12px)';
              row.style.maxHeight = '0px';
              row.style.padding = '0';
              row.style.borderBottom = 'none';
            });
            setTimeout(() => {
              row.remove();
              updateCartSummary();
            }, 380);
            toast('Removed from bag');
          });
        }
        if (txt.includes('save for later')) {
          a.style.cursor = 'pointer';
          a.addEventListener('click', e => { e.preventDefault(); toast('Saved for later'); });
        }
      });
    });
  }

  // ---------- Promo apply ----------
  function bindPromo() {
    $$('button.btn.btn-light').forEach(b => {
      if ((b.textContent || '').trim().toLowerCase() === 'apply') {
        b.addEventListener('click', e => {
          e.preventDefault();
          const input = b.previousElementSibling;
          if (input && input.value && input.value.trim()) toast('Promo applied: ' + input.value.toUpperCase());
          else toast('Enter a promo code');
        });
      }
    });
  }

  // ---------- Demo-only interactions ----------
  function bindDemoActions() {
    $$('a[href="#"]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const label = (a.getAttribute('aria-label') || a.dataset.action || a.textContent || 'Feature').trim();
        toast(`${label} preview`);
      });
    });

    $$('a.icon-btn:not([href]), button.icon-btn[aria-label="Menu"]').forEach(btn => {
      if (btn.classList.contains('mobile-toggle')) return;
      btn.addEventListener('click', e => {
        e.preventDefault();
        buildMobileMenu();
        $('.mobile-menu').classList.add('open');
        showScrim();
        document.body.style.overflow = 'hidden';
      });
    });

    $$('.express-pay button').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        toast(`${btn.textContent.trim()} selected`);
      });
    });

    $$('button.btn').forEach(btn => {
      const text = btn.textContent.trim().toLowerCase();
      if (text.includes('save to wishlist')) {
        btn.addEventListener('click', e => {
          e.preventDefault();
          btn.classList.toggle('active');
          btn.textContent = btn.classList.contains('active') ? '♥ Saved to wishlist' : '♡ Save to wishlist';
          toast(btn.classList.contains('active') ? 'Added to wishlist' : 'Removed from wishlist');
        });
      } else if (text.includes('calculate estimate')) {
        btn.addEventListener('click', e => {
          e.preventDefault();
          toast('Estimated shipping: Free');
        });
      } else if (text.includes('place order')) {
        btn.addEventListener('click', e => {
          e.preventDefault();
          toast('Order placed — demo');
        });
      }
    });
  }

  // ---------- Subscribe band ----------
  function bindSubscribe() {
    $$('.subscribe-band form').forEach(f => {
      f.addEventListener('submit', e => {
        e.preventDefault();
        toast('Subscribed — your code is on the way');
        f.reset();
      });
    });
  }

  // ---------- Cat tabs (PLP) ----------
  function bindCatTabs() {
    $$('.cat-tabs').forEach(g => {
      g.addEventListener('click', e => {
        const a = e.target.closest('a'); if (!a) return;
        g.querySelectorAll('a').forEach(x => x.classList.remove('active'));
        a.classList.add('active');
      });
    });
  }

  // ---------- Apply category from ?cat= ----------
  function applyCategory() {
    const params = new URLSearchParams(location.search);
    const searchTerm = params.get('search');
    const cat = params.get('cat');

    if (cat) {
      $$('.nav-left .nav-link[data-cat]').forEach(a => {
        a.classList.toggle('active', a.dataset.cat === cat);
      });
    }

    // PLP-only tweaks
    const path = location.pathname.split('/').pop();
    if (path !== 'dresses.html') return;

    if (searchTerm) {
      const heading = $('.listing-hero h1');
      const para = $('.listing-hero .copy p');
      if (heading) heading.textContent = 'Search Results';
      if (para) para.textContent = `Showing products matching “${searchTerm}”. Refine with filters or browse related categories.`;
      document.title = `Search: ${searchTerm} — MAISON LUNE`;
      return;
    }

    if (!cat) return;

    const labels = {
      'new': 'New Arrivals',
      'dresses': 'Dresses',
      'tops': 'Tops',
      'bottoms': 'Bottoms',
      'accessories': 'Accessories',
      'best-sellers': 'Best Sellers',
      'lookbook': 'Lookbook'
    };
    const copy = {
      'new': 'The latest drops — fresh silhouettes, breathable fabrics, and pieces designed for the season ahead.',
      'dresses': 'Effortless silhouettes. Sculptural details. Designed to move with you through sunlit days and golden nights. Discover dresses for every moment.',
      'tops': 'Lightweight knits, tailored shirting, and resort-ready tanks — layering essentials cut for everyday ease.',
      'bottoms': 'Linen wide legs, fluid skirts, and sculpted denim — foundations built to move and breathe.',
      'accessories': 'Hand-finished hardware, woven straws, and gold-tone jewelry — the small things that finish the look.',
      'best-sellers': 'The pieces our community keeps coming back for — tested, worn, and loved.',
      'lookbook': 'Summer Capsule \'25 — a styled edit of our hero pieces, photographed coast to coast.'
    };
    const banners = {
      'new': 'assets/img/banner-new-arrivals.png',
      'dresses': 'assets/img/banner-dresses.png',
      'tops': 'assets/img/banner-tops.png',
      'bottoms': 'assets/img/banner-bottoms.png',
      'accessories': 'assets/img/banner-accessories.png',
      'lookbook': 'assets/img/lookbook.png'
    };
    const desktopBanners = {
      'new': 'assets/img/banner-new-arrivals-desktop.png',
      'dresses': 'assets/img/banner-dresses-desktop.png',
      'tops': 'assets/img/banner-tops-desktop.png',
      'bottoms': 'assets/img/banner-bottoms-desktop.png',
      'accessories': 'assets/img/banner-accessories-desktop.png'
    };
    const heading = $('.listing-hero h1');
    const para = $('.listing-hero .copy p');
    const banner = $('.listing-hero img');
    if (heading && labels[cat]) {
      heading.textContent = labels[cat];
      document.title = labels[cat] + ' — MAISON LUNE';
    }
    if (para && copy[cat]) para.textContent = copy[cat];
    if (banner && banners[cat]) {
      banner.src = banners[cat];
      if (desktopBanners[cat]) banner.dataset.desktopSrc = desktopBanners[cat];
      banner.dataset.mobileSrc = banners[cat];
      applyResponsiveBanner();
    }

    // Sync second-row cat-tabs active state
    $$('.cat-tabs a[data-cat]').forEach(a => {
      a.classList.toggle('active', a.dataset.cat === cat);
    });
  }

  function applyResponsiveBanner() {
    const banner = $('.listing-hero img[data-mobile-src]');
    if (!banner) return;
    const desktopSrc = banner.dataset.desktopSrc;
    const mobileSrc = banner.dataset.mobileSrc;
    banner.src = desktopSrc && window.innerWidth >= 900 ? desktopSrc : mobileSrc;
    banner.classList.toggle('is-desktop-banner', Boolean(desktopSrc && window.innerWidth >= 900));
  }

  // ---------- Lazy + error fallback ----------
  function lazyImg() {
    $$('img').forEach(img => {
      if (!img.loading) img.loading = 'lazy';
    });
  }

  // ---------- Init ----------
  function init() {
    buildMobileToggle();
    bindHeader();
    bindSearch();
    bindHeroSlider();
    bindControls();
    bindHearts();
    bindAddToBag();
    bindGallery();
    bindFilters();
    bindCartRowActions();
    bindPromo();
    bindSubscribe();
    bindDemoActions();
    bindCatTabs();
    applyCategory();
    applyResponsiveBanner();
    lazyImg();
    autoReveal();

    // Newsletter only on home
    const path = location.pathname.split('/').pop();
    if (path === '' || path === 'index.html') buildNewsletter();
  }

  window.addEventListener('resize', applyResponsiveBanner, { passive: true });

  if (!document.querySelector('link[rel="icon"]')) {
    const favicon = ce('link', { rel: 'icon', href: 'data:,' });
    document.head.appendChild(favicon);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

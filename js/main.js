/**
 * Williams Refrigeration India — Main Application Controller
 * Handles Catalogue Rendering with Authentic Product Photography,
 * In-Site PDF Specification Viewer, History State, 9:16 Review Reels,
 * Quotation Modal & Lead Capture with Local Persistence.
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var products = window.WILLIAMS_PRODUCTS || [];
  var categories = window.WILLIAMS_CATEGORIES || [];
  var tracker = window.WilliamsTracker || { track: function () {} };

  // Initialize PDF.js worker
  if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/pdf.worker.min.js';
  }

  /* ==========================================================================
     1. Hero Section CTAs & Analytics
     ========================================================================== */
  var heroExploreBtn = document.getElementById('heroExploreCta');
  var heroWhatsappCta = document.getElementById('heroWhatsappCta');

  if (heroExploreBtn) {
    heroExploreBtn.addEventListener('click', function () {
      if (tracker.trackHeroExploreCatalogue) {
        tracker.trackHeroExploreCatalogue();
      }
    });
  }

  if (heroWhatsappCta) {
    heroWhatsappCta.addEventListener('click', function () {
      if (tracker.trackHeroConsultation) {
        tracker.trackHeroConsultation();
      }
    });
  }

  /* ==========================================================================
     2. PDF Page 1 Thumbnail Engine & Minimal Product Card Builder
     ========================================================================== */
  var pdfThumbCache = {}; // Cache of generated WebP/canvas data URLs by prod.slug
  var pdfArrayBufferCache = {}; // Cache of downloaded binary ArrayBuffers by prod.pdfPath
  var pdfRenderQueue = []; // Controlled thumbnail render queue
  var activeQueueWorkers = 0;
  var MAX_CONCURRENT_THUMBS = 2;

  // Bulletproof PDF loader via binary fetch + in-memory parsing (bypasses all worker range/CORS issues)
  function fetchPdfBinary(pdfPath) {
    if (pdfArrayBufferCache[pdfPath]) {
      return Promise.resolve(pdfArrayBufferCache[pdfPath]);
    }
    var fullUrl = encodeURI(pdfPath).replace(/&/g, '%26');
    return fetch(fullUrl)
      .then(function (res) {
        if (!res.ok) {
          throw new Error('HTTP ' + res.status + ' loading ' + pdfPath);
        }
        return res.arrayBuffer();
      })
      .then(function (buf) {
        pdfArrayBufferCache[pdfPath] = buf;
        return buf;
      });
  }

  var pdfDocCache = {}; // Cache of PDFDocumentProxy instances

  function loadPdfDoc(prodOrPath) {
    var pdfPath = typeof prodOrPath === 'string' ? prodOrPath : prodOrPath.pdfPath;
    var cacheKey = (typeof prodOrPath === 'object' && prodOrPath.slug) ? prodOrPath.slug : pdfPath;

    if (pdfDocCache[cacheKey]) {
      return Promise.resolve(pdfDocCache[cacheKey]);
    }

    return fetchPdfBinary(pdfPath)
      .then(function (buf) {
        // Clone Uint8Array so worker transfer does not detach cached buffer
        var copy = new Uint8Array(buf.slice(0));
        return window.pdfjsLib.getDocument({
          data: copy,
          cMapPacked: true
        }).promise;
      })
      .then(function (pdfDoc) {
        pdfDocCache[cacheKey] = pdfDoc;
        return pdfDoc;
      })
      ['catch'](function (fetchErr) {
        console.warn('Binary fetch fallback for ' + pdfPath + ':', fetchErr);
        return window.pdfjsLib.getDocument({
          url: encodeURI(pdfPath).replace(/&/g, '%26'),
          disableRange: true,
          disableStream: true
        }).promise.then(function (pdfDoc) {
          pdfDocCache[cacheKey] = pdfDoc;
          return pdfDoc;
        });
      });
  }

  function applyThumbnailImage(containerEl, canvas, skeleton, dataUrl, prodName) {
    var img = document.createElement('img');
    img.className = 'product-pdf-thumb-img';
    img.src = dataUrl;
    img.alt = prodName + ' catalogue specification cover';
    if (canvas && canvas.parentNode) {
      canvas.parentNode.replaceChild(img, canvas);
    } else {
      containerEl.appendChild(img);
    }
    if (skeleton) skeleton.classList.add('loaded');
  }

  function renderPdfPage1Thumbnail(prod, containerEl) {
    if (!containerEl || containerEl.getAttribute('data-loaded') === 'true') return;
    containerEl.setAttribute('data-loaded', 'true');

    var canvas = containerEl.querySelector('.product-pdf-thumb-canvas');
    var skeleton = containerEl.querySelector('.product-thumb-skeleton');

    // 1. Check in-memory thumbnail cache
    if (pdfThumbCache[prod.slug]) {
      applyThumbnailImage(containerEl, canvas, skeleton, pdfThumbCache[prod.slug], prod.name);
      return;
    }

    // 2. Check sessionStorage thumbnail cache
    try {
      var stored = sessionStorage.getItem('wm_thumb_' + prod.slug);
      if (stored && stored.indexOf('data:image/') === 0) {
        pdfThumbCache[prod.slug] = stored;
        applyThumbnailImage(containerEl, canvas, skeleton, stored, prod.name);
        return;
      }
    } catch (e) {}

    if (!window.pdfjsLib) {
      if (skeleton) skeleton.classList.add('loaded');
      return;
    }

    // 3. Queue for orderly rendering
    pdfRenderQueue.push({ prod: prod, containerEl: containerEl, canvas: canvas, skeleton: skeleton });
    processNextInThumbQueue();
  }

  function processNextInThumbQueue() {
    if (pdfRenderQueue.length === 0 || activeQueueWorkers >= MAX_CONCURRENT_THUMBS) {
      return;
    }

    var item = pdfRenderQueue.shift();
    activeQueueWorkers++;

    var prod = item.prod;
    var containerEl = item.containerEl;
    var canvas = item.canvas;
    var skeleton = item.skeleton;

    loadPdfDoc(prod.pdfPath).then(function (pdfDoc) {
      return pdfDoc.getPage(1);
    }).then(function (page) {
      var unscaled = page.getViewport({ scale: 1 });
      var targetWidth = 460;
      var scale = targetWidth / unscaled.width;
      var viewport = page.getViewport({ scale: scale });

      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.className = 'product-pdf-thumb-canvas';
        containerEl.appendChild(canvas);
      }

      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.aspectRatio = (viewport.width + ' / ' + viewport.height);

      var ctx = canvas.getContext('2d');
      var renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };

      return page.render(renderContext).promise;
    }).then(function () {
      if (skeleton) skeleton.classList.add('loaded');

      try {
        var dataUrl = canvas.toDataURL('image/webp', 0.82);
        if (!dataUrl || dataUrl.indexOf('data:image/webp') !== 0) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        }
        if (dataUrl) {
          pdfThumbCache[prod.slug] = dataUrl;
          try { sessionStorage.setItem('wm_thumb_' + prod.slug, dataUrl); } catch (e) {}
        }
      } catch (e) {}
    })['catch'](function (err) {
      console.warn('PDF thumbnail note for ' + prod.name + ':', err);
      if (skeleton) skeleton.classList.add('loaded');
      if (prod.image) {
        var fallbackImg = document.createElement('img');
        fallbackImg.className = 'product-pdf-thumb-img';
        fallbackImg.src = prod.image;
        fallbackImg.alt = prod.name + ' catalogue specification';
        if (canvas && canvas.parentNode) {
          canvas.parentNode.replaceChild(fallbackImg, canvas);
        }
      }
    })['finally'](function () {
      activeQueueWorkers--;
      processNextInThumbQueue();
    });
  }

  // IntersectionObserver for lazy-loading PDF thumbnails below the fold
  var thumbObserver = null;
  if ('IntersectionObserver' in window) {
    thumbObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var stage = entry.target;
          var slug = stage.getAttribute('data-slug');
          var prod = products.find(function (p) { return p.slug === slug; });
          if (prod) {
            renderPdfPage1Thumbnail(prod, stage);
          }
          observer.unobserve(stage);
        }
      });
    }, { rootMargin: '250px 0px' });
  }

  function createProductCard(prod) {
    var card = document.createElement('article');
    card.className = 'product-card';
    card.setAttribute('data-id', prod.id);
    card.setAttribute('data-category', prod.category);
    card.setAttribute('data-slug', prod.slug);
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', 'View ' + prod.name + ' catalogue specification');

    // Subtle, optional badge (Hot Selling or Best Value only)
    var badgeHtml = '';
    if (prod.badge) {
      var badgeClass = 'badge-' + prod.badge.toLowerCase().replace(/\s+/g, '-');
      badgeHtml = '<span class="product-badge ' + badgeClass + '">' + prod.badge + '</span>';
    }

    var thumbSrc = prod.image || ('assets/thumbnails/' + prod.slug + '.jpg');

    // Media HTML: Authentic PDF Page 1 cover image with shimmer skeleton loader
    var mediaHtml =
      '<div class="product-media-wrap">' +
        badgeHtml +
        '<div class="product-thumb-stage" data-slug="' + prod.slug + '">' +
          '<img class="product-pdf-thumb-img" src="' + thumbSrc + '" alt="' + prod.name + ' catalogue specification cover" loading="lazy" width="400" height="520" onload="var s=this.nextElementSibling; if(s) s.classList.add(\'loaded\');">' +
          '<div class="product-thumb-skeleton" aria-hidden="true"></div>' +
        '</div>' +
      '</div>';

    // Generate direct WhatsApp link with specific product name pre-filled
    var waProductText = encodeURIComponent('Hello Williams Refrigeration, I would like to request pricing and specifications for ' + prod.name + ' (' + prod.categoryLabel + '). Please share details.');
    var waUrl = 'https://wa.me/919844013768?text=' + waProductText;

    // Direct Google Drive brochure URL for zero-wait smooth opening
    var catUrl = prod.driveUrl || (prod.driveId ? ('https://drive.google.com/file/d/' + prod.driveId + '/view?usp=drive_link') : '#');

    // Body HTML: strictly product name, "Catalogue ->" button and WhatsApp direct fast response button
    var bodyHtml =
      '<div class="product-body">' +
        '<h3 class="product-name">' + prod.name + '</h3>' +
        '<div class="product-actions-bar">' +
          '<button type="button" class="product-action-link" aria-label="View ' + prod.name + ' digital catalogue">' +
            '<span>Catalogue</span>' +
            '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>' +
          '</button>' +
          '<a href="' + waUrl + '" target="_blank" rel="noopener noreferrer" class="product-whatsapp-btn" aria-label="Direct WhatsApp message for ' + prod.name + '">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.983.54 1.811.83 2.796.83 3.18 0 5.767-2.587 5.767-5.766.001-3.187-2.575-5.817-5.767-6.017zm7.533 5.766c0 4.14-3.374 7.514-7.533 7.514-1.309 0-2.548-.344-3.626-.951l-4.405 1.155 1.176-4.291c-.705-1.139-1.107-2.483-1.107-3.927 0-4.14 3.374-7.514 7.533-7.514 4.16 0 7.533 3.374 7.533 7.514zm-4.209 2.553c-.22-.11-1.301-.642-1.503-.715-.202-.073-.349-.11-.496.11-.147.221-.57 0.716-.698.863-.129.147-.257.165-.477.055-.22-.11-.931-.343-1.774-1.095-.655-.584-1.098-1.306-1.226-1.526-.129-.221-.014-.34.096-.45.099-.099.22-.257.33-.385.11-.129.147-.221.221-.368.073-.147.037-.275-.018-.385-.055-.11-.496-1.194-.679-1.636-.179-.43-.36-.372-.496-.379-.129-.007-.275-.009-.422-.009-.147 0-.385.055-.587.275-.202.221-.771.753-.771 1.837 0 1.084.789 2.13 0.899 2.277.11.147 1.552 2.37 3.76 3.321.525.227.935.362 1.255.464.528.168 1.008.144 1.388.088.423-.063 1.301-.532 1.485-1.047.183-.514.183-.955.128-1.047-.054-.092-.201-.147-.421-.257z"/></svg>' +
            '<span>Fast Response</span>' +
          '</a>' +
        '</div>' +
      '</div>';

    card.innerHTML = mediaHtml + bodyHtml;

    // Check if image is already cached or handle fallback
    var stageEl = card.querySelector('.product-thumb-stage');
    var imgEl = card.querySelector('.product-pdf-thumb-img');
    if (imgEl) {
      if (imgEl.complete && imgEl.naturalWidth > 0) {
        var skel = card.querySelector('.product-thumb-skeleton');
        if (skel) skel.classList.add('loaded');
      }
      imgEl.addEventListener('error', function () {
        renderPdfPage1Thumbnail(prod, stageEl);
      });
    }

    // Catalogue button click opens catalogue directly on website
    var catBtn = card.querySelector('.product-action-link');
    if (catBtn) {
      catBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (tracker.trackProductPdfOpen) {
          tracker.trackProductPdfOpen(prod.category, prod.name, 1);
        }
        openPdfViewer(prod, 1, true);
      });
    }

    // Direct WhatsApp fast response click (prevents card click from triggering PDF modal)
    var waBtn = card.querySelector('.product-whatsapp-btn');
    if (waBtn) {
      waBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (tracker.trackProductQuoteClick) {
          tracker.trackProductQuoteClick(prod.category, prod.name, 'whatsapp-direct');
        }
      });
    }

    // Card click opens internal PDF viewer smoothly on the website only
    card.addEventListener('click', function (e) {
      if (e.target.closest('.product-whatsapp-btn')) {
        return;
      }
      if (tracker.trackProductCardClick) {
        tracker.trackProductCardClick(prod.category, prod.name, prod.pdfFileName);
      }
      openPdfViewer(prod, 1, true);
    });

    // Keyboard enter / space trigger
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });

    return card;
  }

  /* ==========================================================================
     3. Catalogue Categories, Search & Live Filter
     ========================================================================== */
  var productGrid = document.getElementById('productGridContainer');
  var tabButtons = document.querySelectorAll('.tab-btn');
  var searchInput = document.getElementById('catalogueSearchInput');
  var searchClearBtn = document.getElementById('catalogueSearchClearBtn');
  var resultsCountEl = document.getElementById('catalogueResultsCount');
  var catalogueBottomQuoteBtn = document.getElementById('catalogueBottomQuoteBtn');
  var currentCategory = 'all';

  // Synchronize category tab counts dynamically from products data
  tabButtons.forEach(function (btn) {
    var cat = btn.getAttribute('data-category');
    var badge = btn.querySelector('.tab-badge');
    if (badge) {
      if (cat === 'all') {
        badge.textContent = products.length;
      } else {
        var count = products.filter(function (p) { return p.category === cat; }).length;
        badge.textContent = count;
      }
    }
  });

  function renderCatalogue(category, searchFilter) {
    if (!productGrid) return;
    productGrid.innerHTML = '';

    var filtered = products;

    if (category && category !== 'all') {
      filtered = filtered.filter(function (p) { return p.category === category; });
    }

    if (searchFilter && searchFilter.trim().length > 0) {
      var q = searchFilter.trim().toLowerCase();
      filtered = filtered.filter(function (p) {
        return p.name.toLowerCase().indexOf(q) !== -1 ||
               p.categoryLabel.toLowerCase().indexOf(q) !== -1 ||
               p.slug.toLowerCase().indexOf(q) !== -1 ||
               (p.summary && p.summary.toLowerCase().indexOf(q) !== -1);
      });
    }

    // Update results counter
    if (resultsCountEl) {
      resultsCountEl.textContent = 'Showing ' + filtered.length + ' of ' + products.length + ' models';
    }

    if (searchClearBtn && searchInput) {
      searchClearBtn.style.display = searchInput.value.trim().length > 0 ? 'inline-flex' : 'none';
    }

    if (filtered.length === 0) {
      var emptyBox = document.createElement('div');
      emptyBox.className = 'catalogue-empty-state';
      emptyBox.style.gridColumn = '1 / -1';
      emptyBox.style.textAlign = 'center';
      emptyBox.style.padding = '64px 24px';
      emptyBox.innerHTML =
        '<div style="width:56px; height:56px; border-radius:50%; background:var(--brand-blue-soft); display:flex; align-items:center; justify-content:center; margin:0 auto 16px; color:var(--brand-blue);">' +
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
        '</div>' +
        '<h3 style="font-size:1.25rem; font-weight:600; margin-bottom:8px; color:var(--text);">No matching Williams models found</h3>' +
        '<p style="font-size:0.9375rem; color:var(--text-muted); max-width:460px; margin:0 auto 20px;">We couldn&rsquo;t find equipment matching &ldquo;' + (searchFilter || '') + '&rdquo;. Try clearing your search keyword or browse all ' + products.length + ' models.</p>' +
        '<button type="button" class="btn btn-outline btn-sm" id="emptyResetFilterBtn">Reset All Filters</button>';
      productGrid.appendChild(emptyBox);

      var resetBtn = document.getElementById('emptyResetFilterBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', function () {
          if (searchInput) searchInput.value = '';
          switchCategory('all', true);
        });
      }
      return;
    }

    filtered.forEach(function (prod) {
      productGrid.appendChild(createProductCard(prod));
    });
  }

  // Set active tab visually
  function setActiveTabVisual(category) {
    currentCategory = category;
    tabButtons.forEach(function (btn) {
      var isTarget = btn.getAttribute('data-category') === category;
      btn.classList.toggle('active', isTarget);
      btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });
  }

  // Switch category programmatically
  function switchCategory(category, pushHistory) {
    setActiveTabVisual(category);
    var q = searchInput ? searchInput.value : '';
    renderCatalogue(category, q);

    if (pushHistory !== false) {
      var targetHash = (category === 'all') ? '#catalogue-section' : '#category=' + category;
      if (window.location.hash !== targetHash) {
        history.pushState({ category: category }, '', targetHash);
      }
    }

    if (tracker.trackCategoryOpen) {
      var catObj = categories.find(function (c) { return c.slug === category; });
      var catName = catObj ? catObj.name : 'All Equipment';
      tracker.trackCategoryOpen(category, catName);
    }
  }

  // Tab button click listeners
  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var cat = this.getAttribute('data-category');
      switchCategory(cat, true);
    });
  });

  // Search input live filtering
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      renderCatalogue(currentCategory, this.value);
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', function () {
      if (searchInput) {
        searchInput.value = '';
        renderCatalogue(currentCategory, '');
        searchInput.focus();
      }
    });
  }

  // Catalogue bottom CTA
  if (catalogueBottomQuoteBtn) {
    catalogueBottomQuoteBtn.addEventListener('click', function () {
      if (tracker.trackProductQuoteClick) {
        tracker.trackProductQuoteClick(currentCategory, 'Catalogue Bottom Quote', 'whatsapp-bottom');
      }
    });
  }

  /* ==========================================================================
     4. Clean & Normal In-Site PDF Document Viewer
     ========================================================================== */
  var pdfViewer = document.getElementById('internalPdfViewer');
  var pdfScrollViewport = document.getElementById('pdfDocumentScrollViewport');
  var pdfDocumentContainer = document.getElementById('pdfDocumentContainer');
  var pdfLoadingOverlay = document.getElementById('pdfLoadingOverlay');

  var pdfCloseBtn = document.getElementById('pdfCloseBtn');
  var pdfBackBtn = document.getElementById('pdfBackToCategoryBtn');
  var pdfBackText = document.getElementById('pdfBackBtnText');
  var pdfProductTitle = document.getElementById('pdfViewerProductTitle');
  var pdfCategoryLabel = document.getElementById('pdfViewerCategoryLabel');
  var pdfDocBadge = document.getElementById('pdfViewerDocBadge');
  var pdfShareLinkBtn = document.getElementById('pdfShareLinkBtn');
  var pdfRequestQuoteBtn = document.getElementById('pdfRequestQuoteBtn');
  var pdfDriveBtn = document.getElementById('pdfDriveBtn');
  var pdfGdriveFrame = document.getElementById('pdfGdriveFrame');

  var pdfCurrentPageNum = document.getElementById('pdfCurrentPageNum');
  var pdfTotalPages = document.getElementById('pdfTotalPages');
  var pdfFloatingPagePill = document.getElementById('pdfFloatingPagePill');

  var activePdfDoc = null;
  var activeProduct = null;
  var currentPage = 1;
  var totalPages = 1;
  var previousScrollPos = 0;
  var activeRenderTasks = [];
  var isScrollingFromJump = false;

  function cancelAllActiveRenders() {
    activeRenderTasks.forEach(function (task) {
      try { task.cancel(); } catch (e) {}
    });
    activeRenderTasks = [];
  }

  function openPdfViewer(prod, targetPageNum, pushHistory) {
    if (!pdfViewer || !pdfDocumentContainer) return;

    cancelAllActiveRenders();
    activeProduct = prod;
    totalPages = prod.pageCount || 8;
    currentPage = targetPageNum ? Math.max(1, Math.min(totalPages, targetPageNum)) : 1;
    previousScrollPos = window.scrollY;

    // Smoothly activate viewer modal without loading block
    pdfViewer.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (pdfProductTitle) pdfProductTitle.textContent = prod.name;
    if (pdfCategoryLabel) pdfCategoryLabel.textContent = prod.categoryLabel;
    if (pdfBackText) pdfBackText.textContent = 'Back to ' + prod.categoryLabel;
    if (pdfDocBadge) pdfDocBadge.textContent = totalPages + ' Pages';

    // Dynamically wire WhatsApp button in PDF viewer with active product name
    if (pdfRequestQuoteBtn) {
      var waDocMsg = encodeURIComponent('Hello Williams Refrigeration, I would like to request pricing and specifications for ' + prod.name + ' (' + prod.categoryLabel + '). Please share details.');
      pdfRequestQuoteBtn.href = 'https://wa.me/919844013768?text=' + waDocMsg;
    }

    // Wire Google Drive download/view button
    if (pdfDriveBtn) {
      pdfDriveBtn.href = prod.driveUrl || (prod.driveId ? ('https://drive.google.com/file/d/' + prod.driveId + '/view?usp=drive_link') : '#');
    }

    if (pdfCurrentPageNum) pdfCurrentPageNum.textContent = currentPage;
    if (pdfTotalPages) pdfTotalPages.textContent = totalPages;

    if (pushHistory !== false) {
      updatePdfViewerHash();
    }

    // Direct in-site Google Drive brochure frame — shows smoothly on website without blocking loading overlay
    if (prod.driveId && pdfGdriveFrame) {
      var previewUrl = prod.drivePreviewUrl || ('https://drive.google.com/file/d/' + prod.driveId + '/preview');
      if (pdfGdriveFrame.src !== previewUrl) {
        pdfGdriveFrame.src = previewUrl;
      }
      if (pdfLoadingOverlay) {
        pdfLoadingOverlay.style.display = 'none';
      }
      if (pdfDocumentContainer) pdfDocumentContainer.style.display = 'none';
      if (pdfFloatingPagePill) pdfFloatingPagePill.style.display = 'none';
    } else {
      // Local fallback using PDF.js continuous stream
      if (pdfDocumentContainer) pdfDocumentContainer.style.display = '';
      if (pdfFloatingPagePill) pdfFloatingPagePill.style.display = '';
      pdfDocumentContainer.innerHTML = '';

      for (var p = 1; p <= totalPages; p++) {
        var pageItem = document.createElement('div');
        pageItem.className = 'pdf-page-item';
        pageItem.id = 'pdfPageItem-' + p;
        pageItem.setAttribute('data-page', p);

        var meta = document.createElement('div');
        meta.className = 'pdf-page-header-meta';
        meta.innerHTML = '<span class="pdf-page-num-label">Page ' + p + ' of ' + totalPages + '</span>';

        var wrapper = document.createElement('div');
        wrapper.className = 'pdf-page-canvas-wrapper';
        wrapper.id = 'pdfCanvasWrapper-' + p;

        var canvas = document.createElement('canvas');
        canvas.className = 'pdf-page-canvas';
        canvas.id = 'pdfCanvasPage-' + p;

        var skeleton = document.createElement('div');
        skeleton.className = 'pdf-page-skeleton';
        skeleton.id = 'pdfSkeleton-' + p;
        skeleton.innerHTML = '<div class="pdf-spinner" style="width:28px; height:28px; border-width:2px;"></div><span>Rendering Page ' + p + '...</span>';

        if (p === 1 && prod.image) {
          var coverImg = document.createElement('img');
          coverImg.className = 'pdf-page-cover-img';
          coverImg.id = 'pdfCoverImg-1';
          coverImg.alt = prod.name + ' specification page 1';
          coverImg.src = prod.image;
          wrapper.appendChild(coverImg);
          skeleton.classList.add('hidden');
        }

        wrapper.appendChild(canvas);
        wrapper.appendChild(skeleton);

        pageItem.appendChild(meta);
        pageItem.appendChild(wrapper);
        pdfDocumentContainer.appendChild(pageItem);
      }

      loadPdfDoc(prod).then(function (pdfDoc) {
        activePdfDoc = pdfDoc;
        if (pdfDoc.numPages && pdfDoc.numPages !== totalPages) {
          totalPages = pdfDoc.numPages;
          if (pdfTotalPages) pdfTotalPages.textContent = totalPages;
          if (pdfDocBadge) pdfDocBadge.textContent = totalPages + ' Pages';
        }
        renderAllDocumentPages(pdfDoc);
      })['catch'](function (err) {
        console.warn('PDF document load note:', err);
      });
    }
  }

  function renderAllDocumentPages(pdfDoc) {
    if (!pdfDoc) return;
    var numPages = pdfDoc.numPages;

    function renderPageSeq(pageIndex) {
      if (pageIndex > numPages || !activeProduct) return;

      var canvas = document.getElementById('pdfCanvasPage-' + pageIndex);
      var skeleton = document.getElementById('pdfSkeleton-' + pageIndex);
      var coverImg = document.getElementById('pdfCoverImg-' + pageIndex);

      if (!canvas) {
        renderPageSeq(pageIndex + 1);
        return;
      }

      pdfDoc.getPage(pageIndex).then(function (page) {
        var viewport = page.getViewport({ scale: 1.5 });
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        var ctx = canvas.getContext('2d');
        var renderTask = page.render({
          canvasContext: ctx,
          viewport: viewport
        });

        activeRenderTasks.push(renderTask);

        return renderTask.promise;
      }).then(function () {
        if (skeleton) skeleton.classList.add('hidden');
        if (coverImg) coverImg.style.display = 'none';
        renderPageSeq(pageIndex + 1);
      })['catch'](function (err) {
        if (err && err.name === 'RenderingCancelledException') return;
        if (skeleton) skeleton.classList.add('hidden');
        renderPageSeq(pageIndex + 1);
      });
    }

    renderPageSeq(1);
  }

  function scrollToPage(pageNum, smooth) {
    if (!pdfScrollViewport) return;
    var targetEl = document.getElementById('pdfPageItem-' + pageNum);
    if (targetEl) {
      isScrollingFromJump = true;
      targetEl.scrollIntoView({ behavior: smooth !== false ? 'smooth' : 'auto', block: 'start' });
      setTimeout(function () {
        isScrollingFromJump = false;
      }, 500);
    }
  }

  // Track active page as customer scrolls naturally through document
  if (pdfScrollViewport) {
    var scrollThrottleTimer = null;
    pdfScrollViewport.addEventListener('scroll', function () {
      if (isScrollingFromJump || !activeProduct) return;
      if (scrollThrottleTimer) return;

      scrollThrottleTimer = setTimeout(function () {
        scrollThrottleTimer = null;
        var viewportRect = pdfScrollViewport.getBoundingClientRect();
        var midY = viewportRect.top + viewportRect.height * 0.35;

        var pageItems = pdfDocumentContainer.querySelectorAll('.pdf-page-item');
        var currentVisiblePage = 1;

        for (var i = 0; i < pageItems.length; i++) {
          var item = pageItems[i];
          var rect = item.getBoundingClientRect();
          if (rect.top <= midY && rect.bottom >= midY) {
            currentVisiblePage = parseInt(item.getAttribute('data-page'), 10);
            break;
          }
        }

        if (currentVisiblePage !== currentPage) {
          currentPage = currentVisiblePage;
          if (pdfCurrentPageNum) pdfCurrentPageNum.textContent = currentPage;
          updatePdfViewerHash();
        }
      }, 80);
    }, { passive: true });
  }

  function updatePdfViewerHash() {
    if (!activeProduct) return;
    var newHash = '#category=' + activeProduct.category + '&product=' + activeProduct.slug + '&page=' + currentPage;
    try {
      history.replaceState({ type: 'pdf', product: activeProduct.slug, category: activeProduct.category, page: currentPage }, '', newHash);
    } catch (e) {}
  }

  function closePdfViewer() {
    if (!pdfViewer) return;
    pdfViewer.classList.remove('active');
    document.body.style.overflow = '';
    cancelAllActiveRenders();

    if (pdfGdriveFrame) {
      pdfGdriveFrame.src = 'about:blank';
    }
    if (pdfLoadingOverlay) {
      pdfLoadingOverlay.style.display = 'none';
      pdfLoadingOverlay.style.opacity = '1';
    }

    var closedProd = activeProduct;
    activePdfDoc = null;
    activeProduct = null;

    if (closedProd && window.location.hash.indexOf('product=') !== -1) {
      history.replaceState({ category: closedProd.category }, '', '#category=' + closedProd.category);
    }

    window.scrollTo({
      top: previousScrollPos,
      behavior: 'instant'
    });
  }

  if (pdfCloseBtn) pdfCloseBtn.addEventListener('click', closePdfViewer);
  if (pdfBackBtn) pdfBackBtn.addEventListener('click', closePdfViewer);

  // Keyboard Escape to close
  document.addEventListener('keydown', function (e) {
    if (!pdfViewer || !pdfViewer.classList.contains('active')) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closePdfViewer();
    }
  });

  // Top nav bar WhatsApp direct CTA
  var navWhatsappBtn = document.getElementById('navWhatsappBtn');
  if (navWhatsappBtn) {
    navWhatsappBtn.addEventListener('click', function () {
      if (tracker.trackHeroConsultation) {
        tracker.trackHeroConsultation();
      }
    });
  }

  /* Share Catalogue Deep Web Link (Replaces Direct Downloads) */
  var shareToast = document.getElementById('shareToast');
  var shareToastMsg = document.getElementById('shareToastMsg');
  var shareToastTimer = null;

  function showShareToast(msg) {
    if (!shareToast) return;
    if (shareToastMsg && msg) shareToastMsg.textContent = msg;
    shareToast.classList.add('show');
    clearTimeout(shareToastTimer);
    shareToastTimer = setTimeout(function () {
      shareToast.classList.remove('show');
    }, 3500);
  }

  function flashShareButtonState() {
    var shareBtnText = document.getElementById('pdfShareBtnText');
    var origText = shareBtnText ? shareBtnText.textContent : 'Share Link';
    if (shareBtnText) shareBtnText.textContent = '✓ Copied!';

    var tbLabel = document.querySelector('.pdf-toolbar-share-label');
    var origTb = tbLabel ? tbLabel.textContent : 'Share Link';
    if (tbLabel) tbLabel.textContent = '✓ Copied!';

    setTimeout(function () {
      if (shareBtnText) shareBtnText.textContent = origText;
      if (tbLabel) tbLabel.textContent = origTb;
    }, 2200);
  }

  function shareCurrentProductLink() {
    if (!activeProduct) return;
    var base = window.location.href.split('#')[0];
    var shareUrl = base + '#category=' + activeProduct.category + '&product=' + activeProduct.slug + '&page=' + currentPage;
    var shareTitle = 'Williams ' + activeProduct.name + ' Specification (Page ' + currentPage + ' of ' + totalPages + ')';
    var shareText = 'Explore the official specification catalogue for ' + activeProduct.name + ' (Page ' + currentPage + ' of ' + totalPages + ') on Williams Refrigeration India.';

    function onSharedSuccess() {
      showShareToast('Specification link copied to clipboard! Anyone with this link can view this document.');
      flashShareButtonState();
    }

    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl
      }).then(function () {
        showShareToast('Specification link shared successfully!');
        flashShareButtonState();
      })['catch'](function () {
        copyUrlToClipboard(shareUrl, onSharedSuccess);
      });
    } else {
      copyUrlToClipboard(shareUrl, onSharedSuccess);
    }
  }

  function copyUrlToClipboard(url, callback) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () {
        if (callback) callback();
      })['catch'](function () {
        fallbackCopyText(url, callback);
      });
    } else {
      fallbackCopyText(url, callback);
    }
  }

  function fallbackCopyText(text, callback) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      if (callback) callback();
    } catch (e) {
      showShareToast('Specification link: ' + text);
    }
    document.body.removeChild(ta);
  }

  if (pdfShareLinkBtn) {
    pdfShareLinkBtn.addEventListener('click', shareCurrentProductLink);
  }

  var pdfToolbarShareBtn = document.getElementById('pdfToolbarShareBtn');
  if (pdfToolbarShareBtn) {
    pdfToolbarShareBtn.addEventListener('click', shareCurrentProductLink);
  }

  var pdfFallbackShareBtn = document.getElementById('pdfFallbackShareBtn');
  if (pdfFallbackShareBtn) {
    pdfFallbackShareBtn.addEventListener('click', shareCurrentProductLink);
  }

  if (pdfRequestQuoteBtn) {
    pdfRequestQuoteBtn.addEventListener('click', function () {
      var prod = activeProduct;
      if (prod && tracker.trackProductQuoteClick) {
        tracker.trackProductQuoteClick(prod.category, prod.name, 'whatsapp-pdf-header');
      }
    });
  }



  /* ==========================================================================
     5. Browser PopState State Restoration
     ========================================================================== */
  window.addEventListener('popstate', function () {
    if (pdfViewer && pdfViewer.classList.contains('active')) {
      closePdfViewer();
      return;
    }

    var quoteModal = document.getElementById('quoteModal');
    if (quoteModal && quoteModal.classList.contains('active')) {
      closeQuoteModal();
      return;
    }

    var hash = window.location.hash;
    if (hash && hash.indexOf('category=') !== -1) {
      var catMatch = hash.match(/category=([a-z0-9-]+)/);
      if (catMatch && catMatch[1]) {
        var cat = catMatch[1];
        if (cat !== currentCategory) {
          switchCategory(cat, false);
        }
      }
    } else {
      if (currentCategory !== 'all') {
        switchCategory('all', false);
      }
    }
  });

  // Initialize initial hash route if visitor arrived via deep link
  function handleInitialHash() {
    var hash = window.location.hash;
    if (!hash) {
      renderCatalogue('all', '');
      return;
    }

    if (hash.indexOf('category=') !== -1) {
      var catMatch = hash.match(/category=([a-z0-9-]+)/);
      var prodMatch = hash.match(/product=([a-z0-9-]+)/);
      var pageMatch = hash.match(/page=(\d+)/);

      var cat = catMatch ? catMatch[1] : 'all';
      setActiveTabVisual(cat);
      renderCatalogue(cat, '');

      if (prodMatch && prodMatch[1]) {
        var targetSlug = prodMatch[1];
        var found = products.find(function (p) { return p.slug === targetSlug; });
        if (found) {
          var pNum = pageMatch ? parseInt(pageMatch[1], 10) : 1;
          setTimeout(function () {
            openPdfViewer(found, pNum, false);
          }, 200);
        }
      }
    } else {
      renderCatalogue('all', '');
    }
  }

  handleInitialHash();

  /* ==========================================================================
     6. Consultation & Quote Modal Dialog Controller
     ========================================================================== */
  var quoteModal = document.getElementById('quoteModal');
  var quoteModalCloseBtn = document.getElementById('quoteModalCloseBtn');
  var quoteModalForm = document.getElementById('williamsQuoteModalForm');
  var modalCategorySelect = document.getElementById('modalCategorySelect');
  var modalProjectNotes = document.getElementById('modalProjectNotes');
  var modalSuccessBox = document.getElementById('modalSuccessBox');
  var modalSuccessCloseBtn = document.getElementById('modalSuccessCloseBtn');
  var modalQuoteSubmitBtn = document.getElementById('modalQuoteSubmitBtn');
  var confirmedClientName = document.getElementById('confirmedClientName');

  function openQuoteModal(category, productName) {
    if (!quoteModal) return;

    if (modalCategorySelect && category) {
      modalCategorySelect.value = category;
    }
    if (modalProjectNotes && productName) {
      modalProjectNotes.value = 'Enquiry for: ' + productName + '\n';
    }

    if (quoteModalForm) quoteModalForm.style.display = 'block';
    if (modalSuccessBox) modalSuccessBox.style.display = 'none';

    quoteModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    var firstInput = document.getElementById('modalFullName');
    if (firstInput) {
      setTimeout(function () { firstInput.focus(); }, 150);
    }
  }

  function closeQuoteModal() {
    if (!quoteModal) return;
    quoteModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (quoteModalCloseBtn) quoteModalCloseBtn.addEventListener('click', closeQuoteModal);
  if (modalSuccessCloseBtn) modalSuccessCloseBtn.addEventListener('click', closeQuoteModal);

  if (quoteModal) {
    quoteModal.addEventListener('click', function (e) {
      if (e.target === quoteModal) closeQuoteModal();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && quoteModal && quoteModal.classList.contains('active')) {
      closeQuoteModal();
    }
  });

  // Quotation form submission with local lead persistence
  if (quoteModalForm) {
    quoteModalForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var fullNameEl = document.getElementById('modalFullName');
      var companyEl = document.getElementById('modalCompanyName');
      var phoneEl = document.getElementById('modalPhone');
      var emailEl = document.getElementById('modalEmail');
      var cityEl = document.getElementById('modalCity');
      var businessTypeEl = document.getElementById('modalBusinessType');

      var fullName = fullNameEl ? fullNameEl.value.trim() : '';
      var company = companyEl ? companyEl.value.trim() : '';
      var phone = phoneEl ? phoneEl.value.trim() : '';
      var email = emailEl ? emailEl.value.trim() : '';
      var city = cityEl ? cityEl.value.trim() : '';
      var businessType = businessTypeEl ? businessTypeEl.value : 'Commercial Kitchen';
      var category = modalCategorySelect ? modalCategorySelect.value : (currentCategory || 'all');
      var notes = modalProjectNotes ? modalProjectNotes.value.trim() : '';

      if (!fullName || !phone || !city) {
        alert('Please fill in your name, phone number, and city.');
        return;
      }

      if (modalQuoteSubmitBtn) {
        modalQuoteSubmitBtn.disabled = true;
        modalQuoteSubmitBtn.textContent = 'Submitting enquiry to Bangalore desk...';
      }

      setTimeout(function () {
        if (modalQuoteSubmitBtn) {
          modalQuoteSubmitBtn.disabled = false;
          modalQuoteSubmitBtn.textContent = 'Submit Request for Quote \u2192';
        }
        quoteModalForm.style.display = 'none';

        if (confirmedClientName) confirmedClientName.textContent = fullName;
        if (modalSuccessBox) modalSuccessBox.style.display = 'block';

        // Local enquiry storage
        try {
          var enquiries = JSON.parse(localStorage.getItem('williams_quote_enquiries') || '[]');
          enquiries.push({
            date: new Date().toISOString(),
            fullName: fullName,
            company: company,
            phone: phone,
            email: email,
            city: city,
            businessType: businessType,
            category: category,
            notes: notes
          });
          localStorage.setItem('williams_quote_enquiries', JSON.stringify(enquiries));
        } catch (storageErr) {}

        if (tracker.trackConsultationSubmit) {
          tracker.trackConsultationSubmit(category, notes || 'Product Enquiry', {
            full_name: fullName,
            company: company,
            phone: phone,
            email: email,
            city: city,
            business_type: businessType
          });
        }
      }, 500);
    });
  }

  /* ==========================================================================
     7. Customer Experience Reels — Full-Width 9:16 Rotating Showcase Controller
     ========================================================================== */
  var reelsTrack = document.getElementById('reelsTrack');
  var reelSlides = document.querySelectorAll('.reel-slide');
  var reelDots = document.querySelectorAll('.reel-dot');
  var reelsNavPrev = document.getElementById('reelsNavPrev');
  var reelsNavNext = document.getElementById('reelsNavNext');
  var globalAudioToggle = document.getElementById('reelsGlobalAudioToggle');
  var reelsAudioLabel = document.getElementById('reelsAudioLabel');
  var reelsAudioIcon = document.getElementById('reelsAudioIcon');
  var reelsSection = document.getElementById('reviews-section');
  var stageContainer = document.getElementById('reelsStageContainer');

  var currentReelIndex = 0;
  var totalReels = reelSlides.length; // 5 reels
  var isAudioMuted = true; // All testimonial videos muted by default per requirements
  var sectionInViewport = false;
  var isReelHovered = false;

  // Auto-advance animation settings
  var REEL_AUTO_INTERVAL = 6000; // 6 seconds per reel
  var reelProgressTimer = null;
  var reelProgressStartTime = 0;
  var prevSlideDiffs = {};

  function updateGlobalAudioUI() {
    if (!globalAudioToggle) return;
    if (isAudioMuted) {
      globalAudioToggle.classList.remove('sound-active');
      if (reelsAudioLabel) reelsAudioLabel.textContent = 'Enable Sound';
      if (reelsAudioIcon) {
        reelsAudioIcon.innerHTML =
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';
      }
    } else {
      globalAudioToggle.classList.add('sound-active');
      if (reelsAudioLabel) reelsAudioLabel.textContent = 'Mute Sound';
      if (reelsAudioIcon) {
        reelsAudioIcon.innerHTML =
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
      }
    }
  }

  function updateCarouselStagePosition() {
    if (!reelsTrack || totalReels === 0) return;

    var windowWidth = window.innerWidth;
    var isMobile = windowWidth < 768;
    var isSmall = windowWidth < 480;

    // Side-to-side horizontal step offsets calibrated for 3D stage
    var step1 = isSmall ? 180 : (isMobile ? 240 : 330);
    var step2 = isSmall ? 320 : (isMobile ? 420 : 590);

    reelSlides.forEach(function (slide, idx) {
      // Calculate relative circular offset: -2, -1, 0, 1, 2
      var diff = (idx - currentReelIndex + totalReels) % totalReels;
      if (diff > totalReels / 2) {
        diff -= totalReels; // e.g. 3 -> -2, 4 -> -1
      }

      var xOffset = 0;
      var scale = 1;
      var rotateY = 0;
      var opacity = 1;
      var zIndex = 1;
      var isActive = (diff === 0);

      if (diff === 0) {
        // Center Active Playing Reel
        xOffset = 0;
        scale = 1.05;
        rotateY = 0;
        opacity = 1;
        zIndex = 10;
      } else if (diff === 1) {
        // Immediate Right Card
        xOffset = step1;
        scale = 0.86;
        rotateY = -12;
        opacity = 0.65;
        zIndex = 6;
      } else if (diff === -1) {
        // Immediate Left Card
        xOffset = -step1;
        scale = 0.86;
        rotateY = 12;
        opacity = 0.65;
        zIndex = 6;
      } else if (diff === 2) {
        // Far Right Card
        xOffset = step2;
        scale = 0.72;
        rotateY = -20;
        opacity = 0.32;
        zIndex = 3;
      } else if (diff === -2) {
        // Far Left Card
        xOffset = -step2;
        scale = 0.72;
        rotateY = 20;
        opacity = 0.32;
        zIndex = 3;
      }

      // Check if this slide is wrapping across the circular boundary (-2 <-> +2)
      var prevDiff = prevSlideDiffs[idx];
      var isWrapping = prevDiff !== undefined && Math.abs(prevDiff - diff) > 2;
      prevSlideDiffs[idx] = diff;

      // Ensure no blur filter is applied to any slide so brand logo and name remain 100% crisp
      slide.style.filter = 'none';

      var transformStr = isActive
        ? 'translate3d(0, 0, 0) scale(' + scale + ')'
        : 'translate3d(' + Math.round(xOffset) + 'px, 0, -30px) scale(' + scale + ') rotateY(' + rotateY + 'deg)';

      if (isWrapping) {
        // Suppress transition while card teleports to opposite end to prevent flying across center
        slide.style.transition = 'none';
        slide.style.opacity = '0';
        slide.style.transform = transformStr;
        slide.style.zIndex = zIndex;
        // Re-enable smooth transitions on next frame
        setTimeout(function () {
          slide.style.transition = '';
          slide.style.opacity = opacity;
        }, 30);
      } else {
        slide.style.transform = transformStr;
        slide.style.opacity = opacity;
        slide.style.zIndex = zIndex;
      }

      slide.classList.toggle('active', isActive);
      slide.setAttribute('aria-current', isActive ? 'true' : 'false');
    });

    reelDots.forEach(function (dot, idx) {
      var isActive = (idx === currentReelIndex);
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  function setProgressBars(percent) {
    var p = Math.max(0, Math.min(100, percent));
    reelSlides.forEach(function (slide, idx) {
      var bar = slide.querySelector('.reel-progress-bar');
      if (bar) {
        bar.style.width = (idx === currentReelIndex) ? p + '%' : '0%';
      }
    });

    reelDots.forEach(function (dot, idx) {
      var fill = dot.querySelector('.reel-dot-fill');
      if (fill) {
        fill.style.width = (idx === currentReelIndex) ? p + '%' : '0%';
      }
    });
  }

  function startReelAutoTimer() {
    stopReelAutoTimer();
    if (!sectionInViewport) return;

    reelProgressStartTime = Date.now();

    reelProgressTimer = setInterval(function () {
      if (!sectionInViewport || isReelHovered || !isAudioMuted) {
        return; // Paused while hovered, out of viewport, or customer listening with sound
      }

      var elapsed = Date.now() - reelProgressStartTime;
      var percent = (elapsed / REEL_AUTO_INTERVAL) * 100;
      setProgressBars(percent);

      if (elapsed >= REEL_AUTO_INTERVAL) {
        stopReelAutoTimer();
        goToReel((currentReelIndex + 1) % totalReels);
      }
    }, 50);
  }

  function stopReelAutoTimer() {
    if (reelProgressTimer) {
      clearInterval(reelProgressTimer);
      reelProgressTimer = null;
    }
  }

  function sendYtMessage(iframe, func, args) {
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func: func,
          args: args || []
        }), '*');
      } catch (e) {}
    }
  }

  function playActiveVideo() {
    var activeSlide = reelSlides[currentReelIndex];
    if (!activeSlide) return;

    var ytId = activeSlide.getAttribute('data-yt-id');
    var mediaStage = activeSlide.querySelector('.reel-media-stage');
    if (!mediaStage || !ytId) return;

    var existingIframe = mediaStage.querySelector('.reel-yt-iframe');
    if (!existingIframe) {
      // Clean up any other iframes so only the active card plays
      reelSlides.forEach(function (slide, idx) {
        if (idx !== currentReelIndex) {
          var otherIframe = slide.querySelector('.reel-yt-iframe');
          if (otherIframe) otherIframe.remove();
        }
      });

      var iframe = document.createElement('iframe');
      iframe.className = 'reel-yt-iframe';
      var muteVal = isAudioMuted ? '1' : '0';
      // Native Video Card Embed: controls=0 (removes play/pause bar), showinfo=0, rel=0, modestbranding=1 (removes YouTube logo), iv_load_policy=3, fs=0, disablekb=1
      iframe.src = 'https://www.youtube.com/embed/' + ytId + '?autoplay=1&mute=' + muteVal + '&loop=1&playlist=' + ytId + '&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&fs=0&disablekb=1&enablejsapi=1';
      iframe.title = (activeSlide.getAttribute('data-brand-name') || 'Customer Testimonial') + ' Video Reel';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = false;
      mediaStage.appendChild(iframe);
    } else {
      if (sectionInViewport) {
        sendYtMessage(existingIframe, 'playVideo');
        if (isAudioMuted) {
          sendYtMessage(existingIframe, 'mute');
        } else {
          sendYtMessage(existingIframe, 'unMute');
        }
      }
    }
  }

  function pauseAllVideos() {
    reelSlides.forEach(function (slide) {
      var iframe = slide.querySelector('.reel-yt-iframe');
      if (iframe) {
        sendYtMessage(iframe, 'pauseVideo');
      }
    });
  }

  function goToReel(index) {
    if (totalReels === 0) return;
    var targetIndex = (index % totalReels + totalReels) % totalReels;

    // Reset progress display
    setProgressBars(0);

    // Remove iframes from inactive slides
    reelSlides.forEach(function (slide, idx) {
      if (idx !== targetIndex) {
        var ifr = slide.querySelector('.reel-yt-iframe');
        if (ifr) ifr.remove();
      }
    });

    currentReelIndex = targetIndex;
    updateCarouselStagePosition();
    playActiveVideo();
    startReelAutoTimer();

    if (tracker.trackReviewVideoPlay) {
      var activeSlide = reelSlides[targetIndex];
      var activeSlug = activeSlide ? activeSlide.getAttribute('data-slug') : '';
      tracker.trackReviewVideoPlay('reel-' + targetIndex, activeSlug);
    }
  }

  // Slide click listeners (clicking an inactive slide brings it to center)
  reelSlides.forEach(function (slide, idx) {
    slide.addEventListener('click', function () {
      if (idx !== currentReelIndex) {
        goToReel(idx);
      }
    });
  });

  // Pause auto-rotation on mouse hover so customer can inspect comfortably
  if (stageContainer) {
    stageContainer.addEventListener('mouseenter', function () {
      isReelHovered = true;
    });

    stageContainer.addEventListener('mouseleave', function () {
      isReelHovered = false;
      reelProgressStartTime = Date.now(); // Restart current slide timer smoothly
    });

    // Touch swipe support for mobile & tablet
    var touchStartX = 0;
    var touchStartY = 0;

    stageContainer.addEventListener('touchstart', function (e) {
      if (e.touches && e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    stageContainer.addEventListener('touchend', function (e) {
      if (e.changedTouches && e.changedTouches.length > 0) {
        var diffX = e.changedTouches[0].clientX - touchStartX;
        var diffY = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
          if (diffX < 0) {
            goToReel(currentReelIndex + 1);
          } else {
            goToReel(currentReelIndex - 1);
          }
        }
      }
    }, { passive: true });

    // Keyboard navigation when user interacts with stage
    stageContainer.setAttribute('tabindex', '0');
    stageContainer.setAttribute('role', 'region');
    stageContainer.setAttribute('aria-label', 'Customer experience video reels carousel');
    stageContainer.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToReel(currentReelIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToReel(currentReelIndex + 1);
      }
    });
  }

  // Global Audio Button listener (only one audio control for entire section)
  if (globalAudioToggle) {
    globalAudioToggle.addEventListener('click', function () {
      isAudioMuted = !isAudioMuted;
      updateGlobalAudioUI();

      var activeSlide = reelSlides[currentReelIndex];
      if (activeSlide) {
        var activeIframe = activeSlide.querySelector('.reel-yt-iframe');
        if (activeIframe) {
          if (!isAudioMuted) {
            sendYtMessage(activeIframe, 'unMute');
            sendYtMessage(activeIframe, 'playVideo');
            stopReelAutoTimer();
            setProgressBars(0);
          } else {
            sendYtMessage(activeIframe, 'mute');
            startReelAutoTimer();
          }
        } else {
          playActiveVideo();
          if (!isAudioMuted) {
            stopReelAutoTimer();
            setProgressBars(0);
          }
        }
      }
    });
  }

  // Navigation arrows
  if (reelsNavPrev) {
    reelsNavPrev.addEventListener('click', function () {
      goToReel(currentReelIndex - 1);
    });
  }

  if (reelsNavNext) {
    reelsNavNext.addEventListener('click', function () {
      goToReel(currentReelIndex + 1);
    });
  }

  // Pagination dots
  reelDots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var idx = parseInt(this.getAttribute('data-index'), 10);
      if (!isNaN(idx)) {
        goToReel(idx);
      }
    });
  });

  // Check section viewport intersection to manage video playback & rotation
  function checkReelsViewportState() {
    if (!reelsSection) return;
    var rect = reelsSection.getBoundingClientRect();
    var isInView = rect.top < window.innerHeight && rect.bottom > 0;
    if (isInView !== sectionInViewport) {
      sectionInViewport = isInView;
      if (sectionInViewport) {
        playActiveVideo();
        startReelAutoTimer();
      } else {
        stopReelAutoTimer();
        pauseAllVideos();
      }
    }
  }

  if ('IntersectionObserver' in window && reelsSection) {
    var reelsSectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        sectionInViewport = entry.isIntersecting;
        if (sectionInViewport) {
          playActiveVideo();
          startReelAutoTimer();
        } else {
          stopReelAutoTimer();
          pauseAllVideos();
        }
      });
    }, { threshold: [0, 0.1, 0.25] });
    reelsSectionObserver.observe(reelsSection);
  }

  window.addEventListener('scroll', checkReelsViewportState, { passive: true });

  // Responsive repositioning
  window.addEventListener('resize', function () {
    updateCarouselStagePosition();
  });

  // Initialize
  updateGlobalAudioUI();
  updateCarouselStagePosition();
  checkReelsViewportState();

  // Smooth scroll handler for Customer Videos and Reviews jump links
  document.querySelectorAll('a[href="#reviews-section"], a[href="#reviews"], a[href="#reels"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var target = document.getElementById('reviews-section');
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (history.pushState) {
          history.pushState(null, '', '#reviews-section');
        }
      }
    });
  });

  // Continuous Hero Video Playback: autoplay, continuous loop, and resume on pause
  var heroIframe = document.getElementById('heroYoutubeIframe');
  if (heroIframe) {
    function sendHeroCommand(func, args) {
      if (!heroIframe.contentWindow) return;
      try {
        heroIframe.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func: func,
          args: args || []
        }), '*');
      } catch (err) {}
    }

    function initHeroPlayer() {
      if (!heroIframe.contentWindow) return;
      try {
        heroIframe.contentWindow.postMessage(JSON.stringify({
          event: 'listening'
        }), '*');
        sendHeroCommand('mute');
        sendHeroCommand('playVideo');
      } catch (err) {}
    }

    heroIframe.addEventListener('load', function () {
      initHeroPlayer();
      setTimeout(initHeroPlayer, 500);
      setTimeout(initHeroPlayer, 1500);
    });

    initHeroPlayer();
    setTimeout(initHeroPlayer, 1000);

    // Official YT.Player API integration for seamless looping without pause/previous/next controls
    var heroYTPlayer = null;
    function mountHeroYT() {
      if (window.YT && window.YT.Player && !heroYTPlayer) {
        try {
          heroYTPlayer = new YT.Player('heroYoutubeIframe', {
            events: {
              'onReady': function (e) {
                e.target.mute();
                e.target.playVideo();
              },
              'onStateChange': function (e) {
                if (e.data === 0) {
                  e.target.seekTo(0);
                  e.target.playVideo();
                } else if (e.data === 2) {
                  e.target.playVideo();
                }
              }
            }
          });
        } catch (e) {}
      }
    }

    if (window.YT && window.YT.Player) {
      mountHeroYT();
    } else {
      var prevReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function () {
        if (typeof prevReady === 'function') prevReady();
        mountHeroYT();
      };
    }

    // Proactive loop: restart 0.4s before video reaches the end
    // This prevents YouTube from ever showing pause icons, end cards, or replay buttons!
    setInterval(function () {
      if (heroYTPlayer && typeof heroYTPlayer.getCurrentTime === 'function' && typeof heroYTPlayer.getDuration === 'function') {
        try {
          var dur = heroYTPlayer.getDuration();
          var cur = heroYTPlayer.getCurrentTime();
          if (dur > 0 && cur >= dur - 0.4) {
            heroYTPlayer.seekTo(0);
            heroYTPlayer.playVideo();
          }
          if (typeof heroYTPlayer.getPlayerState === 'function' && heroYTPlayer.getPlayerState() === 2) {
            heroYTPlayer.playVideo();
          }
        } catch (e) {}
      }
    }, 250);

    // Fallback postMessage listener
    window.addEventListener('message', function (e) {
      try {
        var data = JSON.parse(e.data);
        if (data.event === 'onStateChange') {
          if (data.info === 0) {
            sendHeroCommand('seekTo', [0, true]);
            sendHeroCommand('playVideo');
          } else if (data.info === 2) {
            sendHeroCommand('playVideo');
          }
        }
      } catch (err) {}
    });

    // User gesture fallback: ensure autoplay kicks in if initially blocked by browser policy
    var kickstartAutoplay = function () {
      if (heroYTPlayer && typeof heroYTPlayer.playVideo === 'function') {
        try {
          heroYTPlayer.mute();
          heroYTPlayer.playVideo();
        } catch (e) {}
      }
      sendHeroCommand('mute');
      sendHeroCommand('playVideo');
    };
    ['click', 'touchstart', 'scroll'].forEach(function (evt) {
      window.addEventListener(evt, kickstartAutoplay, { once: true, passive: true });
    });
  }

  /* ==========================================================================
     8. Google Reviews, WhatsApp & Direct Contact Analytics
     ========================================================================== */
  var googleReviewsBtn = document.getElementById('googleReviewsBtn');
  if (googleReviewsBtn) {
    googleReviewsBtn.addEventListener('click', function () {
      if (tracker.trackGoogleReviewsClick) {
        tracker.trackGoogleReviewsClick();
      }
    });
  }

  // Track WhatsApp CTA triggers
  document.querySelectorAll('.whatsapp-trigger, .direct-wa-link').forEach(function (el) {
    el.addEventListener('click', function () {
      if (tracker.trackWhatsAppClick) {
        tracker.trackWhatsAppClick('direct_whatsapp');
      }
    });
  });

  // Track Direct Telephone Call triggers
  document.querySelectorAll('a[href^="tel:"]').forEach(function (el) {
    el.addEventListener('click', function () {
      if (tracker.trackPhoneCallClick) {
        tracker.trackPhoneCallClick('telephone_link');
      }
    });
  });
});

/**
 * Williams Refrigeration India — Structured Product Catalogue Data
 * Sourced strictly from verified commercial technical files & cloud brochure assets.
 *
 * 5 Updated Categories:
 * 1. Ice Cream (6 Products: Stella, Sierra ICD, Shea, Shiloh, Smart, Snowgel)
 * 2. Display Cabinet (8 Products: Shannon, Silya, Sherin, Stellina, Stellar, Slavia, StellarSphire, Scenic-Prima)
 * 3. Refrigeration Cabinet (9 Products: Open Deck, Chiller, Blast Freezer, R290 Banquet Trolley Cabinet, R290 Refrigerated Counter, Refrigerated Counter - Regular, Back Bar Cooler, Wine Chiller, Dual Temp Cabinet)
 * 4. Drop In Series (1 Product: Drop-In Series)
 * 5. Confectionery (5 Products: Sibyl, Sierra Pastry, Skyler, Steffania, Sonnet)
 *
 * Total: 29 Verified Commercial Models
 */

window.WILLIAMS_CATEGORIES = [
  {
    id: 'ice-cream',
    slug: 'ice-cream',
    name: 'Ice Cream',
    folderName: 'Ice Cream Display',
    productCount: 6
  },
  {
    id: 'display-cabinets',
    slug: 'display-cabinets',
    name: 'Display Cabinet',
    folderName: 'Display Cabinets',
    productCount: 8
  },
  {
    id: 'refrigeration-cabinat',
    slug: 'refrigeration-cabinat',
    name: 'Refrigeration Cabinet',
    folderName: 'Commercial Refrigerations',
    productCount: 9
  },
  {
    id: 'drop-in-series',
    slug: 'drop-in-series',
    name: 'Drop In Series',
    folderName: 'Drop In',
    productCount: 1
  },
  {
    id: 'confectionery',
    slug: 'confectionery',
    name: 'Confectionery',
    folderName: 'Display Cabinets',
    productCount: 5
  }
];

window.WILLIAMS_PRODUCTS = [
  /* =========================================================================
     CATEGORY 1: ICE CREAM (6 Models)
     ========================================================================= */
  {
    id: 'ice-stella',
    slug: 'stella',
    name: 'Stella',
    category: 'ice-cream',
    categoryLabel: 'Ice Cream',
    pdfFileName: 'Stella.pdf',
    pdfPath: 'assets/View Digital Catalogue/Ice Cream Display/Stella.pdf',
    pdfSizeKB: 893.2,
    badge: 'Hot Selling'
  },
  {
    id: 'ice-sierra-icd',
    slug: 'sierra-icd',
    name: 'Sierra ICD',
    category: 'ice-cream',
    categoryLabel: 'Ice Cream',
    pdfFileName: 'Sierra ICD.pdf',
    pdfPath: 'assets/View Digital Catalogue/Ice Cream Display/Sierra ICD.pdf',
    pdfSizeKB: 33094.6,
    badge: null
  },
  {
    id: 'ice-shea',
    slug: 'shea',
    name: 'Shea',
    category: 'ice-cream',
    categoryLabel: 'Ice Cream',
    pdfFileName: 'Shea.pdf',
    pdfPath: 'assets/View Digital Catalogue/Ice Cream Display/Shea.pdf',
    pdfSizeKB: 875.7,
    badge: null
  },
  {
    id: 'ice-shiloh',
    slug: 'shiloh',
    name: 'Shiloh',
    category: 'ice-cream',
    categoryLabel: 'Ice Cream',
    pdfFileName: 'shiloh.pdf',
    pdfPath: 'assets/View Digital Catalogue/Ice Cream Display/shiloh.pdf',
    pdfSizeKB: 955.9,
    badge: null
  },
  {
    id: 'ice-smart',
    slug: 'smart',
    name: 'Smart',
    category: 'ice-cream',
    categoryLabel: 'Ice Cream',
    pdfFileName: 'Smart.pdf',
    pdfPath: 'assets/View Digital Catalogue/Ice Cream Display/Smart.pdf',
    pdfSizeKB: 785.5,
    badge: 'Best Value'
  },
  {
    id: 'ice-snowgel',
    slug: 'snowgel',
    name: 'Snowgel',
    category: 'ice-cream',
    categoryLabel: 'Ice Cream',
    pdfFileName: 'Snowgel.pdf',
    pdfPath: 'assets/View Digital Catalogue/Ice Cream Display/Snowgel.pdf',
    pdfSizeKB: 1318.7,
    badge: null
  },

  /* =========================================================================
     CATEGORY 2: DISPLAY CABINET (Sweets & Namkeens) (8 Models)
     ========================================================================= */
  {
    id: 'disp-shannon',
    slug: 'shannon',
    name: 'Shannon',
    category: 'display-cabinets',
    categoryLabel: 'Display Cabinet',
    pdfFileName: 'Shannon.pdf',
    pdfPath: 'assets/View Digital Catalogue/Display Cabinets/Shannon.pdf',
    pdfSizeKB: 1476.9,
    badge: null
  },
  {
    id: 'disp-silya',
    slug: 'silya',
    name: 'Silya',
    category: 'display-cabinets',
    categoryLabel: 'Display Cabinet',
    pdfFileName: 'silya.pdf',
    pdfPath: 'assets/View Digital Catalogue/Display Cabinets/silya.pdf',
    pdfSizeKB: 1073.0,
    badge: null
  },
  {
    id: 'disp-sherin',
    slug: 'sherin',
    name: 'Sherin',
    category: 'display-cabinets',
    categoryLabel: 'Display Cabinet',
    pdfFileName: 'Sherin.pdf',
    pdfPath: 'assets/View Digital Catalogue/Display Cabinets/Sherin.pdf',
    pdfSizeKB: 1150.0,
    badge: null
  },
  {
    id: 'disp-stellina',
    slug: 'stellina',
    name: 'Stellina',
    category: 'display-cabinets',
    categoryLabel: 'Display Cabinet',
    pdfFileName: 'Stellina.pdf',
    pdfPath: 'assets/View Digital Catalogue/Display Cabinets/Stellina.pdf',
    pdfSizeKB: 1150.0,
    badge: null
  },
  {
    id: 'disp-stellar',
    slug: 'stellar',
    name: 'Stellar',
    category: 'display-cabinets',
    categoryLabel: 'Display Cabinet',
    pdfFileName: 'stellar.pdf',
    pdfPath: 'assets/View Digital Catalogue/Display Cabinets/stellar.pdf',
    pdfSizeKB: 997.6,
    badge: null
  },
  {
    id: 'disp-slavia',
    slug: 'slavia',
    name: 'Slavia',
    category: 'display-cabinets',
    categoryLabel: 'Display Cabinet',
    pdfFileName: 'Slavia.pdf',
    pdfPath: 'assets/View Digital Catalogue/Display Cabinets/Slavia.pdf',
    pdfSizeKB: 1746.3,
    badge: null
  },
  {
    id: 'disp-stellarsphire',
    slug: 'stellarsphire',
    name: 'StellarSphire',
    category: 'display-cabinets',
    categoryLabel: 'Display Cabinet',
    pdfFileName: 'StellarSphire.pdf',
    pdfPath: 'assets/View Digital Catalogue/Display Cabinets/StellarSphire.pdf',
    pdfSizeKB: 1160.1,
    badge: null
  },
  {
    id: 'disp-scenic-prima',
    slug: 'scenic-prima',
    name: 'Scenic-Prima',
    category: 'display-cabinets',
    categoryLabel: 'Display Cabinet',
    pdfFileName: 'Scenic-Prima.pdf',
    pdfPath: 'assets/View Digital Catalogue/Display Cabinets/Scenic-Prima.pdf',
    pdfSizeKB: 997.5,
    badge: null
  },

  /* =========================================================================
     CATEGORY 3: CONFECTIONERY (Chocolate & Pastries) (5 Models)
     ========================================================================= */
  {
    id: 'conf-sibyl',
    slug: 'sibyl',
    name: 'Sibyl',
    category: 'confectionery',
    categoryLabel: 'Confectionery',
    pdfFileName: 'Sibyl.pdf',
    pdfPath: 'assets/View Digital Catalogue/Display Cabinets/Sibyl.pdf',
    pdfSizeKB: 821.6,
    badge: 'Best Value'
  },
  {
    id: 'conf-sierra-pastry',
    slug: 'sierra-pastry',
    name: 'Sierra Pastry',
    category: 'confectionery',
    categoryLabel: 'Confectionery',
    pdfFileName: 'Sierra Pastry.pdf',
    pdfPath: 'assets/View Digital Catalogue/Display Cabinets/Sierra Pastry.pdf',
    pdfSizeKB: 44004.0,
    badge: null
  },
  {
    id: 'conf-skyler',
    slug: 'skyler',
    name: 'Skyler',
    category: 'confectionery',
    categoryLabel: 'Confectionery',
    pdfFileName: 'Skyler.pdf',
    pdfPath: 'assets/View Digital Catalogue/Display Cabinets/Skyler.pdf',
    pdfSizeKB: 1230.2,
    badge: 'Hot Selling'
  },
  {
    id: 'conf-steffania',
    slug: 'steffania',
    name: 'Steffania',
    category: 'confectionery',
    categoryLabel: 'Confectionery',
    pdfFileName: 'Steffania.pdf',
    pdfPath: 'assets/View Digital Catalogue/Display Cabinets/Steffania.pdf',
    pdfSizeKB: 1219.9,
    badge: null
  },
  {
    id: 'conf-sonnet',
    slug: 'sonnet',
    name: 'Sonnet',
    category: 'confectionery',
    categoryLabel: 'Confectionery',
    pdfFileName: 'Sonnet.pdf',
    pdfPath: 'assets/View Digital Catalogue/Ice Cream Display/Sonnet.pdf',
    pdfSizeKB: 453.9,
    badge: null
  },

  /* =========================================================================
     CATEGORY 4: REFRIGERATION CABINET (9 Models)
     ========================================================================= */
  {
    id: 'refrig-open-deck',
    slug: 'open-deck',
    name: 'Open Deck',
    category: 'refrigeration-cabinat',
    categoryLabel: 'Refrigeration Cabinet',
    pdfFileName: 'Sidney.pdf',
    pdfPath: 'assets/View Digital Catalogue/Display Cabinets/Sidney.pdf',
    pdfSizeKB: 1026.9,
    badge: null
  },
  {
    id: 'refrig-chiller',
    slug: 'chiller',
    name: 'Chiller',
    category: 'refrigeration-cabinat',
    categoryLabel: 'Refrigeration Cabinet',
    pdfFileName: 'Refrigerated Cabinet_Regular.pdf',
    pdfPath: 'assets/View Digital Catalogue/Commercial Refrigerations/Refrigerated Cabinet_Regular.pdf',
    pdfSizeKB: 1145.9,
    badge: null
  },
  {
    id: 'comm-blast-freezer',
    slug: 'blast-freezer',
    name: 'Blast Freezer',
    category: 'refrigeration-cabinat',
    categoryLabel: 'Refrigeration Cabinet',
    pdfFileName: 'Blast Freezer.pdf',
    pdfPath: 'assets/View Digital Catalogue/Commercial Refrigerations/Blast Freezer.pdf',
    pdfSizeKB: 1114.8,
    badge: 'Hot Selling'
  },
  {
    id: 'comm-hot-cold-banquet-trolley',
    slug: 'hot-cold-banquet-trolley-r290',
    name: 'R290 Banquet Trolley Cabinet',
    category: 'refrigeration-cabinat',
    categoryLabel: 'Refrigeration Cabinet',
    pdfFileName: 'Hot & Cold Banquet Trolley R290.pdf',
    pdfPath: 'assets/View Digital Catalogue/Commercial Refrigerations/Hot & Cold Banquet Trolley R290.pdf',
    pdfSizeKB: 1708.7,
    badge: null
  },
  {
    id: 'comm-r290-counter',
    slug: 'r290-refrigerated-counter',
    name: 'R290 Refrigerated Counter',
    category: 'refrigeration-cabinat',
    categoryLabel: 'Refrigeration Cabinet',
    pdfFileName: 'R290 Refrigerated Counter.pdf',
    pdfPath: 'assets/View Digital Catalogue/Commercial Refrigerations/R290 Refrigerated Counter.pdf',
    pdfSizeKB: 522.2,
    badge: null
  },
  {
    id: 'comm-counter-regular',
    slug: 'refrigerated-counter-regular',
    name: 'Refrigerated Counter - Regular',
    category: 'refrigeration-cabinat',
    categoryLabel: 'Refrigeration Cabinet',
    pdfFileName: 'Refrigerated Counter-Regular.pdf',
    pdfPath: 'assets/View Digital Catalogue/Commercial Refrigerations/Refrigerated Counter-Regular.pdf',
    pdfSizeKB: 1407.7,
    badge: 'Best Value'
  },
  {
    id: 'comm-back-bar-cooler',
    slug: 'back-bar-cooler',
    name: 'Back Bar Cooler',
    category: 'refrigeration-cabinat',
    categoryLabel: 'Refrigeration Cabinet',
    pdfFileName: 'Back Bar cooler.pdf',
    pdfPath: 'assets/View Digital Catalogue/Commercial Refrigerations/Back Bar cooler.pdf',
    pdfSizeKB: 1086.1,
    badge: 'Hot Selling'
  },
  {
    id: 'comm-wine-chiller',
    slug: 'wine-chiller',
    name: 'Wine Chiller',
    category: 'refrigeration-cabinat',
    categoryLabel: 'Refrigeration Cabinet',
    pdfFileName: 'wine chiller.pdf',
    pdfPath: 'assets/View Digital Catalogue/Commercial Refrigerations/wine chiller.pdf',
    pdfSizeKB: 562.3,
    badge: null
  },
  {
    id: 'comm-dual',
    slug: 'dual',
    name: 'Dual Temp Cabinet',
    category: 'refrigeration-cabinat',
    categoryLabel: 'Refrigeration Cabinet',
    pdfFileName: 'Dual.pdf',
    pdfPath: 'assets/View Digital Catalogue/Commercial Refrigerations/Dual.pdf',
    pdfSizeKB: 373.1,
    badge: null
  },

  /* =========================================================================
     CATEGORY 5: DROP IN (1 Model)
     ========================================================================= */
  {
    id: 'drop-series',
    slug: 'drop-in-series',
    name: 'Drop-In Series',
    category: 'drop-in-series',
    categoryLabel: 'Drop In Series',
    pdfFileName: 'Dropin_Series_New_1 Draft_1.pdf',
    pdfPath: 'https://drive.google.com/file/d/1sLAUF4wa0qYxs6N5FASjnNYBZECKWtjs/view?usp=sharing',
    pdfSizeKB: 164374.0,
    badge: 'Hot Selling'
  }
];

// Verified high-resolution PDF front-page cover page counts
var WILLIAMS_PAGE_COUNTS = {
  // Ice Cream (6 models)
  'stella': 6,
  'sierra-icd': 6,
  'shea': 6,
  'shiloh': 8,
  'smart': 6,
  'snowgel': 6,

  // Display Cabinet (8 models)
  'shannon': 8,
  'silya': 8,
  'sherin': 8,
  'stellina': 8,
  'stellar': 8,
  'slavia': 8,
  'stellarsphire': 8,
  'scenic-prima': 8,

  // Confectionery (5 models)
  'sibyl': 8,
  'sierra-pastry': 8,
  'skyler': 8,
  'steffania': 8,
  'sonnet': 8,

  // Refrigeration Cabinet (9 models)
  'open-deck': 8,
  'chiller': 12,
  'blast-freezer': 8,
  'hot-cold-banquet-trolley-r290': 10,
  'r290-refrigerated-counter': 12,
  'refrigerated-counter-regular': 12,
  'back-bar-cooler': 8,
  'wine-chiller': 12,
  'dual': 8,

  // Drop In Series (1 model)
  'drop-in-series': 30
};

// Local Multi-Page Brochure Image Directories (8-Page High-Res Streams)
var WILLIAMS_LOCAL_BROCHURES = {
  'sherin': 'assets/brochures/sherin',
  'stellina': 'assets/brochures/stellina'
};

// Verified Cloud Google Drive Brochure Links for Fast Streaming & Direct Downloads
var WILLIAMS_DRIVE_LINKS = {
  // Drop In Series (Official Drive Asset)
  'drop-in-series': '1sLAUF4wa0qYxs6N5FASjnNYBZECKWtjs',

  // Refrigeration Cabinet
  'open-deck': '14iFNiVNVx3xO03xOgvzTytGZ-H4v41YJ',
  'chiller': '1EpCbSNJVEqOS8m3ACKBWh6OsWl8iPtZn',
  'blast-freezer': '11xfPrWGiPUj4lc-2bI-9MC4dEAHX3Qc8',
  'hot-cold-banquet-trolley-r290': '1-uwZ0PJx94IIx3_l8-MIFqZwnfqLJtTr',
  'r290-refrigerated-counter': '1fiyCCTycPCPvAjI6xUlj-IoP8mVU7FK1',
  'refrigerated-counter-regular': '1JJu93GJOJ6m3oSbVIINUNs_IKNYFWRMR',
  'back-bar-cooler': '1wL-hkj62PACfCFF1E4NKAKApwZ1OMjAd',
  'wine-chiller': '1vvVkLG5T2BDNsogN6bFcUwDeYi1zYrGT',
  'dual': '1yJ1bSu7OphcZSWF67q8A7knNiPZPSVX-',

  // Display Cabinet
  'scenic-prima': '1mzfK769iKSNpCm4GePRrSI3duR6NWj8z',
  'shannon': '1tUKPXEKcqpp0flWrPXIpPWyA8Yxhfbkq',
  'silya': '1_fkRZoFsXAIN3CnKZgRwkGtBeLM19258',
  'slavia': '1REpUrmYBfRN2iGFIMlCGox25lA6P9DTM',
  'stellar': '1c_ftgSRdd3PYGoyKcl6PrOEm7jHB-_jF',
  'stellarsphire': '1Wr2S7e6iDFZyoJ_ssLwVw3D6AGaes3dx',

  // Confectionery
  'sibyl': '1BadkRVdlw8fNLeZiNWagW0K_31qonHRv',
  'sierra-pastry': '1pGdkQv5petWijHjDu5RFmlcGR-S8F1YK',
  'skyler': '1JXB1eguAivNwFU_7MvMFjcYYYb8JIO_-',
  'steffania': '1eo_nxe4HaqKimTHKlbelJy1oDCaVpopv',
  'sonnet': '1Nlsl7UZ-foMrSKpvcruuBiXB4fAVfhAc',

  // Ice Cream
  'shea': '1Qyohg_TbgHMW6mrrd0Sq6KCcchn6reYY',
  'shiloh': '10bYtNnimNhNrXbLbUURmhUHTOCZpeHqd',
  'sierra-icd': '1Hw8TIFHq7BTrZweMZA_mjmA39jc7IjHw',
  'smart': '1VfKogWqvWrPuBN-Y__H1NtuexNEjlkQN',
  'snowgel': '1rKmcoWOZuoFc8QDFOvB3v675coDvSCZJ',
  'stella': '1akrjAC-h1vVVdmk_2POZhQ-9mD1zoUsL'
};

if (window.WILLIAMS_PRODUCTS && Array.isArray(window.WILLIAMS_PRODUCTS)) {
  window.WILLIAMS_PRODUCTS.forEach(function (prod) {
    if (!prod.image) {
      prod.image = 'assets/thumbnails/' + prod.slug + '.jpg?v=5';
    }
    prod.pageCount = WILLIAMS_PAGE_COUNTS[prod.slug] || 8;

    if (WILLIAMS_LOCAL_BROCHURES[prod.slug]) {
      prod.localBrochureDir = WILLIAMS_LOCAL_BROCHURES[prod.slug];
    }

    var driveId = WILLIAMS_DRIVE_LINKS[prod.slug];
    if (driveId) {
      prod.driveId = driveId;
      prod.driveUrl = 'https://drive.google.com/file/d/' + driveId + '/view?usp=drive_link';
      prod.drivePreviewUrl = 'https://drive.google.com/file/d/' + driveId + '/preview';
      prod.driveDownloadUrl = 'https://drive.google.com/uc?export=download&id=' + driveId;
    }
  });
}

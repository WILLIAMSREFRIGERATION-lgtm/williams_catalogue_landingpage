# Williams Refrigeration India — B2B Digital Product Catalogue

A visually calm, high-performance digital product catalogue and conversion experience engineered for **Williams Refrigeration India** (Bangalore, Karnataka).

Built around authentic commercial assets, verified engineering specifications, on-demand PDF.js rendering, and restrained B2B aesthetics.

---

## 1. Design System & Aesthetics

* **Primary Brand Blue:** `#5378B3`
* **Dark Brand Navy:** `#18324F` / `#0F1E33`
* **Soft Technical Backgrounds:** `#EEF3FA` / `#F8FAFC`
* **Verified Rating Gold:** `#FBBC05` / `#F4B400`
* **Typography:** `Outfit` (Headings & Identity), `Inter` (Body & Technical Data)
* **Weights:** Enforced medium weights (`500–600`) over excessive bolding for a calm, premium feel.
* **Section Spacing:** Desktop major sections (`112px`, calibrated within `96–140px`), Mobile (`72px`, calibrated within `64–88px`).
* **Accessibility:** WCAG 2.2 AA compliant, visible focus rings (`:focus-visible`), `@media (prefers-reduced-motion)` overrides, and full keyboard navigation.

---

## 2. Core Architecture & Experience Sequence

1. **Top Navigation Bar:** Clean brand header with official Williams logo, catalogue jump link, and instant WhatsApp CTA.
2. **Hero Video Banner (1536×768 / 2:1 Ratio):**
   * High-resolution poster fallback (`assets/images/hero-bg.jpg`).
   * High-contrast dark radial overlay (`rgba(15, 30, 51, 0.72)` to `rgba(15, 30, 51, 0.88)`).
   * Official Williams branding (`assets/logos/williams-logo.png`).
   * Two primary CTAs: *"Explore Catalogue ↓"* (smooth anchor scroll) & *"Fast Response on WhatsApp"* (direct WhatsApp message).
3. **Engineering Highlights:** 4 key credibility pillars:
   * **Established 1997:** 27+ years of cold chain engineering in Bangalore.
   * **Climate Class 5 (43°C):** Tropical reliability rating.
   * **Commercial-Grade 304 SS:** Food-grade hygienic stainless steel construction.
   * **Eco-Friendly R290 Gas:** Low-GWP natural hydrocarbon refrigeration.
4. **Editorial Heritage:** The story of Williams Refrigeration India led by Managing Director William S.R. and Patrick, with 3 Bangalore manufacturing hubs and 1,000+ commercial installations.
5. **Interactive Product Catalogue (30 Verified Models):**
   * Sourced directly from verified PDF technical files in `assets/View Digital Catalogue/`.
   * **Display Cabinets (11 Models):** Scenic-Prima, Shannon, Sibyl (Best Value), Sidney, Sierra Pastry (Hot Selling), Skyler (Hot Selling), Slavia, Steffania, StellarSphire (Hot Selling), Silya, Stellar.
   * **Ice Cream Display (7 Models):** Shea, Sierra ICD (Hot Selling), Smart (Best Value), Snowgel (Best Value), Sonnet, Stella (Hot Selling), Shiloh.
   * **Commercial Refrigeration (12 Models):** Back Bar Cooler, Blast Freezer (Hot Selling), Dual, Hot & Cold Banquet Trolley R290, Pan Cooler, Prep Stations (Best Value), R290 Refrigerated Cabinets (Hot Selling), R290 Refrigerated Counter, Refrigerated Cabinet - Regular, Refrigerated Counter - Regular (Best Value), Thawing Cabinets, Wine Chiller.
   * **Instant Vector Blueprint Canvas:** Generates immediate architectural previews so cards never appear blank while PDF.js loads.
   * **On-Demand First-Page PDF Render:** Uses client-side Mozilla PDF.js via `IntersectionObserver` with in-memory WebP caching.
   * **URL Hash State Synchronization:** `#category=...` synced with `history.pushState` and `window.onpopstate` for native browser back-button navigation.
6. **In-Site Internal PDF Viewer:**
   * Modal stage keeping visitors inside the Williams experience.
   * Live canvas rendering with zoom in/out (50%–250%), fit-width, page turners, and download link.
   * Full keyboard navigation (`Esc` to close, `ArrowLeft` / `ArrowRight` / `PageUp` / `PageDown` to turn pages).
   * Mobile touch-swipe gestures (`touchstart` / `touchend`).
   * Direct "Get Quote" trigger that transfers the active product context to the quote modal.
7. **Consultation & Quote Modal Dialog:**
   * Replaces permanent on-page form clutter with a dedicated, accessible modal (`role="dialog"`, `aria-modal="true"`).
   * Pre-populates selected product name and equipment category.
   * Full client-side validation, privacy pledge, and confirmation success state.
8. **Customer Review Video Cards (9:16 Vertical Ratio):**
   * Native portrait video cards with continuous looping, dynamic progress tracking, and sharp branding.
   * Player chrome, YouTube overlays, play/pause buttons, and like/share links removed for a distraction-free experience.
   * Razor-sharp, anti-aliased client brand badges with high contrast.
9. **Written Client Reviews & Genuine Google Reviews:**
   * Verified testimonials from hospitality directors (Hari Bhavanam Restaurants, Park Hyatt Chennai).
   * 4.8-star verified Google rating badge linked to Williams Bommasandra Bangalore headquarters.
10. **Minimal Technical Footer:** Restrained two-column layout with Bangalore facility locations (Unit I & Unit II Bommasandra), direct phone/email, and social links.

---

## 3. Analytics Pipeline (`js/analytics.js`)

All 11 GA4/GTM custom events and 4 custom dimensions dispatch through `window.dataLayer`:

### Events
1. `hero_explore_catalogue_click`
2. `hero_consultation_click`
3. `category_open`
4. `product_card_click`
5. `product_pdf_open`
6. `product_pdf_page_change`
7. `product_pdf_download`
8. `product_quote_click`
9. `review_video_play`
10. `google_reviews_click`
11. `consultation_submit`

### Dimensions
* `category`
* `product_name`
* `pdf_filename`
* `page_number`

---

## 4. Project Directory Structure

```
wiliams/
├── index.html                  # Semantic HTML5 catalogue & conversion experience
├── robots.txt                  # Search engine crawler instructions
├── sitemap.xml                 # XML sitemap with all core sections
├── .htaccess                   # Apache / cPanel MIME, CORS & caching rules
├── _headers                    # Cloudflare Pages & Netlify headers & range streaming
├── vercel.json                 # Vercel deployment configuration
├── start-server.ps1            # Local HTTP server with CORS, range chunking & URL decoding
├── README.md                   # Technical documentation
├── css/
│   ├── tokens.css              # Design tokens (colors, typography, spacing)
│   └── styles.css              # Responsive stylesheet, mobile optimizations & 3D carousel
├── js/
│   ├── products-data.js        # 30 verified product models metadata & Google Drive cloud links
│   ├── analytics.js            # GA4 / GTM event pipeline
│   └── main.js                 # Catalogue renderer, touch gestures, PDF viewer & reels
└── assets/
    ├── images/                 # Hero poster fallback & factory heritage imagery
    ├── logos/                  # Official Williams logo & commercial client brand logos (PNG)
    └── thumbnails/             # 30 pre-rendered Page 1 JPEG product covers
```

---

## 5. Deployment & Production Hosting Guide

This repository is **100% static, production-ready, and bug-free**. It can be deployed directly to any static web host, CDN, or web server:

### Cloudflare Pages / Netlify / Vercel
1. Upload or push this folder to your Git repository.
2. Build command: *(None required — purely static)*.
3. Publish directory: `.` (the project root).
4. Direct deep links and PDF range requests will work out of the box.

### Apache / Nginx / Traditional Linux Server
* **Nginx:** Configure `try_files $uri $uri/ =404;` and ensure `gzip` or `brotli` is enabled for SVG, CSS, and JS files. Ensure `mp4` and `pdf` support byte range requests (default in Nginx).
* **Apache:** Ensure `mod_headers` and `mod_mime` are enabled.

---

## 6. How to Run Locally

### Option A: Built-in PowerShell Server
Run the included PowerShell server script:
```powershell
powershell -ExecutionPolicy Bypass -File .\start-server.ps1
```
* Binds to `http://localhost:8080/`.
* Automatic byte range chunking for smooth high-resolution video streaming.
* Injects CORS headers for local PDF worker execution.

### Option B: Any Static Web Server
Serve the project root folder via Python, Caddy, or Node:
```bash
python -m http.server 8080
# or
npx serve .
```

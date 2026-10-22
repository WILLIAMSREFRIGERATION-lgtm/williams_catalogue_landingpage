/**
 * Williams Refrigeration India — Analytics & Lead Tracking System
 * Implements GA4 / GTM standard event dispatch with window.dataLayer
 *
 * Required Events:
 * 1.  hero_explore_catalogue_click
 * 2.  hero_consultation_click
 * 3.  category_open
 * 4.  product_card_click
 * 5.  product_pdf_open
 * 6.  product_pdf_page_change
 * 7.  product_pdf_download
 * 8.  product_quote_click
 * 9.  review_video_play
 * 10. google_reviews_click
 * 11. consultation_submit
 *
 * Required Dimensions:
 * - category
 * - product_name
 * - pdf_filename
 * - page_number
 */

(function () {
  'use strict';

  window.dataLayer = window.dataLayer || [];

  window.WilliamsTracker = {
    /**
     * Dispatch an event to dataLayer
     * @param {string} eventName
     * @param {Object} dimensions
     */
    track: function (eventName, dimensions) {
      dimensions = dimensions || {};
      var payload = Object.assign(
        {
          event: eventName,
          brand: 'Williams Refrigeration India',
          timestamp: new Date().toISOString()
        },
        dimensions
      );

      window.dataLayer.push(payload);

      if (window.console && window.console.debug) {
        console.debug('[Williams Analytics]', eventName, payload);
      }
    },

    // 1. Hero CTAs
    trackHeroExploreCatalogue: function () {
      this.track('hero_explore_catalogue_click', {
        cta_location: 'hero_primary_button'
      });
    },

    trackHeroConsultation: function () {
      this.track('hero_consultation_click', {
        cta_location: 'hero_secondary_button'
      });
    },

    // 2. Catalogue Category Open
    trackCategoryOpen: function (categorySlug, categoryName) {
      this.track('category_open', {
        category: categorySlug,
        category_name: categoryName
      });
    },

    // 3. Product Card Click
    trackProductCardClick: function (category, productName, pdfFilename) {
      this.track('product_card_click', {
        category: category,
        product_name: productName,
        pdf_filename: pdfFilename
      });
    },

    // 4. In-Site PDF Viewer Open
    trackPdfOpen: function (category, productName, pdfFilename, pageNumber) {
      this.track('product_pdf_open', {
        category: category,
        product_name: productName,
        pdf_filename: pdfFilename,
        page_number: pageNumber || 1
      });
    },

    // 5. PDF Viewer Page Turn
    trackPdfPageChange: function (category, productName, pdfFilename, pageNumber) {
      this.track('product_pdf_page_change', {
        category: category,
        product_name: productName,
        pdf_filename: pdfFilename,
        page_number: pageNumber
      });
    },

    // 6. PDF Direct Download
    trackPdfDownload: function (category, productName, pdfFilename) {
      this.track('product_pdf_download', {
        category: category,
        product_name: productName,
        pdf_filename: pdfFilename
      });
    },

    // 7. Product Quote Trigger
    trackProductQuoteClick: function (category, productName, pdfFilename) {
      this.track('product_quote_click', {
        category: category,
        product_name: productName,
        pdf_filename: pdfFilename
      });
    },

    // 8. Customer Review Video Play
    trackReviewVideoPlay: function (reelId, clientName) {
      this.track('review_video_play', {
        reel_id: reelId,
        client_name: clientName,
        aspect_ratio: '9:16'
      });
    },

    // 9. Google Reviews Action
    trackGoogleReviewsClick: function () {
      this.track('google_reviews_click', {
        profile_location: 'Bommasandra Bangalore Headquarters',
        verified_rating: '4.8'
      });
    },

    // 10. Consultation Form Submission
    trackConsultationSubmit: function (category, productName, formDetails) {
      this.track('consultation_submit', Object.assign({
        category: category || 'all',
        product_name: productName || 'General Facility Enquiry',
        form_source: 'consultation_quote_modal'
      }, formDetails || {}));
    },

    // 11. Direct WhatsApp Click
    trackWhatsAppClick: function (source) {
      this.track('whatsapp_click', {
        cta_location: source || 'direct_whatsapp',
        phone_number: '+919844013768'
      });
    },

    // 12. Direct Phone Call Click
    trackPhoneCallClick: function (source) {
      this.track('phone_call_click', {
        cta_location: source || 'telephone_link',
        phone_number: '+919844013768'
      });
    }
  };
})();

/**
 * Google Ads conversion tracking utilities.
 *
 * Conversion tag: AW-11225595244
 *
 * Fires gtag conversion events for key customer actions so Google Ads can
 * optimise towards real business outcomes (bookings, WhatsApp contacts, etc.).
 */

// Extend Window interface to include gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// ── helpers ──────────────────────────────────────────────────────────────────

const AW_ID = 'AW-11225595244';

/** Safe wrapper – never throws, never blocks UI. */
const fireConversion = (
  label: string,
  extra?: Record<string, unknown>,
) => {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: `${AW_ID}/${label}`,
        ...extra,
      });
    }
  } catch {
    // Silently handle tracking errors – never break the app
  }
};

// ── public API ───────────────────────────────────────────────────────────────

/**
 * Customer clicked "Book Now" and was redirected to Fresha.
 * This is the primary conversion action.
 */
export const trackBookingClick = (branchName: string) => {
  fireConversion('booking_click', {
    value: 1.0,
    currency: 'SAR',
    event_category: 'booking',
    event_label: branchName,
  });
};

/**
 * Customer opened a WhatsApp chat with a branch.
 */
export const trackWhatsAppClick = (branchName: string) => {
  fireConversion('whatsapp_click', {
    value: 0.5,
    currency: 'SAR',
    event_category: 'contact',
    event_label: branchName,
  });
};

/**
 * Customer opened a branch location in Google Maps.
 */
export const trackLocationClick = (branchName: string) => {
  fireConversion('location_click', {
    event_category: 'engagement',
    event_label: branchName,
  });
};

/**
 * Customer viewed the menu / offers content.
 */
export const trackMenuView = () => {
  fireConversion('menu_view', {
    event_category: 'engagement',
  });
};

/**
 * Generic page-view event (useful for remarketing audiences).
 * Fired automatically by gtag config, but available for SPA route changes.
 */
export const trackPageView = (pagePath: string) => {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: pagePath,
        send_to: AW_ID,
      });
    }
  } catch {
    // Silently handle
  }
};

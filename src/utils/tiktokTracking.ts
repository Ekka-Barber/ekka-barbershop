
import { logger } from "./logger";

// Extend Window interface to include TikTok pixel
declare global {
  interface Window {
    ttq?: {
      track: (event: string, params: Record<string, unknown>) => void;
    };
  }
}

interface ViewContentEvent {
  pageId: string;
  pageName: string;
  value?: number;
}

interface ButtonClickEvent {
  buttonId: string;
  buttonName: string;
  value?: number;
}

interface LocationViewEvent {
  id: string;
  name_en: string;
  value?: number;
}

interface SocialMediaClickEvent {
  platform: string;
  url: string;
  value?: number;
}

export const trackViewContent = (params: ViewContentEvent) => {
  try {
    const ttq = window.ttq;
    if (ttq) {
      logger.debug("Tracking view_content:", params);
      const eventParams: Record<string, unknown> = {
        content_id: params.pageId,
        content_name: params.pageName,
        content_type: 'product',
      };

      // Only include value and currency if value is provided
      if (params.value && params.value > 0) {
        eventParams.value = params.value;
        eventParams.currency = 'SAR'; // Saudi Riyal for Middle East barbershop
      }

      ttq.track('ViewContent', eventParams);
    } else {
      logger.debug("TikTok pixel not loaded, view_content event not fired");
    }
  } catch (error) {
    logger.error("Error tracking view_content:", error);
  }
};

export const trackButtonClick = (params: ButtonClickEvent) => {
  try {
    const ttq = window.ttq;
    if (ttq) {
      logger.debug("Tracking button_click:", params);
      const eventParams: Record<string, unknown> = {
        button_id: params.buttonId,
        button_name: params.buttonName,
      };

      // Only include value and currency if value is provided
      if (params.value && params.value > 0) {
        eventParams.value = params.value;
        eventParams.currency = 'SAR'; // Saudi Riyal for Middle East barbershop
      }

      ttq.track('ClickButton', eventParams);
    } else {
      logger.debug("TikTok pixel not loaded, button_click event not fired");
    }
  } catch (error) {
    logger.error("Error tracking button_click:", error);
  }
};

export const trackLocationView = (params: LocationViewEvent) => {
  try {
    const ttq = window.ttq;
    if (ttq) {
      logger.debug("Tracking location_view:", params);
      const eventParams: Record<string, unknown> = {
        location_id: params.id,
        location_name: params.name_en,
      };

      // Only include value and currency if value is provided
      if (params.value && params.value > 0) {
        eventParams.value = params.value;
        eventParams.currency = 'SAR'; // Saudi Riyal for Middle East barbershop
      }

      ttq.track('ViewLocation', eventParams);
    } else {
      logger.debug("TikTok pixel not loaded, location_view event not fired");
    }
  } catch (error) {
    logger.error("Error tracking location_view:", error);
  }
};

export const trackSocialMediaClick = (params: SocialMediaClickEvent) => {
  try {
    const ttq = window.ttq;
    if (ttq) {
      logger.debug("Tracking social_media_click:", params);
      const eventParams: Record<string, unknown> = {
        platform: params.platform,
        url: params.url,
      };

      // Only include value and currency if value is provided
      if (params.value && params.value > 0) {
        eventParams.value = params.value;
        eventParams.currency = 'SAR'; // Saudi Riyal for Middle East barbershop
      }

      ttq.track('SocialInteraction', eventParams);
    } else {
      logger.debug("TikTok pixel not loaded, social_media_click event not fired");
    }
  } catch (error) {
    logger.error("Error tracking social_media_click:", error);
  }
};

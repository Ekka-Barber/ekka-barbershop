
import { logger } from "./logger";

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
    const ttq = (window as any).ttq;
    if (ttq) {
      logger.debug("Tracking view_content:", params);
      ttq.track('ViewContent', {
        content_id: params.pageId,
        content_name: params.pageName,
        content_type: 'product',
        value: params.value || 0,
      });
    } else {
      logger.debug("TikTok pixel not loaded, view_content event not fired");
    }
  } catch (error) {
    logger.error("Error tracking view_content:", error);
  }
};

export const trackButtonClick = (params: ButtonClickEvent) => {
  try {
    const ttq = (window as any).ttq;
    if (ttq) {
      logger.debug("Tracking button_click:", params);
      ttq.track('ClickButton', {
        button_id: params.buttonId,
        button_name: params.buttonName,
        value: params.value || 0,
      });
    } else {
      logger.debug("TikTok pixel not loaded, button_click event not fired");
    }
  } catch (error) {
    logger.error("Error tracking button_click:", error);
  }
};

export const trackLocationView = (params: LocationViewEvent) => {
  try {
    const ttq = (window as any).ttq;
    if (ttq) {
      logger.debug("Tracking location_view:", params);
      ttq.track('ViewLocation', {
        location_id: params.id,
        location_name: params.name_en,
        value: params.value || 0,
      });
    } else {
      logger.debug("TikTok pixel not loaded, location_view event not fired");
    }
  } catch (error) {
    logger.error("Error tracking location_view:", error);
  }
};

export const trackSocialMediaClick = (params: SocialMediaClickEvent) => {
  try {
    const ttq = (window as any).ttq;
    if (ttq) {
      logger.debug("Tracking social_media_click:", params);
      ttq.track('SocialInteraction', {
        platform: params.platform,
        url: params.url,
        value: params.value || 0,
      });
    } else {
      logger.debug("TikTok pixel not loaded, social_media_click event not fired");
    }
  } catch (error) {
    logger.error("Error tracking social_media_click:", error);
  }
};



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
    }
  } catch {
    // Silently handle tracking errors
  }
};

export const trackButtonClick = (params: ButtonClickEvent) => {
  try {
    const ttq = window.ttq;
    if (ttq) {
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
    }
  } catch {
    // Silently handle tracking errors
  }
};

export const trackLocationView = (params: LocationViewEvent) => {
  try {
    const ttq = window.ttq;
    if (ttq) {
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
    }
  } catch {
    // Silently handle tracking errors
  }
};

export const trackSocialMediaClick = (params: SocialMediaClickEvent) => {
  try {
    const ttq = window.ttq;
    if (ttq) {
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
    }
  } catch {
    // Silently handle tracking errors
  }
};

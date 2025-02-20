
interface TikTokEvent {
  track: (event: string, data?: any, options?: any) => void;
  identify: (data: {
    email?: string;
    phone_number?: string;
    external_id?: string;
  }) => void;
}

declare global {
  interface Window {
    ttq?: TikTokEvent;
  }
}

export {};

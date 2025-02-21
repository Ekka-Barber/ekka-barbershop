
import crypto from 'crypto-js';

// Hash sensitive data using SHA-256 as required by TikTok
const hashData = (data: string) => {
  return crypto.SHA256(data).toString();
};

// Generate unique event ID for deduplication
const generateEventId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

interface ViewContentParams {
  pageId: string;
  pageName: string;
  value?: number;
  currency?: string;
}

interface ButtonClickParams {
  buttonId: string;
  buttonName: string;
  value?: number;
  currency?: string;
}

interface ServiceParams {
  id: string;
  name_en: string;
  price: number;
}

interface LocationParams {
  id: string;
  name_en: string;
  value?: number;
}

interface CustomerParams {
  email: string;
  phone: string;
  id: string | number;
}

export const trackViewContent = ({ pageId, pageName, value, currency = "SAR" }: ViewContentParams) => {
  if (typeof window === 'undefined' || !window.ttq) return;
  
  window.ttq.track('ViewContent', {
    contents: [{
      content_id: pageId,
      content_type: "page",
      content_name: pageName
    }],
    ...(value && { value, currency })
  });
};

export const trackServiceSelection = (service: ServiceParams) => {
  if (typeof window === 'undefined' || !window.ttq) return;
  
  window.ttq.track('AddToCart', {
    contents: [{
      content_id: service.id,
      content_type: "service",
      content_name: service.name_en,
    }],
    value: service.price,
    currency: "SAR"
  });
};

export const trackLocationView = (branch: LocationParams) => {
  if (typeof window === 'undefined' || !window.ttq) return;
  
  window.ttq.track('FindLocation', {
    contents: [{
      content_id: branch.id,
      content_type: "branch",
      content_name: branch.name_en
    }],
    ...(branch.value && { value: branch.value, currency: "SAR" })
  });
};

export const trackButtonClick = ({ buttonId, buttonName, value, currency = "SAR" }: ButtonClickParams) => {
  if (typeof window === 'undefined' || !window.ttq) return;
  
  window.ttq.track('ClickButton', {
    contents: [{
      content_id: buttonId,
      content_type: "button",
      content_name: buttonName
    }],
    ...(value && { value, currency })
  });
};

export const identifyCustomer = (customer: CustomerParams) => {
  if (typeof window === 'undefined' || !window.ttq) return;

  // Hash sensitive data as required by TikTok
  const hashedEmail = hashData(customer.email);
  const hashedPhone = hashData(customer.phone);
  const hashedId = hashData(customer.id.toString());

  window.ttq.identify({
    email: hashedEmail,
    phone_number: hashedPhone,
    external_id: hashedId
  });
};

export const trackBookingCompletion = (booking: any, customerDetails: CustomerParams) => {
  if (typeof window === 'undefined' || !window.ttq) return;

  // First identify the customer
  identifyCustomer(customerDetails);

  // Then track the order completion
  window.ttq.track('PlaceAnOrder', {
    contents: booking.services.map((service: ServiceParams) => ({
      content_id: service.id,
      content_type: "service",
      content_name: service.name_en,
    })),
    value: booking.totalPrice,
    currency: "SAR",
    event_id: generateEventId()
  });
};


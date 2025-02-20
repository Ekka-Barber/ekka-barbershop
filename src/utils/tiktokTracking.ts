
import crypto from 'crypto-js';

// Hash sensitive data using SHA-256
const hashData = (data: string) => {
  return crypto.SHA256(data).toString();
};

// Generate unique event ID
const generateEventId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const trackViewContent = (page: string) => {
  if (typeof ttq === 'undefined') return;
  
  ttq.track('ViewContent', {
    contents: [{
      content_type: "page",
      content_name: page
    }]
  });
};

export const trackServiceSelection = (service: any) => {
  if (typeof ttq === 'undefined') return;
  
  ttq.track('AddToCart', {
    contents: [{
      content_id: service.id,
      content_type: "service",
      content_name: service.name_en,
    }],
    value: service.price,
    currency: "SAR"
  });
};

export const trackLocationView = (branch: any) => {
  if (typeof ttq === 'undefined') return;
  
  ttq.track('FindLocation', {
    contents: [{
      content_id: branch.id,
      content_type: "branch",
      content_name: branch.name_en
    }]
  });
};

export const trackButtonClick = (buttonName: string) => {
  if (typeof ttq === 'undefined') return;
  
  ttq.track('ClickButton', {
    contents: [{
      content_type: "button",
      content_name: buttonName
    }]
  });
};

export const trackBookingCompletion = (booking: any, customerDetails: any) => {
  if (typeof ttq === 'undefined') return;

  // Hash sensitive data
  const hashedEmail = hashData(customerDetails.email);
  const hashedPhone = hashData(customerDetails.phone);
  const hashedBookingId = hashData(booking.id);

  // Identify customer
  ttq.identify({
    email: hashedEmail,
    phone_number: hashedPhone,
    external_id: hashedBookingId
  });

  // Track completion
  ttq.track('PlaceAnOrder', {
    contents: booking.services.map((service: any) => ({
      content_id: service.id,
      content_type: "service",
      content_name: service.name_en,
    })),
    value: booking.totalPrice,
    currency: "SAR",
    event_id: generateEventId()
  });
};

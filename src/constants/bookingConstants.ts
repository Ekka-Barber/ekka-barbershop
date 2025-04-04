
import { BookingStep } from "@/components/booking/BookingProgress";

/**
 * Array of booking steps in the correct order
 */
export const BOOKING_STEPS: BookingStep[] = ['services', 'datetime', 'barber', 'details'];

/**
 * Validation messages for different booking steps
 */
export const VALIDATION_MESSAGES = {
  services: {
    en: 'Please select at least one service',
    ar: 'الرجاء اختيار خدمة واحدة على الأقل'
  },
  datetime: {
    en: 'Please select a date',
    ar: 'الرجاء اختيار تاريخ'
  },
  barber: {
    en: 'Please select a barber and appointment time',
    ar: 'الرجاء اختيار حلاق ووقت للموعد'
  },
  details: {
    en: 'Please fill in your name and phone number',
    ar: 'الرجاء تعبئة الاسم ورقم الهاتف'
  }
};

/**
 * Regular expressions for validation
 */
export const VALIDATION_REGEX = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^05\d{8}$/
};

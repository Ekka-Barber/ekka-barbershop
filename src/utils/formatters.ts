
import { convertToArabic } from "./arabicNumerals";
import { formatNumber } from "./priceFormatting";
import { SelectedService } from "@/types/service";
import { Branch } from "@/types/booking";

export const formatDuration = (duration: number, language: 'en' | 'ar' = 'en'): string => {
  const rounded = Math.round(duration);
  const formattedNumber = language === 'ar' ? convertToArabic(rounded.toString()) : rounded.toString();
  
  if (language === 'ar') {
    // Arabic plural rules with abbreviation د instead of دقيقة
    return `${formattedNumber} د`;
  }
  
  return `${formattedNumber} mins`;
};

// Format a price with currency symbol according to language
export const formatPrice = (price: number, language: 'en' | 'ar' = 'en'): string => {
  const roundedPrice = Math.round(price);
  
  if (language === 'ar') {
    return `${convertToArabic(roundedPrice.toString())} ريال`;
  }
  
  return `${roundedPrice} SAR`;
};

// Format a price in Arabic
export const formatPriceArabic = (price: number): string => {
  const roundedPrice = Math.round(price);
  return convertToArabic(roundedPrice.toString());
};

// Format a date string to display in the proper language
export const formatDateString = (dateStr: string, language: 'en' | 'ar' = 'en'): string => {
  if (language === 'ar') {
    return convertToArabic(dateStr);
  }
  return dateStr;
};

// Generate a well-formatted WhatsApp message for booking details (always in Arabic)
export const generateWhatsAppMessage = (
  selectedServices: SelectedService[],
  totalPrice: number,
  selectedDate: Date | undefined,
  selectedTime: string | undefined,
  selectedBarberName: string | undefined,
  customerDetails: any,
  branch?: Branch
): string => {
  if (!selectedDate || !selectedTime || !customerDetails?.name) {
    return '';
  }

  // Helper function to format prices in Arabic
  const formatPriceWithCurrency = (price: number) => `${convertToArabic(Math.round(price).toString())} ريال`;
  
  // Format date in Arabic
  const day = selectedDate.getDate().toString().padStart(2, '0');
  const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
  const year = selectedDate.getFullYear();
  const dateString = `${day}/${month}/${year}`;
  const formattedDate = convertToArabic(dateString);
  
  // Calculate total duration
  const totalDuration = selectedServices.reduce((sum, service) => sum + (service.duration || 0), 0);
  const formattedDuration = `${convertToArabic(totalDuration.toString())} دقيقة`;

  // Organize services by type
  const regularServices: SelectedService[] = [];
  const packageBaseServices: SelectedService[] = [];
  const packageAddOnServices: SelectedService[] = [];
  const upsellServices: SelectedService[] = [];
  
  selectedServices.forEach(service => {
    if (service.isBasePackageService) {
      packageBaseServices.push(service);
    } else if (service.isPackageAddOn) {
      packageAddOnServices.push(service);
    } else if (service.isUpsellItem) {
      upsellServices.push(service);
    } else {
      regularServices.push(service);
    }
  });

  // Format services lists
  let servicesSection = "📌 الخدمات المختارة:\n\n";
  
  // Regular services
  if (regularServices.length > 0) {
    servicesSection += "الخدمات العادية:\n";
    regularServices.forEach(service => {
      servicesSection += `• ${service.name_ar}: ${formatPriceWithCurrency(service.price)}\n`;
    });
    servicesSection += "\n";
  }
  
  // Package services (if any)
  if (packageBaseServices.length > 0 || packageAddOnServices.length > 0) {
    servicesSection += "🏷️ باقة مخصصة (اصنع باقتك الخاصة)\n";
    
    // Get discount percentage from the first add-on service that has it
    const discountPercentage = packageAddOnServices.length > 0 && packageAddOnServices[0].discountPercentage 
      ? packageAddOnServices[0].discountPercentage 
      : 0;
      
    if (discountPercentage > 0) {
      servicesSection += `الخصم المطبق: ${convertToArabic(discountPercentage.toString())}%\n\n`;
    }
    
    // Base services
    if (packageBaseServices.length > 0) {
      servicesSection += "الخدمة الأساسية:\n";
      packageBaseServices.forEach(service => {
        servicesSection += `• ${service.name_ar}: ${formatPriceWithCurrency(service.price)}\n`;
      });
      servicesSection += "\n";
    }
    
    // Add-on services
    if (packageAddOnServices.length > 0) {
      servicesSection += "الخدمات الإضافية (مخفضة):\n";
      packageAddOnServices.forEach(service => {
        const originalPrice = service.originalPrice ? ` (السعر الأصلي: ${formatPriceWithCurrency(service.originalPrice)})` : '';
        servicesSection += `• ${service.name_ar}: ${formatPriceWithCurrency(service.price)}${originalPrice}\n`;
      });
      servicesSection += "\n";
    }
  }
  
  // Upsell services (if any)
  if (upsellServices.length > 0) {
    // Group upsell services by their main service
    const upsellsByMainService = new Map<string, SelectedService[]>();
    
    upsellServices.forEach(upsell => {
      if (upsell.mainServiceId) {
        if (!upsellsByMainService.has(upsell.mainServiceId)) {
          upsellsByMainService.set(upsell.mainServiceId, []);
        }
        upsellsByMainService.get(upsell.mainServiceId)?.push(upsell);
      }
    });
    
    servicesSection += "العروض الإضافية:\n";
    
    // For each main service with upsells
    Array.from(upsellsByMainService.entries()).forEach(([mainServiceId, upsells]) => {
      // Find the main service
      const mainService = selectedServices.find(s => s.id === mainServiceId);
      if (mainService) {
        servicesSection += `• الخدمة الرئيسية: ${mainService.name_ar}\n`;
        
        // List all upsells for this main service
        upsells.forEach(upsell => {
          const discountInfo = upsell.discountPercentage 
            ? ` (خصم ${convertToArabic(upsell.discountPercentage.toString())}%)` 
            : '';
          const originalPrice = upsell.originalPrice 
            ? ` (السعر الأصلي: ${formatPriceWithCurrency(upsell.originalPrice)})` 
            : '';
          servicesSection += `  - ${upsell.name_ar}: ${formatPriceWithCurrency(upsell.price)}${originalPrice}${discountInfo}\n`;
        });
        servicesSection += "\n";
      }
    });
  }
  
  // Calculate total savings (original vs discounted prices)
  const totalOriginalPrice = selectedServices.reduce((sum, service) => sum + (service.originalPrice || service.price), 0);
  const totalDiscount = totalOriginalPrice - totalPrice;
  const savingsSection = totalDiscount > 0 
    ? `💰 إجمالي التوفير: ${formatPriceWithCurrency(totalDiscount)}\n\n` 
    : "";

  // Branch location link if available
  const locationSection = branch?.google_maps_url 
    ? `📍 موقع الفرع: ${branch.google_maps_url}\n\n` 
    : "";

  // Assemble the final message
  return `✨ طلب حجز جديد ✨

📌 معلومات العميل:

• الاسم: ${customerDetails.name}
• رقم الجوال: ${customerDetails.phone || '-'}
${customerDetails.email ? `• البريد الإلكتروني: ${customerDetails.email}\n` : ''}

${servicesSection}
💰 التكلفة الإجمالية: ${formatPriceWithCurrency(totalPrice)}

⏰ المدة الإجمالية: ${formattedDuration}
📅 التاريخ والوقت: ${formattedDate} - ${selectedTime}
${selectedBarberName ? `💈 الحلاق: ${selectedBarberName}\n` : ''}
${locationSection}
${customerDetails.notes ? `📝 ملاحظات العميل: ${customerDetails.notes}\n\n` : ''}
${savingsSection}⚠️ يرجى الحضور قبل 5 دقائق من موعدك.`;
};

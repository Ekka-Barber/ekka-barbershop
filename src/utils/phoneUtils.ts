
/**
 * Validates and formats WhatsApp numbers
 * Expects Saudi numbers in format: 05XXXXXXXX or 5XXXXXXXX
 */
export const formatWhatsAppNumber = (number: string | null | undefined): string | null => {
  if (!number) return null;

  // Remove any spaces, dashes, or other separators
  const cleaned = number.replace(/[\s\-\(\)]/g, '');

  // Handle Saudi numbers
  if (cleaned.startsWith('05')) {
    // Convert local Saudi format (05XXXXXXXX) to international format (966XXXXXXXX)
    return `966${cleaned.slice(1)}`;
  } else if (cleaned.startsWith('5')) {
    // Convert short format (5XXXXXXXX) to international format (966XXXXXXXX)
    return `966${cleaned}`;
  } else if (cleaned.startsWith('966')) {
    // Already in correct format
    return cleaned;
  } else if (cleaned.startsWith('+966')) {
    // Remove the plus sign
    return cleaned.slice(1);
  }

  // If number doesn't match any expected format, return null
  return null;
};

export const isValidWhatsAppNumber = (number: string | null | undefined): boolean => {
  if (!number) return false;
  
  const formatted = formatWhatsAppNumber(number);
  if (!formatted) return false;

  // Check if it's a valid Saudi number
  // Should be 966 followed by 9 digits
  return /^966\d{9}$/.test(formatted);
};


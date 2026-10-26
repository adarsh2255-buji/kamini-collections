/**
 * Kamini Collections - Boutique Contact & Store Configuration
 */

export const STORE_CONFIG = {
  name: 'Kamini Collections',
  tagline: 'Authentic Heritage Indian Handloom Sarees',
  email: 'care@kaminicollections.com',
  // Default official boutique WhatsApp contact (9496812845)
  defaultPhoneRaw: '9496812845',
  defaultWhatsAppDigits: '919496812845',
  displayPhone: '+91 94968 12845',
  operatingHours: 'Mon - Sat: 10:00 AM - 8:00 PM IST',
  location: 'Retail Boutique, India',
};

/**
 * Normalizes any Indian phone number or env variable to international WhatsApp digits (e.g. 919496812845)
 */
export function formatWhatsAppNumber(rawNumber?: string | null): string {
  if (!rawNumber) {
    return STORE_CONFIG.defaultWhatsAppDigits;
  }

  // Remove all non-numeric characters (+, spaces, dashes, brackets)
  let digits = rawNumber.replace(/\D/g, '');

  // If starts with leading 0 (e.g. 09496812845), strip it
  if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1);
  }

  // If 10 digits Indian mobile number (e.g. 9496812845), prepend India country code 91
  if (digits.length === 10) {
    return `91${digits}`;
  }

  // If already 12 digits starting with 91
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }

  return digits.length > 0 ? digits : STORE_CONFIG.defaultWhatsAppDigits;
}

/**
 * Gets the active WhatsApp number from environment variable or boutique default
 */
export function getWhatsAppNumber(): string {
  const envNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  return formatWhatsAppNumber(envNumber);
}

/**
 * Generates an official wa.me WhatsApp direct chat link with prefilled message
 */
export function getWhatsAppLink(message?: string): string {
  const number = getWhatsAppNumber();
  const baseUrl = `https://wa.me/${number}`;
  if (!message) {
    return baseUrl;
  }
  return `${baseUrl}?text=${encodeURIComponent(message)}`;
}

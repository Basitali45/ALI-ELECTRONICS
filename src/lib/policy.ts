// ZAPLIX store policies (single source of truth for storefront messaging & checkout)
export const FREE_SHIPPING_PROMO_TITLE = 'FREE HOME DELIVERY ON ALL ORDERS';
export const FREE_SHIPPING_PROMO_SUBTITLE = 'Shop your favourite products with zero delivery charges. No minimum order required.';

export const STANDARD_SHIPPING_FEE = 0; // Always Rs. 0 - 100% Free Home Delivery nationwide
export const RETURN_DAYS = 7;

export const SHIPPING_TEXT = 'FREE HOME DELIVERY ON ALL ORDERS';
export const RETURNS_TEXT = `${RETURN_DAYS}-Day Easy Returns`;

/**
 * Calculates delivery charges for an order.
 * Policy: Always PKR 0 across Pakistan (No minimum order required).
 */
export function getDeliveryCharges(_subtotal: number, _configuredFee?: number): number {
  return 0;
}

export const OFFICIAL_WHATSAPP_LINK = 'https://wa.me/message/4DT24PTIDNPXB1';
export const OFFICIAL_WHATSAPP_NUMBER = '03189869746';

// Official Zaplix Brand Assets & Social Channels
export const OFFICIAL_LOGO_IMAGE = '/images/zaplix/zaplix-official-logo.jpeg';
export const INSTAGRAM_HANDLE = '@GS.ONLINE21';
export const INSTAGRAM_USERNAME = 'gs.online21';
export const INSTAGRAM_URL = 'https://www.instagram.com/gs.online21/';
export const INSTAGRAM_QR_IMAGE = '/images/zaplix/instagram-gs-online21.jpeg';

/**
 * Builds the official WhatsApp click-to-chat URL with optional prefilled message text.
 * Always points to the official Zaplix Store link https://wa.me/message/4DT24PTIDNPXB1
 */
export function getWhatsAppUrl(text?: string): string {
  if (!text) return OFFICIAL_WHATSAPP_LINK;
  return `${OFFICIAL_WHATSAPP_LINK}?text=${encodeURIComponent(text)}`;
}

/**
 * Formats a Pakistani phone number into standard international format for WhatsApp click-to-chat.
 */
export function toWhatsAppNumber(num?: string, fallback = OFFICIAL_WHATSAPP_NUMBER): string {
  if (!num) return '923189869746';
  if (num.includes('wa.me')) return num;
  const clean = num.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) {
    return '92' + clean.slice(1);
  }
  if (!clean.startsWith('92') && clean.length === 10) {
    return '92' + clean;
  }
  return clean || '923189869746';
}

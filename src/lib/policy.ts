// Zyvara store policies (single source of truth for storefront messaging & checkout)
export const FREE_SHIPPING_THRESHOLD = 3000; // Free shipping on orders of Rs. 3,000 and above
export const STANDARD_SHIPPING_FEE = 200; // Applied below the threshold unless store settings define a fee
export const RETURN_DAYS = 7;

export const SHIPPING_TEXT = `Free Shipping on Orders Above Rs. ${FREE_SHIPPING_THRESHOLD.toLocaleString()}`;
export const RETURNS_TEXT = `${RETURN_DAYS}-Day Returns`;

export function getDeliveryCharges(subtotal: number, configuredFee?: number): number {
  if (subtotal <= 0 || subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return typeof configuredFee === 'number' && configuredFee > 0 ? configuredFee : STANDARD_SHIPPING_FEE;
}

export function toWhatsAppNumber(num?: string, fallback = '03705776869'): string {
  return (num || fallback).replace(/[^0-9]/g, '').replace(/^0/, '92');
}

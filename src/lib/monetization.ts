// Modo de monetización del funnel.
// 'lead'    → captura nombre+whatsapp+email, CTA WhatsApp a la clínica (fase validación).
// 'payment' → cobra vía Flow antes de mostrar la simulación.
//
// Cambiar vía VITE_MONETIZATION_MODE en .env (o variable de build).
export type MonetizationMode = 'lead' | 'payment';

export const MONETIZATION_MODE: MonetizationMode =
  (import.meta.env.VITE_MONETIZATION_MODE as MonetizationMode) || 'lead';

// WhatsApp de la clínica para CTAs (formato internacional sin +)
export const CLINIC_WHATSAPP =
  (import.meta.env.VITE_CLINIC_WHATSAPP as string) || '56935572986';

export const CLINIC_NAME = 'Clínica Dental Miró';

export const CLINIC_BOOKING_URL =
  (import.meta.env.VITE_CLINIC_BOOKING_URL as string) || 'https://ff.healthatom.io/41knMr';


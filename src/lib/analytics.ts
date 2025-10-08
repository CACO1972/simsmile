// Simple analytics tracking utility
export function track(params: { name: string; data?: Record<string, any> }) {
  console.log('[Analytics]', params.name, params.data);
  // In production, this would send to your analytics service
  // For now, we just log to console for debugging
}

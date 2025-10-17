import { logger } from "./logger";

// Simple analytics tracking utility
export function track(params: { name: string; data?: Record<string, unknown> }) {
  logger.log('[Analytics]', params.name, params.data);
  // In production, this would send to your analytics service
}

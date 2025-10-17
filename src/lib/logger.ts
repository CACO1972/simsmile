/**
 * Conditional logging utility
 * Only logs in development mode to keep production console clean
 */

export const log = (...args: unknown[]) => {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
};

export const warn = (...args: unknown[]) => {
  if (import.meta.env.DEV) {
    console.warn(...args);
  }
};

export const error = (...args: unknown[]) => {
  // Always log errors, even in production
  console.error(...args);
};

export const debug = (...args: unknown[]) => {
  if (import.meta.env.DEV) {
    console.debug(...args);
  }
};

// Auto-generated version file - DO NOT EDIT MANUALLY
// This helps prevent frontend-backend mismatches during deployment

export const APP_VERSION = {
  version: '1.0.0',
  buildDate: new Date().toISOString(),
  commit: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
  environment: import.meta.env.MODE,
};

// Log version info in development
if (import.meta.env.DEV) {
  console.info('App Version:', APP_VERSION);
}

// Expose version to window for debugging
if (typeof window !== 'undefined') {
  (window as any).__APP_VERSION__ = APP_VERSION;
}

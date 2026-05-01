import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.skyfit.gym',
  appName: 'SkyFit',
  webDir: 'dist',

  // ── Splash Screen ──────────────────────────────────────────────────────────
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0F172A',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',            // light text on dark background
      backgroundColor: '#0F172A',
    },
  },

  // ── Android ────────────────────────────────────────────────────────────────
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false, // set true during dev
  },

  // ── iOS ────────────────────────────────────────────────────────────────────
  ios: {
    contentInset: 'always',
    allowsLinkPreview: false,
  },
};

export default config;

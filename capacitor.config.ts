import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.automatech.virtuadoc',
  appName: 'VirtuaDoc',
  webDir: 'public',
  server: {
    url: 'https://virtuadoc.automatech.tech',
    cleartext: true
  }
};

export default config;

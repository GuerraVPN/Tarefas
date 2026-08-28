import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.com.guerravpn.tarefas',
  appName: 'TAREFAS',
  webDir: 'dist',
  bundledWebRuntime: false,
  android: {
    allowMixedContent: false,
    backgroundColor: '#0b1220'
  },
  server: {
    androidScheme: 'https'
  }
};

export default config;

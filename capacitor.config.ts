import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.com.guerravpn.tarefas.mobile',
  appName: 'TAREFAS',
  webDir: 'dist',
  bundledWebRuntime: false,
  android: {
    allowMixedContent: false,
    backgroundColor: '#040808'
  },
  server: {
    androidScheme: 'https'
  }
};

export default config;

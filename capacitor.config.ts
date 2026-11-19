import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.myrecipes.app',
  appName: 'MyRecipes',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;

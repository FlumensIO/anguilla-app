/* eslint-disable @getify/proper-arrows/name */
import { configure as mobxConfig } from 'mobx';
import i18n from 'i18next';
import { createRoot } from 'react-dom/client';
import { initReactI18next } from 'react-i18next';
import { App as AppPlugin } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style as StatusBarStyle } from '@capacitor/status-bar';
import { setupIonicReact, isPlatform } from '@ionic/react';
import 'common/images/favicon.ico?originalName';
import 'common/images/logo192.png?originalName';
import 'common/images/logo512.png?originalName';
import lists from 'common/models/lists';
import records from 'common/models/records';
import surveys from 'common/models/surveys';
import userModel from 'common/models/user';
import 'common/theme.scss';
import appModel from 'models/app';
import App from './App';
import './manifest.json';

console.log('🚩 App starting.'); // eslint-disable-line

i18n.use(initReactI18next).init({ lng: 'en' });

mobxConfig({ enforceActions: 'never' });

setupIonicReact({
  swipeBackEnabled: false,
});

async function init() {
  await appModel.ready;
  await userModel.ready;
  await surveys.ready;
  await lists.ready;
  await records.ready;

  // appModel.attrs.sendAnalytics &&
  //   initAnalytics({
  //     dsn: config.sentryDNS,
  //     environment: config.environment,
  //     build: config.build,
  //     release: config.version,
  //   });

  appModel.attrs.appSession += 1;
  appModel.save();

  const container = document.getElementById('root');
  const root = createRoot(container!);
  root.render(<App />);

  if (isPlatform('hybrid')) {
    StatusBar.setStyle({
      style: StatusBarStyle.Dark,
    });

    SplashScreen.hide();

    AppPlugin.addListener('backButton', () => {
      /* disable android app exit using back button */
    });
  }
}

init();

if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator)
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });

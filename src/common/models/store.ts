import { Store } from '@flumens';
import { isPlatform } from '@ionic/react';

const isDemo = !isPlatform('hybrid');

// eslint-disable-next-line
export const genericStore = new Store({
  storeName: 'generic',
  debugging: isDemo,
});

// eslint-disable-next-line
export const modelStore = new Store({
  storeName: 'models',
  debugging: isDemo,
});

if (isDemo) {
  Object.assign(window, { genericStore, modelStore });
}

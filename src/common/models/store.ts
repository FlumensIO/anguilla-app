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

// eslint-disable-next-line
export const surveysStore = new Store({
  storeName: 'surveys',
  debugging: isDemo,
});

// eslint-disable-next-line
export const listsStore = new Store({
  storeName: 'list',
  debugging: isDemo,
});

if (isDemo) {
  Object.assign(window, { genericStore, modelStore, surveysStore, listsStore });
}
